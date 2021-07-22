const { ObjectId } = require('mongoose').Types
const Glucose = require('../models/glucoseModel')
const Bolus = require('../models/bolusModel')
const Basal = require('../models/basalModel')
const User = require('../models/userModel')
const Device = require('../models/deviceModel')

function dateRange(startDate, endDate) {
    var start = startDate.split('-');
    var end = endDate.split('-');
    var startYear = parseInt(start[0]);
    var endYear = parseInt(end[0]);
    var dates = [];

    for (var i = startYear; i <= endYear; i++) {
        var endMonth = i != endYear ? 11 : parseInt(end[1]) - 1;
        var startMon = i === startYear ? parseInt(start[1]) - 1 : 0;
        for (var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
            var month = j + 1;
            var displayMonth = month < 10 ? '0' + month : month;
            dates.push([i, displayMonth].join('-'));
        }
    }
    return dates;
}

exports.getReport = async (req, res) => {
    try {
        var queryObj
        if (!req.query["startDate"] && !req.query["endDate"]) {
            queryObj = { user: ObjectId(req.auth.id) }
        } else if (!req.query["startDate"]) {
            queryObj = { user: ObjectId(req.auth.id), date: { $lte: new Date(req.query["endDate"]) } }
        } else if (!req.query["endDate"]) {
            queryObj = { user: ObjectId(req.auth.id), date: { $gte: new Date(req.query["startDate"]) } }
        } else {
            queryObj = {
                user: ObjectId(req.auth.id),
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

        const carbStats = await Bolus.aggregate([
            {
                $match: queryObj
            },
            {
                $group: {
                    _id: null,
                    countCarbIntake: { $sum: 1 },
                    sumCarbIntake: { $sum: '$carbIntake' },
                    avgCarbIntake: { $avg: '$carbIntake' }
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
                    avgGlucose: glucoseStats[0] && glucoseStats[0].avgGlucose ? glucoseStats[0].avgGlucose : 0,
                    sumGlucose: glucoseStats[0] ? glucoseStats[0].sumGlucose : 0
                },
                insulin: {
                    avgInsulin: avgInsulin ? avgInsulin : 0,
                    sumInsulin: sumInsulin ? sumInsulin : 0
                },
                carbIntake: {
                    avgCarbIntake: carbStats[0] && carbStats[0].avgCarbIntake ? carbStats[0].avgCarbIntake : -1,
                    sumCarbIntake: carbStats[0] && carbStats[0].sumCarbIntake ? carbStats[0].sumCarbIntake : -1
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
        const endDate = currentDate.split("T")[0].concat("T00:00:00.000Z")

        const start_date = new Date(newDate).toISOString().split("T")[0]
        const end_date = currentDate.split("T")[0]

        const queryObj = {
            user: ObjectId(req.auth.id),
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
                        year: { $year: "$date" },
                        date: { $substr: ["$date", 0, 7] }
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
                    date: '$_id.date',
                    avgGlucose: 1
                }
            },
            {
                $group: {
                    _id: null,
                    stats: { $push: "$$ROOT" }
                }
            },
            {
                $project: {
                    stats: {
                        $map: {
                            input: dateRange(start_date, end_date),
                            as: "date_new",
                            in: {
                                $let: {
                                    vars: { dateIndex: { "$indexOfArray": ["$stats.date", "$$date_new"] } },
                                    in: {
                                        $cond: {
                                            if: { $ne: ["$$dateIndex", -1] },
                                            then: {
                                                $arrayElemAt: ["$stats", "$$dateIndex"]
                                            }
                                            ,
                                            else: {
                                                month: { $month: { $toDate: "$$date_new" } },
                                                year: { $year: { $toDate: "$$date_new" } },
                                                avgGlucose: 0
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $unwind: "$stats"
            },
            {
                $replaceRoot: {
                    newRoot: "$stats"
                }
            },
            {
                $project: {
                    year: '$year',
                    month: '$month',
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
                        year: { $year: "$date" },
                        date: { $substr: ["$date", 0, 7] }
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
                    date: '$_id.date',
                    avgBolus: 1
                }
            },
            {
                $group: {
                    _id: null,
                    stats: { $push: "$$ROOT" }
                }
            },
            {
                $project: {
                    stats: {
                        $map: {
                            input: dateRange(start_date, end_date),
                            as: "date_new",
                            in: {
                                $let: {
                                    vars: { dateIndex: { "$indexOfArray": ["$stats.date", "$$date_new"] } },
                                    in: {
                                        $cond: {
                                            if: { $ne: ["$$dateIndex", -1] },
                                            then: {
                                                $arrayElemAt: ["$stats", "$$dateIndex"]
                                            }
                                            ,
                                            else: {
                                                month: { $month: { $toDate: "$$date_new" } },
                                                year: { $year: { $toDate: "$$date_new" } },
                                                avgBolus: 0
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $unwind: "$stats"
            },
            {
                $replaceRoot: {
                    newRoot: "$stats"
                }
            },
            {
                $project: {
                    year: '$year',
                    month: '$month',
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
                        year: { $year: "$date" },
                        date: { $substr: ["$date", 0, 7] }
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
                    date: '$_id.date',
                    avgBasal: 1
                }
            },
            {
                $group: {
                    _id: null,
                    stats: { $push: "$$ROOT" }
                }
            },
            {
                $project: {
                    stats: {
                        $map: {
                            input: dateRange(start_date, end_date),
                            as: "date_new",
                            in: {
                                $let: {
                                    vars: { dateIndex: { "$indexOfArray": ["$stats.date", "$$date_new"] } },
                                    in: {
                                        $cond: {
                                            if: { $ne: ["$$dateIndex", -1] },
                                            then: {
                                                $arrayElemAt: ["$stats", "$$dateIndex"]
                                            }
                                            ,
                                            else: {
                                                month: { $month: { $toDate: "$$date_new" } },
                                                year: { $year: { $toDate: "$$date_new" } },
                                                avgBasal: 0
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $unwind: "$stats"
            },
            {
                $replaceRoot: {
                    newRoot: "$stats"
                }
            },
            {
                $project: {
                    year: '$year',
                    month: '$month',
                    avgBasal: 1
                }
            }
        ])

        res.status(200).json({
            status: 1,
            data: {
                glucose: glucoseAggr,
                bolus: bolusAggr,
                basal: basalAggr
            },
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
            user: ObjectId(req.auth.id),
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
                carb: carbStats[0] ? carbStats[0].sumCarb : -1
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
                $match: { _id: ObjectId(req.auth.id) }
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

        res.status(200).json({
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
            queryObj = { user: ObjectId(req.auth.id) }
        } else if (!req.query["startDate"]) {
            queryObj = { user: ObjectId(req.auth.id), date: { $lte: new Date(req.query["endDate"]) } }
        } else if (!req.query["endDate"]) {
            queryObj = { user: ObjectId(req.auth.id), date: { $gte: new Date(req.query["startDate"]) } }
        } else {
            queryObj = {
                user: ObjectId(req.auth.id),
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
                carb: bolusData.map(el => el.carbIntake || -1)
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