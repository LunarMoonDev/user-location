const express = require('express');
const userController = require('../../controllers/user.controller');
const validate = require('../../middlewares/validate');
const { auth } = require('../../middlewares/auth');
const userValidation = require('../../validations/user.validation');

const router = express.Router();

router.route('/').post(auth('manageUsers'), validate(userValidation.createUser), userController.createUser);

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
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
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
 */
