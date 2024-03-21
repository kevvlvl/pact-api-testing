# pact-health-api

Simple REST Server API using NodeJS to demonstrate PACT contract testing how to use Pact in a nodejs app to test your REST api, in this case written in TypeScript

## Setup

Start node in development mode

```shell
npm run dev
```

Curl the endpoint

```shell
curl -v localhost:3000/api/health
```

Now, see the project `pact-health-test` for the contract test