import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

  var match = false;

  function calcCrow(lat1:any, lng1:any, lat2:any, lng2:any) 
  {
    var R = 6371; // km
    var dLat = toRad(lat2-lat1);
    var dLon = toRad(lng2-lng1);
    lat1 = toRad(lat1);
    lat2 = toRad(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
  }

  // Converts numeric degrees to radians
  function toRad(value:any) 
  {
      return value * Math.PI / 180;
  }

  exports.getSpots = async (req:any, res:any) => {

    let limit = Number(req.query.limit)

    try {
     
      const spots: any = await prisma.$queryRaw`
        SELECT 
        name,
        images,
        active,
        address,
        radius,
        latitude,
        longitude,
        open_hour,
        close_hour,
        admin_id::text,
        stylist_ids,
        customer_ids,
        id::text FROM "Spot" FETCH FIRST ${limit} ROWS ONLY` as any;

      // if(spots.length > 0){
      //   spots.forEach((spot:any) => {
      //     spot['distance'] = calcCrow(spot.latitude, spot.longitude, users[0].latitude, users[0].longitude).toFixed(2)
      //   })
      // }

      return res.status(200).json({
        success: true,
        spots: spots,
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.getCurrentLocationSpots = async (req:any, res:any) => {

    let latitude = req.query.latitude
    let longitude = req.query.longitude

     try {
     
        const query = await prisma.$queryRaw<{ id: any }[]>`SELECT id, longitude, latitude, radius, name FROM "Spot" WHERE ST_DWithin(ST_MakePoint(longitude, latitude), ST_MakePoint(${longitude}::Float, ${latitude}::Float)::geography, radius * 15)`
      
        const spots = await prisma.spot.findMany({
          where: {
            id: {
              in: query.map(({ id }) => id)
            }
          }
        })

      return res.status(200).json({
        success: true,
        spots: spots
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }
     
  }

  exports.getCustomerSpots = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
      const users: any = await prisma.$queryRaw`SELECT name::text, phone_number::text, role::text, order_ids, current_address::text, active, radius, latitude, longitude, id::text FROM "Customer" WHERE id::text = ${id}` as any;
      try {
     
        const query = await prisma.$queryRaw<{ id: any }[]>`SELECT id, longitude, latitude, radius, name FROM "Spot" WHERE ST_DWithin(ST_MakePoint(longitude, latitude), ST_MakePoint(${users[0].longitude}, ${users[0].latitude})::geography, radius * 15)`
      
        const spots = await prisma.spot.findMany({
          where: {
            id: {
              in: query.map(({ id }) => id)
            }
          }
        })

        if(spots.length > 0){
          spots.forEach((spot:any) => {
            spot['distance'] = calcCrow(spot.latitude, spot.longitude, users[0].latitude, users[0].longitude).toFixed(2)
          })
        }

      return res.status(200).json({
        success: true,
        spots: spots
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

  exports.getStylistSpots = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
      const stylists: any = await prisma.$queryRaw`SELECT name::text, phone_number::text, role::text, current_address::text, active, radius, latitude, longitude, id::text FROM "Stylist" WHERE id::text = ${id}` as any;
      try {
     
        const query = await prisma.$queryRaw<{ id: any }[]>`SELECT id, longitude, latitude, radius, name FROM "Spot" WHERE ST_DWithin(ST_MakePoint(longitude, latitude), ST_MakePoint(${stylists[0].longitude}, ${stylists[0].latitude})::geography, radius * 15)`
      
        const spots = await prisma.spot.findMany({
          where: {
            id: {
              in: query.map(({ id }) => id)
            }
          }
        })

        if(spots.length > 0){
          spots.forEach((spot:any) => {
            spot['distance'] = calcCrow(spot.latitude, spot.longitude, stylists[0].latitude, stylists[0].longitude).toFixed(2)
          })
        }

      return res.status(200).json({
        success: true,
        spots: spots
      })

    } catch (e) {

      res.status(400).json({
        error: true,
        message: "stylist not found"
      })

    }


    } catch (e) {

      res.status(400).json({
        error: e
      })

    }
     
  }

  exports.getSpot = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
        const response: any = await prisma.$queryRaw`
        SELECT 
        name,
        images,
        active,
        address,
        radius,
        latitude,
        longitude,
        open_hour,
        close_hour,
        admin_id::text,
        stylist_ids,
        customer_ids,
        id::text FROM "Spot" WHERE id::text = ${id}` as any;

      return res.status(200).json({
        success: true,
        spots: response
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.postSpot = async (req:any, res:any) => {

    const { 
        radius,
        latitude,
        longitude,
        name,
        images,
        active,
        address,
        admin_id,
        open_hour,
        close_hour,
        stylist_ids,
        customer_ids
     } = req.body
    const spots:any = await prisma.$queryRaw`
    SELECT 
    id::text, 
    name::text
    FROM "Spot"` as any;
 
      spots?.forEach((spot:any) => {
          if(spot?.name == name){
            match = true
          } else {
            match = false
          }
      });

      if(match){

        res.status(400).json({
          "message": "spot already exists"
        })   

      } else if(!match) {

        try {

          const response: any = await prisma.$queryRaw`
          insert into "Spot" 
          (
            "radius",
            "latitude",
            "longitude",
            "name",
            "images",
            "active",
            "address",
            "admin_id",
            "open_hour",
            "close_hour",
            "stylist_ids",
            "customer_ids"
          ) values
          (
            ${radius},
            ${latitude},
            ${longitude},
            ${name},
            ${images},
            ${active},
            ${address},
            ${admin_id}::uuid,
            ${open_hour},
            ${close_hour},
            ${stylist_ids},
            ${customer_ids}
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

  exports.uploadSpotImage = async (req:any, res:any) => {
    let ImageFile;
    let uploadPath;
  
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('no files were uploaded.');
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

  exports.updateSpot = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
      const response: any = await prisma.$queryRaw`UPDATE 
        name,
        image,
        active,
        address,
        open_hour,
        close_hour,
        stylist_ids,
        admin_id::uuid,
        customer_ids FROM "Spot" WHERE id::text = ${id}` as any;

      return res.status(200).json({
        success: true,
        spots: response
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.deleteSpot = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
     const response: any = await prisma.$queryRaw`
     DELETE FROM "Spot" 
     WHERE 
     id::text = ${id} 
     RETURNING id::text` as any;

      if(response[0]?.id){
     
        return res.status(200).json({
          success: true,
          message: 'spot deleted'
        })

      } else {
             
          return res.status(400).json({
          success: true,
          message: 'spot not found'
        })

      }
 
    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }


  

  

