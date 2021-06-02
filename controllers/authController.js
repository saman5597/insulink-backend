const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const Logger = require('../config/Logger')

const sendMail = require('../config/emailHandler')
const User = require('../models/userModel')

const signToken = id => {

    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createJWT = (userId, statusCode, message, res) => {

    const token = signToken(userId)

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRY_DT * 24 * 60 * 60 * 1000
        ),
        secure: false,
        httpOnly: true
    }

    res.cookie('jwt', token, cookieOptions)

    res.status(statusCode).json({
        status: true,
        message
    })
}

exports.signUp = async (req, res) => {
    try {

        const { firstName, lastName, email, phone, gender, country, password } = req.body

        if (!firstName || !lastName || !email || !phone || !gender || !country || !password) {
            new Logger("insulink").e("Invalid signup data", req.body)
            return res.status(400).json({ status: false, message: 'Invalid data.' })
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

        new Logger("insulink").i("User signed up successfully")
        createJWT(user._id, 201, "User signed up successfully.", res)

    } catch (err) {

        console.log(err.message)

        //handling duplicate key
        if (err && err.code === 11000) {
            new Logger("insulink").e("Duplicate signup data found", req.body)
            return res.status(409).json({ status: false, message: 'Duplicate data found.' })
        }

        new Logger("insulink").e(err.message, req.body)
        return res.status(400).json({ status: false, message: err.message })

    }
}

exports.loginUsingEmail = async (req, res) => {
    try {

        const { email, password } = req.body

        if (!email || !password) {
            new Logger("insulink").e("Please enter your login credentials", req.body)
            return res.status(400).json({ status: false, message: 'Please enter your credentials.' })
        }

        var user
        if (email) {
            user = await User.findOne({ email }).select('+password')
            if (user) {
                if (!user || !(user.comparePassword(password, user.password))) {
                    new Logger("insulink").e("Incorrect login credentials", req.body)
                    return res.status(401).json({ status: false, message: 'Incorrect credentials.' })
                }

                const loggedUser = await User.updateOne({ email }, { $set: { status: 'active' } })

                new Logger("insulink").i("User logged in successfully")

                createJWT(user._id, 200, 'User logged in successfully.', res)

            } else {
                new Logger("insulink").e("Account does not exist. Please register first", req.body)
                return res.status(404).json({ status: false, message: 'Account does not exist. Please register first.' })
            }
        }

    } catch (err) {
        console.log(err)
        new Logger("insulink").e("Error in Login using email", err)
    }
}

exports.loginUsingMob = async (req, res) => {
    try {

        const { phone, password } = req.body

        if (!phone || !password) {
            new Logger("insulink").e("Please enter your login credentials", req.body)
            return res.status(400).json({ status: false, message: 'Please enter your credentials.' })
        }

        var user
        if (phone) {
            user = await User.findOne({ phone }).select('+password')
            if (user) {
                if (!user || !(user.comparePassword(password, user.password))) {
                    new Logger("insulink").e("Incorrect login credentials", req.body)
                    return res.status(401).json({ status: false, message: 'Incorrect credentials.' })
                }

                const loggedUser = await User.updateOne({ phone }, { $set: { status: 'active' } })

                new Logger("insulink").i("User logged in successfully")

                createJWT(user._id, 200, 'User logged in successfully.', res)

            } else {
                new Logger("insulink").e("Account does not exist. Please register first", req.body)
                return res.status(404).json({ status: false, message: 'Account does not exist. Please register first.' })
            }
        }

    } catch (err) {
        console.log(err)
        new Logger("insulink").e("Error in Login using mobile", err)
    }
}

exports.forgotPwd = async (req, res) => {
    try {

        if (!req.body.email) {
            new Logger("insulink").e("Forgot pwd Please enter email address", req.body)
            return res.status(400).json({ status: false, message: 'Please enter email address.' })
        }

        const user = await User.findOne({ email: req.body.email })

        const resetToken = crypto.randomBytes(32).toString('hex')

        const pwdResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        const linkExpireTime = Date.now() + 2 * 60 * 1000 // 2 minutes expiry time

        if (!user) {
            new Logger("insulink").e("Forgot pwd No user found with this email address", req.body)
            return res.status(404).json({ status: false, message: 'No user found with this email address.' })
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

        new Logger("insulink").i("Forgot pwd Reset url sent via email")

        res.status(200).json({ status: true, link: resetURL })

    } catch (err) {
        console.log(err)
        new Logger("insulink").e("Error in Forgot pwd", err)
    }
}

exports.resetPwd = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.query.rt).digest('hex')
        const user = await User.findOne({
            pwdResetToken: hashedToken,
            linkExpireTime: { $gt: Date.now() }
        })

        if (user) {

            if (!req.body.password) {
                new Logger("insulink").e("Reset pwd Please enter new password", req.body)
                return res.status(400).json({ status: false, message: 'Please enter new password.' })
            }

            user.pass = req.body.password
            user.updatedAt = new Date().toISOString()
            user.pwdResetToken = undefined
            user.linkExpireTime = undefined

            await user.save()

            new Logger("insulink").i("Reset pwd Password updated successfully")

            res.status(200).json({ status: true, message: 'Password updated successfully.' })

        } else {
            new Logger("insulink").w("Reset pwd Link expired", req.body)
            return res.status(400).json({ status: false, message: 'Link expired.' })
        }

    } catch (err) {
        console.log(err)
        new Logger("insulink").e("Error in Reset pwd", err)
    }

}

exports.logout = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.auth.id,
            status: 'active'
        })

        if (user) {
            res.clearCookie('jwt')

            new Logger("insulink").i("You have logged out successfully")

            res.status(200).json({ status: true, message: 'You have logged out successfully.' })
        } else {
            new Logger("insulink").e("Logout User not found")
            return res.status(401).json({ status: false, message: 'User not found.' })
        }
    } catch (error) {
        console.log(error)
        new Logger("insulink").e("Error in Logout", error)
    }
}
