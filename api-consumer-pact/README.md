# api-consumer-pact

Example of how to run contract testing using pact. Here, we are testing the typescript-written API `health-api`

## Run postgres for pact Broker

Also supports mysql, but postgres is recommended (for JSON format)
```shell
❯ nerdctl image pull postgres
docker.io/library/postgres:latest:                                                resolved       |++++++++++++++++++++++++++++++++++++++|
index-sha256:6b841c8f6a819884207402f1209a8116844365df15fca8cf556fc54a24c70800:    done           |++++++++++++++++++++++++++++++++++++++|
...
layer-sha256:13de11c6ecda05d8df6bd5fa12f60fba7d4c29c144ab97de5270df3db130cbba:    done           |++++++++++++++++++++++++++++++++++++++| 
elapsed: 25.4s                                                                    total:  118.5  (4.7 MiB/s)                                       

❯ nerdctl image ls
REPOSITORY                    TAG       IMAGE ID        CREATED               PLATFORM       SIZE         BLOB SIZE
postgres                      latest    6b841c8f6a81    About a minute ago    linux/amd64    436.0 MiB    146.3 MiB

❯ nerdctl run --name pactpostgres -e POSTGRES_PASSWORD=mypwd -p 5432:5432 -d postgres
79af58c4d5a08ec6352d4774785bdeecb5bc037bdbef9331e59720f59dc3ff36

❯ nerdctl container ls
CONTAINER ID    IMAGE                                COMMAND                   CREATED           STATUS    PORTS    NAMES
79af58c4d5a0    docker.io/library/postgres:latest    "docker-entrypoint.s…"    19 seconds ago    Up                 pactpostgres 
```

You can now connect to the above postgres using pgadmin, datagrip, etc. at localhost:5432 with user `postgres` and password `mypwd` to confirm connection and health of postgres

## Run the pact Broker

```shell
❯ nerdctl image pull pactfoundation/pact-broker
docker.io/pactfoundation/pact-broker:latest:                                      resolved       |++++++++++++++++++++++++++++++++++++++| 
index-sha256:8f10947f230f661ef21f270a4abcf53214ba27cd68063db81de555fcd93e07dd:    done           |++++++++++++++++++++++++++++++++++++++|
... 
layer-sha256:c289b0ded1e97f8df4578475987ad6d7443450f293a55fd8765db4fa67b85c78:    done           |++++++++++++++++++++++++++++++++++++++| 
elapsed: 32.3s                                                                    total:  248.4  (7.7 MiB/s)                                       

❯ nerdctl image ls
REPOSITORY                    TAG       IMAGE ID        CREATED         PLATFORM       SIZE         BLOB SIZE
pactfoundation/pact-broker    latest    8f10947f230f    10 hours ago    linux/amd64    678.1 MiB    248.4 MiB

❯ nerdctl run --name pactbroker \
-e PACT_BROKER_DATABASE_USERNAME=postgres \
-e PACT_BROKER_DATABASE_PASSWORD=mypwd \
-e PACT_BROKER_DATABASE_HOST=pactpostgres \
-e PACT_BROKER_DATABASE_NAME=postgres \
-e PACT_BROKER_DATABASE_PORT=5432 \
-p 9292:9292 -d pactfoundation/pact-broker

9e0b5f8213fa136a3334ecbe19d78a29d3dbf5bba747cd98101dfc8b7047e9af

❯ nerdctl container ls
CONTAINER ID    IMAGE                                          COMMAND                   CREATED           STATUS    PORTS                     NAMES
58061c79af04    docker.io/library/postgres:latest              "docker-entrypoint.s…"    10 minutes ago    Up        0.0.0.0:5432->5432/tcp    pactpostgres
9e0b5f8213fa    docker.io/pactfoundation/pact-broker:latest    "sh ./entrypoint.sh …"    2 seconds ago     Up        0.0.0.0:9292->9292/tcp    pactbroker
```

At this point, pact broker connected to postgres to create numerous tables, and the broker will be up and healthy.

You can now connect to the pact broker in the browser at `http://localhost:9292`

## Generate Pact files

This will run the unit tests (based on jest) which are based on mocks of how we (devs) expect the APIs to behave

```shell
npm run test
```

Test results:

See the console output as well as the pact files under `./pacts`

### Perform a manual provider test

The _manualest_ method now is to take the generated pact file, and copy it in the `pacts` folder of the api (which is our Health API).
We have a test there that consumes the pact file from that local directory and validates the pact file against itself in an integration test (with a running express server)

1. Copy the pact file from `api-consumer-test` to `api`
2. Go to `api` and run test:
    ```shell
    ❯ npm run test
    > health-api@1.0.0 test
    > jest --ci
    ...
   Verifying a pact between Consumer and Provider
    
    a request to obtain API health status (0s loading, 37ms verification)
    Given I have a Health API
    returns a response which
    has status code 200 (OK)
    includes headers
    "Content-Type" with value "application/json; charset=utf-8" (OK)
    "X-App-TrxId" with value "123456" (OK)
    has a matching body (OK)
    
    console.log
    Pact Verification Complete!
    ...
   Test Suites: 1 passed, 1 total
    Tests:       1 passed, 1 total
    Snapshots:   0 total
    Time:        1.142 s, estimated 2 s
    Ran all test suites.
    ```
   
As we can see, pact verified that our endpoint respects the contract as defined in our pact file.

In practice, copy pasting these files manually would be near impossible, therefore the pact-broker is here to help us with ensuring that new pact files are provided to devs in an accurate and timely manner.

Use the manual method to perform initial testing, PoC, evaluation. Once you are sure of the approach, proceed with the broker

### Perform an automated provider test using the Pact broker

TODO