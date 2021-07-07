const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')
const { buildSchema } = require('graphql')
const { graphqlHTTP } = require('express-graphql')
require('dotenv').config({ path: './configuration.env' })
const userRoute = require('./routes/userRoutes')
const deviceRoute = require('./routes/deviceRoutes')
const insulinRoute = require('./routes/insulinRoutes')
const glucoseRoute = require('./routes/glucoseRoutes')
const authRoute = require('./routes/authRoutes')
const dashboardRoute = require('./routes/dashboardRoutes')
const testRoutes = require('./routes/testRoutes')
const User = require('./models/userModel')
const Device = require('./models/deviceModel')

//Start express app
const app = express()

//Global Middlewares
app.use(cors()) //for CORS

// Req meta-data development logging
if (process.env.NODE_ENV === 'development') {
  app.use(
    // only log error responses (4XX and 5XX)
    morgan('dev', {
      skip: function (req, res) { return res.statusCode < 400 }
    })
  )
}
// else {
//   morgan.token("authtoken", (req, res) => {
//     return req.headers["authorization"].split("Bearer")[1]
//   })

//   app.use(morgan("token[:authtoken] - :method :url | :status (time taken - :response-time ms)"))
// }

// Body-parsing , reading data from body into req.body
app.use(express.json({ limit: '200kb' }))

// IP Address and Hostname 
app.use(function (req, res, next) {
  let ip = req.header('x-forwarded-for') || req.connection.remoteAddress
  req.ipAddress = ip.split(':').slice(-1)[0]
  req.hostName = req.get('host')
  next()
})

const swaggerOptions = require('./config/swagger.json')

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs))

//Mounting the router
app.use('/api/v1/auth', authRoute)
app.use('/api/v1/users', userRoute)
app.use('/api/v1/devices', deviceRoute)
app.use('/api/v1/insulin', insulinRoute)
app.use('/api/v1/glucose', glucoseRoute)
app.use('/api/v1/dashboard', dashboardRoute)
app.use('/api/v2/test',testRoutes)

var graphqlSchema = buildSchema(`
  type User {
    _id: ID!,
    firstName: String!,
    lastName: String!,
    email: String!,
    phone: Float!
    gender: String!,
    country: String!
  }

  type RootQuery {
    getUsers: [User!]!
  }

  schema {
    query: RootQuery
  }
`)

var graphqlResolver = {
  getUsers: () => {
    return User.find().then(users => {
      return users.map(user => {
        return { ...user._doc }
      })
    }).catch(err => console.log(err))
  }
}

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true
}))

// 404 handling Route
app.all('*', (req, res) => {
  res.status(404).json({
    status: 0,
    data: {},
    message: `Can't find ${req.originalUrl} on this server!`
  })
})

module.exports = app
