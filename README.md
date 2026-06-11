# Saint-Pierre Stage

Simple setup and commands to run this project.

## Installation

```sh
npm install
```

## Setup Database

```sh
npx prisma generate
```

## Run Development

```sh
docker compose up -d --build
```

## Run Production

```sh
docker compose -f docker-compose-prod.yml up -d --build
```

## Tests

```sh
npm run test:coverage
```

## Swagger Documentation

Swagger documentation is available at `/swagger` endpoint.
