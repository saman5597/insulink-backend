const Glucose = require('../models/glucoseModel')

exports.getGlucoseByDateRange = async (req, res) => {
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

        const glucoseData = await Glucose.find(queryObj)
        console.log(glucoseData)
        res.status(200).json({ status: true, data: glucoseData })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: false, data: { error }, message: 'Internal Server Error.' })
    }
}

exports.getGlucoseByDate = async (req, res) => {
    try {
        var queryObj
        if (!req.query["date"]) {
            queryObj = {}
        } else {
            queryObj = { "date": new Date(req.query["date"]) }
        }
        const glucoseData = await Glucose.find(queryObj)
        console.log(glucoseData)
        res.status(200).json({ status: true, data: glucoseData })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: false, data: { error }, message: 'Internal Server Error.' })
    }
}

exports.getGlucoseByUID = async (req, res) => {
    try {
        const glucoseData = await Glucose.find({user : req.params.uid})
        console.log(glucoseData)
        res.status(200).json({ status: true, data: glucoseData })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: false, data: { error }, message: 'Internal Server Error.' })
    }
}