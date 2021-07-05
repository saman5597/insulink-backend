const { getReport, getMonthlyReport, getTodayIntake, getDeviceDetails, getReadingsByDateRange } = require('../controllers/dashboardController')

const { isAuth, isUser, isAdmin } = require('../middlewares/authMiddleware')

const router = require('express').Router()

// Protected Routes starts here
router.use(isAuth)

router.get('/get-avg-report', getReport) //done

router.get('/get-monthly-avg-report/:month', getMonthlyReport)

router.get('/today-intake', getTodayIntake) //done

router.get('/get-device-details', getDeviceDetails)

router.get('/get-readings-by-daterange', getReadingsByDateRange)

module.exports = router