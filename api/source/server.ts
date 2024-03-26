import express, { Express } from 'express'
import morgan from "morgan"
import { getHealth } from './controller/healthController'

const PORT = process.env.PORT || 3000
const app: Express = express()

app.use(express.json())
app.use(morgan('combined'))

app.route('/api/health').get(getHealth)

app.listen(PORT, () => {
    console.info("Listening on port: " + PORT)
});
