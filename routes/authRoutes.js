const { body, check } = require('express-validator')

const { signUp, loginUsingEmail, loginUsingMob, forgotPwd, resetPwd, logout } = require('../controllers/authController.js')
const { isAuth, isUser, isAdmin, isSignedIn } = require('../middlewares/authMiddleware')

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
router.post('/signup',
    check('email', "Invalid email address.").isEmail().normalizeEmail(),
    body('firstName', 'First name is required.').not().isEmpty().trim().escape(),
    check('firstName', 'First name length should not be > 50.').isLength({ max: 50 }),
    body('lastName', 'Last name is required.').not().isEmpty().trim().escape(),
    check('lastName', 'Last name length should not be > 50.').isLength({ max: 50 }),
    body('gender', 'Gender is required.').not().isEmpty(),
    body('phone', 'Phone number is required.').not().isEmpty(),
    body('country', 'Gender is required.').not().isEmpty().escape(),
    check('password', "Empty password.").not().isEmpty().trim().bail(),
    check('password', "Password length should not be < 6").isLength({ min: 6 }),
    signUp
)

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
 *       400:
 *         description: Please enter your credentials.
 *       401:
 *         description: Incorrect credentials.   
 *       404:
 *         description: Account does not exist.  
 */
router.post('/loginUsingEmail',
    body('email').isEmail().normalizeEmail(),
    body('password').not().isEmpty().trim(),
    loginUsingEmail
)

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
 *       400:
 *         description: Please enter your credentials.
 *       401:
 *         description: Incorrect credentials.   
 *       404:
 *         description: Account does not exist.  
 */
router.post('/loginUsingMob',
    body('phone').not().isEmpty().trim(),
    body('password').not().isEmpty().trim(),
    loginUsingMob
)

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
router.post('/forgotPassword',
    check('email', "Invalid email coming from route validation").isEmail().normalizeEmail(),
    forgotPwd
)

router.patch('/resetPassword',
    [
        check('password', "Empty password").not().isEmpty().trim().bail(),
        check('password', "Password length < 6").isLength({ min: 6 })
    ],
    resetPwd
)

// Protected Routes starts here
router.use(isSignedIn, isAuth)

/**
 * @swagger
 * /api/v1/auth/logout:
 *   get:
 *     description: Logout user
 *     responses:
 *       200:
 *         description: You have logged out successfully.
 *       404:
 *         description: User not found.
 *     security:
 *     - bearerAuth: []      
 */
router.get('/logout', logout)

module.exports = router