import { Client } from '@opensearch-project/opensearch';
import axios from 'axios';
import type { SearchCarsRequest, SearchCarsResponse, CarResponse } from '../types/index.js';

/**
 * Search Service - Handles OpenSearch geo-spatial searches and availability checks
 */
export class SearchService {
  private readonly esIndex = 'cars';

  constructor(
    private readonly esClient: Client,
    private readonly bookingServiceUrl: string
  ) {}

  /**
   * Search for cars with geo-spatial filtering and availability
   */
  async searchCars(params: SearchCarsRequest): Promise<SearchCarsResponse> {
    const {
      latitude,
      longitude,
      radius = 10,
      pickupTime,
      dropoffTime,
      fuelType,
      transmission,
      seats,
      query,
      page = 1,
      limit = 20
    } = params;

    const from = (page - 1) * limit;

    // Build Elasticsearch query
    const must: any[] = [
      {
        geo_distance: {
          distance: `${radius}km`,
          location: {
            lat: latitude,
            lon: longitude
          }
        }
      },
      { term: { is_active: true } }
    ];

    // Optional filters
    if (fuelType) {
      must.push({ term: { fuel: fuelType } });
    }

    if (transmission) {
      must.push({ term: { transmission } });
    }

    if (seats) {
      must.push({ term: { seats } });
    }

    // Text search on name and features
    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['name^2', 'brand', 'model', 'features'],
          fuzziness: 'AUTO'
        }
      });
    }

    // Execute search
    const response = await this.esClient.search({
      index: this.esIndex,
      body: {
        query: {
          bool: { must }
        },
        sort: [
          {
            _geo_distance: {
              location: {
                lat: latitude,
                lon: longitude
              },
              order: 'asc',
              unit: 'km'
            }
          }
        ],
        from,
        size: limit
      }
    });

    const hits = response.body?.hits?.hits || [];
    const cars = hits.map((hit: any) => {
      const source = hit._source;
      return {
        id: source.car_id || source.id,
        make: source.brand || source.make || 'Unknown',
        model: source.model || 'Unknown',
        year: source.year,
        fuelType: source.fuel || source.fuelType,
        transmission: source.transmission,
        seats: source.seats,
        pricePerDay: source.price_per_day || source.pricePerDay,
        imageUrl: source.images?.[0] || source.imageUrl,
        location: {
          lat: source.location.lat,
          lng: source.location.lon,
          address: source.address || '',
          city: source.city || '',
          state: source.state || '',
          country: source.country || '',
          zipCode: source.zipCode || ''
        },
        isAvailable: source.is_active ?? source.isActive ?? true,
        distance: hit.sort?.[0] ?? 0
      } as CarResponse & { distance: number };
    });

    // Filter by availability if dates provided
    let availableCars = cars;
    if (pickupTime && dropoffTime) {
      const carIds = cars.map((car) => car.id);
      const availability = await this.checkAvailability(
        carIds,
        pickupTime.toISOString(),
        dropoffTime.toISOString()
      );

      availableCars = cars.filter((car) => availability[car.id]);
    }

    return {
      cars: availableCars,
      total: availableCars.length,
      page,
      limit,
      totalPages: Math.ceil(availableCars.length / limit)
    };
  }

  /**
   * Reindex all cars from car-service to Elasticsearch
   */
  async reindexCars(carServiceUrl: string): Promise<{ indexed: number; errors: number }> {
    try {
      // Fetch all cars from car-service (car-service expects / not /cars)
      const response = await axios.get(carServiceUrl, { timeout: 10000 });
      const cars = response.data?.data || [];

      let indexed = 0;
      let errors = 0;

      // Bulk index operations
      const bulkBody: any[] = [];

      for (const car of cars) {
        bulkBody.push({
          index: {
            _index: this.esIndex,
            _id: car.id
          }
        });

        bulkBody.push({
          car_id: car.id,
          name: car.name,
          brand: car.brand,
          model: car.model,
          year: car.year,
          fuel: car.fuelType,
          transmission: car.transmission,
          seats: car.seats,
          price_per_day: car.pricePerDay,
          images: car.images,
          features: car.features,
          location: {
            lat: car.location.latitude,
            lon: car.location.longitude
          },
          address: car.location.address,
          city: car.location.city,
          state: car.location.state,
          country: car.location.country,
          is_active: car.isActive
        });
      }

      if (bulkBody.length > 0) {
        const bulkResponse = await this.esClient.bulk({
          body: bulkBody,
          refresh: 'true' // Force refresh so changes are immediately visible
        });

        if (bulkResponse.body.errors) {
          errors = bulkResponse.body.items.filter((item: any) => item.index?.error).length;
        }
        indexed = cars.length - errors;
      }

      return { indexed, errors };
    } catch (error) {
      console.error('Reindex failed:', error);
      throw new Error('Failed to reindex cars from car-service');
    }
  }

  /**
   * Check availability via Booking Service
   */
  private async checkAvailability(
    carIds: string[],
    pickupTime: string,
    dropoffTime: string
  ): Promise<Record<string, boolean>> {
    try {
      const response = await axios.post(
        `${this.bookingServiceUrl}/availability`,
        {
          carIds,
          pickupTime,
          dropoffTime
        },
        { timeout: 5000 }
      );

      return response.data.data;
    } catch (error) {
      console.error('Booking service availability check failed:', error);
      // Return all as available if booking service fails
      return carIds.reduce(
        (acc, id) => {
          acc[id] = true;
          return acc;
        },
        {} as Record<string, boolean>
      );
    }
  }
}
