import axios from 'axios';
import bcrypt from 'bcrypt';
import { env } from 'process';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

  var match = false;
  var missingName = false;
  var missingEmail = false;
  var missingPhoneNumber = false;
  // let mediumPassword = new RegExp('((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,}))|((?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,}))');

  exports.loginStylist = async (req:any, res:any) => {

    const { phone_number, pin_code } = req.body
    const stylists:any = await prisma.$queryRaw`SELECT name::text,phone_number::text,id::text,pin_code::text,active FROM "Stylist" WHERE phone_number = ${phone_number}` as any;

    if(stylists[0]){

      var stylistFound = false
      var stylist = stylists[0]
      var stylistId = stylist?.id
      var stylistName = stylist?.name
      var stylistActive = stylist?.active
      var stylistPinCode = stylist?.pin_code
      var stylistPhoneNumber = stylist?.phone_number

      const checkPassword = bcrypt.compareSync(pin_code, stylistPinCode)

      if (stylistPhoneNumber == stylist.phone_number){
        stylistFound = true
        if(checkPassword){
          match = true
        } else if(!checkPassword) {
          match = false
        }
      } else {
        stylistFound = false
      }

      if(stylistFound && match){

          const token = jwt.sign({ id: stylistId, name: stylistName }, env.STYLIST_SECRET_KEY ?? '', { expiresIn: '2h',  algorithm: 'HS512'});
          const refreshToken = jwt.sign({ id: stylistId, name: stylistName }, env.STYLIST_SECRET_KEY ?? '', { expiresIn: '8h', algorithm: 'HS384'});

          res.status(200).json({
            "active": stylistActive,
            "token": token,
            "refreshToken": refreshToken,
            "message": "Welcome to geostyle"
          })   

        } else if(!stylistFound || !match) {

         res.status(401).json({
            "active": stylistActive,
            "token": "haha",
            "message": "Unauthorized"
          })  

        }

    } else {

      res.status(401).json({
        "active": stylistActive,
        "token": "haha",
        "message": "Unauthorized"
      })   

    }

  }

  exports.registerStylist = async (req:any, res:any) => {

    var { 
      name, 
      phone_number, 
      current_address, 
      pin_code, 
      role, 
      active,       
      radius,
      latitude,
      longitude
     } = req.body

    const stylists:any = await prisma.$queryRaw` SELECT name::text,id::text,phone_number::text FROM "Stylist" ` as any;

    
      stylists?.forEach((stylist:any) => {

          if(stylist?.phone_number == phone_number){
            match = true
          } else {
            match = false
          }

      })

        if(match){

        res.status(400).json({
          "message": "stylist already exists"
        })   

      } else if(!match) {

        pin_code = bcrypt.hashSync(pin_code, 8);

        try {

          const response: any = await prisma.$queryRaw`
          insert into "Stylist" (
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
      
      const stylists: any = await prisma.$queryRaw`SELECT name::text,id::text FROM "Stylist" WHERE id::text = ${id}` as any;
      
      var stylist = stylists[0]
      var stylistId = stylist.id
      var stylistName = stylist.name

      const token = jwt.sign({ id: stylistId, name: stylistName }, env.STYLIST_SECRET_KEY ?? '', { expiresIn: '2h',  algorithm: 'HS512'});
      const newRefreshToken = jwt.sign({ id: stylistId, name: stylistName }, env.STYLIST_SECRET_KEY ?? '', { expiresIn: '8h', algorithm: 'HS384'});

      res.status(200).json({
        "token": token,
        "refreshToken": newRefreshToken,
        "message": "Token refreshed"
      })   

    } catch(err:any) {
     
      res.status(401).json({
        "token": "haha",
        "message": "Unauthorized"
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
        "items": data.items,
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
        "items": data.items,
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

  exports.getStylists = async (req:any, res:any) => {

    try {
     
      const stylists: any = await prisma.$queryRaw`SELECT * FROM "Stylist"` as any;

      for(let [stylistIndex, stylist] of stylists.entries()){
        delete stylist.pin_code
      }

      return res.status(200).json({
        success: true,
        stylists: stylists,
      })

    } catch (e) {

      res.status(400).json({
        error: 'Bad request.',
      })

    }

  }

  exports.getStylist = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
      const response: any = await prisma.$queryRaw`SELECT 
      name::text,
      id::text, 
      phone_number::text, 
      current_address::text, 
      role::text, 
      active::text,       
      radius,
      latitude,
      longitude FROM "Stylist" WHERE id::text = ${id}` as any;

      return res.status(200).json({
        success: true,
        stylists: response,
      })

    } catch (e) {

      res.status(400).json({
        error: 'bad request',
      })

    }

  }

  exports.deleteStylist = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
     const response: any = await prisma.$queryRaw`DELETE FROM "Stylist" WHERE id::text = ${id} RETURNING id::text` as any;

      if(response[0]?.id){
     
        return res.status(200).json({
          success: true,
          message: 'stylist deleted',
        })

      } else {
             
          return res.status(400).json({
          success: true,
          message: 'stylist not found',
        })

      }
 
    } catch (e) {

      res.status(400).json({
        error: 'bad request',
      })

    }

  }
