const redis = require('redis')
const url = require('url')
let redisClient
if (process.env.REDISCLOUD_URL) {
    let redisURL = url.parse(process.env.REDISCLOUD_URL)
    redisClient = redis.createClient(redisURL.port, redisURL.hostname, { no_ready_check: true })
    redisClient.auth(redisURL.auth.split(":")[1])
} else {
    redisClient = redis.createClient()
}
const JWTR = require('jwt-redis').default
const jwtr = new JWTR(redisClient)
const crypto = require('crypto')

const sendMail = require('../config/emailHandler')
const User = require('../models/userModel')

/**
 * Creates a JWT Token
 * @param {id} id 
 * @returns token
 * @author Saman Arshad
 */
const signToken = async id => {
    const token = await jwtr.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
        issuer: 'AgVa Healthcare'
    })
    return token
}

/**
 * Signs a JWT token and sends the token in headers and response
 * @param {*} user
 * @param {*} statusCode 
 * @param {*} message 
 * @param {*} res 
 * @returns JWT in headers and response
 * @author Saman Arshad
 */
const createJWT = async (user, statusCode, message, res) => {

    const token = await signToken(user._id)

    res.header('Authorization', `Bearer  ${token}`)

    res.status(statusCode).json({
        status: 1,
        data: {
            user: {
                firstName: user.firstName,
                status: 'active',
                lastName: user.lastName,
                phone: user.phone,
                email: user.email,
                gender: user.gender,
                country: user.country,
                role: user.role,
                deviceCount: user.devices.length,
                token
            }
        },
        message
    })
}

/**
 * User signup/register
 * @reqBody {firstName, lastName, email, phone, gender,country, password} 
 * @returns response as JSON object
 * @author Saman Arshad
 */
exports.signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, gender, country, password } = req.body

        const user = User({
            firstName,
            lastName,
            email,
            phone,
            gender,
            country,
            pass: password
        })

        const newUser = await user.save()

        createJWT(newUser, 201, "User signed up successfully.", res)
    } catch (err) {

        console.log(err.message)

        //handling duplicate key
        if (err && err.code === 11000) {
            return res.status(409).json({
                status: 0,
                data: {
                    err: {
                        generatedTime: new Date(),
                        errMsg: err.message,
                        msg: 'User already exists.',
                        type: 'DuplicateKeyError'
                    }
                }
            })
        }

        return res.status(400).json({
            status: 0,
            data: {
                err: {
                    generatedTime: new Date(),
                    errMsg: err.message,
                    msg: 'Invalid data.',
                    type: 'ValidationError'
                }
            }
        })

    }
}

/**
 * Admin signup/register
 * @reqBody {firstName, lastName, email, phone, gender,country, password} 
 * @returns response as JSON object
 * @author Saman Arshad
 */
exports.adminSignup = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, gender, country, password } = req.body

        const admin = User({
            firstName,
            lastName,
            email,
            phone,
            gender,
            country,
            pass: password,
            role: 1
        })

        const newAdmin = await admin.save()

        createJWT(newAdmin, 201, "Admin signed up successfully.", res)
    } catch (err) {

        console.log(err.message)

        //handling duplicate key
        if (err && err.code === 11000) {
            return res.status(409).json({
                status: 0,
                data: {
                    err: {
                        generatedTime: new Date(),
                        errMsg: err.message,
                        msg: 'Admin already exists.',
                        type: 'DuplicateKeyError'
                    }
                }
            })
        }

        return res.status(400).json({
            status: 0,
            data: {
                err: {
                    generatedTime: new Date(),
                    errMsg: err.message,
                    msg: 'Invalid data.',
                    type: 'ValidationError'
                }
            }
        })

    }
}

/**
 * Admin Login
 * @reqBody { email, password }
 * @returns response as JSON object
 * @author Saman Arshad
 */
exports.adminLogin = async (req, res) => {
    try {

        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                status: 0,
                data: {
                    err: {
                        generatedTime: new Date(),
                        errMsg: 'Please enter your credentials.',
                        msg: 'Please enter your credentials.',
                        type: 'ValidationError'
                    }
                }
            })
        }

        var admin
        if (email) {
            admin = await User.findOne({ email, role: 1 }).select('+password')
            if (admin) {
                if (!admin || !(admin.comparePassword(password, admin.password))) {
                    return res.status(401).json({
                        status: 0,
                        data: {
                            err: {
                                generatedTime: new Date(),
                                errMsg: 'Incorrect credentials.',
                                msg: 'Incorrect credentials.',
                                type: 'AuthenticationError'
                            }
                        }
                    })
                }

                const loggedAdmin = await User.updateOne({ email }, { $set: { status: 'active' } })

                createJWT(admin, 200, 'Admin logged in successfully.', res)

            }
            else {
                return res.status(404).json({
                    status: 0,
                    data: {
                        err: {
                            generatedTime: new Date(),
                            errMsg: 'Account does not exist. Please register first.',
                            msg: 'Account does not exist. Please register first.',
                            type: 'MongoDBError'
                        }
                    }
                })
            }
        }

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

/**
 * User Login with Email , password
 * @reqBody { email, password }
 * @returns response as JSON object
 * @author Saman Arshad
 */
exports.loginUsingEmail = async (req, res) => {
    try {

        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                status: 0,
                data: {
                    err: {
                        generatedTime: new Date(),
                        errMsg: 'Please enter your credentials.',
                        msg: 'Please enter your credentials.',
                        type: 'ValidationError'
                    }
                }
            })
        }

        var user
        if (email) {
            user = await User.findOne({ email }).select('+password')
            if (user) {
                if (!user || !(user.comparePassword(password, user.password))) {
                    return res.status(401).json({
                        status: 0,
                        data: {
                            err: {
                                generatedTime: new Date(),
                                errMsg: 'Incorrect credentials.',
                                msg: 'Incorrect credentials.',
                                type: 'AuthenticationError'
                            }
                        }
                    })
                }

                const loggedUser = await User.updateOne({ email }, { $set: { status: 'active' } })

                createJWT(user, 200, 'User logged in successfully.', res)

            }
            else {
                return res.status(404).json({
                    status: 0,
                    data: {
                        err: {
                            generatedTime: new Date(),
                            errMsg: 'Account does not exist. Please register first.',
                            msg: 'Account does not exist. Please register first.',
                            type: 'MongoDBError'
                        }
                    }
                })
            }
        }

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

/**
 * User Login with Phone , password
 * @reqBody { phone, password }
 * @returns response as JSON object
 * @author Saman Arshad
 */
exports.loginUsingMob = async (req, res) => {
    try {

        const { phone, password } = req.body

        if (!phone || !password) {
            return res.status(400).json({
                status: 0,
                data: {
                    err: {
                        generatedTime: new Date(),
                        errMsg: 'Please enter your credentials.',
                        msg: 'Please enter your credentials.',
                        type: 'ValidationError'
                    }
                }
            })
        }

        var user
        if (phone) {
            user = await User.findOne({ phone }).select('+password')
            if (user) {
                if (!user || !(user.comparePassword(password, user.password))) {
                    return res.status(401).json({
                        status: 0,
                        data: {
                            err: {
                                generatedTime: new Date(),
                                errMsg: 'Incorrect credentials.',
                                msg: 'Incorrect credentials.',
                                type: 'AuthenticationError'
                            }
                        }
                    })
                }

                const loggedUser = await User.updateOne({ phone }, { $set: { status: 'active' } })

                createJWT(user, 200, 'User logged in successfully.', res)

            } else {
                return res.status(404).json({
                    status: 0,
                    data: {
                        err: {
                            generatedTime: new Date(),
                            errMsg: 'Account does not exist. Please register first.',
                            msg: 'Account does not exist. Please register first.',
                            type: 'MongoDBError'
                        }
                    }
                })
            }
        }

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

/**
 * Forgot Password
 * @reqBody { email }
 * @returns reset password URL in its response as JSON object
 * @author Saman Arshad
 */
exports.forgotPwd = async (req, res) => {
    try {

        if (!req.body.email) {
            return res.status(400).json({
                status: 0,
                data: {
                    err: {
                        generatedTime: new Date(),
                        errMsg: 'Please enter email address.',
                        msg: 'Please enter email address.',
                        type: 'ValidationError'
                    }
                }
            })
        }

        const user = await User.findOne({ email: req.body.email })

        const resetToken = crypto.randomBytes(32).toString('hex')

        const pwdResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        const linkExpireTime = Date.now() + 2 * 60 * 1000 // 2 minutes expiry time

        if (!user) {
            return res.status(404).json({
                status: 0,
                data: {
                    err: {
                        generatedTime: new Date(),
                        errMsg: 'No user found with this email address.',
                        msg: 'No user found with this email address.',
                        type: 'MongoDBError'
                    }
                }
            })
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

        res.status(200).json({ status: 1, data: { link: resetURL }, message: 'Reset URL sent via mail' })

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

/**
 * Reset Password
 * @reqBody { password }
 * @returns response as JSON object
 * @author Saman Arshad
 */
exports.resetPwd = async (req, res) => {
    try {

        const hashedToken = crypto.createHash('sha256').update(req.query.rt).digest('hex')
        const user = await User.findOne({
            pwdResetToken: hashedToken,
            linkExpireTime: { $gt: Date.now() }
        })

        if (user) {

            if (!req.body.password) {
                return res.status(400).json({
                    status: 0,
                    data: {
                        err: {
                            generatedTime: new Date(),
                            errMsg: 'Please enter new password.',
                            msg: 'Please enter new password.',
                            type: 'ValidationError'
                        }
                    }
                })
            }

            user.pass = req.body.password
            user.updatedAt = new Date().toISOString()
            user.pwdResetToken = undefined
            user.linkExpireTime = undefined

            await user.save()

            res.status(200).json({ status: 1, data: { user }, message: 'Password updated successfully.' })

        } else {
            return res.status(400).json({
                status: 0,
                data: {
                    err: {
                        generatedTime: new Date(),
                        errMsg: 'Link expired.',
                        msg: 'Link expired.',
                        type: 'ValidationError'
                    }
                }
            })
        }

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

/**
 * User/Admin logout
 * @reqHeaders { Authorization : " Bearer [TOKEN] " }
 * @returns response as JSON object
 * @author Saman Arshad
 */
exports.logout = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.auth.id,
            status: 'active'
        })

        if (user) {
            const isDestroyed = await jwtr.destroy(req.auth.jti)
            res.removeHeader('Authorization')
            res.status(200).json({ status: 1, data: { user }, message: 'You have logged out successfully.' })
        } else {
            return res.status(404).json({
                status: 0,
                data: {
                    err: {
                        generatedTime: new Date(),
                        errMsg: 'User not found.',
                        msg: 'User not found.',
                        type: 'MongoDBError'
                    }
                }
            })
        }
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
