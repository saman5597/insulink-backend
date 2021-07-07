const Device = require('../models/deviceModel')
const User = require('../models/userModel')

exports.getAllUsersNew = async (req, res) => {
    try {
        var queryObj
        if (req.query["status"] === "inactive") {
            queryObj = { status: "inactive" }
        } else if (req.query["status"] === "active") {
            queryObj = { status: "active" }
        } else queryObj = {}

        const users = await User.find(queryObj).populate({
            path: "devices",
            select: "_id serialNo modelName manufactureDate battery reservoir"
        })
        // .select('-devices')

        res.status(200).json({ status: 1, data: { users }, message: 'Getting data of all users from DB.' })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: -1,
            data: {
                err: {
                    generatedTime: new Date(),
                    errMsg: err.message,
                    msg: 'Internal Server Error.',
                    type: err.name
                }
            }
        })
    }
}


exports.getAllDevicesNew = async (req, res) => {
    try {
        const devices = await Device.find({}).select('-users')

        res.status(200).json({ status: 1, data: { devices }, message: 'Getting data of all devices from DB.' })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: -1,
            data: {
                err: {
                    generatedTime: new Date(),
                    errMsg: err.message,
                    msg: 'Internal Server Error.',
                    type: err.name
                }
            }
        })
    }
}