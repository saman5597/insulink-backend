const connectDB = require('./config/db')
const Logger = require('./config/Logger')

process.on('uncaughtException', err => {
  console.log('Shutting down app...')
  new Logger("insulink").e("Shutting down app", err)
  console.log(err.name, err.message)
  process.exit(1)
})

const app = require('./app')

const PORT = process.env.PORT || 5000

connectDB()

app.listen(PORT, async () => {
  console.log(`Listening on port ${PORT}.`)
})

process.on('unhandledRejection', err => {
  console.log('Shutting down app...')
  new Logger("insulink").e("Shutting down app", err)
  console.log(err.name, err.message)
  process.exit(1)
})

