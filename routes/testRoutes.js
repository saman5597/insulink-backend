const { getAllUsersNew, getUserByUserIdNew, getAllDevicesNew } = require('../controllers/testRouteController')

const router = require('express').Router()

router.get('/all-users', getAllUsersNew)

router.get('/all-users/:id', getUserByUserIdNew)

router.get('/all-devices', getAllDevicesNew)

module.exports = router