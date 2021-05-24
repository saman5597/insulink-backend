const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

require('dotenv').config({ path: './config.env' });

//Start express app
const app = express();

//Global Middlewares
app.use(cors()); //for CORS

app.options('*', cors());

// Req meta-data development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// app.use(express.static('public'));

// Body-parsing , reading data from body into req.body
app.use(express.json()); 

//Mounting the router
app.use('/api/v1/users' , require('./routes/userRoutes'));

// 404 handling Route
app.all('*', (req, res) => {
  res.status(404).json({
    status: false,
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

module.exports = app;
