const User = require('../models/userModel')
const Device = require('../models/deviceModel')

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).populate({
            path: "devices",
            select: "-users"
            // match: { modelName: { $ne: 'pro' } }
        })

        res.status(200).json({ status: 1, data: { userData: users }, message: 'Getting data of all users from DB.' })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: -1, data: { err }, message: 'Internal Server Error.' })
    }
}

exports.getLoggedInUser = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.auth.id }).populate({
            path: "devices",
            select: "-users"
        })

        res.status(200).json({ status: 1, data: { user }, message: 'Getting data of logged in user from DB.' })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: -1, data: { err }, message: 'Internal Server Error.' })
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
                return res.status(400).json({ status: 0, data: { payload: req.body }, message: 'Please enter your current password.' })
            }

            if (!(await user.comparePassword(passwordOld, user.password))) {
                return res.status(401).json({ status: 0, data: { payload: req.body }, message: 'Your current password is incorrect.' })
            }

            if (!passwordUpdated) {
                return res.status(400).json({ status: 0, data: { payload: req.body }, message: 'Please enter your new password.' })
            }

            user.pass = passwordUpdated
            user.updatedAt = new Date().toISOString()

            await user.save()

            res.status(200).json({ status: 1, data: { user }, message: 'Password changed successfully.' })
        } else {
            return res.status(404).json({ status: 0, data: { payload: user }, message: 'User not found.' })
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({ status: -1, data: { err }, message: 'Internal Server Error.' })
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
                status: 1,
                data: {
                    user: {
                        firstName: updatedUser.firstName,
                        lastName: updatedUser.lastName,
                        status: updatedUser.status,
                        phone: updatedUser.phone,
                        email: updatedUser.email,
                        gender: updatedUser.gender,
                        role: updatedUser.role
                    }
                },
                message: 'User details updated successfully.'
            })
        } else {
            return res.status(404).json({ status: 0, data: { payload: user }, message: 'User not found.' })
        }

    } catch (err) {
        console.log(err)

        if (err.code === 11000) {
            return res.status(409).json({ status: 0, data: { payload: req.body }, message: `${err.codeName} error` })
        }

        return res.status(400).json({ status: 0, data: { err }, message: err._message })
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

            res.status(200).json({ status: 1, data: { user }, message: 'Account deactivated.' })

        } else {
            return res.status(404).json({ status: 0, data: { payload: user }, message: 'User not found.' })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: -1, data: { err }, message: 'Internal Server Error.' })
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.auth.id
        })

        if (user) {
            const deletedUser = await User.deleteOne({ _id: req.auth.id })

            res.status(204).json({ status: 1, data: {}, message: 'Account Deleted.' })

        } else {
            return res.status(404).json({ status: 0, data: { payload: user }, message: 'User not found.' })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: -1, data: { err }, message: 'Internal Server Error.' })
    }
}