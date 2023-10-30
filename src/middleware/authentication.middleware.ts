import { env } from 'process';
import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const SECRET_KEY: Secret = env.SECRET ?? ''
export const ADMIN_SECRET_KEY: Secret = env.ADMINSECRET ?? ''
export const STYLIST_SECRET_KEY: Secret = env.STYLIST_SECRET_KEY ?? ''

export interface CustomRequest extends Request {
 token: string | JwtPayload;
}

export const customerAuthentication = async (req: Request, res: Response, next: NextFunction) => {

 try {
   const token = req.header('Authorization')?.replace('Bearer ', '');

   if (!token) {
     throw Error();
   }

   const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ['HS512'] } );
   (req as CustomRequest).token = decoded;

   next();
 } catch (err) {
    res.status(401).json({"message": 'Please authenticate'})
 }

}

export const stylistAuthentication = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
 
    if (!token) {
      throw Error();
    }
 
    const decoded = jwt.verify(token, STYLIST_SECRET_KEY, { algorithms: ['HS512'] } );
    (req as CustomRequest).token = decoded;
 
    next();
  } catch (err) {
     res.status(401).json({"message": 'Please authenticate'})
  }
 
 }

export const adminAuthentication = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
 
    if (!token) {
      throw Error();
    }
 
    const decoded = jwt.verify(token, ADMIN_SECRET_KEY, { algorithms: ['HS512'] } );
    (req as CustomRequest).token = decoded;
 
    next();
  } catch (err) {
     res.status(401).json({"message": 'Please authenticate'})
  }
 
 }


