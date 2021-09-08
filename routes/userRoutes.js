const { getAllUsers, getLoggedInUser, changePassword, updateProfile, deactivateAccount, deleteAccount } = require('../controllers/userController.js')
const { isAuth, isUser, isAdmin } = require('../middlewares/authMiddleware')

const router = require('express').Router()

// Protected Routes starts here
router.use(isAuth)

router.get('/', isAdmin, getAllUsers)

router.get('/myProfile', getLoggedInUser)

router.post('/changePassword', changePassword)

router.put('/updateProfile', updateProfile)

router.post('/deactivateAccount', deactivateAccount)

router.delete('/deleteAccount', deleteAccount)

module.exports = router