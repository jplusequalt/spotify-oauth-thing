import { NextFunction } from 'express';

export const logging = (req: any, res: any, next: any) => {
  console.log('Method: ', req.method);
  console.log('URL: ', req.url);
  console.log('Headers: ', req.headers);
  next();
}