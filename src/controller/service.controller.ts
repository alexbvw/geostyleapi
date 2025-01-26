import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

var match = false;
export const prisma = new PrismaClient();
const supabase = createClient('https://gotuhgkivvglmxdzvqvd.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdHVoZ2tpdnZnbG14ZHp2cXZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMjAxOTM0MCwiZXhwIjoyMDM3NTk1MzQwfQ.oY4yYqa0MYhg7QsNnW5F73F2is2cReWrifa9fu0Qvy4')

  exports.getSpotServices = async (req:any, res:any) => {

    let id = req.params.id
    let limit = Number(req.query.limit)

    try {
     
      const response: any = await prisma.$queryRaw`
        SELECT 
        spot_id::text,
        service_name,
        service_description,
        estimate_hours,
        amount_per_hour,
        image_url,
        id::text FROM "Service" WHERE spot_id::text = ${id} FETCH FIRST ${limit} ROWS ONLY` as any;

      return res.status(200).json({
        success: true,
        services: response,
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.getServices = async (req:any, res:any) => {

    let limit = Number(req.query.limit)

    try {
     
      const response: any = await prisma.$queryRaw`
        SELECT 
        spot_id::text,
        service_name,
        service_description,
        estimate_hours,
        amount_per_hour,
        image_url,
        id::text FROM "Service" FETCH FIRST ${limit} ROWS ONLY` as any;

      return res.status(200).json({
        success: true,
        services: response,
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.getService = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
      const response: any = await prisma.$queryRaw`
      SELECT 
      spot_id::text,
      service_name,
      service_description,
      estimate_hours,
      amount_per_hour,
      image_url,
      id::text FROM "Service" WHERE id::text = ${id}` as any;

      return res.json({
        success: true,
        services: response,
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.postService = async (req:any, res:any) => {

    const { 
      spot_id,
      service_name,
      service_description,
      estimate_hours,
      amount_per_hour,
      image_url
     } = req.body
     
    const services:any = await prisma.$queryRaw`
    SELECT 
    id::text, 
    service_name::text
    FROM "Service"` as any;
 
     for(let [serviceIndex, service] of services.entries()){
      if(service?.spot_id == spot_id && service?.service_name == service_name){
        match = true
      } else {
        match = false
      }
     }

      if(match){

        res.status(400).json({
          "message": "service already exists"
        })   

      } else if(!match) {

        try {

          const response: any = await prisma.$queryRaw`
          insert into "Service" 
          (
            "spot_id",
            "service_name",
            "service_description",
            "estimate_hours",
            "amount_per_hour",
            "image_url"
          ) values
          (
            ${spot_id}::uuid,
            ${service_name},
            ${service_description}, 
            ${estimate_hours},
            ${amount_per_hour}, 
            ${image_url}
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
  

  exports.uploadServiceImage = async (req: any, res: any) => {
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
         const response: any = await prisma.service.update({
           where: {
             id: id
           },
           data: {
             image_url: publicURL
           }
         })
    
          return res.status(200).json({
            success: true,
            services: response
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

  exports.deleteServiceImage = async (req: any, res: any) => {
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

  exports.updateService = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
      const response: any = await prisma.$queryRaw`UPDATE 
      spot_id, 
      service_name, 
      service_description, 
      estimate_hours, 
      amount_per_hour, 
      image_url FROM "Service" WHERE id::text = ${id}` as any;

      return res.status(200).json({
        success: true,
        services: response
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.deleteService = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
     const response: any = await prisma.$queryRaw`
     DELETE FROM "Service" 
     WHERE 
     id::text = ${id} 
     RETURNING id::text` as any;

      if(response[0]?.id){
     
        return res.status(200).json({
          success: true,
          message: 'service deleted'
        })

      } else {
             
        return res.status(400).json({
          success: true,
          message: 'service not found'
        })

      }
 
    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }


  

  

