const expressJWT = require('express-jwt')

const userController = require('../controllers/userController.js')
const authController = require('../controllers/authController.js')
const authMiddleware = require('../middlewares/authMiddleware')

const router = require('express').Router()

/**
 * @swagger
 * /api/v1/auth/signup:
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
 * /api/v1/auth/loginUsingEmail:
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
 * /api/v1/auth/loginUsingMob:
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
 * /api/v1/auth/forgotPassword:
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
 * /api/v1/auth/logout:
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