import axios from 'axios';
import bcrypt from 'bcrypt';
import { env } from 'process';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { STATUS_CODES } from 'http';

export const prisma = new PrismaClient();

  var match = false;
  
  exports.loginAdmin = async (req:any, res:any) => {

    const { phone_number, pin_code } = req.body

    const admins:any = await prisma.$queryRaw`SELECT id::text,name::text,phone_number::text,pin_code::text,active FROM "Admin" WHERE phone_number = ${phone_number}` as any;
    if(admins[0]){

        var adminFound = false
        var admin = admins[0]
        var adminId = admin?.id
        var adminName = admin?.name
        var adminActive = admin?.active
        var adminPinCode = admin?.pin_code
        var adminPhoneNumber = admin.phone_number

        const checkPassword = bcrypt.compareSync(pin_code, adminPinCode)

        if (adminPhoneNumber == admin.phone_number){
          adminFound = true
          if(checkPassword){
            match = true
          } else if(!checkPassword) {
            match = false
          }
        } else {
          adminFound = false
        }

        if(adminFound && match){

          const token = jwt.sign({ id: adminId, name: adminName }, env.ADMINSECRET ?? '', { expiresIn: '2h',  algorithm: 'HS512'});
          const refreshToken = jwt.sign({ id: adminId, name: adminName }, env.ADMINSECRET ?? '', { expiresIn: '8h', algorithm: 'HS384'});

          res.json({
            "active": adminActive,
            "token": token,
            "refreshToken": refreshToken,
            "message": "welcome to geostyle"
          })   

        } else if(!adminFound || !match) {

         res.status(401).json({
            "active": adminActive,
            "token": "haha",
            "message": "unauthorized"
          })  

        }

    } else {

      res.status(401).json({
        "active": adminActive,
        "token": "haha",
        "message": "unauthorized"
      })   

    }

  }

  exports.registerAdmin = async (req:any, res:any) => {
    var { 
      radius,
      latitude,
      longitude,
      name, 
      phone_number,
      current_address,
      pin_code, 
      role,
      active
    } = req.body
    const admins:any = await prisma.$queryRaw` SELECT name::text,id::text,phone_number FROM "Admin" ` as any;
    if (admins.length > 0){
      admins?.forEach((admin:any) => {
          if(admin?.phone_number == phone_number){
            match = true
          } else {
            match = false
          }
      })
    }
      if(match){
        res.json({
          "message": "admin already exists"
        })   
      } else if(!match) {
        pin_code = bcrypt.hashSync(pin_code, 8);
        try {
          const response: any = await prisma.$queryRaw`
          insert into "Admin" (
            "radius",
            "latitude",
            "longitude", 
            "name",
            "phone_number",
            "current_address",
            "pin_code",
            "role",
            "active"
             ) values
          (
            ${radius},
            ${latitude},
            ${longitude}, 
            ${name},
            ${phone_number},
            ${current_address},
            ${pin_code},
            ${role},
            ${active} 
          )
          returning id` as any;
          res.status(200).json({
            message: "succesfully registered",
            active: active,
            success: true,
            id: response[0].id
          })
        } catch (e) {
          res.status(400).json({
            message: "registration error, please retry or contact support.",
            error: e
          })
        }
      }
  }

  exports.refreshLogin = async (req:any, res:any) => {

    const { refreshToken } = req.body

    try {
      
      var decoded:any = jwt.verify(refreshToken, env.SECRET ?? '', { algorithms: ['HS384'] });
      var id = decoded.id
      
      const admins: any = await prisma.$queryRaw`SELECT name::text,id::text FROM "Admin" WHERE id::text = ${id}` as any;
      
      var admin = admins[0]
      var adminName = admin.name
      var adminId = admin.id

      const token = jwt.sign({ id: adminId, name: adminName }, env.ADMINSECRET ?? '', { expiresIn: '2h',  algorithm: 'HS512'});
      const newRefreshToken = jwt.sign({ id: adminId, name: adminName }, env.ADMINSECRET ?? '', { expiresIn: '8h', algorithm: 'HS384'});

      res.status(200).json({
        "token": token,
        "refreshToken": newRefreshToken,
        "message": "token refreshed"
      })   

    } catch(err:any) {
     
      res.status(401).json({
        "token": "haha",
        "message": "unauthorized"
      })   

    }

    return

  }
  
  exports.getAddressDetails = async (req:any, res:any) => { 

    let q = req.query.q;
    let apiKey = req.query.apiKey;

    type Position = {
      lat: Number,
      lng: Number
    }
  
    type Access = {
      lat: Number,
      lng: Number
    }
  
    type MapView = {
      west: Number
      south: Number
      east: Number
      north: Number
    }
  
    type FieldScore = {
      country: Number, 
      city: Number,
      streets:  Number[],
      houseNumber:  Number,
      postalCode:  Number
    }
  
    type Scoring = {
      queryScore: Number,
      fieldScore: FieldScore
    }
  
    type ItemAddress = {
      label: string,
      countryCode: string,
      countryName: string,
      state: string,
      county: string,
      city: string,
      street: string,
      postalCode: string,
      houseNumber: string
    }
  
    type Item = {
      title: string,
      id: string,
      resultType: string,
      houseNumberType: string,
      address: ItemAddress,
      position: Position,
      access: Access,
      mapView: MapView,
      scoring: Scoring
    }
  
    type GetAddressDetailsResponse = { 
      items: Item[]
    }

    try {

      // 👇️ const items: GetSearchResultsResponse
      const { data, status } = await axios.get<GetAddressDetailsResponse>(
        `https://geocode.search.hereapi.com/v1/geocode?q=${q}&apiKey=${apiKey}`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

      res.status(200).json({
        "items": data.items
      })   

    } 
    catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('error message: ', error.message);
        return error.message;
      } else {
        console.log('unexpected error: ', error);
        return 'An unexpected error occurred';
      }
    }
  }
  
  
  exports.getAddress = async (req:any, res:any) => { 

    let q = req.query.q;
    let In = req.query.in;
    let apiKey = req.query.apiKey;

    type Address = {
      label: string,
      countryCode: string,
      countryName: string,
      state: string,
      county: string,
      city: string,
      street: string,
      postalCode: string,
    }

    type Title = {
      start: Number,
      end: Number 
    }

    type Label = {
      start: Number,
      end: Number 
    }

    type Street = {
      start: Number,
      end: Number 
    }

    type HighlightAddress = {
      label: Label[]
      street: Street[]
    }

    type Hightlight = {
      title: Title[],
      address: HighlightAddress
    }

    type Item = {
      title: string,
      id: string,
      language: string,
      resultType: string,
      address: Address,
      highlights: Hightlight
    }

    type GetSearchResultsResponse = { 
        items: Item[]
    }

    try {

      // 👇️ const items: GetSearchResultsResponse
      const { data, status } = await axios.get<GetSearchResultsResponse>(
        `https://autocomplete.search.hereapi.com/v1/autocomplete?in=${In}&q=${q}&apiKey=${apiKey}`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

      res.status(200).json({
        "items": data.items
      })   

    } 
    catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('error message: ', error.message);
        return error.message;
      } else {
        console.log('unexpected error: ', error);
        return 'An unexpected error occurred';
      }
    }
  }

  exports.getAdmins = async (req:any, res:any) => {

    try {
     
      const response: any = await prisma.$queryRaw`SELECT   
      radius,
      latitude,
      longitude 
      name::text,
      id::text,
      phone_number::text,
      current_address::text,
      role::text,
      active::text FROM "Admin"` as any;

      return res.status(200).json({
        success: true,
        admins: response
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.getAdmin = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
      const response: any = await prisma.$queryRaw`SELECT 
      radius,
      latitude,
      longitude 
      name::text,
      id::text,
      phone_number::text,
      current_address::text,
      role::text,
      active::text FROM "Admin" WHERE id::text = ${id}` as any;

      return res.status(200).json({
        success: true,
        admins: response
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.deleteAdmin = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
     const response: any = await prisma.$queryRaw`DELETE FROM "Admin" WHERE id::text = ${id} RETURNING id::text` as any;

      if(response[0]?.id){
     
        return res.status(200).json({
          success: true,
          message: 'admin deleted'
        })

      } else {
             
          return res.status(400).json({
          success: true,
          message: 'admin not found'
        })

      }
 
    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

