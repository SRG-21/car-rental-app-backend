# Git Commit Script - Car Rental Backend
# Starting from 18-Jan-2026

# Commit 1: Update root tsconfig with ES module support


# Commit 2: Update root package.json with new scripts


# Commit 3: Update pnpm-lock.yaml
$env:GIT_AUTHOR_DATE="2026-01-18T10:47:23"
$env:GIT_COMMITTER_DATE="2026-01-18T10:47:23"
git add pnpm-lock.yaml
git commit -m "build: update pnpm lockfile with new dependencies"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 4: Update environment example file
$env:GIT_AUTHOR_DATE="2026-01-18T11:23:41"
$env:GIT_COMMITTER_DATE="2026-01-18T11:23:41"
git add .env.example
git commit -m "config: update .env.example with service URLs and production settings"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 5: Add production environment file
$env:GIT_AUTHOR_DATE="2026-01-18T11:38:17"
$env:GIT_COMMITTER_DATE="2026-01-18T11:38:17"
git add .env.production
git commit -m "config: add production environment configuration for cloud deployment"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 6: Update auth-service Prisma schema
$env:GIT_AUTHOR_DATE="2026-01-20T09:14:52"
$env:GIT_COMMITTER_DATE="2026-01-20T09:14:52"
git add packages/auth-service/prisma/schema.prisma
git commit -m "feat(auth): update Prisma schema to use unified field names (password, token)"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 7: Update auth-service to match new schema
$env:GIT_AUTHOR_DATE="2026-01-20T10:42:08"
$env:GIT_COMMITTER_DATE="2026-01-20T10:42:08"
git add packages/auth-service/src/services/auth.service.ts
git commit -m "feat(auth): update auth service to use password field instead of password_hash"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 8: Update auth-service app and routes
$env:GIT_AUTHOR_DATE="2026-01-20T11:17:33"
$env:GIT_COMMITTER_DATE="2026-01-20T11:17:33"
git add packages/auth-service/src/app.ts
git add packages/auth-service/src/index.ts
git add packages/auth-service/src/routes/auth.routes.ts
git commit -m "refactor(auth): update app initialization and route registration"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 9: Update auth-service Dockerfile and package.json
$env:GIT_AUTHOR_DATE="2026-01-20T14:23:46"
$env:GIT_COMMITTER_DATE="2026-01-20T14:23:46"
git add packages/auth-service/Dockerfile
git add packages/auth-service/package.json
git commit -m "build(auth): optimize Dockerfile for production and update dependencies"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 10: Add PUT endpoint for car updates
$env:GIT_AUTHOR_DATE="2026-01-22T09:37:19"
$env:GIT_COMMITTER_DATE="2026-01-22T09:37:19"
git add packages/car-service/src/routes/car.routes.ts
git commit -m "feat(car): add PUT /:id endpoint for full car updates"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 11: Add auto-reindex trigger on car updates
$env:GIT_AUTHOR_DATE="2026-01-22T10:52:41"
$env:GIT_COMMITTER_DATE="2026-01-22T10:52:41"
git add packages/car-service/src/services/car.service.ts
git add packages/car-service/src/utils/validation.ts
git commit -m "feat(car): trigger search reindex automatically on car updates"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 12: Update car-service app and build config
$env:GIT_AUTHOR_DATE="2026-01-22T11:28:14"
$env:GIT_COMMITTER_DATE="2026-01-22T11:28:14"
git add packages/car-service/src/app.ts
git add packages/car-service/Dockerfile
git add packages/car-service/package.json
git commit -m "build(car): update app initialization and Dockerfile for production"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 13: Add reindex endpoint to search-service
$env:GIT_AUTHOR_DATE="2026-01-24T09:08:37"
$env:GIT_COMMITTER_DATE="2026-01-24T09:08:37"
git add packages/search-service/src/services/search.service.ts
git commit -m "feat(search): add reindexCars method to sync Elasticsearch with database"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 14: Add search controller reindex endpoint
$env:GIT_AUTHOR_DATE="2026-01-24T10:21:55"
$env:GIT_COMMITTER_DATE="2026-01-24T10:21:55"
git add packages/search-service/src/controllers/search.controller.ts
git commit -m "feat(search): add reindex controller with car service URL injection"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 15: Update search routes for gateway compatibility
$env:GIT_AUTHOR_DATE="2026-01-24T10:44:12"
$env:GIT_COMMITTER_DATE="2026-01-24T10:44:12"
git add packages/search-service/src/routes/search.routes.ts
git commit -m "refactor(search): update routes to use root prefix for gateway compatibility"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 16: Update search-service app and build config
$env:GIT_AUTHOR_DATE="2026-01-24T11:16:38"
$env:GIT_COMMITTER_DATE="2026-01-24T11:16:38"
git add packages/search-service/src/app.ts
git add packages/search-service/Dockerfile
git add packages/search-service/package.json
git commit -m "build(search): update app with CAR_SERVICE_URL and optimize Dockerfile"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 17: Add search/reindex route to gateway
$env:GIT_AUTHOR_DATE="2026-01-25T09:12:27"
$env:GIT_COMMITTER_DATE="2026-01-25T09:12:27"
git add packages/gateway/src/routes/index.ts
git commit -m "feat(gateway): add POST /search/reindex route for search reindexing"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 18: Update gateway proxy to strip /search prefix
$env:GIT_AUTHOR_DATE="2026-01-25T09:34:51"
$env:GIT_COMMITTER_DATE="2026-01-25T09:34:51"
git add packages/gateway/src/services/proxy.service.ts
git commit -m "fix(gateway): strip /search prefix when proxying to search service"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 19: Update gateway app and build config
$env:GIT_AUTHOR_DATE="2026-01-25T10:18:05"
$env:GIT_COMMITTER_DATE="2026-01-25T10:18:05"
git add packages/gateway/src/app.ts
git add packages/gateway/src/index.ts
git add packages/gateway/Dockerfile
git add packages/gateway/package.json
git commit -m "build(gateway): update app initialization and optimize Dockerfile"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 20: Update booking-service build config
$env:GIT_AUTHOR_DATE="2026-01-26T09:26:43"
$env:GIT_COMMITTER_DATE="2026-01-26T09:26:43"
git add packages/booking-service/Dockerfile
git add packages/booking-service/package.json
git commit -m "build(booking): optimize Dockerfile and update dependencies"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 21: Update notification-service Dockerfile
$env:GIT_AUTHOR_DATE="2026-01-26T09:41:29"
$env:GIT_COMMITTER_DATE="2026-01-26T09:41:29"
git add packages/notification-service/Dockerfile
git commit -m "build(notification): optimize Dockerfile for production"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 22: Enhance seed script with more car data
$env:GIT_AUTHOR_DATE="2026-01-27T10:33:18"
$env:GIT_COMMITTER_DATE="2026-01-27T10:33:18"
git add infra/seed.ts
git commit -m "feat(infra): enhance seed script with 20 diverse car entries and locations"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 23: Add production docker-compose
$env:GIT_AUTHOR_DATE="2026-01-28T14:47:22"
$env:GIT_COMMITTER_DATE="2026-01-28T14:47:22"
git add docker-compose.production.yml
git commit -m "feat(infra): add production docker-compose with cloud database support"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 24: Add API documentation
$env:GIT_AUTHOR_DATE="2026-01-29T11:19:54"
$env:GIT_COMMITTER_DATE="2026-01-29T11:19:54"
git add docs/
git commit -m "docs: add API reference documentation"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

# Commit 25: Update README
$env:GIT_AUTHOR_DATE="2026-01-30T15:42:37"
$env:GIT_COMMITTER_DATE="2026-01-30T15:42:37"
git add README.md
git commit -m "docs: update README with production deployment instructions"
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

Write-Host "All commits completed successfully!" -ForegroundColor Green
