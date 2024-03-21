import { Request, Response } from 'express';

export const getHealth = (req: Request, res: Response) => {
    res
        .status(200)
        .set('Content-Type', 'text/json')
        .set('x-app-trxId', '123999')
        .json({message: 'API server is up and healthy'});
};