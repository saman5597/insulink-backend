const Device = require('../models/deviceModel')

exports.isDeviceRegistered = async (req, res, next) => {
    try {
        const device = await Device.findOne({ serialNo: req.body.device.deviceId })

        if (!device) {
            return res.status(400).json({
                status: 0,
                data: {
                    err: {
                        generatedTime: new Date(),
                        errMsg: 'Device not found.',
                        msg: 'Invalid data.',
                        type: 'MongoDBError'
                    }
                }
            })
        }

        req.device_id = device._id
        next()

    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: -1,
            data: {
                err: {
                    generatedTime: new Date(),
                    errMsg: err.message,
                    msg: 'Internal Server Error',
                    type: err.name
                }
            }
        })
    }
}