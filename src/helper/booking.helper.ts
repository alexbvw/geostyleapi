import { PrismaClient } from '@prisma/client';


export const prisma = new PrismaClient()

var message = '';
var booking_id = '';
var unavailable = false;
var error_message:any;
var empty_service = false;
var empty_time_slot = false;
var empty_booking_order = false;
