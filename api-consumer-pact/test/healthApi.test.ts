import {PactV3} from '@pact-foundation/pact';
import axios, { AxiosPromise } from 'axios';
import {like, regex, string} from "@pact-foundation/pact/src/v3/matchers";

const provider: PactV3 = new PactV3({
    consumer: 'Consumer',
    provider: 'Provider',
    port: 4000,
    dir: './pacts',
    logLevel: 'info',
});

export class HealthApi {

    private readonly url: string;
    constructor(url: string) {
        this.url = url
    }

    public getHealth = (): AxiosPromise => {
        return axios.request({
            baseURL: this.url,
            headers: { Accept: "application/json" },
            method: 'GET',
            url: '/api/health'
        });
    };
}

describe('Consumer API Contract Test', () => {

    // Example of a contract test against a Live API at localhost:3000
    it('should return healthy API', async () => {

        provider
            .given('I have a Health API')
            .uponReceiving("a request to obtain API health status")
            .withRequest({
                method: 'GET',
                path: '/api/health',
            })
            .willRespondWith({
                status: 200,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'X-App-TrxId': regex(/[0-9]+/, '123456')
                },
                body: {
                    message: regex(/^.*is healthy.*$/, 'Api is healthy')
                }
            })

        return provider.executeTest(async (mockServer) => {

            let server = new HealthApi(mockServer.url)

            const response = await server.getHealth()

            expect(response.status).toEqual(200);
            expect(response.headers).toHaveProperty('content-type', 'application/json; charset=utf-8')
            expect(response.headers).toHaveProperty('x-app-trxid', expect.stringMatching(/^[0-9]+$/))
            expect(response.data).toHaveProperty('message', expect.stringMatching(/^.*is healthy.*$/))
        })
    });
});