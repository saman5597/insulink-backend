const User = require('../models/userModel')

exports.checkAuth = async (err, req, res, next) => {

  try {

    if (err) {
      if (err.name === 'UnauthorizedError') {
        return res.status(401).send({
          success: false,
          message: 'Not authenticated.'
        })
      }
    }

    if (!req.auth) {
      return res.status(401).json({ status: false, message: 'You are not logged in. Please login.' })
    }

    const currentUser = await User.findById(req.auth.id)

    if (!currentUser) {
      return res.status(401).json({ status: false, message: 'The user belonging to the token does no longer exist.' })
    }

    req.currentUser = currentUser

    next()

  } catch (err) {
    console.log(err.message)
  }

}