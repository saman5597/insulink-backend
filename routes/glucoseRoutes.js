const { getGlucoseByDate, getGlucoseByDateRange, getGlucoseByUID } = require('../controllers/glucoseController.js')
const { isAuth, isUser, isAdmin, isSignedIn } = require('../middlewares/authMiddleware')

const router = require('express').Router()

// Protected Routes starts here
router.use(isSignedIn, isAuth)

router.get('/getGlucoseByDate', isAdmin, getGlucoseByDate)

router.get('/getGlucoseByDateRange', isAdmin, getGlucoseByDateRange)

router.get('/getGlucoseByUID/:uid', isAdmin, getGlucoseByUID)

module.exports = router