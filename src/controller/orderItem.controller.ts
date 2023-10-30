import { PrismaClient } from '@prisma/client';
import { P } from 'pino';

export const prisma = new PrismaClient();



  exports.postOrderItem = async (req:any, res:any) => {
    var match = false;
    var order_id:any;

    const { 
        spot_id,
        price,
        customer_id,
        quantity,
        product_id
     } = req.body

    try {
     
        const ordersQuery: any = await prisma.$queryRaw`
        SELECT 
        spot_id::text,
        total,
        status,
        booking_ids,
        customer_id::text,
        payment_option,
        payment_status,
        line_item_count,
        id::text FROM "Order" WHERE customer_id::text = ${customer_id} AND status = ${"OPEN"}` as any;
  
        if(ordersQuery.length > 0){

        order_id = ordersQuery[0].id
        const orderItems:any = await prisma.$queryRaw`SELECT id::text,order_id::text,product_id::text,quantity,price FROM "OrderItem" WHERE order_id::text = ${order_id}` as any;

        if(orderItems.length > 0){

          for(let [orderItemIndex, orderItem] of orderItems.entries()){
            if(orderItem?.product_id == product_id && orderItem?.order_id == order_id){
              match = true;
            }
          }

          if(match){

            res.status(400).json({
              "message": "item already added to order"
            })   

          } else if(!match) {

            try {
              const response: any = await prisma.$queryRaw`
              insert into "OrderItem" 
              (
                "price",
                "order_id",
                "quantity",
                "product_id"
              ) values
              (
                ${price},
                ${order_id}::uuid,
                ${quantity},
                ${product_id}::uuid
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

        } else if(orderItems.length == 0) {

          try {
            const response: any = await prisma.$queryRaw`
            insert into "OrderItem" 
            (
              "price",
              "order_id",
              "quantity",
              "product_id"
            ) values
            (
              ${price},
              ${order_id}::uuid,
              ${quantity},
              ${product_id}::uuid
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
          
        } else {
          
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
                    ${0},
                    ${"OPEN"},
                    ${customer_id}::uuid,
                    ${[]},
                    ${"INSTORE"},
                    ${false},
                    ${0}
                )
                returning id` as any;
                order_id = response[0].id

                try {
                  const response: any = await prisma.$queryRaw`
                  insert into "OrderItem" 
                  (
                    "price",
                    "order_id",
                    "quantity",
                    "product_id"
                  ) values
                  (
                    ${price},
                    ${order_id}::uuid,
                    ${quantity},
                    ${product_id}::uuid
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
    
              } catch (e) {
                
                res.status(400).json({
                  error: e
                })

              }

            }
            
      } catch (e) {

        res.status(400).json({
          error: e
        })

      }

    
  }

  exports.incrementOrderItem = async (req:any, res:any) => {

    let id = req.params.id
  
    try {
      var quantity
      const findOrderItem: any = await prisma.$queryRaw`
      SELECT 
      quantity
      id::text FROM "OrderItem" WHERE id::text = ${id}` as any;

      console.log(findOrderItem)
      quantity = findOrderItem.quantity

      if(findOrderItem != null){
        try {

         const incrementItem: any = await prisma.orderItem.update({ 
            where: {
              id: id
            },
            data: {
              quantity: quantity++,
            }       
          })
    
          return res.status(200).json({
            success: true,
            orderItems: incrementItem
          })
    
        } catch (e) {
    
          res.status(400).json({
            error: e
          })
    
        }
      }
      else {

        res.status(404).json({
          message: "order item not found"
        })

      }

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.decrementOrderItem = async (req:any, res:any) => {

    let id = req.params.id
  
    try {
      var quantity
      const findOrderItem: any = await prisma.$queryRaw`
      SELECT 
      quantity
      id::text FROM "OrderItem" WHERE id::text = ${id}` as any;

      console.log(findOrderItem)
      quantity = findOrderItem.quantity

      if(findOrderItem != null){
        try {

         const incrementItem: any = await prisma.orderItem.update({ 
            where: {
              id: id
            },
            data: {
              quantity: quantity--,
            }       
          })
    
          return res.status(200).json({
            success: true,
            orderItems: incrementItem
          })
    
        } catch (e) {
    
          res.status(400).json({
            error: e
          })
    
        }
      }
      else {

        res.status(404).json({
          message: "order item not found"
        })

      }

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.updateOrderItem = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
      const response: any = await prisma.$queryRaw`UPDATE order_id::uuid,product_id::uuid,quantity,price FROM "OrderItem" WHERE id::text = ${id}` as any;

      return res.status(200).json({
        success: true,
        orderItems: response
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.deleteOrderItem = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
     const response: any = await prisma.$queryRaw`
     DELETE FROM "OrderItem" 
     WHERE 
     id::text = ${id} 
     RETURNING id::text` as any;

      if(response[0]?.id){

        return res.status(200).json({
          success: true,
          message: 'item deleted'
        })

      } else {           

          return res.status(400).json({
          success: false,
          message: 'item not found'
        })

      }
 
    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }


  

  

