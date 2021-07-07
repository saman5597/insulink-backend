const { check } = require('express-validator')

const { uploadDeviceData, getAllDevices, getAllDevicesNew, getDeviceByDID, updateDevice, updateDeviceByDID, deleteDeviceByDID, createDevice } = require('../controllers/deviceController.js')
const { isAuth, isUser, isAdmin } = require('../middlewares/authMiddleware')

const router = require('express').Router()

// Protected Routes starts here
router.use(isAuth)

var isObjectValid = (param) => {
    return check(param).custom((obj) => {
        if (obj) {
            for (prop of obj) {
                if (!prop) return false
            }
            return true
        }

        return false
    })
}

router.post('/uploadDeviceData', uploadDeviceData)

router.get('/', isAdmin, getAllDevices)

router.get('/:did', isAdmin, getDeviceByDID)

router.post('/createDevice',
    [
        check('serialNo', "Device Id cannot be empty").not().isEmpty().trim().bail(),
        check('modelName', "Model Name cannot be empty").not().isEmpty().trim().bail(),
        check('manufactureDate', "Manufacture Date cannot be empty").not().isEmpty().trim().bail(),
    ],
    isAdmin, createDevice)

router.put('/:did', isAdmin, updateDeviceByDID)

router.put('/:dname', isAdmin, updateDevice) // Update by Device Id (Not the mongoose object id)

router.delete('/:did', isAdmin, deleteDeviceByDID)


module.exports = router