const { getBasalByDate, getBasalByDateRange, getBasalByUID, getBolusByDate, getBolusByDateRange, getBolusByUID, getLoggedUserBasal, getLoggedUserBolus } = require('../controllers/insulinController')
const { isAuth, isUser, isAdmin } = require('../middlewares/authMiddleware')

const router = require('express').Router()

// Protected Routes starts here
router.use(isAuth)

router.get('/getBasalByDate', isAdmin, getBasalByDate)

router.get('/getBasalByDateRange', isAdmin, getBasalByDateRange)

router.get('/getBasalByUID/:uid', isAdmin, getBasalByUID)

router.get('/getBolusByDate', isAdmin, getBolusByDate)

router.get('/getBolusByDateRange', isAdmin, getBolusByDateRange)

router.get('/getBolusByUID/:uid', isAdmin, getBolusByUID)

router.get('/get-logged-user-basal', getLoggedUserBasal)

router.get('/get-logged-user-bolus', getLoggedUserBolus)

module.exports = router