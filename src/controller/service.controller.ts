import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

  var match = false;

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

  exports.uploadServiceImage = async (req:any, res:any) => {
    let ImageFile;
    let uploadPath;
  
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    ImageFile = req?.files?.image;
    // console.log(ImageFile);
    // uploadPath = __dirname + '/uploads' + sampleFile?.name;
  
    // // Use the mv() method to place the file somewhere on your server
    // sampleFile?.mv(uploadPath, function(err:any) {
    //   if (err)
    //     return res.status(400).send(err);
  
    //   res.send('File uploaded!');
    // });

  }

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


  

  

