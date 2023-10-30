import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { customerAuthentication } from '../middleware/authentication.middleware';

export const customers = Router();
export const prisma = new PrismaClient();

const spotController = require('../controller/spot.controller');
const orderController = require('../controller/order.controller');
const bookingController = require('../controller/booking.controller');
const articleController = require('../controller/article.controller');
const productController = require('../controller/product.controller');
const serviceController = require('../controller/service.controller');
const customerController = require('../controller/customer.controller');
const timeSlotController = require('../controller/timeslot.controller');
const orderItemController = require('../controller/orderItem.controller');

// <--- SPOTS ROUTES ---> //
customers.get('/spots', spotController.getSpots);
customers.get('/spot/:id', spotController.getSpot);
customers.get('/spots/radius/:id', spotController.getCustomerSpots);
customers.get('/spot/services/:id', serviceController.getSpotServices);
customers.get('/spot/products/:id', productController.getSpotProducts);
customers.get('/spot/articles/:id', articleController.getSpotArticles);
customers.get('/spot/timeslots-series/:id', timeSlotController.getSpotTimeslotsSeries);
customers.get('/spot/timeslots/:id', timeSlotController.getSpotTimeslots);
customers.get('/spots/nearby', spotController.getCurrentLocationSpots);

// <--- CUSTOMER AUTHENTICATION ROUTES ---> //
customers.post('/login', customerController.loginCustomer);
customers.post('/refresh', customerController.refreshLogin);
customers.post('/register', customerController.registerCustomer);
customers.get('/profile/:id', customerController.getCustomer);

// <--- CUSTOMER GET ADDRESS ROUTES ---> //
customers.get('/address', customerController.getAddress);
customers.get('/address-details', customerController.getAddressDetails);

// <--- BOOKINGS ROUTES ---> //
customers.get('/booking/:id', bookingController.getBooking);
customers.get('/bookings/:id', bookingController.getCustomerBookings);
customers.post('/bookings', customerAuthentication, bookingController.postBooking);
customers.put('/booking/:id', customerAuthentication, bookingController.updateBooking);
customers.delete('/booking/:id', customerAuthentication, bookingController.deleteBooking);
customers.post('/booking-order', customerAuthentication, bookingController.createBookingOrder);
customers.put('/booking/status/:id', customerAuthentication, bookingController.updateBookingStatus);

// <--- TIMESLOTS ROUTES ---> //
customers.get('/timeslots', timeSlotController.getTimeslots);
customers.get('/timeslot/:id', timeSlotController.getTimeslot);

// <--- ORDERS ROUTES ---> //
customers.get('/orders', customerAuthentication,  orderController.getCustomerOrders);
customers.get('/order/:id', customerAuthentication, orderController.getOrder);
customers.post('/orders', customerAuthentication, orderController.postOrder);
customers.put('/order/:id', customerAuthentication, orderController.updateOrder);
customers.delete('/order/:id', customerAuthentication, orderController.deleteOrder);

// <--- ORDER ITEM ROUTES ---> //
customers.post('/order-items', customerAuthentication, orderItemController.postOrderItem);
customers.put('/order-item', customerAuthentication, orderItemController.updateOrderItem);
customers.delete('/order-item/:id', customerAuthentication, orderItemController.deleteOrderItem);
customers.patch('/order-item/increment/:id', customerAuthentication, orderItemController.incrementOrderItem)
customers.patch('/order-item/decrement/:id', customerAuthentication, orderItemController.decrementOrderItem)

// <--- ARTICLES ROUTES ---> //
customers.get('/articles', articleController.getArticles);
customers.get('/article/:id', articleController.getArticle);

// <--- PRODUCTS ROUTES ---> //
customers.get('/products', productController.getProducts);
customers.get('/product/:id', productController.getProduct);
customers.get('/products/bulk', productController.getBulkProducts);

// <--- SERVICES ROUTES ---> //
customers.get('/services', serviceController.getServices);
customers.get('/service/:id', serviceController.getService);

customers.post("/payments/webhook", function(req, res) {
    const requestBody = req.body;
    console.log(requestBody)
    // Verify and process the received data
    res.send(200);
});
