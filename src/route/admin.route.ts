import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { adminAuthentication } from '../middleware/authentication.middleware';

export const admins = Router();
export const prisma = new PrismaClient();

const spotController = require('../controller/spot.controller');
const adminController = require('../controller/admin.controller');
const orderController = require('../controller/order.controller');
const stylistController = require('../controller/stylist.controller');
const bookingController = require('../controller/booking.controller');
const articleController = require('../controller/article.controller');
const productController = require('../controller/product.controller');
const serviceController = require('../controller/service.controller');
const customerController = require('../controller/customer.controller');
const timeSlotController = require('../controller/timeslot.controller');

// <--- SPOTS ROUTES ---> //
admins.get('/spots', spotController.getSpots);
admins.get('/spot/:id', spotController.getSpot);
admins.post('/spots', adminAuthentication, spotController.postSpot);
admins.put('/spot/:id', adminAuthentication, spotController.updateSpot);
admins.delete('/spot/:id', adminAuthentication, spotController.deleteSpot);

// <--- ADMIN ROUTES ---> //
admins.post('/login', adminController.loginAdmin)
admins.post('/refresh', adminController.refreshLogin)
admins.post('/register', adminController.registerAdmin)

// <--- ADMIN GET ADDRESS ROUTES ---> //
admins.get('/address', adminController.getAddress);
admins.get('/address-details', adminController.getAddressDetails);

// <--- STYLISTS ROUTES ---> //
admins.get('/stylists', stylistController.getStylists);
admins.get('/stylist/:id', stylistController.getStylist);
// admins.put('/stylist/:id', adminAuthentication, stylistController.updateStylist);
admins.delete('/stylist/:id', adminAuthentication, stylistController.deleteStylist);

// <--- BOOKINGS ROUTES ---> //
admins.get('/customers', customerController.getCustomers);
admins.get('/customer/:id', customerController.getCustomer);
admins.delete('/customer/:id', adminAuthentication, customerController.deleteCustomer);

// <--- BOOKINGS ROUTES ---> //
admins.get('/bookings', bookingController.getBookings);
admins.get('/booking/:id', bookingController.getBooking);
admins.post('/booking', adminAuthentication, bookingController.postBooking);
admins.put('/booking/:id', adminAuthentication, bookingController.updateBooking);
admins.delete('/booking/:id', adminAuthentication, bookingController.deleteBooking);
admins.put('/booking/status/:id', adminAuthentication, bookingController.updateBookingStatus);

// <--- TIMESLOTS ROUTES ---> //
admins.get('/timeslots', timeSlotController.getTimeslots);
admins.get('/timeslot/:id', timeSlotController.getTimeslot);
admins.post('/timeslots', adminAuthentication, timeSlotController.postTimeslot);
admins.put('/timeslot/:id', adminAuthentication, timeSlotController.updateTimeslot);
admins.delete('/timeslot/:id',adminAuthentication, timeSlotController.deleteTimeslot);
admins.post('/timeslot/generate', adminAuthentication, timeSlotController.generateTimeslots);

// <--- ORDERS ROUTES ---> //
admins.get('/orders', orderController.getOrders);
admins.get('/order/:id', orderController.getOrder);
admins.post('/orders', adminAuthentication, orderController.postOrder);
admins.put('/order/:id', adminAuthentication, orderController.updateOrder);
admins.delete('/order/:id', adminAuthentication, orderController.deleteOrder);

// <--- ARTICLES ROUTES ---> //
admins.get('/articles', articleController.getArticles);
admins.get('/article/:id', articleController.getArticle);
admins.post('/articles', adminAuthentication, articleController.postArticle);
admins.put('/article/:id', adminAuthentication, articleController.updateArticle);
admins.delete('/article/:id', adminAuthentication, articleController.deleteArticle);
admins.post('/articles/bulk/:id', adminAuthentication, articleController.bulkPostArticle);

// <--- PRODUCTS ROUTES ---> //
admins.get('/products', productController.getProducts);
admins.get('/product/:id', productController.getProduct);
admins.post('/products', adminAuthentication, productController.postProduct);
admins.put('/product/:id', adminAuthentication, productController.updateProduct);
admins.delete('/product/:id', adminAuthentication, productController.deleteProduct);

// <--- SERVICES ROUTES ---> //
admins.get('/services', serviceController.getServices);
admins.get('/service/:id', serviceController.getService);
admins.post('/services', adminAuthentication, serviceController.postService);
admins.put('/service/:id', adminAuthentication, serviceController.updateService);
admins.delete('/service/:id', adminAuthentication, serviceController.deleteService);
admins.post('/service-image/:id', adminAuthentication, serviceController.uploadServiceImage);

