import { Request, Response } from 'express';
import { Health } from '../model/health'

export const getHealth = (req: Request, res: Response) => {
    res
        .status(200)
        .set('Content-Type', 'text/json')
        .set('x-app-trxId', '123999')
        .json(new Health('API server is up and healthy'));
};