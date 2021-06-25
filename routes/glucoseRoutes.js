const { getGlucoseByDate, getGlucoseByDateRange, getGlucoseByUID } = require('../controllers/glucoseController.js')
const { isAuth, isUser, isAdmin } = require('../middlewares/authMiddleware')

const router = require('express').Router()

// Protected Routes starts here
router.use(isAuth)

router.get('/getGlucoseByDate', isAdmin, getGlucoseByDate)

router.get('/getGlucoseByDateRange', isAdmin, getGlucoseByDateRange)

router.get('/getGlucoseByUID/:uid', isAdmin, getGlucoseByUID)

module.exports = router