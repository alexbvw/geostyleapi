import cors from 'cors';
import express from 'express';
import HttpStatus from './util/status.util';
import Response from './util/response.util';
import fileUpload from 'express-fileupload';
import { admins } from './route/admin.route';
import { PrismaClient } from '@prisma/client';
import { stylists } from './route/stylist.route';
import { customers } from './route/customer.route';

const app = express()
export const prisma = new PrismaClient()

app.use(cors({ origin: '*' }));

app.use(fileUpload({}));
app.use(express.json());

app.use('/api/admin', admins);
app.use('/api/stylist', stylists);
app.use('/api/customer', customers);

app.get('/', (req:any, res:any) => res.send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'geostyle API, v1.0.1 - All Systems Go', { "status": 200 } ))); 
app.all('*', (req:any, res:any) => res.status(HttpStatus.NOT_FOUND.code).send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Route does not exist on the server', { "status": 404 } )));

export { app }

// setInterval(myFunction, seconds * 1000)