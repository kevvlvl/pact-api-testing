import { Pact } from '@pact-foundation/pact';
import axios, { AxiosResponse } from 'axios';
import { somethingLike } from "@pact-foundation/pact/src/dsl/matchers";
import { like } from "@pact-foundation/pact/src/v3/matchers";

describe('API Contract Test', () => {

    const provider: Pact = new Pact({
        consumer: 'Consumer',
        provider: 'Provider',
        port: 4000,
        log: './logs/pacts.log',
        dir: './pacts',
        logLevel: 'info',
    });

    // Setup Mocks here
    beforeAll(() => {
        provider.setup();
        provider.setup().then(() => {
           provider.addInteraction({
               state: 'Client API Mock',
               uponReceiving: 'a request to obtain clients',
               withRequest: {
                   method: 'GET',
                   path: '/api/clientApi',
               },
               willRespondWith: {
                   status: 200,
                   headers: {
                       'Content-Type': 'text/json'
                   },
                   body: {
                       id: 1,
                       name: 'iddqd'
                   },
               }
           })
        });
    });

    afterAll( () => {
        provider.verify();
        provider.finalize();
    });

    // Example of a contract test against a Live API at localhost:3000
    it('should return healthy API', async () => {
        const response: AxiosResponse = await axios.get('http://localhost:3000/api/health');

        expect(response.status).toEqual(200);
        expect(response.headers).toHaveProperty('content-type', 'text/json; charset=utf-8')
        expect(response.headers).toHaveProperty('x-app-trxid', '123999')
        expect(response.data).toEqual({
            'message': 'API server is up and healthy'
        });
    });

    // Example of a contract test against a mock API definition at self
    it('should get Client', async () => {
        const response: AxiosResponse = await axios.get('http://localhost:4000/api/clientApi');

        expect(response.status).toEqual(200);
        expect(response.headers).toHaveProperty('content-type', 'text/json')
        expect(response.data).toEqual({
            id: 1,
            name: 'iddqd'
        });
    });
});