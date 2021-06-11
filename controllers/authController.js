const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const sendMail = require('../config/emailHandler')
const User = require('../models/userModel')
const { validationResult } = require("express-validator")

const signToken = id => {

    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
        issuer: 'AgVa Healthcare'
    })
}

const createJWT = (user, statusCode, message, res) => {

    const token = signToken(user._id)

    res.header('Authorization', `Bearer  ${token}`)

    res.status(statusCode).json({
        status: true,
        data: {
            user: {
                firstName: user.firstName,
                status: user.status,
                lastName: user.lastName,
                phone: user.phone,
                email: user.email,
                gender: user.gender,
                country: user.country,
                token
            }
        },
        message
    })
}

exports.signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, gender, country, password } = req.body

        if (!firstName || !lastName || !email || !phone || !gender || !country || !password) {
            return res.status(400).json({ status: false, data: { payload: req.body }, message: 'Invalid data.' })
        }

        const user = User({
            firstName,
            lastName,
            email,
            phone,
            gender,
            country,
            pass: password
        })

        await user.save()

        createJWT(user, 201, "User signed up successfully.", res)
    } catch (err) {

        console.log(err.message)

        //handling duplicate key
        if (err && err.code === 11000) {
            return res.status(409).json({ status: false, data: { payload: req.body }, message: 'Duplicate data found.' })
        }

        return res.status(400).json({ status: false, data: { err }, message: err.message })

    }
}

exports.loginUsingEmail = async (req, res) => {
    try {

        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ status: false, data: { payload: req.body }, message: 'Please enter your credentials.' })
        }

        var user
        if (email) {
            user = await User.findOne({ email }).select('+password')
            if (user) {
                if (!user || !(user.comparePassword(password, user.password))) {
                    return res.status(401).json({ status: false, data: { payload: req.body }, message: 'Incorrect credentials.' })
                }

                const loggedUser = await User.updateOne({ email }, { $set: { status: 'active' } })

                createJWT(user, 200, 'User logged in successfully.', res)

            } else {
                return res.status(404).json({ status: false, data: { payload: req.body }, message: 'Account does not exist. Please register first.' })
            }
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, data: { err }, message: 'Internal Server Error.' })
    }
}

exports.loginUsingMob = async (req, res) => {
    try {

        const { phone, password } = req.body

        if (!phone || !password) {
            return res.status(400).json({ status: false, data: { payload: req.body }, message: 'Please enter your credentials.' })
        }

        var user
        if (phone) {
            user = await User.findOne({ phone }).select('+password')
            if (user) {
                if (!user || !(user.comparePassword(password, user.password))) {
                    return res.status(401).json({ status: false, data: { payload: req.body }, message: 'Incorrect credentials.' })
                }

                const loggedUser = await User.updateOne({ phone }, { $set: { status: 'active' } })

                createJWT(user, 200, 'User logged in successfully.', res)

            } else {
                return res.status(404).json({ status: false, data: { payload: req.body }, message: 'Account does not exist. Please register first.' })
            }
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, data: { err }, message: 'Internal Server Error.' })
    }
}

exports.forgotPwd = async (req, res) => {
    try {

        // let errors = validationResult(req)
        // if (errors.isEmpty) {
        //     return res.status(400).json({
        //         status: -1,
        //         data: {
        //             errs: errors.array()
        //         }
        //     })
        // }

        if (!req.body.email) {
            return res.status(400).json({ status: false, data: { payload: req.body }, message: 'Please enter email address.' })
        }

        const user = await User.findOne({ email: req.body.email })

        const resetToken = crypto.randomBytes(32).toString('hex')

        const pwdResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        const linkExpireTime = Date.now() + 2 * 60 * 1000 // 2 minutes expiry time

        if (!user) {
            return res.status(404).json({ status: false, data: { payload: req.body }, message: 'No user found with this email address.' })
        }

        const currentUser = await User.updateOne({ email: req.body.email }, { $set: { pwdResetToken, linkExpireTime } })

        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword?rt=${resetToken}`

        // Send Mail
        sendMail({
            from: `User <${process.env.SENDER_EMAIL}>`,
            to: user.email,
            subject: 'Password Reset Token',
            text: resetURL,
            html: "<h2>Reset URL Valid for 2 minutes</h2>"
        })

        res.status(200).json({ status: true, data: { link: resetURL }, message: 'Reset URL sent via mail' })

    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, data: { err }, message: 'Internal Server Error.' })
    }
}

exports.resetPwd = async (req, res) => {
    try {


        // let errors = validationResult(req)
        // if (errors.isEmpty) {
        //     return res.status(400).json({
        //         status: -1,
        //         data: {
        //             errs: errors.array()
        //         }
        //     })
        // }


        const hashedToken = crypto.createHash('sha256').update(req.query.rt).digest('hex')
        const user = await User.findOne({
            pwdResetToken: hashedToken,
            linkExpireTime: { $gt: Date.now() }
        })

        if (user) {

            if (!req.body.password) {
                return res.status(400).json({ status: false, data: { payload: req.body }, message: 'Please enter new password.' })
            }

            user.pass = req.body.password
            user.updatedAt = new Date().toISOString()
            user.pwdResetToken = undefined
            user.linkExpireTime = undefined

            await user.save()

            res.status(200).json({ status: true, data: { user }, message: 'Password updated successfully.' })

        } else {
            return res.status(400).json({ status: false, data: { payload: req.body }, message: 'Link expired.' })
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, data: { err }, message: 'Internal Server Error.' })
    }

}

exports.logout = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.auth.id,
            status: 'active'
        })

        if (user) {
            res.removeHeader('Authorization')
            res.status(200).json({ status: true, data: { user }, message: 'You have logged out successfully.' })
        } else {
            return res.status(404).json({ status: false, data: { user }, message: 'User not found.' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: false, data: { err }, message: 'Internal Server Error.' })
    }
}
