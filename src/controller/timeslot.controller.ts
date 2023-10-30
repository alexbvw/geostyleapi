import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

  var match = false;

  exports.generateTimeslots = async (req:any, res:any) => {

    let spot_id = req.query.spotId

    var days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ]

    var timeslotsArr = [
        {
            "start_time":  "09:00",
            "end_time": "09:30"
        },
        {
            "start_time":  "09:30",
            "end_time": "10:00"
        },
        {
            "start_time":  "10:00",
            "end_time": "10:30"
        },
        {
            "start_time":  "10:30",
            "end_time": "11:00"
        },
        {
            "start_time":  "11:00",
            "end_time": "11:30"
        },
        {
            "start_time":  "11:30",
            "end_time": "12:00"
        },
        {
            "start_time":  "12:00",
            "end_time": "12:30"
        },
        {
            "start_time":  "12:30",
            "end_time": "13:00"
        },
        {
            "start_time":  "13:00",
            "end_time": "13:30"
        },
        {
            "start_time":  "13:30",
            "end_time": "14:00"
        },
        {
            "start_time":  "14:00",
            "end_time": "14:30"
        },
        {
            "start_time":  "14:30",
            "end_time": "15:00"
        },
        {
            "start_time":  "15:00",
            "end_time": "15:30"
        },
        {
            "start_time":  "15:30",
            "end_time": "16:00"
        },
        {
            "start_time":  "16:00",
            "end_time": "16:30"
        },
        {
            "start_time":  "16:30",
            "end_time": "17:00"
        },
        {
            "start_time":  "17:00",
            "end_time": "17:30"
        },
        {
            "start_time":  "17:30",
            "end_time": "18:00"
        }     
    ]

    var newTimeSlots:any = [];

    for(let [dayIndex, day] of days.entries()){
      for(let [timeslotIndex, timeslot] of timeslotsArr.entries()){
        let newTimeSlot = {
          spot_id: spot_id,
          date: "",         
          day_name: day,
          available: true,   
          start_time: timeslot.start_time,  
          end_time: timeslot.end_time     
        }
        newTimeSlots.push(newTimeSlot)
      }
    }

    const timeslots:any = await prisma.$queryRaw`
    SELECT 
    spot_id::text,
    date,
    day_name,
    end_time,
    available,
    start_time,
    id::text FROM "Timeslot" WHERE spot_id::text = ${spot_id}` as any;

    if(timeslots.length > 0){
      for(let [timeslotIndex, timeslot] of timeslots?.entries()){
        for(let [newTimeSlotIndex, newTimeSlot] of newTimeSlots?.entries()){
          if(timeslot.spot_id == newTimeSlot.spot_id && timeslot.day_name == newTimeSlot.day_name && timeslot.start_time == newTimeSlot.start_time && timeslot.end_time == newTimeSlot.end_time){
            match = true;
          }
        }
      }
    } else {
      match = false
    }

    if(match){

      res.status(400).json({
        message: 'timeslots already generated'
      })

    } else if(!match) {
      
      try {

        const response: any = await prisma.timeslot.createMany({
          data: newTimeSlots,
          skipDuplicates: true,
        })

        res.status(200).json({
          success: true,
          total: response,
          message: "timeslots saved"
        })

      } catch (e) {

        res.status(400).json({
          error: e
        })

      }

    }

  }

  exports.getTimeslotsAvailable = async (req:any, res:any) => {

    try {
      
        const response: any = await prisma.$queryRaw`
        SELECT 
        spot_id::text,
        date,
        day_name,
        end_time,
        available,
        start_time,
        id::text FROM "Timeslot" WHERE available = true` as any;

      return res.json({
        success: true,
        timeslots: response
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }



  exports.getSpotTimeslots = async (req:any, res:any) => {
    let id = req.params.id
    let day = req.query.day

    try {
     
      const response: any = await prisma.$queryRaw`
      SELECT 
      spot_id::text,
      date,
      day_name,
      end_time,
      available,
      start_time,
      id::text FROM "Timeslot" WHERE day_name LIKE ${day} AND spot_id::text = ${id} AND available = true` as any;

      return res.json({
        success: true,
        timeslots: response,
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.getSpotTimeslotsSeries = async (req:any, res:any) => {

    let id = req.params.id
    var days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
  ]

    var availableTimeSlotSeries = [

    ]

    for(let [dayIndex, day] of days.entries()){
      try {
      
        const availableCount: any = await prisma.$queryRaw`
        SELECT 
        COUNT(*) 
        FROM "Timeslot" WHERE day_name LIKE ${day} AND spot_id::text = ${id} AND available = true` as any;

        availableTimeSlotSeries.push(Number(availableCount[0].count.toString()))

      } catch (e) {

        res.status(400).json({
          error: e
        })

      }
  }

  return res.json({
    success: true,
    timeslotSeries: availableTimeSlotSeries,
  })

}


  exports.getTimeslots = async (req:any, res:any) => {

    let day = req.query.day

    try {
     
      const response: any = await prisma.$queryRaw`
      SELECT 
      spot_id::text,
      date,
      day_name,
      end_time,
      available,
      start_time,
      id::text FROM "Timeslot" WHERE day_name LIKE ${day}` as any;

      return res.json({
        success: true,
        timeslots: response,
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.getTimeslot = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
        const response: any = await prisma.$queryRaw`
        SELECT 
        spot_id::text,
        date,
        day_name,
        end_time,
        available,
        start_time,
        id::text FROM "Timeslot" WHERE id::text = ${id}` as any;

      return res.status(200).json({
        success: true,
        timeslots: response
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.postTimeslot = async (req:any, res:any) => {

    const { 
      spot_id,
      date,
      end_time,
      duration,
      day_name,
      available,
      start_time
     } = req.body
    const timeslots:any = await prisma.$queryRaw`
    SELECT 
    id::text, 
    start_time::text
    FROM "Timeslot"` as any;
 
      timeslots?.forEach((timeSlot:any) => {

          if(timeSlot?.start_time == start_time && timeSlot.spot_id == spot_id){
            match = true
          } else {
            match = false
          }

      });

      if(match){

        res.json({
          "message": "timeslot already exists"
        });

      } else if(!match) {

        try {

          const response: any = await prisma.$queryRaw`
          insert into "Timeslot" 
          (
            "spot_id",
            "date",
            "day_name",
            "end_time",
            "duration",
            "available",
            "start_time"
          ) values
          (
            ${spot_id}::uuid,
            ${date},
            ${day_name},
            ${end_time},
            ${duration},
            ${available},
            ${start_time}
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

  exports.updateTimeslot = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
        const response: any = await prisma.$queryRaw`
        UPDATE 
        date,
        day_name,
        end_time,
        available,
        start_time,
        id::text FROM "Timeslot" WHERE id::text = ${id}` as any;

      return res.status(200).json({
        success: true,
        timeslots: response
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.deleteTimeslot = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
        const response: any = await prisma.$queryRaw`
        DELETE FROM "Timeslot" 
        WHERE 
        id::text = ${id} 
        RETURNING id::text` as any;

      if(response[0]?.id){
     
        return res.status(200).json({
          success: true,
          message: 'timeslot deleted',
        })

      } else {
             
          return res.status(400).json({
          success: true,
          message: 'timeslot not found',
        })

      }
 
    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }
  
