const express = require('express');
const userController = require('../../controllers/user.controller');
const validate = require('../../middlewares/validate');
const { auth } = require('../../middlewares/auth');
const userValidation = require('../../validations/user.validation');
const commonValidation = require('../../validations/common.validation');

const router = express.Router();

router.route('/').post(auth('manageUsers'), validate(userValidation.createUser), userController.createUser);
router
  .route('/')
  .patch(
    auth('manageUsers'),
    validate(commonValidation.queryFilter),
    validate(userValidation.updateUser),
    userController.updateUser
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *  name: User
 *  description: Users registered in the application
 */

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Create a user
 *     description: only admins can create users
 *     tags: [User]
 *     security:
 *       - oAuthSample:
 *         - profile
 *         - email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - lastname
 *               - email
 *               - location
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 25
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 25
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 40
 *               location:
 *                 description: city of the location
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *             example:
 *               firstName: harjit
 *               lastName: brar
 *               email: harjitbrar07@gmail.com
 *               location:
 *                 city: "quezon"
 *                 state: "manila"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   patch:
 *     summary: Update a User
 *     description: Only admins can update a user
 *     tags: [User]
 *     security:
 *       - oAuthSample:
 *          - profile
 *          - email
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *           format: byte
 *           minlength: 1
 *           maxlength: 24
 *         description: id of the document
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - lastname
 *               - email
 *               - location
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 25
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 25
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 minLength: 1
 *                 maxLength: 25
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 40
 *               location:
 *                 description: city of the location
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *             example:
 *               firstName: harjit
 *               lastName: brar
 *               role: admin
 *               email: harjitbrar07@gmail.com
 *               location:
 *                 city: "quezon"
 *                 state: "manila"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
