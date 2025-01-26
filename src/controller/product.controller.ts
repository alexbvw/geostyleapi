import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

var match = false;
export const prisma = new PrismaClient();
const supabase = createClient('https://gotuhgkivvglmxdzvqvd.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdHVoZ2tpdnZnbG14ZHp2cXZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMjAxOTM0MCwiZXhwIjoyMDM3NTk1MzQwfQ.oY4yYqa0MYhg7QsNnW5F73F2is2cReWrifa9fu0Qvy4')

  exports.getSpotProducts = async (req:any, res:any) => {

    let id = req.params.id
    let limit = Number(req.query.limit)

    try {
     
        const response: any = await prisma.$queryRaw`
        SELECT 
        spot_id::text,
        price,
        in_stock,
        image_url,
        stock_count,
        product_name,
        product_category,
        product_description,
        id::text FROM "Product" WHERE spot_id::text = ${id} FETCH FIRST ${limit} ROWS ONLY` as any;

      return res.status(200).json({
        success: true,
        products: response,
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }
  }

  exports.getBulkProducts = async (req:any, res:any) => {
    let productIds = req.query?.product_ids?.split(",")
    let limit = Number(req.query.limit)
    if(productIds.length > 0){
      if(productIds[0] != ''){
        try {
          const products = await prisma.product.findMany(
            {
              take: limit,
              where: {
                id: {
                  in: productIds
                }
              }
            }
          )
          return res.status(200).json({
            success: true,
            products: products,
          })
        } catch (e) {
          res.status(400).json({
            error: e
          })
        }
      } else{
        return res.status(200).json({
          success: true,
          products: [],
        })
      }
    } else {
      return res.status(200).json({
        success: true,
        products: [],
      })
    }
  }

  exports.getProducts = async (req:any, res:any) => {

    let limit = Number(req.query.limit)

    try {
     
        const response: any = await prisma.$queryRaw`
        SELECT 
        spot_id::text,
        price,
        in_stock,
        image_url,
        stock_count,
        product_name,
        product_category,
        product_description,
        id::text FROM "Product" FETCH FIRST ${limit} ROWS ONLY` as any;

      return res.status(200).json({
        success: true,
        products: response,
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }
  }

  exports.getProduct = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
        const response: any = await prisma.$queryRaw`
        SELECT 
        spot_id::text,
        price,
        in_stock,
        image_url,
        stock_count,
        product_name,
        product_category,
        product_description,
        id::text FROM "Product" WHERE id::text = ${id}` as any;

      return res.status(200).json({
        success: true,
        products: response,
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }
  }

  exports.postProduct = async (req:any, res:any) => {

      const { 
        spot_id,
        price,
        in_stock,
        image_url,
        stock_count,
        product_name,
        product_category,
        product_description
      } = req.body

      const products:any = await prisma.$queryRaw`
      SELECT 
      id::text, 
      spot_id::text,
      product_name::text
      FROM "Product"` as any;
      
      products?.forEach((product:any) => {
          if(product.spot_id == spot_id && product?.product_name == product_name){
            match = true
          } 
      })

      if(match){

        res.status(400).json({
          "message": "product already exists"
        })   

      } else if(!match) {

        try {

          const response: any = await prisma.$queryRaw`
          insert into "Product" 
          (
            "spot_id",
            "price",
            "in_stock",
            "image_url",
            "stock_count",
            "product_name",
            "product_category",
            "product_description"
          ) values
          (
            ${spot_id}::uuid,
            ${price},
            ${in_stock},
            ${image_url},
            ${stock_count},
            ${product_name},
            ${product_category},
            ${product_description}
          )
          returning id` as any;

          res.status(200).json({
            success: true,
            id: response[0].id,
          })
          
        } catch (e) {

          res.status(400).json({
            error: e
          })

        }
      }
  }

  exports.bulkPostProduct = async (req:any, res:any) => {

    var uploadProducts = []
    uploadProducts = req.body

    if(uploadProducts.length > 0){

      try {

        const response: any = await prisma.product.createMany({
          data: uploadProducts,
          skipDuplicates: true,
        })

        res.status(200).json({
          success: true,
          message: "Products saved.",
          total: response,
        })

      } catch (e) {

        res.status(400).json({
          error: e
        })

      }
    } else {

      res.status(400).json({
        error: 'no products'
      })

    }
  }

  
    exports.uploadProductImage = async (req: any, res: any) => {
      let id = req.params.id
      console.log(id)
      try {
        // Ensure a file is uploaded
        if (!req.files || !req.files.image) {
          return res.status(400).send('No image file was uploaded.');
        }
        console.log(res)
        const imageFile = req.files.image;
    
        // Create a unique filename to avoid overwriting existing files
        const uniqueFileName = `${Date.now()}_${imageFile.name}`;
        const { data, error } = await supabase.storage.from('manifest').upload(uniqueFileName, imageFile.data);
        console.log(data)
        if (error) {
          res.status(500).json({ error: error });
        } else {
          
          try {
           let publicURL = 'https://gotuhgkivvglmxdzvqvd.supabase.co/storage/v1/object/public/'+data.fullPath
           const response: any = await prisma.product.update({
             where: {
               id: id
             },
             data: {
               image_url: publicURL
             }
           })
      
            return res.status(200).json({
              success: true,
              products: response
            })
      
          } catch (e) {
      
            res.status(400).json({
              error: e
            })
      
          }
          return res.status(200).json({
            success: true,
            file: data.fullPath
          })
        }
  
      } catch (error: any) {
        res.status(500).json({ error: error });
      }
    };
  
    exports.deleteProductImage = async (req: any, res: any) => {
      const { id } = req.params;
      const { data, error } = await supabase.storage.from('manifest').remove([id]);
      if (error) {
        res.status(500).json({ error: error });
      } else {
        return res.status(200).json({
          success: true,
          file: data
        });
      }
    };
  


  exports.updateProduct = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
        const response: any = await prisma.$queryRaw`
        UPDATE 
        spot_id::text,
        price,
        in_stock,
        image_url,
        stock_count,
        product_name,
        product_category,
        product_description,
        id::text FROM "Product" WHERE id::text = ${id}` as any;

      return res.status(200).json({
        success: true,
        products: response
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }
  }

  exports.deleteProduct = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
     const response: any = await prisma.$queryRaw`
     DELETE FROM "Product" 
     WHERE 
     id::text = ${id} 
     RETURNING id::text` as any;

      if(response[0]?.id){
     
        return res.status(200).json({
          success: true,
          message: 'product deleted',
        })

      } else {
             
          return res.status(400).json({
          success: true,
          message: 'product not found',
        })

      }
 
    } catch (e) {

      res.status(400).json({
        error: e
      })

    }
  }

  exports.updateProducts = async (req:any, res:any) => {

    const { 
        spot_id,
        price,
        in_stock,
        image_url,
        stock_count,
        product_name,
        product_category,
        product_description
      } = req.body

    const products:any = await prisma.$queryRaw`
    SELECT 
    id::text, 
    product_name::text
    FROM "Product"` as any;

    products?.forEach((product:any) => {
        if(product?.product_name == product_name){
          match = true
        } else {
          match = false
        }
    })

    if(match){

      res.status(400).json({
        "message": "product already exists"
      })   

    } else if(!match) {

      try {

        const response: any = await prisma.$queryRaw`
        insert into "Product" 
        (
          "spot_id",
          "price",
          "in_stock",
          "image_url",
          "stock_count",
          "product_name",
          "product_category",
          "product_description"
        ) values
        (
          ${spot_id}::uuid,
          ${price},
          ${in_stock},
          ${image_url},
          ${stock_count},
          ${product_name},
          ${product_category},
          ${product_description}
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


  

  

