import path from "node:path"
import express, {Express} from "express"
import { getHealth } from './controller/healthController'
import * as http from "node:http";

describe('API Contract Test Pact Verification', () => {

    const Verifier = require("@pact-foundation/pact").Verifier
    const app: Express = express()
    const port: number = 8084
    let server: http.Server

    beforeAll(() => {

        app.route('/api/health').get(getHealth)
        server = app.listen(port, () => {
            console.info("Listening test port: " + port)
            // TODO: how to close server after jest finishes tests?
       });
    });

    afterAll(() => {
        if(server.close()) {
            console.info("Test server closed, freeing port " + port)
        }
    });

    it('should be able to verify the pact file against the health API', () => {

        return new Verifier({
            providerBaseUrl: "http://localhost:" + port,
            pactUrls: [ path.resolve(process.cwd(), "./pacts/Consumer-Provider.json") ],
        })
            .verifyProvider()
            .then(() => {
                console.log('Pact Verification Complete!')
            });
    });
});