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
        return res.status(401).send({
          success: false,
          data: { err },
          message: 'Not authenticated.'
        })
      }
    }

    if (!req.auth) {
      return res.status(401).json({ status: false, data: {}, message: 'You are not logged in. Please login.' })
    }

    const currentUser = await User.findById(req.auth.id)

    if (!currentUser) {
      return res.status(401).json({ status: false, data: {}, message: 'The user belonging to the token does no longer exist.' })
    }

    next()

  } catch (err) {
    console.log(err)
  }

}

exports.isAdmin = authorizeTo(1)
exports.isUser = authorizeTo(0)

function authorizeTo(role) {
  return async (req, res, next) => {

    const currentUser = await User.findById(req.auth.id)
    if (currentUser) {
      if (role !== currentUser.role) {
        return res.status(403).json({ status: false, data: {}, message: 'You do not have permission to perform this action.' })
      }
      next()
    }
    else {
      return res.status(401).json({ status: false, data: {}, message: 'Not authenticated.' })
      next()
    }
  }
}