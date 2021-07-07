const { body } = require('express-validator')

const { getAllUsers, getAllUsersNew, getLoggedInUser, changePassword, updateProfile, deactivateAccount, deleteAccount } = require('../controllers/userController.js')
const { isAuth, isUser, isAdmin } = require('../middlewares/authMiddleware')

const router = require('express').Router()

// Protected Routes starts here
router.use(isAuth)

/**
 * @swagger
 * /api/v1/users/:
 *   get:
 *     description: Get all users
 *     responses:
 *       200:
 *         description: Array of users.      
 */
router.get('/', isAdmin, getAllUsers)

/**
 * @swagger
 * /api/v1/users/myProfile:
 *   get:
 *     description: Get data of logged in user
 *     responses:
 *       200:
 *         description: Data of logged in user.   
 *     security:
 *     - bearerAuth: []    
 */
router.get('/myProfile', getLoggedInUser)

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
 *         description: Your current password is incorrect.
 *       404:
 *         description: User not found.
 *       200:
 *         description: Password changed successfully.
 *     security:
 *     - bearerAuth: []      
 */
router.post('/changePassword', body('passwordOld').not().isEmpty().trim(),
    body('passwordUpdated').not().isEmpty().trim(),
    changePassword
)

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
 *       404:
 *         description: User not found.
 *       409:
 *         description: Duplicate data found.
 *       200:
 *         description: User details updated successfully
 *     security:
 *     - bearerAuth: []      
 */
router.put('/updateProfile',
    body('firstName').not().isEmpty().trim().escape(),
    body('lastName').not().isEmpty().trim().escape(),
    body('country').not().isEmpty().escape(),
    body('gender').not().isEmpty(),
    updateProfile
)


/**
 * @swagger
 * /api/v1/users/deactivateAccount:
 *   post:
 *     description: Deactivate user account
 *     responses:
 *       204:
 *         description: Account Deleted.
 *       404:
 *         description: User not found.
 *     security:
 *     - bearerAuth: []      
 */
router.post('/deactivateAccount', deactivateAccount)

/**
 * @swagger
 * /api/v1/users/deleteAccount:
 *   delete:
 *     description: Delete user account
 *     responses:
 *       204:
 *         description: Account Deleted.
 *       404:
 *         description: User not found.
 *     security:
 *     - bearerAuth: []      
 */
router.delete('/deleteAccount', deleteAccount)

module.exports = router