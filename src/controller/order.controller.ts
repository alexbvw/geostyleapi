import { sum } from '../helper/math.helper';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

  var match = false;

  exports.getSpotOrders = async (req:any, res:any) => {

    let orders:any = []
    let id = req.params.id
    let limit = Number(req.query.limit)

    try {
     
      const ordersQuery: any = await prisma.$queryRaw`
        SELECT 
        spot_id::text,
        total,
        status,
        booking_ids,
        customer_id,
        payment_option,
        payment_status,
        line_item_count,
        id::text FROM "Order" WHERE spot_id::text = ${id} FETCH FIRST ${limit} ROWS ONLY` as any;

      orders = ordersQuery;

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

    for (let [index, order] of orders.entries()) {

      var bookings:any = []
      var orderItems:any = []
      let booking_amounts = []
      let item_amounts = []

      if(order.booking_ids != null){
        bookings = await prisma.booking.findMany(
          {
            where: {
              id: {
                in: order.booking_ids
              }
            }
          }
        )
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
        orders[index]['bookings'] = bookings
      } else if(order.booking_ids == null){
        orders[index]['bookings'] = bookings
      } 

      orderItems =  await prisma.$queryRaw`SELECT id::text,order_id::text,product_id::text,quantity,price FROM "OrderItem" WHERE order_id::text = ${orders[index].id}` as any;

      if(orderItems.length > 0){
        for(let [index,orderItem] of orderItems.entries()){
          const orderProductPrice = await prisma.$queryRaw`SELECT price FROM "Product" WHERE id::text = ${orderItem.product_id}` as any;
          if(orderProductPrice.length > 0){
            orderItem.price = orderProductPrice[0].price
            item_amounts.push(orderItem.price * orderItem.quantity)
          } else {
            orderItem.price = 0
          }
        }
    
        orders[index]['order_items'] = orderItems;


      } else {
        orders[index]['order_items'] = [];
      }
        
      for (let [index, booking] of bookings.entries()){
        booking_amounts.push(booking.amount)
      }

      let orderItemsTotal = sum(item_amounts);
      orders[index].total = sum(booking_amounts) + orderItemsTotal;
      orders[index].line_item_count =  sum([bookings.length, orderItems.length]);
    }

      return res.json({
        success: true,
        orders: orders
      })

  }

  exports.getOrders = async (req:any, res:any) => {

    let orders:any = []
    let endDate = req.query.endDate
    let startDate = req.query.startDate
    let limit = Number(req.query.limit)

    try {
     
      const ordersQuery: any = await prisma.$queryRaw`
        SELECT 
        spot_id::text,
        total,
        status,
        booking_ids,
        customer_id,
        payment_option,
        payment_status,
        line_item_count,
        id::text FROM "Order" WHERE created_At::text BETWEEN ${startDate} AND ${endDate} FETCH FIRST ${limit} ROWS ONLY` as any;

      orders = ordersQuery;

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

    for (let [index, order] of orders.entries()) {

      var bookings:any = []
      var orderItems:any = []
      let booking_amounts = []
      let item_amounts = []

      if(order.booking_ids != null){
        bookings = await prisma.booking.findMany(
          {
            where: {
              id: {
                in: order.booking_ids
              }
            }
          }
        )
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
        orders[index]['bookings'] = bookings
      } else if(order.booking_ids == null){
        orders[index]['bookings'] = bookings
      } 

      orderItems =  await prisma.$queryRaw`SELECT id::text,order_id::text,product_id::text,quantity,price FROM "OrderItem" WHERE order_id::text = ${orders[index].id}` as any;

      if(orderItems.length > 0){
        for(let [index,orderItem] of orderItems.entries()){
          const orderProductPrice = await prisma.$queryRaw`SELECT price FROM "Product" WHERE id::text = ${orderItem.product_id}` as any;
          if(orderProductPrice.length > 0){
            orderItem.price = orderProductPrice[0].price
            item_amounts.push(orderItem.price * orderItem.quantity)
          } else {
            orderItem.price = 0
          }
        }
    
        orders[index]['order_items'] = orderItems;


      } else {
        orders[index]['order_items'] = [];
      }
        
      for (let [index, booking] of bookings.entries()){
        booking_amounts.push(booking.amount)
      }

      let orderItemsTotal = sum(item_amounts);
      orders[index].total = sum(booking_amounts) + orderItemsTotal;
      orders[index].line_item_count =  sum([bookings.length, orderItems.length]);
    }

      return res.json({
        success: true,
        orders: orders
      })

  }


  exports.getCustomerOrders = async (req:any, res:any) => {

    let orders:any = []
    let endDate = req.query.endDate
    let startDate = req.query.startDate
    let limit = Number(req.query.limit)
    let customerId = req.query.customerId

    try {
     
      const ordersQuery: any = await prisma.$queryRaw`
        SELECT 
        spot_id::text,
        total,
        status,
        booking_ids,
        customer_id,
        payment_option,
        payment_status,
        line_item_count,
        id::text FROM "Order" WHERE customer_id::text = ${customerId} AND created_At::text BETWEEN ${startDate} AND ${endDate} FETCH FIRST ${limit} ROWS ONLY` as any;

      orders = ordersQuery;

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  for (let [index, order] of orders.entries()) {

      var bookings:any = []
      var orderItems:any = []
      let booking_amounts = []
      let item_amounts = []

      if(order.booking_ids != null){
        bookings = await prisma.booking.findMany(
          {
            where: {
              id: {
                in: order.booking_ids
              }
            }
          }
        )
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
        orders[index]['bookings'] = bookings
      } else if(order.booking_ids == null){
        orders[index]['bookings'] = bookings
      } 

      orderItems =  await prisma.$queryRaw`SELECT id::text,order_id::text,product_id::text,quantity,price FROM "OrderItem" WHERE order_id::text = ${orders[index].id}` as any;

      if(orderItems.length > 0){
        for(let [index,orderItem] of orderItems.entries()){
          const orderProductPrice = await prisma.$queryRaw`SELECT price FROM "Product" WHERE id::text = ${orderItem.product_id}` as any;
          if(orderProductPrice.length > 0){
            orderItem.price = orderProductPrice[0].price
            item_amounts.push(orderItem.price * orderItem.quantity)
          } else {
            orderItem.price = 0
          }
        }
    
        orders[index]['order_items'] = orderItems;


      } else {
        orders[index]['order_items'] = [];
      }
        
      for (let [index, booking] of bookings.entries()){
        booking_amounts.push(booking.amount)
      }

      let orderItemsTotal = sum(item_amounts);
      orders[index].total = sum(booking_amounts) + orderItemsTotal;
      orders[index].line_item_count =  sum([bookings.length, orderItems.length]);
    }

      return res.json({
        success: true,
        orders: orders
      })

  }

  exports.getOrder = async (req:any, res:any) => {

    let id = req.params.id
    let orders = []

    try {
     
        const response: any = await prisma.$queryRaw`
        SELECT 
        spot_id::text,
        total,
        status,
        booking_ids,
        customer_id,
        payment_option,
        payment_status,
        line_item_count,
        id::text FROM "Order" WHERE id::text = ${id}` as any;

     orders = response;

     for (let [index, order] of orders.entries()) {

      var bookings:any = []
      var orderItems:any = []
      let booking_amounts = []
      let item_amounts = []

      if(order.booking_ids != null){
        bookings = await prisma.booking.findMany(
          {
            where: {
              id: {
                in: order.booking_ids
              }
            }
          }
        )
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
        orders[index]['bookings'] = bookings
      } else if(order.booking_ids == null){
        orders[index]['bookings'] = bookings
      } 

      orderItems =  await prisma.$queryRaw`SELECT id::text,order_id::text,product_id::text,quantity,price FROM "OrderItem" WHERE order_id::text = ${orders[index].id}` as any;

      if(orderItems.length > 0){
        for(let [index,orderItem] of orderItems.entries()){
          const orderProductPrice = await prisma.$queryRaw`SELECT price FROM "Product" WHERE id::text = ${orderItem.product_id}` as any;
          if(orderProductPrice.length > 0){
            orderItem.price = orderProductPrice[0].price
            item_amounts.push(orderItem.price * orderItem.quantity)
          } else {
            orderItem.price = 0
          }
        }
    
        orders[index]['order_items'] = orderItems;


      } else {
        orders[index]['order_items'] = [];
      }
        
      for (let [index, booking] of bookings.entries()){
        booking_amounts.push(booking.amount)
      }

      let orderItemsTotal = sum(item_amounts);
      orders[index].total = sum(booking_amounts) + orderItemsTotal;
      orders[index].line_item_count =  sum([bookings.length, orderItems.length]);
    }

    return res.json({
      success: true,
      orders: orders
    })
    
    } catch (e) {
      res.status(400).json({
        error: e
      })
    }

  
   
  }

  exports.postOrder = async (req:any, res:any) => {

    const { 
      spot_id,
      total,
      status,
      booking_ids,
      customer_id,
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
          if(order?.spot_id == spot_id && order?.customer_id == customer_id){
            match = true
          } else {
            match = false
          }
      })

      if(match){

        res.json({
          "message": "order already exists"
        })   

      } else if(!match) {

        try {

          const response: any = await prisma.$queryRaw`
          insert into "Order" 
          (
            "spot_id",
            "total",
            "status",
            "booking_ids",
            "customer_id",
            "payment_option",
            "payment_status",
            "line_item_count"
          ) values
          (
            ${spot_id}::uuid,
            ${total},
            ${status},
            ${booking_ids},
            ${customer_id}::uuid,
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

  exports.updateOrder = async (req:any, res:any) => {

    let id = req.params.id
    const { 
      total,
      status,
      booking_ids,
      customer_id,
      payment_option,
      payment_status,
      line_item_count
     } = req.body

    try {

      const updateOrderQuery: any = await prisma.order.update({
        where: {
          id: id
        },
        data: {
          total: total,
          status: status,
          booking_ids: booking_ids,
          customer_id: customer_id,
          payment_option: payment_option,
          payment_status: payment_status,
          line_item_count: line_item_count
        }
      })
     

      return res.json({
        success: true,
        orders: updateOrderQuery
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.updateOrderStatus = async (req:any, res:any) => {

    let id = req.params.id

    const { 
      status,
   } = req.body

    try {
     
      const response: any = await prisma.order.update({ 
        where: {
          id: id
        },
        data: {
          status: status,
        }       
      })

      return res.status(200).json({
        success: true,
        orders: response,
      })

    } catch (e) {
      res.status(400).json({
        error: e
      })
    }

  }

  exports.deleteOrder = async (req:any, res:any) => {

    let orderItems:any
    let id = req.params.id
    let deleteOrderQuery:any

    try {

     deleteOrderQuery = await prisma.$queryRaw`
     DELETE FROM "Order" 
     WHERE 
     id::text = ${id} 
     RETURNING booking_ids::text` as any;

     orderItems = await prisma.$queryRaw`
     SELECT id::text FROM "OrderItem" 
     WHERE 
     order_id::text = ${id}` as any;
     
     if(orderItems?.length > 0){
      try {

        const deleteOrderItems = await prisma.orderItem.deleteMany(
          {
            where: {
              order_id: id
            }
          }
        )

      } catch (e) {

        return res.status(400).json({
          error: e
        })
        
      }
     }

     let updatedBookingIds = []

     if(deleteOrderQuery[0]?.booking_ids.split(',').length > 1){
      let bookingIds = deleteOrderQuery[0]?.booking_ids.split(',')
     
      for(let [bookingIdIndex, bookingId] of bookingIds.entries()){
       if(bookingId.includes('{')){
         bookingId = bookingId.replace('{', '')
         updatedBookingIds.push(bookingId);
       } else if(bookingId.includes('}')){
         bookingId = bookingId.replace('}', '')
         updatedBookingIds.push(bookingId);
       }
      }
     } else {
      updatedBookingIds.push(deleteOrderQuery[0].booking_ids)
     }
    

    if(deleteOrderQuery[0]?.booking_ids.length > 0){
      try {
        const deleteBookings = await prisma.booking.deleteMany(
          {
            where: {
              id: {
                in: updatedBookingIds
              }
            }
          }
        )
      } catch (e) {
        // return res.status(400).json({
        //   error: e
        // })
      }

      return res.status(200).json({
        success: true,
        message: 'order deleted'
      })

      } else {        
          return res.status(400).json({
          success: true,
          message: 'order not found'
        })
      }

    } catch (e) {
      res.status(400).json({
        error: e
      })
    }
  }




  

  

