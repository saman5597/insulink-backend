const { getGlucoseByDate, getGlucoseByDateRange, getGlucoseByUID, getLoggedUserGlucose } = require('../controllers/glucoseController.js')
const { isAuth, isUser, isAdmin } = require('../middlewares/authMiddleware')

const router = require('express').Router()

// Protected Routes starts here
router.use(isAuth)

router.get('/getGlucoseByDate', isAdmin, getGlucoseByDate)

router.get('/getGlucoseByDateRange', isAdmin, getGlucoseByDateRange)

router.get('/getGlucoseByUID/:uid', isAdmin, getGlucoseByUID)

router.get('/get-logged-user-glucose', getLoggedUserGlucose)

module.exports = router