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
                    sumGlucose: { $sum: '$glucoseReading' },
                    avgGlucose: { $avg: '$glucoseReading' }
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
                    sumBasal: { $sum: '$flow' },
                    avgBasal: { $avg: '$flow' }
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
                    sumBolus: { $sum: '$dose' },
                    avgBolus: { $avg: '$dose' }
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
                    avgGlucose: glucoseStats[0] ? glucoseStats[0].avgGlucose : 0,
                    sumGlucose: glucoseStats[0] ? glucoseStats[0].sumGlucose : 0
                },
                insulin: {
                    avgInsulin: avgInsulin ? avgInsulin : 0,
                    sumInsulin: sumInsulin ? sumInsulin : 0
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
        const currentDate = new Date().toISOString()

        var subtractedDate = new Date()
        var newDate = subtractedDate.setMonth(subtractedDate.getMonth() - parseInt(req.params.month))
        const startDate = new Date(newDate).toISOString().split("T")[0].concat("T00:00:00.000Z")
        console.log(startDate)

        const endDate = currentDate.split("T")[0].concat("T00:00:00.000Z")
        console.log(endDate)
        const queryObj = {
            user: mongoose.Types.ObjectId(req.auth.id),
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }


        const glucoseAggr = await Glucose.aggregate([
            {
                $match: queryObj
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        year: { $year: "$date" }
                    },
                    sumGlucose: { $sum: '$glucoseReading' },
                    avgGlucose: { $avg: '$glucoseReading' },
                    countGlucose: { $sum: 1 }
                }
            },
            { $sort: { "year": -1 } },
            {
                $project: {
                    _id: 0,
                    year: '$_id.year',
                    month: '$_id.month',
                    // sumGlucose: 1,
                    // countGlucose: 1,
                    avgGlucose: 1
                }
            }
        ])

        const bolusAggr = await Bolus.aggregate([
            {
                $match: queryObj
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        year: { $year: "$date" }
                    },
                    sumBolus: { $sum: '$dose' },
                    avgBolus: { $avg: '$dose' },
                    countBolus: { $sum: 1 }
                }
            },
            { $sort: { "year": -1 } },
            {
                $project: {
                    _id: 0,
                    year: '$_id.year',
                    month: '$_id.month',
                    // sumBolus: 1,
                    // countBolus: 1,
                    avgBolus: 1
                }
            }
        ])

        const basalAggr = await Basal.aggregate([
            {
                $match: queryObj
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        year: { $year: "$date" }
                    },
                    sumBasal: { $sum: '$flow' },
                    avgBasal: { $avg: '$flow' },
                    countBasal: { $sum: 1 }
                }
            },
            { $sort: { "year": -1 } },
            {
                $project: {
                    _id: 0,
                    year: '$_id.year',
                    month: '$_id.month',
                    // sumBasal: 1,
                    // countBasal: 1,
                    avgBasal: 1
                }
            }
        ])

        res.status(200).json({
            status: 1,
            glucose: glucoseAggr,
            bolus: bolusAggr,
            basal: basalAggr,
            message: 'Getting monthly average data of Insulin & Glucose of logged in user'
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
                    sumGlucose: { $sum: '$glucoseReading' }
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
                    sumBolus: { $sum: '$dose' }
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
                    sumBasal: { $sum: '$flow' }
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
                    sumCarb: { $sum: '$carbIntake' }
                }
            }
        ])

        const sumBasalVal = basalStats[0] ? basalStats[0].sumBasal : 0
        const sumBolusVal = bolusStats[0] ? bolusStats[0].sumBolus : 0
        const sumInsulin = sumBasalVal + sumBolusVal

        res.status(200).json({
            status: 1,
            data: {
                glucose: glucoseStats[0] ? glucoseStats[0].sumGlucose : 0,
                insulin: sumInsulin ? sumInsulin : 0,
                carb: carbStats[0] ? carbStats[0].avgCarb : 0
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

exports.getUpdatedDeviceDetails = async (req, res) => {
    try {
        const user = await User.aggregate([
            {
                $match: { _id: mongoose.Types.ObjectId(req.auth.id) }
            },
            {
                $lookup: { from: 'devices', localField: 'devices', foreignField: '_id', as: 'devices' }
            },
            {
                $unwind: '$devices'
            },
            {
                $project: { _id: 0, 'devices.serialNo': 1, 'devices.battery': 1, 'devices.reservoir': 1, 'devices.updatedAt': 1 }
            },
            {
                $sort: { 'devices.updatedAt': -1 }
            }
        ])

        console.log(user && user[0] ? user[0] : 0)

        res.json({
            status: 1,
            data: {
                device: {
                    battery: user && user[0] ? user[0].devices.battery : 0,
                    reservoir: user && user[0] ? user[0].devices.reservoir : 0
                }
            },
            message: 'Get last updated device details'
        })
    } catch (err) {
        console.log(err)
    }
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
                glucose: glucoseData.map(el => el.glucoseReading || 0),
                insulin: insulinData.map(el => el || 0),
                carb: bolusData.map(el => el.carbIntake || 0)
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