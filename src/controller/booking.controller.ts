import { sum } from '../helper/math.helper';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
const bookingHelper = require('../helper/booking.helper');

exports.getSpotBookings = async (req:any, res:any) => {

  let bookings:any = []
  let id = req.params.id
  let endDate = req.query.endDate
  let startDate = req.query.startDate
  let limit = Number(req.query.limit)

  try {
  
    let bookingsQuery: any = await prisma.$queryRaw`
      SELECT 
      spot_id::text,
      amount,
      status,
      review,
      end_date,  
      start_date,  
      customer_id::text,
      total_hours,
      service_ids,
      stylist_ids,
      time_slot_ids,  
      id::text FROM "Booking" WHERE spot_id::text = ${id} AND start_date::text BETWEEN ${startDate} AND ${endDate} FETCH FIRST ${limit} ROWS ONLY` as any;
      
      if(bookingsQuery.length > 0){
        bookings = bookingsQuery;
        for (let [index, booking] of bookings.entries()) {

          const services = await prisma.service.findMany(
            {
              where: {
                id: {
                  in: booking.service_ids
                }
              }
            }
          )
      
          let service_amounts = []
      
          for (let [index, service] of services.entries()){
              service_amounts.push(service.amount_per_hour * service.estimate_hours)
          }
      
          const time_slots = await prisma.timeslot.findMany(
            {
              where: {
                id: {
                  in: booking.time_slot_ids
                }
              }
            }
          )
      
          for (let [timeSlotIndex, time_slot ] of time_slots.entries()){
            await prisma.timeslot.updateMany({
              where: {
                id: {
                  in: booking.time_slot_ids
                }
              },
              data: {
                date: booking?.start_date,
                available: false
              },
            })
          }
          
          bookings[index]['services'] = services
          bookings[index]['time_slots'] = time_slots
          bookings[index].amount =  sum(service_amounts)
        }
      
        return res.status(200).json({
          success: true,
          bookings: bookings
        })
      } else {
        return res.status(200).json({
          success: true,
          bookings: []
        })
      }

     
    

  } catch (e) {

    res.status(400).json({
      error: e
    })

  }

 
}

exports.getBookings = async (req: any, res: any) => {
  try {
    const endDate = req.query.endDate;
    const startDate = req.query.startDate;
    const limit = Number(req.query.limit);
    const bookingsQuery: any = await prisma.$queryRaw`
      SELECT 
      spot_id::text,
      amount,
      status,
      review,
      end_date,  
      start_date,  
      customer_id,
      total_hours,
      service_ids,
      stylist_ids,
      time_slot_ids,  
      id::text FROM "Booking" WHERE start_date::text BETWEEN ${startDate} AND ${endDate} FETCH FIRST ${limit} ROWS ONLY` as any;
    let bookings = bookingsQuery;

    for (let [index, booking] of bookings.entries()) {
      const services = await prisma.service.findMany({
        where: {
          id: { in: booking.service_ids }
        }
      });

      let service_amounts = [];

      for (let [index, service] of services.entries()) {
        service_amounts.push(service.amount_per_hour * service.estimate_hours);
      }

      const time_slots = await prisma.timeslot.findMany({
        where: {
          id: { in: booking.time_slot_ids }
        }
      });

      for (let [timeSlotIndex, time_slot] of time_slots.entries()) {
        await prisma.timeslot.updateMany({
          where: {
            id: { in: booking.time_slot_ids }
          },
          data: {
            date: booking?.start_date,
            available: false
          },
        });
      }

      bookings[index]['services'] = services;
      bookings[index]['time_slots'] = time_slots;
      bookings[index].amount = sum(service_amounts);
    }

    return res.status(200).json({
      success: true,
      bookings: bookings
    });
  } catch (e) {
    res.status(400).json({
      error: e
    });
  }
};

    exports.getCustomerBookings = async (req:any, res:any) => {

      let bookings:any = []
      let id = req.params.id

      try {
      
        let bookingsQuery: any = await prisma.$queryRaw`
          SELECT 
          spot_id::text,
          amount,
          status,
          review,
          end_date,  
          start_date,  
          customer_id,
          total_hours,
          service_ids,
          stylist_ids,
          time_slot_ids,  
          id::text FROM "Booking" WHERE customer_id::text = ${id}` as any;
          bookings = bookingsQuery;

      } catch (e) {

        res.status(400).json({
          error: e
        })

      }

      for (let [index, booking] of bookings.entries()) {

        const services = await prisma.service.findMany(
          {
            where: {
              id: {
                in: booking.service_ids
              }
            }
          }
        )

        let service_amounts = []

        for (let [index, service] of services.entries()){
            service_amounts.push(service.amount_per_hour * service.estimate_hours)
        }

        const time_slots = await prisma.timeslot.findMany(
          {
            where: {
              id: {
                in: booking.time_slot_ids
              }
            }
          }
        )

        for (let [timeSlotIndex, time_slot ] of time_slots.entries()){
          await prisma.timeslot.updateMany({
            where: {
              id: {
                in: booking.time_slot_ids
              }
            },
            data: {
              date: booking?.start_date,
              available: false
            },
          })
        }
        
        bookings[index]['services'] = services
        bookings[index]['time_slots'] = time_slots
        bookings[index].amount = sum(service_amounts)

      }

      return res.status(200).json({
        success: true,
        bookings: bookings
      })

    }

    exports.getBooking = async (req:any, res:any) => {

      let bookings:any = []
      let id = req.params.id

      try {
      
        const bookingQuery: any = await prisma.$queryRaw`
        SELECT 
        spot_id::text,
        amount,
        status,
        review,
        end_date,  
        start_date,  
        customer_id,
        total_hours,
        service_ids,
        stylist_ids,
        time_slot_ids,  
        id::text FROM "Booking" WHERE id::text = ${id}` as any;
        bookings = bookingQuery;

      } catch (e) {

        res.status(400).json({
          error: e
        })

      }

      for (let [index, booking] of bookings.entries()) {

        const services = await prisma.service.findMany(
          {
            where: {
              id: {
                in: booking.service_ids
              }
            }
          }
        )

        let service_amounts = []

        for (let [index, service] of services.entries()){
            service_amounts.push(service.amount_per_hour * service.estimate_hours)
        }

        const time_slots = await prisma.timeslot.findMany(
          {
            where: {
              id: {
                in: booking.time_slot_ids
              }
            }
          }
        )

        for (let [timeSlotIndex, time_slot ] of time_slots.entries()){
          await prisma.timeslot.updateMany({
            where: {
              id: {
                in: booking.time_slot_ids
              }
            },
            data: {
              date: booking?.start_date,
              available: false
            },
          })
        }
        
        bookings[index]['services'] = services
        bookings[index]['time_slots'] = time_slots
        bookings[index].amount =  sum(service_amounts)

      }

      return res.status(200).json({
        success: true,
        bookings: bookings
      })

    }

  exports.createBookingOrder = async (req:any, res:any) => {

    let order_exists = false;
    let booking_id = req.query.bookingId
    let customer_id = req.query.customerId

    const orders:any = await prisma.$queryRaw`SELECT id::text, customer_id::text, status, booking_ids FROM "Order" WHERE customer_id::text = ${customer_id}` as any;
    if(orders.length > 0){
      for(let [orderIndex, order] of orders.entries()){

        if(order.status == "OPEN") {
  
          const { 
            spot_id,
            total,
            status,
            customer_id,
            // booking_ids,
            payment_option,
            payment_status,
            line_item_count
           } = req.body

           let booking_ids:any = []

            try {
              booking_ids.push(booking_id);
              if(order.booking_ids.length > 0){
                for(let [bookingIdIndex, bookingId] of order.booking_ids.entries()){
                  booking_ids.push(bookingId);
                }
              }
              const updateOrderQuery: any = await prisma.$queryRaw`
              UPDATE "Order"
              SET 
              spot_id = ${spot_id}::uuid,
              total = ${total}, 
              status = ${status}, 
              customer_id = ${customer_id}::uuid, 
              booking_ids = ${booking_ids}, 
              payment_option = ${payment_option}, 
              payment_status = ${payment_status}, 
              line_item_count = ${line_item_count} WHERE customer_id::text = ${customer_id} returning id` as any;

          } catch (e) {
      
            res.status(400).json({
              error: e
            })
      
          }
  
        } else {
  
          const { 
            spot_id,
            total,
            status,
            customer_id,
            booking_ids,
            payment_option,
            payment_status,
            line_item_count
           } = req.body
           
          const orders:any = await prisma.$queryRaw`
          SELECT 
          id::text, 
          customer_id::text
          FROM "Order"` as any;
       
            orders?.forEach((order:any) => {
                if(order?.customer_id == customer_id){
                  order_exists = true
                } else {
                  order_exists = false
                }
            })
      
            if(order_exists){
      
              res.status(400).json({
                "message": "order already exists"
              })   
      
            } else if(!order_exists) {
      
              try {
      
                const response: any = await prisma.$queryRaw`
                insert into "Order" 
                (
                  "spot_id",
                  "total",
                  "status",
                  "customer_id",
                  "booking_ids",
                  "payment_option",
                  "payment_status",
                  "line_item_count"
                ) values
                (
                  ${spot_id}::uuid,
                  ${total},
                  ${status},
                  ${customer_id}::uuid,
                  ${booking_ids},
                  ${payment_option},
                  ${payment_status},
                  ${line_item_count}
                )
                returning id` as any;
      
                res.json({
                  success: true,
                  id: response[0].id
                })
                
              } catch (e) {
                
                res.status(400).json({
                  error: e
                })

              }
            }
        }
      }
    }
     else {

      const { 
        spot_id,
        total,
        status,
        customer_id,
        booking_ids,
        payment_option,
        payment_status,
        line_item_count
       } = req.body
       
      const orders:any = await prisma.$queryRaw`
      SELECT 
      id::text, 
      customer_id::text
      FROM "Order"` as any;
   
        orders?.forEach((order:any) => {
            if(order?.customer_id == customer_id && order.spot_id && spot_id){
              order_exists = true
            } else {
              order_exists = false
            }
        })
  
        if(order_exists){
  
          res.status(400).json({
            "message": "order already exists"
          })   
  
        } else if(!order_exists) {
  
          try {
  
            const response: any = await prisma.$queryRaw`
            insert into "Order" 
            (
              "spot_id",
              "total",
              "status",
              "customer_id",
              "booking_ids",
              "payment_option",
              "payment_status",
              "line_item_count"
            ) values
            (
              ${spot_id}::uuid,
              ${total},
              ${status},
              ${customer_id}::uuid,
              ${booking_ids},
              ${payment_option},
              ${payment_status},
              ${line_item_count}
            )
            returning id` as any;
  
            res.status(200).json({
              success: true,
              id: response[0].id
            })
            
          } catch (e) {
            
            res.status(400).json({
              error: e
            })
  
          }
        }
    }
 
  }
  
  exports.postBooking = async (req:any, res:any) => {

    const { 
        spot_id,
        amount,
        status,
        review,
        end_date,  
        start_date,  
        customer_id,
        total_hours,
        service_ids,
        stylist_ids,
        time_slot_ids  
     } = req.body

      const time_slots = await prisma.timeslot.findMany(
        {
          where: {
            id: {
              in: time_slot_ids
            }
          } 
        }
      )

      for(let [timeSlotIndex, time_slot] of time_slots.entries()){

        if(!time_slot.available){         
          bookingHelper.unavailable  = true; 
        } else if(time_slot.available){
          bookingHelper.unavailable = false; 
        }

      }

      if(time_slot_ids.length == 0){
        bookingHelper.empty_time_slot = true
      } else {
        bookingHelper.empty_time_slot = false
      }

      if(service_ids.length == 0){
        bookingHelper.empty_service = true
      } else {
        bookingHelper.empty_service = false
      }

      if(bookingHelper.empty_time_slot){

        res.status(400).json({
          "message": "time slot cannot be empty"
        })   

      } 
      
      if(bookingHelper.empty_service){

        res.status(400).json({
          "message": "service cannot be empty"
        })   

      } 

      if(bookingHelper.unavailable){

        res.status(400).json({
          "message": "booking already exists"
        })   

      } 
      
      else if(!bookingHelper.unavailable && !bookingHelper.empty_service && !bookingHelper.empty_time_slot) {

          try {

            const createBooking: any = await prisma.$queryRaw`
            insert into "Booking" 
            (
              "spot_id",
              "amount",
              "status",
              "review",
              "end_date",  
              "start_date",  
              "customer_id",
              "total_hours",
              "service_ids",
              "stylist_ids",
              "time_slot_ids"  
            ) values
            (
              ${spot_id}::uuid,
              ${amount},
              ${status},
              ${review},
              ${end_date},  
              ${start_date},  
              ${customer_id}::uuid,
              ${total_hours},
              ${service_ids},
              ${stylist_ids},
              ${time_slot_ids} 
            )
            returning id` as any;

            bookingHelper.message = 'booking created'
            bookingHelper.booking_id = createBooking[0].id

            res.status(200).json({
              "message": bookingHelper.message,
              "bookingId": bookingHelper.booking_id
            })

          } catch (e) {

            res.status(400).json({
              "message": e
            })   

          }

        }

      }

  exports.updateBooking = async (req:any, res:any) => {

    let id = req.params.id

    const { 
      status,
      review,
      end_date,  
      start_date,  
      service_ids,
      stylist_ids,
      time_slot_ids  
   } = req.body

    try {
     
      const response: any = await prisma.booking.update({ 
        where: {
          id: id
        },
        data: {
          status: status,
          review: review,
          end_date: end_date,  
          start_date: start_date,  
          service_ids: service_ids,
          stylist_ids: stylist_ids,
          time_slot_ids: time_slot_ids
        }       
      })

      return res.status(200).json({
        success: true,
        bookings: response,
      })

    } catch (e) {
      res.status(400).json({
        error: e
      })
    }

  }

  exports.updateBookingStatus = async (req:any, res:any) => {

    let id = req.params.id

    const { 
      status,
   } = req.body

    try {
     
      const response: any = await prisma.booking.update({ 
        where: {
          id: id
        },
        data: {
          status: status,
        }       
      })

      return res.status(200).json({
        success: true,
        bookings: response,
      })

    } catch (e) {
      res.status(400).json({
        error: e
      })
    }

  }

  exports.deleteBooking = async (req:any, res:any) => {

    let id = req.params.id

    let orderDeleted = false;

    try {
     
     const response: any = await prisma.$queryRaw`
     DELETE FROM "Booking" 
     WHERE 
     id::text = ${id} 
     RETURNING id::text` as any;

      if(response[0]?.id){

        try {
     
          const deleteOrder: any = await prisma.$queryRaw`
          DELETE FROM "Order" WHERE ${id} = ANY(booking_ids)` as any;

        } catch (e) {
    
          return res.status(400).json({
            error: e
          })
    
        }
     
        return res.status(200).json({
          success: true,
          message: 'booking deleted'
        })

      } else {
             
        return res.status(400).json({
          success: true,
          message: 'booking not found'
        })

      }
 
    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  

  

