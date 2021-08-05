const redis = require('redis')
const url = require('url')
let redisClient
if(process.env.REDISCLOUD_URL){
    let redisURL = url.parse(process.env.REDISCLOUD_URL)
    redisClient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true})
    redisClient.auth(redisURL.auth.split(":")[1])
} else {
    redisClient = redis.createClient()
}
const JWTR = require('jwt-redis').default
const jwtr = new JWTR(redisClient)

const User = require('../models/userModel')

exports.isAuth = async (req, res, next) => {

  try {

    let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Not authenticated.',
            msg: 'You are not logged in. Please login.',
            type: 'AuthenticationError'
          }
        }
      })
    }

    const decodedUser = await jwtr.verify(token, process.env.JWT_SECRET)
    const currentUser = await User.findById(decodedUser.id)

    if (!currentUser) {
      return res.status(401).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Not authenticated.',
            msg: 'The user belonging to the token does no longer exist.',
            type: 'AuthenticationError'
          }
        }
      })
    }

    req.auth = decodedUser
    next()

  } catch (error) {
    console.log(error)
    return res.status(401).json({
      status: 0,
      data: {
        err: {
          generatedTime: new Date(),
          errMsg: error.name,
          msg: 'You are logged out.',
          type: 'AuthenticationError'
        }
      }

    })
  }

}

exports.isAdmin = authorizeTo(1)
exports.isUser = authorizeTo(0)

function authorizeTo(role) {
  return async (req, res, next) => {

    const currentUser = await User.findById(req.auth.id)
    if (currentUser && role !== currentUser.role) {
      return res.status(403).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Not authorized.',
            msg: 'You do not have permission to perform this action.',
            type: 'UnauthorizedError'
          }
        }
      })
    }
    next()
  }
}