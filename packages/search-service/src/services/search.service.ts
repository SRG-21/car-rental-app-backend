import { Client as ElasticsearchClient } from '@elastic/elasticsearch';
import axios from 'axios';
import type { SearchCarsRequest, SearchCarsResponse, CarResponse } from '../types/index.js';

/**
 * Search Service - Handles Elasticsearch geo-spatial searches and availability checks
 */
export class SearchService {
  private readonly esIndex = 'cars';

  constructor(
    private readonly esClient: ElasticsearchClient,
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

    const cars = response.hits.hits.map((hit: any) => {
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
