const Logger = require('../config/Logger')
const User = require('../models/userModel')
const Device = require('../models/deviceModel')

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).populate({
            path: "devices",
            select: "-users"
            // match: { modelName: { $ne: 'pro' } }
        })

        res.status(200).json({ status: true, users })
    } catch (error) {
        console.log(error)
    }
}

exports.getLoggedInUser = async (req, res) => {
    try {
        const user = await User.findOne({ _id : req.auth.id}).populate({
            path: "devices",
            select: "-users"
        })

        res.status(200).json({ status: true, user })
    } catch (error) {
        console.log(error)
    }
}

exports.changePassword = async (req, res) => {
    try {
        const { passwordOld, passwordUpdated } = req.body

        const user = await User.findOne({
            _id: req.auth.id,
            status: 'active'
        }).select('+password')

        if (user) {
            if (!passwordOld) {
                return res.status(400).json({ status: false, message: 'Please enter your current password.' })
            }

            if (!(await user.comparePassword(passwordOld, user.password))) {
                return res.status(401).json({ status: false, message: 'Your current password is incorrect.' })
            }

            if (!passwordUpdated) {
                return res.status(400).json({ status: false, message: 'Please enter your new password.' })
            }

            user.pass = passwordUpdated
            user.updatedAt = new Date().toISOString()

            await user.save()

            res.status(200).json({ status: true, message: 'Password changed successfully.' })
        } else {
            return res.status(404).json({ status: false, message: 'User not found.' })
        }

    } catch (err) {
        console.log(err)
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, gender, phone, country } = req.body
        const filteredBody = {
            firstName,
            lastName,
            gender,
            phone,
            country
        }

        const user = await User.findOne({
            _id: req.auth.id,
            status: 'active'
        })

        if (user) {
            const updatedUser = await User.findByIdAndUpdate(req.auth.id, filteredBody, {
                new: true,
                runValidators: true
            })


            res.status(200).json({
                status: 'success',
                message: 'User details updated successfully.'
            })
        } else {
            return res.status(404).json({ status: false, message: 'User not found.' })
        }

    } catch (error) {
        console.log(error)

        if (error.code === 11000) {
            return res.status(409).json({ status: false, message: `${error.codeName} error` })
        }

        return res.status(400).json({ status: false, message: error._message })
    }
}

exports.deactivateAccount = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.auth.id,
            status: 'active'
        })

        if (user) {

            const userData = await User.updateOne({ _id: req.auth.id }, { $set: { status: 'inactive' } })

            res.status(200).json({ status: true, message: 'Account deactivated.' })

        } else {
            return res.status(404).json({ status: false, message: 'User not found.' })
        }
    } catch (error) {
        console.log(error)
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.auth.id
        })

        if (user) {
            const deletedUser = await User.deleteOne({ _id: req.auth.id })

            res.status(204).json({ status: true, message: 'Account Deleted.' })

        } else {
            return res.status(404).json({ status: false, message: 'User not found.' })
        }
    } catch (error) {
        console.log(error)
    }
}