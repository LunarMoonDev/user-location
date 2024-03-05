const express = require('express');
const locationController = require('../../controllers/location.controller');
const validate = require('../../middlewares/validate');
const { auth } = require('../../middlewares/auth');
const locationValidation = require('../../validations/location.validation');

const router = express.Router();

router.route('/').post(auth('manageLoc'), validate(locationValidation.createLocation), locationController.createLocation);
router.route('/').get(auth('getLocs'), validate(locationValidation.getLocations), locationController.getLocations); // TODO: need docs

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
 *
 *   get:
 *     summary: Retrieve locations
 *     description: API is paginated and any user can retrieve
 *     tags: [Location]
 *     security:
 *       - oAuthSample:
 *          - profile
 *          - email
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: city of the location
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: state of the location
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
 *                     $ref: '#/components/schemas/Location'
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
 */
