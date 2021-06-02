const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')
const { buildSchema } = require('graphql')
const { graphqlHTTP } = require('express-graphql')
require('dotenv').config({ path: './configuration.env' })
const userRoute = require('./routes/userRoutes')
const authRoute = require('./routes/authRoutes')
const User = require('./models/userModel')
const Device = require('./models/deviceModel')

//Start express app
const app = express()

//Global Middlewares
app.use(cors()) //for CORS

// Req meta-data development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Body-parsing , reading data from body into req.body
app.use(express.json())

const swaggerOptions = require('./config/swagger.json')

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs))

//Mounting the router
app.use('/api/v1/users', userRoute)
app.use('/api/v1/auth', authRoute)

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
    status: false,
    message: `Can't find ${req.originalUrl} on this server!`
  })
})

module.exports = app
