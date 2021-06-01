const mongoose =  require('mongoose')

function connectToDB() {

    // Database Connection
    mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true })
    
    const connection = mongoose.connection

    connection.once('open' , () => {
        console.log('Database connected.')
    }).catch(err => {
        console.log('Connection failed.')
        console.warn(err)
    })
}

module.exports = connectToDB