const expressJWT = require('express-jwt')

const User = require('../models/userModel')

exports.isSignedIn = expressJWT({
  secret: process.env.JWT_SECRET,
  requestProperty: 'auth',
  algorithms: ['sha1', 'RS256', 'HS256']
})

exports.isAuth = async (err, req, res, next) => {

  try {

    if (err) {
      if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
          status: 0,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: 'Not authenticated.',
              msg: err.message,
              errType: 'UnauthorizedError'
            }
          }

        })
      }
    }

    if (!req.auth) {
      return res.status(401).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'You are not logged in. Please login.',
            msg: 'Not authenticated.',
            errType: 'UnauthorizedError'
          }
        }
      })
    }

    const currentUser = await User.findById(req.auth.id)

    if (!currentUser) {
      return res.status(401).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'The user belonging to the token does no longer exist.',
            msg: 'Not authenticated.',
            errType: 'UnauthorizedError'
          }
        }
      })
    }

    next()

  } catch (error) {
    console.log(error)
  }

}

exports.isAdmin = authorizeTo(1)
exports.isUser = authorizeTo(0)

function authorizeTo(role) {
  return async (req, res, next) => {

    const currentUser = await User.findById(req.auth.id)
    if (role !== currentUser.role) {
      return res.status(403).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'You do not have permission to perform this action.',
            msg: 'Not authorized.',
            errType: 'UnauthorizedError'
          }
        }
      })
    }
    next()
  }
}