### npm install -g npm@8.19.3

### 1. Setup PostgreSQL
- The recommended way of trying this out would be using a Docker image of PostgreSQL with Postgis extensions that can be pulled from [here](https://github.com/postgis/docker-postgis).
- A [docker-compose.yml](./docker-compose.yml) is included for a quick start so that you do not need any prior setup. Just run `docker-compose up -d` and Postgres will be up and running on PORT 5432 with customername **postgres** and database **geoexample**.
- Connect to Postgres by any database viewer of your choice.
- Rename the `.env.example` to `.env` and replace the _DBNAME_ placeholder with the database name `geoexample` created in the above step.

Run the following command to create the tables and the function required for this example.
```
npx prisma migrate deploy
```
### 2. Run Initial migration if mirgration file doesnt exist.
```
npx prisma migrate dev --name init
```
- Lastly run the following command to generate Prisma Client.
```

```
**_Limitation_**: Currently Prisma doesn't support custom data types, so querying for the _geography_ type in the normal Prisma models is not possible. Operations can only be performed on the types via `prisma.$queryRaw` or `prisma.$executeRaw`. You can learn more about unsupported types [here](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#unsupported).
### 3. Start the REST API server
Execute this command to start the server:
```
npm run dev
```
The server is now running on `http://localhost:3001`. 
You can send the API requests implemented in [`index.ts`](./src/index.ts)# geostyleapi