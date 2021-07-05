const mongoose = require('mongoose')
const Glucose = require('../models/glucoseModel')
const Bolus = require('../models/bolusModel')
const Basal = require('../models/basalModel')
const User = require('../models/userModel')
const Device = require('../models/deviceModel')

exports.getReport = async (req, res) => {
    try {
        var queryObj
        if (!req.query["startDate"] && !req.query["endDate"]) {
            queryObj = { user: mongoose.Types.ObjectId(req.auth.id) }
        } else if (!req.query["startDate"]) {
            queryObj = { user: mongoose.Types.ObjectId(req.auth.id), date: { $lte: new Date(req.query["endDate"]) } }
        } else if (!req.query["endDate"]) {
            queryObj = { user: mongoose.Types.ObjectId(req.auth.id), date: { $gte: new Date(req.query["startDate"]) } }
        } else {
            queryObj = {
                user: mongoose.Types.ObjectId(req.auth.id),
                date: { $gte: new Date(req.query["startDate"]), $lte: new Date(req.query["endDate"]) }
            }
        }

        const glucoseStats = await Glucose.aggregate([
            {
                $match: queryObj
            },
            {
                $group: {
                    _id: null,
                    countGlucose: { $sum: 1 },
                    sumGlucose: { $sum: { $toDouble: '$glucoseReading' } },
                    avgGlucose: { $avg: { $toDouble: '$glucoseReading' } }
                }
            }
        ])

        const basalStats = await Basal.aggregate([
            {
                $match: queryObj
            },
            {
                $group: {
                    _id: null,
                    countBasal: { $sum: 1 },
                    sumBasal: { $sum: { $toDouble: '$flow' } },
                    avgBasal: { $avg: { $toDouble: '$flow' } }
                }
            }
        ])

        const bolusStats = await Bolus.aggregate([
            {
                $match: queryObj
            },
            {
                $group: {
                    _id: null,
                    countBolus: { $sum: 1 },
                    sumBolus: { $sum: { $toDouble: '$dose' } },
                    avgBolus: { $avg: { $toDouble: '$dose' } }
                }
            }
        ])

        const avgBasalVal = basalStats[0] ? basalStats[0].avgBasal : 0
        const avgBolusVal = bolusStats[0] ? bolusStats[0].avgBolus : 0
        const sumBasalVal = basalStats[0] ? basalStats[0].sumBasal : 0
        const sumBolusVal = bolusStats[0] ? bolusStats[0].sumBolus : 0
        const sumInsulin = sumBasalVal + sumBolusVal
        const avgInsulin = (avgBasalVal + avgBolusVal) / 2

        res.status(200).json({
            status: 1,
            data: {
                glucose: {
                    avgGlucose: glucoseStats[0] ? glucoseStats[0].avgGlucose.toString() : "0",
                    sumGlucose: glucoseStats[0] ? glucoseStats[0].sumGlucose.toString() : "0"
                },
                insulin: {
                    avgInsulin: avgInsulin ? avgInsulin.toString() : "0",
                    sumInsulin: sumInsulin ? sumInsulin.toString() : "0"
                }
            },
            message: 'Getting average Glucose, Insulin data of logged in user'
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

exports.getMonthlyReport = async (req, res) => {
    try {
        console.log(req.params.month)

        res.status(200).json({
            status: 1,
            message: 'Getting monthly average data of logged in user'
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

exports.getTodayIntake = async (req, res) => {
    try {
        const currentDate = new Date().toISOString()
        const queryObj = {
            user: mongoose.Types.ObjectId(req.auth.id),
            date: { $eq: new Date(currentDate.split("T")[0].concat("T00:00:00.000Z")) }
        }

        const glucoseStats = await Glucose.aggregate([
            {
                $match: queryObj
            },
            {
                $group: {
                    _id: null,
                    sumGlucose: { $sum: { $toDouble: '$glucoseReading' } }
                }
            }
        ])

        const bolusStats = await Bolus.aggregate([
            {
                $match: queryObj
            },
            {
                $group: {
                    _id: null,
                    sumBolus: { $sum: { $toDouble: '$dose' } }
                }
            }
        ])

        const basalStats = await Basal.aggregate([
            {
                $match: queryObj
            },
            {
                $group: {
                    _id: null,
                    sumBasal: { $sum: { $toDouble: '$flow' } }
                }
            }
        ])

        const carbStats = await Bolus.aggregate([
            {
                $match: queryObj
            },
            {
                $group: {
                    _id: null,
                    sumCarb: { $sum: { $toDouble: '$carbIntake' } }
                }
            }
        ])

        const sumBasalVal = basalStats[0] ? basalStats[0].sumBasal : 0
        const sumBolusVal = bolusStats[0] ? bolusStats[0].sumBolus : 0
        const sumInsulin = sumBasalVal + sumBolusVal

        res.status(200).json({
            status: 1,
            data: {
                glucose: glucoseStats[0] ? glucoseStats[0].sumGlucose.toString() : "0",
                insulin: sumInsulin ? sumInsulin.toString() : "0",
                carb: carbStats[0] ? carbStats[0].avgCarb.toString() : "0"
            },
            message: "Getting today's intake of Glucose, Insulin and Carb."
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

exports.getDeviceDetails = async (req, res) => {
    const user = await User.find({ _id: req.auth.id },
        "devices",
        {
            $push: {
                "users.devices": {
                    "$sort": { "updatedAt": -1 }
                }
            }
        }).populate({
            path: "devices",
            select: "-users"
        })
    res.json(user)
}

exports.getReadingsByDateRange = async (req, res) => {
    try {
        var queryObj
        if (!req.query["startDate"] && !req.query["endDate"]) {
            queryObj = { user: mongoose.Types.ObjectId(req.auth.id) }
        } else if (!req.query["startDate"]) {
            queryObj = { user: mongoose.Types.ObjectId(req.auth.id), date: { $lte: new Date(req.query["endDate"]) } }
        } else if (!req.query["endDate"]) {
            queryObj = { user: mongoose.Types.ObjectId(req.auth.id), date: { $gte: new Date(req.query["startDate"]) } }
        } else {
            queryObj = {
                user: mongoose.Types.ObjectId(req.auth.id),
                date: { $gte: new Date(req.query["startDate"]), $lte: new Date(req.query["endDate"]) }
            }
        }

        const glucoseData = await Glucose.find(queryObj).select('-device -user')
        const basalData = await Basal.find(queryObj).select('-devices -user')
        const bolusData = await Bolus.find(queryObj).select('-devices -user')

        const insulinData = basalData.map((v, i) => parseInt(v.flow) + parseInt(bolusData[i].dose))

        res.status(200).json({
            status: 1,
            data: {
                glucose: glucoseData.map(el => el.glucoseReading || "0"),
                insulin: insulinData.map(el => el.toString() || "0"),
                carb: bolusData.map(el => el.carbIntake || "0")
            },
            message: 'Getting insulin, glucose, carb data for n days'
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