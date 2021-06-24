const mongoose = require('mongoose')
const { validationResult } = require("express-validator")

const Device = require('../models/deviceModel')
const User = require('../models/userModel')
const GlucoseModel = require('../models/glucoseModel')
const Bolus = require('../models/bolusModel')
const Basal = require('../models/basalModel')

exports.uploadDeviceData = async (req, res) => {
    const session = await mongoose.startSession()
    try {
        // console.log(req.body)
        console.log(req.get("content-length")/1024)
        var glucoseArr = []
        var basalArr = []
        var bolusArr = []
        const { deviceId, Glucose, Insulin } = req.body

        // Either perform both operations on none
        await session.startTransaction()

        const device = await Device.findOne({ serialNo: deviceId })
        const device_id = device._id  //Mongoose Object Id
        if (device) {

            device.users.push(req.auth.id)
            await device.save()

            const user = await User.findById(req.auth.id)
            if (user) {
                user.devices.push(device_id)
                await user.save()
            }
        } 

        ///////////////////////////////////////////
        Glucose.forEach(el => {
            var date = el.date
            el.BgValue.forEach(glucose => {
                glucoseArr.push({
                    date,
                    readingTime: glucose.readingTime,
                    glucoseReading: glucose.glucoseReading,
                    readingType: glucose.type,
                    device: device_id,
                    user: req.auth.id
                })
            })
        })

        Insulin.forEach(el => {
            var date = el.date

            el.Bolus.forEach(bolus => {
                bolusArr.push({
                    date,
                    time: bolus.time,
                    dose: bolus.unit,
                    bolusType: bolus.type,
                    device: device_id,
                    user: req.auth.id
                })
            })

            el.Basal.forEach(basal => {
                basalArr.push({
                    date,
                    startTime: basal.startTime,
                    endTime: basal.endTime,
                    flow: basal.flow,
                    device: device_id,
                    user: req.auth.id
                })
            })
        })

        const glucoseData = await GlucoseModel.insertMany(glucoseArr) // Glucose Data
        const bolusData = await Bolus.insertMany(bolusArr)            // Bolus Data
        const basalData = await Basal.insertMany(basalArr)            // Basal Data

        session.commitTransaction()
        session.endSession()

        res.status(201).json({
            status: 1,
            data: {
                glucose: glucoseData,
                insulin: {
                    bolus: bolusData,
                    basal: basalData
                }
            },
            message: 'Data uploaded successfully.'
        })

    } catch (err) {
        console.log(err)
        await session.abortTransaction()
        session.endSession()
        res.status(400).json({
            status: 0,
            data: {
                err: {
                    generatedTime: new Date(),
                    errMsg: err.message,
                    msg: 'Invalid data.',
                    type: err.name
                }
            }
        })
    }
}

exports.getAllDevices = async (req, res) => {
    try {
        const devices = await Device.find({}).populate({
            path: "users",
            select: "-devices"
        })

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

exports.getDeviceByDID = async (req, res) => {
    try {
        const device = await Device.findOne({ _id: req.params.did }).populate({
            path: "users",
            select: "-devices"
        })

        res.status(200).json({ status: 1, data: { device }, message: 'Getting data of device by device ID from DB.' })
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

exports.createDevice = async (req, res) => {
    try {
        const { serialNo, modelName, manufactureDate } = req.body

        let errors = validationResult(req)
        if (errors.isEmpty) {
            return res.status(400).json({ status: 0, data: { err: errors.array() }, message: 'Validation error.' })
        }

        const device = Device({
            serialNo,
            modelName,
            manufactureDate: new Date(manufactureDate)
        })

        await device.save()

        res.status(201).json({ status: 1, data: { device }, message: 'Device created successfully.' })
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

exports.updateDeviceByDID = async (req, res) => {
    try {
        const { modelName } = req.body


        const updatedUser = await Device.findByIdAndUpdate(req.params.did, { modelName }, {
            new: true,
            runValidators: true
        })

        res.status(200).json({
            status: 1,
            data: { user: updatedUser },
            message: 'Device details updated successfully.'
        })
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
        /* 
        400 - Bad Request
        401 - Unauthorised
        403 - Forbidden
        404 - Not Found
        440 - Login timeout

        500 - Internal Server Error
        501 - Unimplemented Service
        503 - Service Unavailable
        */
    }
}

exports.updateDevice = async (req, res) => {
    try {
        const { modelName } = req.body

        const updatedUser = await Device.updateOne({ serialNo: req.params.dname }, { $set: { modelName } }, {
            runValidators: true,
            new: true
        })

        res.status(200).json({
            status: 1,
            data: { user: updatedUser },
            message: 'Device details updated successfully.'
        })
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

exports.deleteDeviceByDID = async (req, res) => {
    try {
        const device = await Device.deleteOne({ _id: req.params.did })

        res.status(204).json({ status: 1, data: {}, message: 'Device deleted.' })
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