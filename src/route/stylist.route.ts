import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { stylistAuthentication } from '../middleware/authentication.middleware';

export const stylists = Router();
export const prisma = new PrismaClient();

const spotController = require('../controller/spot.controller');
const orderController = require('../controller/order.controller');
const stylistController = require('../controller/stylist.controller');
const bookingController = require('../controller/booking.controller');
const articleController = require('../controller/article.controller');
const productController = require('../controller/product.controller');
const serviceController = require('../controller/service.controller');
const customerController = require('../controller/customer.controller');
const timeSlotController = require('../controller/timeslot.controller');

// <--- SPOTS ROUTES ---> //
stylists.get('/spots', spotController.getSpots);
stylists.get('/spot/:id', spotController.getSpot);
stylists.post('/spots', stylistAuthentication, spotController.postSpot);
stylists.get('/spots/radius/:id', spotController.getStylistSpots);
stylists.get('/spot/services/:id', serviceController.getSpotServices);
stylists.get('/spot/products/:id', productController.getSpotProducts);
stylists.get('/spot/orders/:id', orderController.getSpotOrders);
stylists.get('/spot/bookings/:id', bookingController.getSpotBookings);
stylists.get('/spot/articles/:id', articleController.getSpotArticles);
stylists.get('/spot/timeslots/:id', timeSlotController.getSpotTimeslots);

// <--- STYLIST ROUTES ---> //
stylists.post('/login', stylistController.loginStylist);
stylists.post('/refresh', stylistController.refreshLogin);
stylists.post('/register', stylistController.registerStylist);

// <--- STYLIST GET ADDRESS ROUTES ---> //
stylists.get('/address', stylistController.getAddress);
stylists.get('/address-details', stylistController.getAddressDetails);

// <--- BOOKINGS ROUTES ---> //
stylists.get('/customers', customerController.getCustomers);
stylists.get('/customer/:id', customerController.getCustomer);
stylists.delete('/customer/:id', stylistAuthentication, customerController.deleteCustomer);

// <--- BOOKINGS ROUTES ---> //
stylists.get('/bookings', bookingController.getBookings);
stylists.get('/booking/:id', bookingController.getBooking);
stylists.post('/booking', stylistAuthentication, bookingController.postBooking);
stylists.put('/booking/:id', stylistAuthentication, bookingController.updateBooking);
stylists.delete('/booking/:id', stylistAuthentication, bookingController.deleteBooking);
stylists.put('/booking/status/:id', stylistAuthentication, bookingController.updateBookingStatus);

// <--- TIMESLOTS ROUTES ---> //
stylists.get('/timeslots', timeSlotController.getTimeslots);
stylists.get('/timeslot/:id', timeSlotController.getTimeslot);
stylists.post('/timeslots', stylistAuthentication, timeSlotController.postTimeslot);
stylists.put('/timeslot/:id', stylistAuthentication, timeSlotController.updateTimeslot);
stylists.delete('/timeslot/:id',stylistAuthentication, timeSlotController.deleteTimeslot);
stylists.post('/timeslot/generate', stylistAuthentication, timeSlotController.generateTimeslots);

// <--- ORDERS ROUTES ---> //
stylists.get('/orders', orderController.getOrders);
stylists.get('/order/:id', orderController.getOrder);
stylists.post('/orders', stylistAuthentication, orderController.postOrder);
stylists.put('/order/:id', stylistAuthentication, orderController.updateOrder);
stylists.delete('/order/:id', stylistAuthentication, orderController.deleteOrder);
stylists.put('/order/status/:id', stylistAuthentication, orderController.updateOrderStatus);

// <--- ARTICLES ROUTES ---> //
stylists.get('/articles', articleController.getArticles);
stylists.get('/article/:id', articleController.getArticle);
stylists.post('/articles', stylistAuthentication, articleController.postArticle);
stylists.put('/article/:id', stylistAuthentication, articleController.updateArticle);
stylists.delete('/article/:id', stylistAuthentication, articleController.deleteArticle);
stylists.post('/articles/bulk', stylistAuthentication, articleController.bulkPostArticle);

// <--- PRODUCTS ROUTES ---> //
stylists.get('/products', productController.getProducts);
stylists.get('/product/:id', productController.getProduct);
stylists.post('/products', stylistAuthentication, productController.postProduct);
stylists.put('/product/:id', stylistAuthentication, productController.updateProduct);
stylists.delete('/product/:id', stylistAuthentication, productController.deleteProduct);
stylists.post('/product-image/:id', stylistAuthentication, productController.uploadProductImage);
stylists.delete('/product-image/:id', stylistAuthentication, productController.deleteProductImage);

// <--- SERVICES ROUTES ---> //
stylists.get('/services', serviceController.getServices);
stylists.get('/service/:id', serviceController.getService);
stylists.post('/services', stylistAuthentication, serviceController.postService);
stylists.put('/service/:id', stylistAuthentication, serviceController.updateService);
stylists.delete('/service/:id', stylistAuthentication, serviceController.deleteService);
stylists.post('/service-image/:id', stylistAuthentication, serviceController.uploadServiceImage);
stylists.delete('/service-image/:id', stylistAuthentication, serviceController.deleteServiceImage);



