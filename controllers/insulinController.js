const Basal = require('../models/basalModel')
const Bolus = require('../models/bolusModel')
const Glucose = require('../models/glucoseModel')

exports.getBasalByDateRange = async (req, res) => {
    try {

        var queryObj
        if (!req.query["startDate"] && !req.query["endDate"]) {
            queryObj = {}
        } else if (!req.query["startDate"]) {
            queryObj = { "date": { $lt: new Date(req.query["endDate"]) } }
        } else if (!req.query["endDate"]) {
            queryObj = { "date": { $gte: new Date(req.query["startDate"]) } }
        } else {
            queryObj = {
                "date": { $gte: new Date(req.query["startDate"]), $lt: new Date(req.query["endDate"]) }
            }
        }

        const basalData = await Basal.find(queryObj)
        console.log(basalData)
        res.status(200).json({ status: 1, data: { basal: basalData }, message: 'Basal data for a particular date range.' })

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

exports.getBasalByDate = async (req, res) => {
    try {
        var queryObj
        if (!req.query["date"]) {
            queryObj = {}
        } else {
            queryObj = { "date": new Date(req.query["date"]) }
        }
        const basalData = await Basal.find(queryObj)
        console.log(basalData)
        res.status(200).json({ status: 1, data: { basal: basalData }, message: 'Basal data for a particular date.' })

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

exports.getBasalByUID = async (req, res) => {
    try {
        const basalData = await Basal.find({ user: req.params.uid })
        console.log(basalData)
        res.status(200).json({ status: 1, data: { basal: basalData }, message: 'Basal data for a particular user.' })

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

exports.getBolusByDateRange = async (req, res) => {
    try {

        var queryObj
        if (!req.query["startDate"] && !req.query["endDate"]) {
            queryObj = {}
        } else if (!req.query["startDate"]) {
            queryObj = { "date": { $lt: new Date(req.query["endDate"]) } }
        } else if (!req.query["endDate"]) {
            queryObj = { "date": { $gte: new Date(req.query["startDate"]) } }
        } else {
            queryObj = {
                "date": { $gte: new Date(req.query["startDate"]), $lt: new Date(req.query["endDate"]) }
            }
        }

        const bolusData = await Bolus.find(queryObj)
        console.log(bolusData)
        res.status(200).json({ status: 1, data: { bolus: bolusData }, message: 'Bolus data for a particular date range.' })

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

exports.getBolusByDate = async (req, res) => {
    try {
        var queryObj
        if (!req.query["date"]) {
            queryObj = {}
        } else {
            queryObj = { "date": new Date(req.query["date"]) }
        }
        const bolusData = await Bolus.find(queryObj)
        console.log(bolusData)
        res.status(200).json({ status: 1, data: { bolus: bolusData }, message: 'Bolus data for a particular date.' })

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

exports.getBolusByUID = async (req, res) => {
    try {
        const bolusData = await Bolus.find({ user: req.params.uid })
        console.log(bolusData)
        res.status(200).json({ status: 1, data: { bolus: bolusData }, message: 'Basal data for a particular user.' })

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

exports.getReport = async (req, res) => {
    try {
        var queryObj
        if (!req.query["startDate"] && !req.query["endDate"]) {
            queryObj = {}
        } else if (!req.query["startDate"]) {
            queryObj = { "date": { $lte: new Date(req.query["endDate"]) } }
        } else if (!req.query["endDate"]) {
            queryObj = { "date": { $gte: new Date(req.query["startDate"]) } }
        } else {
            queryObj = {
                "date": { $gte: new Date(req.query["startDate"]), $lte: new Date(req.query["endDate"]) }
            }
        }

        const glucoseStats = await Glucose.aggregate([
            {
                $match: queryObj
            },
            {
                $group: {
                    // _id: null (group for all the documents)
                    _id: null,
                    numGlucose: { $sum: 1 },
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
                    // _id: null (group for all the documents)
                    _id: null,
                    numBasal: { $sum: 1 },
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
                    // _id: null (group for all the documents)
                    _id: null,
                    numBolus: { $sum: 1 },
                    sumBolus: { $sum: '$dose' },
                    avgBolus: { $avg: '$dose' }
                }
            }
        ])

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

exports.getLoggedUserBasal = async (req, res) => {
    try {
        const basalData = await Basal.find({ user: req.auth.id }).select('-device -user')
        
        res.status(200).json({ status: 1, data: { basal: basalData }, message: 'Basal data for logged in user.' })

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

exports.getLoggedUserBolus = async (req, res) => {
    try {
        const bolusData = await Bolus.find({ user: req.auth.id }).select('-device -user')
        
        res.status(200).json({ status: 1, data: { bolus: bolusData }, message: 'Bolus data for logged in user.' })

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