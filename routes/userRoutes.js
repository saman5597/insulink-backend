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

/**
 * @swagger
 * /api/v1/users/signup:
 *   post:
 *     description: Signup user
 *     produces:
 *     - "application/json"  
 *     parameters:
 *     - in: "body"
 *       name: "body"
 *       description: "User details"
 *       required: true
 *       schema:    
 *        $ref: "#/definitions/Signupdata"
 *     responses:
 *       201:
 *         description: User signed up successfully.
 *       400:
 *         description: Invalid data.
 *       409:
 *         description: Duplicate data found.     
 */
router.route('/signup').post(authController.signUp)

/**
 * @swagger
 * /api/v1/users/loginUsingEmail:
 *   post:
 *     description: Login user
 *     produces:
 *     - "application/json"
 *     parameters:
 *     - in: "body"
 *       name: "body"
 *       description: "User login details"
 *       required: true
 *       schema:    
 *        $ref: "#/definitions/Loginusingemail"
 *     responses:
 *       200:
 *         description: User logged in successfully.
 *       401:
 *         description: Incorrect credentials.   
 *       404:
 *         description: Account does not exist.  
 */
router.route('/loginUsingEmail').post(authController.loginUsingEmail)

/**
 * @swagger
 * /api/v1/users/loginUsingMob:
 *   post:
 *     description: Login user using mobile number
 *     produces:
 *     - "application/json"
 *     parameters:
 *     - in: "body"
 *       name: "body"
 *       description: "User login details"
 *       required: true
 *       schema:    
 *        $ref: "#/definitions/Loginusingmob"
 *     responses:
 *       200:
 *         description: User logged in successfully.
 *       401:
 *         description: Incorrect credentials.   
 *       404:
 *         description: Account does not exist.  
 */
router.route('/loginUsingMob').post(authController.loginUsingMob)

/**
 * @swagger
 * /api/v1/users/forgotPassword:
 *   post:
 *     description: Forgot password 
 *     produces:
 *     - "application/json"
 *     parameters:
 *     - in: "body"
 *       name: "body"
 *       description: "User email address"
 *       required: true
 *       schema:    
 *        $ref: "#/definitions/Forgotpassword"
 *     responses:
 *       404:
 *         description: No user found with this email address.
 *       400:
 *         description: Please enter email address. 
 *       200:
 *         description: Reset URL in response   
 */
router.route('/forgotPassword').post(authController.forgotPwd)

router.route('/resetPassword').patch(authController.resetPwd)

// Protected Routes starts here
router.use(expressJWT({ secret: process.env.JWT_SECRET, requestProperty: 'auth', algorithms: ['sha1', 'RS256', 'HS256'] }), authMiddleware.checkAuth)

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

/**
 * @swagger
 * /api/v1/users/logout:
 *   get:
 *     description: Logout user
 *     responses:
 *       200:
 *         description: You have logged out successfully.
 *       401:
 *         description: User not found.
 *     security:
 *     - bearerAuth: []      
 */
router.route('/logout').get(authController.logout)

module.exports = router