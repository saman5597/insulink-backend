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
        console.log(`Req body size: ${req.get("content-length") / 1024} KB`)
        var glucoseArr = []
        var glucoseData = []
        var basalArr = []
        var bolusArr = []
        const { device, Glucose, Insulin } = req.body

        // Either perform both operations on none
        await session.startTransaction()

        const device_id = req.device_id //Mongoose Object Id

        if (device && device.batteryPercentage && device.dateAndTimeOfPachChange && device.dateAndTimeOfReservoirChange && device.date && device.totalReservoir) {
            const updatedDevice = await Device.updateOne({ serialNo: device.deviceId }, {
                $addToSet: { users: req.auth.id },
                upsert: true,
                $set: {
                    "battery": device.batteryPercentage,
                    "reservoirDateTime": device.dateAndTimeOfReservoirChange,
                    "patchDateTime": device.dateAndTimeOfPachChange,
                    "reportedAt": device.date,
                    "reservoir": device.totalReservoir
                }
            })
            const user = await User.updateOne({ _id: req.auth.id }, { $addToSet: { devices: device_id } }, { upsert: true })
        } else {
            return res.status(400).json({
                status: 0,
                data: {
                    err: {
                        generatedTime: new Date(),
                        errMsg: 'Invalid device utility data.',
                        msg: 'Invalid data.',
                        type: 'ValidationError'
                    }
                }
            })
        }

        ///////////////////////////////////////////
        var temp = 0
        if (Glucose && Glucose.length) {
            Glucose.forEach(el => {
                var date = el.date
                temp = temp + el.BgValue.length
                if (el.BgValue.length) {
                    el.BgValue.forEach(glucose => {
                        glucoseArr.push({
                            date,
                            readingTime: glucose.readingTime, //.replace(/(.{2})$/, ':$1'),
                            glucoseReading: glucose.glucoseReading,
                            readingType: glucose.type,
                            device: device_id,
                            user: req.auth.id
                        })
                    })
                }
            })
            glucoseData = await GlucoseModel.insertMany(glucoseArr) // Glucose Data
            console.log("Glucose modules : " + temp)
        }

        var itemp = 0
        Insulin.forEach(el => {
            var date = el.date

            itemp += el.Bolus.length
            itemp += el.Basal.length

            el.Bolus.forEach(bolus => {
                bolusArr.push({
                    date,
                    time: bolus.time, //.replace(/(.{2})$/, ':$1'),
                    dose: bolus.unit,
                    bolusType: bolus.type,
                    fromWizard: bolus.isFrom,
                    carbIntake: bolus.carbIntake,
                    insulinRatio: bolus.insulinRatio,
                    insulinSensitivity: bolus.insulinSensitivity,
                    lowerBgRange: bolus.lowerBgRange,
                    higherBgRange: bolus.higherBgRange,
                    activeInsulin: bolus.activeInsulin,
                    device: device_id,
                    user: req.auth.id
                })
            })

            el.Basal.forEach(basal => {
                basalArr.push({
                    date,
                    startTime: basal.startTime, //.replace(/(.{2})$/, ':$1'),
                    endTime: basal.endTime, //.replace(/(.{2})$/, ':$1'),
                    flow: basal.flow,
                    device: device_id,
                    user: req.auth.id
                })
            })
        })
        console.log("Insulin modules : " + itemp)

        const basalData = await Basal.insertMany(basalArr)            // Basal Data
        const bolusData = await Bolus.insertMany(bolusArr)            // Bolus Data
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
        const { serialNo, modelType, manufactureDate } = req.body

        const device = Device({
            serialNo,
            modelType,
            manufactureDate: new Date(manufactureDate)
        })

        await device.save()

        res.status(201).json({ status: 1, data: { device }, message: 'Device created successfully.' })
    } catch (err) {
        console.log(err)
        //handling duplicate key
        if (err && err.code === 11000) {
            return res.status(409).json({
                status: 0,
                data: {
                    err: {
                        generatedTime: new Date(),
                        errMsg: err.message,
                        msg: 'Device already exists.',
                        type: 'DuplicateKeyError'
                    }
                }
            })
        }

        return res.status(400).json({
            status: 0,
            data: {
                err: {
                    generatedTime: new Date(),
                    errMsg: err.message,
                    msg: 'Invalid data.',
                    type: 'ValidationError'
                }
            }
        })
    }
}

exports.updateDeviceByDID = async (req, res) => {
    try {
        const { modelType } = req.body


        const updatedUser = await Device.findByIdAndUpdate(req.params.did, { modelType }, {
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
        const { modelType } = req.body

        const updatedUser = await Device.updateOne({ serialNo: req.params.dname }, { $set: { modelType } }, {
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