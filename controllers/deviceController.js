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
        console.log(req.body)
        const { deviceId, Glucose, Insulin } = req.body.IGValue

        // Either perform both operations on none
        await session.startTransaction()

        const user = await User.findById(req.auth.id)
        if (user) {
            user.devices.push(deviceId)
            await user.save()
        }

        const device = await Device.findOne({ serialNo: deviceId })
        if (device) {
            device.users.push(req.auth.id)
            await device.save()
        }

        session.commitTransaction()
        session.endSession()
        ///////////////////////////////////////////
        var glucoseArr, bolusArr, basalArr = []
        Glucose.forEach(el => {
            var date = el.date
            el.Glucose.forEach(glucose => {
                glucoseArr.push({
                    date,
                    readingTime: glucose.readingTime,
                    glucoseReading: glucose.glucoseReading,
                    readingType: glucose.type,
                    device: deviceId,
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
                    device: deviceId,
                    user: req.auth.id
                })
            })

            el.Basal.forEach(basal => {
                basalArr.push({
                    date,
                    startTime: basal.startTime,
                    endTime: basal.endTime,
                    flow: basal.flow,
                    device: deviceId,
                    user: req.auth.id
                })
            })
        })

        const glucoseData = await GlucoseModel.insertMany(glucoseArr) // Glucose Data
        const bolusData = await Bolus.insertMany(bolusArr)            // Bolus Data
        const basalData = await Basal.insertMany(basalArr)            // Basal Data

        res.status(201).json({ status: true, message: 'Data uploaded successfully.' })

    } catch (error) {
        console.log(error)
        await session.abortTransaction()
        session.endSession()
    }
}

exports.getAllDevices = async (req, res) => {
    try {
        const devices = await Device.find({}).populate({
            path: "users",
            select: "-devices"
        })

        res.status(200).json({ status: true, devices })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: false, message: 'Internal Server Error.' })
    }
}

exports.getDeviceByDID = async (req, res) => {
    try {
        const device = await Device.findOne({ _id: req.params.did }).populate({
            path: "users",
            select: "-devices"
        })

        res.status(200).json({ status: true, device })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: false, message: 'Internal Server Error.' })
    }
}

exports.createDevice = async (req, res) => {
    try {
        const { serialNo, modelName, manufactureDate } = req.body

        let errors = validationResult(req)
        if (errors.isEmpty) {
            return res.status(400).json({ status: false, errors: errors.array() })
        }

        const device = Device({
            serialNo,
            modelName,
            manufactureDate: new Date(manufactureDate)
        })

        await device.save()

        res.status(201).json({ status: true, message: 'Device created successfully.' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: false, message: 'Internal Server Error.' })
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
            status: 'success',
            message: 'Device details updated successfully.'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: false, message: 'Internal Server Error.' })
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
            status: 'success',
            message: 'Device details updated successfully.'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: false, message: 'Internal Server Error.' })
    }
}

exports.deleteDeviceByDID = async (req, res) => {
    try {
        const device = await Device.deleteOne({ _id: req.params.did })

        res.status(204).json({ status: true, message: 'Device deleted.' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: false, message: 'Internal Server Error.' })
    }
}