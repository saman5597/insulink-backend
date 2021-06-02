const mongoose =  require('mongoose')
const Logger = require('./Logger')

function connectToDB() {

    // Database Connection
    mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true })
    
    const connection = mongoose.connection

    connection.once('open' , () => {
        console.log('Database connected.')
        new Logger("insulink").d("Database connected")
    }).catch(err => {
        console.log('Connection failed.')
        new Logger("insulink").e("Connection failed", err)
        console.warn(err)
    })
}

module.exports = connectToDB