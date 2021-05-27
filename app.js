const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')
require('dotenv').config({ path: './config.env' });
const userRoute = require('./routes/userRoutes');

//Start express app
const app = express();

//Global Middlewares
app.use(cors()); //for CORS

// Req meta-data development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body-parsing , reading data from body into req.body
app.use(express.json());

const swaggerOptions = require('./config/swagger.json')

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//Mounting the router
app.use('/api/v1/users', userRoute);

// 404 handling Route
app.all('*', (req, res) => {
  res.status(404).json({
    status: false,
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

module.exports = app;
