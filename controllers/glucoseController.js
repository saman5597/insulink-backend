const Glucose = require('../models/glucoseModel')
// const Device = require('../models/deviceModel')
// const User = require('../models/userModel')

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

        const glucoseData = await Glucose.find(queryObj).select('-device -user')
        res.status(200).json({ status: 1, data: { glucose: glucoseData }, message: 'Glucose data for a particular date range.' })

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

exports.getGlucoseByDate = async (req, res) => {
    try {
        var queryObj
        if (!req.query["date"]) {
            queryObj = {}
        } else {
            queryObj = { "date": new Date(req.query["date"]) }
        }
        const glucoseData = await Glucose.find(queryObj).select('-device -user')
        res.status(200).json({ status: 1, data: { glucose: glucoseData }, message: 'Glucose data for a particular date.' })

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

exports.getGlucoseByUID = async (req, res) => {
    try {
        const glucoseData = await Glucose.find({ user: req.params.uid }).select('-device -user')
        // .populate({
        //     path: "device",
        //     select: "-users"
        // })
        // .populate({
        //     path: "user",
        //     select: "-devices -__v -createdAt -updatedAt"
        // })
        res.status(200).json({ status: 1, data: { glucose: glucoseData }, message: 'Glucose data for a particular user.' })

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

exports.getLoggedUserGlucose = async (req, res) => {
    try {
        const glucoseData = await Glucose.find({ user: req.auth.id }).select('-device -user')
        
        res.status(200).json({ status: 1, data: { glucose: glucoseData }, message: 'Glucose data for logged in user.' })

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
