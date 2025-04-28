## Changelog 

just to make sure i was not sleeping all the time.


## v0.2.0

- Created a centralized database initialization in `[lib/db.ts](./lib/db.ts)` that handles all object store creation
- Modified the `DatabaseContext` to use this centralized initialization
- Updated `UserCacheContext` to reuse the database connection from `DatabaseContext`
- Removed all `db.close()` calls to prevent closing shared connections
- Updated `agentDatabaseTools` to cache and reuse the database connection
- Added a `DBLoader` component to handle database loading and error states
- Updated the provider structure to wrap `UserCacheProvider` with the `DBLoader`

These changes solve the database versioning issues by ensuring:
- Only one instance of the database is opened
- The upgrade logic is centralized and runs only once
- The database connection is shared across providers
- Database errors are properly handled with user feedback


## v0.1.0

### 26th April, 2025
- release v0.1.0
- voice support
- multi-agent support
- conversation agent
- habit tracking
- reward system
- database support
- ...and more things. i am lazy to write all of them.