import axios from 'axios';
import bcrypt from 'bcrypt';
import { env } from 'process';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

var match = false;
export const prisma = new PrismaClient();

  exports.loginCustomer = async (req:any, res:any) => {

    const { phone_number, pin_code } = req.body
    const customers:any = await prisma.$queryRaw`SELECT name::text,phone_number::text,id::text,pin_code::text,active FROM "Customer" WHERE phone_number = ${phone_number}` as any;

    if(customers[0]){

        var customerFound = false
        var customer = customers[0]
        var customerId = customer?.id
        var customerName = customer?.name
        var customerActive = customer?.active
        var customerPinCode = customer?.pin_code
        var customerPhoneNumber = customer?.phone_number

        const checkPinCode = bcrypt.compareSync(pin_code, customerPinCode)

        if (customerPhoneNumber == customer.phone_number){
          customerFound = true
          if(checkPinCode){
            match = true
          } else if(!checkPinCode) {
            match = false
          }
        } else {
          customerFound = false
        }

        if(customerFound && match){

          const token = jwt.sign({ id: customerId, name: customerName }, env.SECRET ?? '', { expiresIn: '2h',  algorithm: 'HS512'});
          const refreshToken = jwt.sign({ id: customerId, name: customerName }, env.SECRET ?? '', { expiresIn: '8h', algorithm: 'HS384'});

          res.json({
            "token": token,
            "active": customerActive,
            "refreshToken": refreshToken,
            "message": "welcome to geostyle"
          })   

        } else if(!customerFound || !match) {

         res.status(401).json({
           "token": "haha",
           "active": customerActive,
           "message": "unauthorized"
          })  

        }

    } else {

      res.status(401).json({
        "token": "haha",
        "active": customerActive,
        "message": "unauthorized"
      })   

    }

  }

  exports.registerCustomer = async (req:any, res:any) => {  

    var {  name, phone_number, pin_code, role, order_ids, current_address, active, radius, latitude, longitude } = req.body
    const customers:any = await prisma.$queryRaw` SELECT name::text,id::text,phone_number FROM "Customer" ` as any;
 
      customers?.forEach((customer:any) => {

          if(customer?.phone_number == phone_number){
            match = true
          } else {
            match = false
          }

      })

      if(match){

        res.status(400).json({
          "message": "customer already exists"
        })   

      } else if(!match) {

        pin_code = bcrypt.hashSync(pin_code, 8);

        try {

          const response: any = await prisma.$queryRaw`
          insert into "Customer" ( 
            "name",
            "phone_number",
            "pin_code",
            "role",
            "order_ids",
            "current_address",
            "active",
            "radius",
            "latitude",
            "longitude"
            ) values
          ( 
            ${name},
            ${phone_number},
            ${pin_code},
            ${role},
            ${order_ids},
            ${current_address},
            ${active},
            ${radius},
            ${latitude}, 
            ${longitude}
          )
          returning id` as any;

          res.status(200).json({
            message: "succesfully registered",
            active: active,
            success: true,
            id: response[0].id
          })

        } catch (e) {

          console.error(e)
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
      
      const customers: any = await prisma.$queryRaw`SELECT name::text,id::text FROM "Customer" WHERE id::text = ${id}` as any;
      
      var customer = customers[0]
      var customerName = customer.name
      var customerId = customer.id

      const token = jwt.sign({ id: customerId, name: customerName }, env.SECRET ?? '', { expiresIn: '2h',  algorithm: 'HS512'});
      const newRefreshToken = jwt.sign({ id: customerId, name: customerName }, env.SECRET ?? '', { expiresIn: '8h', algorithm: 'HS384'});

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
        return 'an unexpected error occurred';
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
        return 'an unexpected error occurred';
      }

    }

  }

  exports.getCustomers = async (req:any, res:any) => {

    try {
     
      const customers: any = await prisma.$queryRaw`SELECT 
      radius,
      latitude,
      longitude,
      name::text,
      phone_number::text,
      role::text,
      order_ids,
      current_address::text,
      active,
      id::text FROM "Customer"` as any;

      return res.json({
        success: true,
        customers: customers
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.getCustomer = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
      const response: any = await prisma.$queryRaw`SELECT 
      name::text,
      phone_number::text,
      role::text,
      order_ids,
      current_address::text,
      active,
      id::text FROM "Customer" WHERE id::text = ${id}` as any;

      return res.status(200).json({
        success: true,
        customers: response
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.updateCustomer = async (req:any, res:any) => {

    let id = req.params.id

    const { 
      radius,
      latitude,
      longitude,
      name,
      phone_number,
      pin_code,
      role,
      order_ids,
      current_address,
      active
     } = req.body

      try {
       
        const updateCustomerQuery: any = await prisma.$queryRaw`
        UPDATE "Order"
        SET radius = ${radius},
        latitude = ${latitude},
        longitude = ${longitude},
        name = ${name},
        phone_number = ${phone_number},
        pin_code = ${pin_code},
        role = ${role},
        order_ids = ${order_ids},
        current_address = ${current_address},
        active = ${active},
        WHERE id::text = ${id} returning id` as any;

        return res.status(200).json({
          success: true,
          customers: updateCustomerQuery
        })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.deleteCustomer = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
     const response: any = await prisma.$queryRaw`DELETE FROM "Customer" WHERE id::text = ${id} RETURNING id::text` as any;

      if(response[0]?.id){
     
        return res.status(200).json({
          success: true,
          message: 'customer deleted'
        })

      } else {
             
        return res.status(400).json({
          success: true,
          message: 'customer not found'
        })

      }
 
    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }



