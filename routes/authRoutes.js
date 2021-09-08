const { signUp, adminSignup, adminLogin, loginUsingEmail, loginUsingMob, forgotPwd, resetPwd, logout } = require('../controllers/authController.js')
const { isAuth, isUser, isAdmin } = require('../middlewares/authMiddleware')

const router = require('express').Router()

router.post('/signup', signUp)

router.post('/admin/signup', adminSignup)

router.post('/admin/login', adminLogin)

router.post('/loginUsingEmail', loginUsingEmail)

router.post('/loginUsingMob', loginUsingMob)

router.post('/forgotPassword', forgotPwd)

router.patch('/resetPassword', resetPwd)

// Protected Routes starts here
router.use(isAuth)

router.get('/logout', logout)

module.exports = router