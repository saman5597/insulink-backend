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
        res.status(200).json({ status: true, data: basalData })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: false, data: { error }, message: 'Internal Server Error.' })
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
        res.status(200).json({ status: true, data: basalData })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: false, data: { error }, message: 'Internal Server Error.' })
    }
}

exports.getBasalByUID = async (req, res) => {
    try {
        const basalData = await Basal.find({ user: req.params.uid })
        console.log(basalData)
        res.status(200).json({ status: true, data: basalData })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: false, data: { error }, message: 'Internal Server Error.' })
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
        res.status(200).json({ status: true, data: bolusData })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: false, data: { error }, message: 'Internal Server Error.' })
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
        res.status(200).json({ status: true, data: bolusData })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: false, data: { error }, message: 'Internal Server Error.' })
    }
}

exports.getBolusByUID = async (req, res) => {
    try {
        const bolusData = await Bolus.find({ user: req.params.uid })
        console.log(bolusData)
        res.status(200).json({ status: true, data: bolusData })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: false, data: { error }, message: 'Internal Server Error.' })
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

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: false, data: { error }, message: 'Internal Server Error.' })
    }
}