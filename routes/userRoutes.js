const expressJWT = require('express-jwt')

const userController = require('../controllers/userController.js')
const authController = require('../controllers/authController.js')
const authMiddleware = require('../middlewares/authMiddleware')

const router = require('express').Router()

/**
 * @swagger
 * /api/v1/users/:
 *   get:
 *     description: Get all users
 *     responses:
 *       200:
 *         description: Array of users.      
 */
router.route('/').get(userController.getAllUsers)

// Protected Routes starts here
router.use(expressJWT({ secret: process.env.JWT_SECRET, requestProperty: 'auth', algorithms: ['sha1', 'RS256', 'HS256'] }), authMiddleware.checkAuth)

 /**
  * @swagger
  * /api/v1/users/changePassword:
  *   post:
  *     description: Change user password
  *     produces:
  *     - "application/json"
  *     parameters:
  *     - in: "body"
  *       name: "body"  
  *       description: "User old and new password"  
  *       required: true 
  *       schema:
  *         $ref: "#/definitions/Changepassword"
  *     responses:
  *       400:
  *         description: Invalid data.
  *       401:
  *         description: Your current password is incorrect/User not found.
  *       200:
  *         description: Password changed successfully.
  *     security:
  *     - bearerAuth: []      
  */
router.route('/changePassword').post(userController.changePassword)

 /**
  * @swagger
  * /api/v1/users/updateProfile:
  *   put:
  *     description: Update user profile
  *     produces:
  *     - "application/json"
  *     parameters:
  *     - in: "body"
  *       name: "body"  
  *       description: "User profile details"  
  *       required: true 
  *       schema:
  *         $ref: "#/definitions/Updateprofile"
  *     responses:
  *       400:
  *         description: Invalid data.
  *       401:
  *         description: User not found.
  *       200:
  *         description: User details updated successfully
  *     security:
  *     - bearerAuth: []      
  */
router.route('/updateProfile').put(userController.updateProfile)


/**
 * @swagger
 * /api/v1/users/deactivateAccount:
 *   post:
 *     description: Deactivate user account
 *     responses:
 *       204:
 *         description: Account Deleted.
 *       401:
 *         description: User not found.
 *     security:
 *     - bearerAuth: []      
 */
router.route('/deactivateAccount').post(userController.deactivateAccount)

/**
 * @swagger
 * /api/v1/users/deleteAccount:
 *   delete:
 *     description: Delete user account
 *     responses:
 *       204:
 *         description: Account Deleted.
 *       401:
 *         description: User not found.
 *     security:
 *     - bearerAuth: []      
 */
router.route('/deleteAccount').delete(userController.deleteAccount)

module.exports = router