const express = require('express');
const locationController = require('../../controllers/location.controller');
const validate = require('../../middlewares/validate');
const { auth } = require('../../middlewares/auth');
const locationValidation = require('../../validations/location.validation');

const router = express.Router();

router.route('/').post(auth('manageLoc'), validate(locationValidation.createLocation), locationController.createLocation);

module.exports = router;

/**
 * @swagger
 * tags:
 *  name: Location
 *  description: locations of any country stored in the database
 */

/**
 * @swagger
 * /locs:
 *   post:
 *     summary: Create a location
 *     description: Only admins can create locations
 *     tags: [Location]
 *     security:
 *       - oAuthSample:
 *          - profile
 *          - email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - city
 *               - pop
 *               - state
 *               - loc
 *             properties:
 *               city:
 *                 type: string
 *               pop:
 *                 type: string
 *                 description: something i do not know atm
 *               state:
 *                 type: string
 *               loc:
 *                 type: [number]
 *                 description: array of angles, must be size of 2
 *             example:
 *               city: quezon
 *               pop: 1103
 *               state: manila
 *               loc: [34, -60]
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Location'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
