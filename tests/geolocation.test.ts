import request from 'supertest'
import { app, prisma } from '../src/server'

afterAll(async () => {
  await prisma.$disconnect()
})

let customerId = 0

test('a customer is added successfully', async () => {
  const customer = await request(app)
    .post('/customer')
    .send({
      name: 'Prisma HQ',
      location: {
        lat: 52.5400243,
        lng: 13.4221333,
      },
    })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  expect(customer.body.id).toBeDefined()
  customerId = customer.body.id
})

test('a location is added successfully', async () => {
  const location1 = await request(app)
    .post('/location')
    .send({
      name: 'MACHmit! Museum for Children',
      location: {
        lat: 52.5403952,
        lng: 13.4221989,
      },
    })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  expect(location1.body).toEqual({
    success: true,
  })

  const location2 = await request(app)
    .post('/location')
    .send({
      name: 'Hotel Eurostars Berlin',
      location: {
        lat: 52.5217022,
        lng: 13.3906928,
      },
    })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  expect(location2.body).toEqual({
    success: true,
  })
})

test('nearby locations are fetched correctly', async () => {
  let nearbyLocations = await request(app)
    .get(`/${customerId}/nearby-places?d=1`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  const locations = nearbyLocations.body
  expect(locations.data).toBeDefined()
  expect(locations.data.locations.length).toBe(1)
})
