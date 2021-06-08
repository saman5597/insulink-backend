const { getBasalByDate, getBasalByDateRange, getBasalByUID, getBolusByDate, getBolusByDateRange, getBolusByUID } = require('../controllers/insulinController')
const { isAuth, isUser, isAdmin, isSignedIn } = require('../middlewares/authMiddleware')

const router = require('express').Router()

// Protected Routes starts here
router.use(isSignedIn, isAuth)

router.get('/getBasalByDate', isAdmin, getBasalByDate)

router.get('/getBasalByDateRange', isAdmin, getBasalByDateRange)

router.get('/getBasalByUID/:uid', isAdmin, getBasalByUID)

router.get('/getBolusByDate', isAdmin, getBolusByDate)

router.get('/getBolusByDateRange', isAdmin, getBolusByDateRange)

router.get('/getBolusByUID/:uid', isAdmin, getBolusByUID)

module.exports = router