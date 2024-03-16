const express = require('express');
const userController = require('../../controllers/user.controller');
const validate = require('../../middlewares/validate');
const { auth } = require('../../middlewares/auth');
const userValidation = require('../../validations/user.validation');
const commonValidation = require('../../validations/common.validation');

const router = express.Router();

router.route('/').post(auth('manageUsers'), validate(userValidation.createUser), userController.createUser);
router.route('/').get(auth('getUsers'), validate(userValidation.getUsers), userController.getUsers);
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
 *   get:
 *     summary: Retrieve Users
 *     description: API is paginated and any user can retrieve
 *     tags: [User]
 *     security:
 *       - oAuthSample:
 *          - profile
 *          - email
 *     parameters:
 *       - in: query
 *         name: firstName
 *         schema:
 *           type: string
 *           minlength: 1
 *           maxlength: 25
 *         description: first name of the user
 *       - in: query
 *         name: lastName
 *         schema:
 *           type: string
 *           minlength: 1
 *           maxlength: 25
 *         description: last name of the user
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           minlength: 1
 *           maxlength: 25
 *         description: email of the user
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: maximum number of locations
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
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
