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

        new Logger("insulink").i("Get JSON array of all users")

        res.status(200).json({ status: true, users })
    } catch (error) {
        console.log(error)
        new Logger("insulink").e("Error in Get Users", error)
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
                new Logger("insulink").e("Change pwd Please enter your current password", req.body)
                return res.status(400).json({ status: false, message: 'Please enter your current password.' })
            }

            if (!(await user.comparePassword(passwordOld, user.password))) {
                new Logger("insulink").e("Change pwd Your current password is incorrect", req.body)
                return res.status(401).json({ status: false, message: 'Your current password is incorrect.' })
            }

            if (!passwordUpdated) {
                new Logger("insulink").e("Change pwd Please enter your new password", req.body)
                return res.status(400).json({ status: false, message: 'Please enter your new password.' })
            }

            user.pass = passwordUpdated
            user.updatedAt = new Date().toISOString()

            await user.save()

            new Logger("insulink").i("Change pwd Password changed successfully")

            res.status(200).json({ status: true, message: 'Password changed successfully.' })
        } else {
            new Logger("insulink").e("Change pwd User not found", req.body)
            return res.status(404).json({ status: false, message: 'User not found.' })
        }

    } catch (err) {
        console.log(err)
        new Logger("insulink").e("Error in Change Pwd", err)
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

            new Logger("insulink").i("Update profile User details updated successfully")

            res.status(200).json({
                status: 'success',
                message: 'User details updated successfully.'
            })
        } else {
            new Logger("insulink").e("Update profile User not found", req.body)
            return res.status(404).json({ status: false, message: 'User not found.' })
        }

    } catch (error) {
        console.log(error)

        if (error.code === 11000) {
            return res.status(409).json({ status: false, message: `${error.codeName} error` }) 
        }

        new Logger("insulink").e("Error in Update Profile", error)
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

            new Logger("insulink").i("Account deactivated")

            res.status(200).json({ status: true, message: 'Account deactivated.' })

        } else {
            new Logger("insulink").e("Deactivate Account User not found")
            return res.status(404).json({ status: false, message: 'User not found.' })
        }
    } catch (error) {
        console.log(error)
        new Logger("insulink").e("Error in Deactivate Account", error)
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.auth.id
        })

        if (user) {
            const deletedUser = await User.deleteOne({ _id: req.auth.id })

            new Logger("insulink").i("Account Deleted")

            res.status(204).json({ status: true, message: 'Account Deleted.' })

        } else {
            return res.status(404).json({ status: false, message: 'User not found.' })
        }
    } catch (error) {
        console.log(error)
        new Logger("insulink").e("Error in Delete Account", error)
    }
}