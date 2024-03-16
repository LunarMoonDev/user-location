const express = require('express');
const locationController = require('../../controllers/location.controller');
const validate = require('../../middlewares/validate');
const { auth } = require('../../middlewares/auth');
const locationValidation = require('../../validations/location.validation');
const commonValidation = require('../../validations/common.validation');

const router = express.Router();

router.route('/').post(auth('manageLocs'), validate(locationValidation.createLocation), locationController.createLocation);
router.route('/').get(auth('getLocs'), validate(locationValidation.getLocations), locationController.getLocations);
router.route('/').delete(auth('manageLocs'), validate(commonValidation.deleteFilter), locationController.deleteLocations);
router
  .route('/')
  .patch(
    auth('manageLocs'),
    validate(commonValidation.queryFilter),
    validate(locationValidation.updateLocation),
    locationController.updateLocation
  );

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
 *                 minlength: 1
 *                 maxlength: 25
 *               pop:
 *                 type: string
 *                 description: something i do not know atm
 *                 minimum: 1000
 *                 maximum: 9999
 *               state:
 *                 type: string
 *                 minlength: 1
 *                 maxlength: 25
 *               loc:
 *                 type: [number]
 *                 description: array of angles, must be size of 2; each element should be -180 < @ < 180
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
 *   patch:
 *     summary: Update a location
 *     description: Only admins can update a location
 *     tags: [Location]
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
 *               - city
 *               - pop
 *               - state
 *               - loc
 *             properties:
 *               city:
 *                 type: string
 *                 minlength: 1
 *                 maxlength: 25
 *               pop:
 *                 type: string
 *                 description: something i do not know atm
 *                 minimum: 1000
 *                 maximum: 9999
 *               state:
 *                 type: string
 *                 minlength: 1
 *                 maxlength: 25
 *               loc:
 *                 type: [number]
 *                 description: array of angles, must be size of 2; each element should be -180 < @ < 180
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
 *   delete:
 *     summary: Retrieve locations
 *     description: API is paginated and any user can retrieve
 *     tags: [Location]
 *     security:
 *       - oAuthSample:
 *          - profile
 *          - email
 *     parameters:
 *       - in: query
 *         name: ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             minlength: 1
 *             maxlength: 25
 *             format: byte
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 delCount:
 *                   type: integer
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
 *           minlength: 1
 *           maxlength: 25
 *         description: city of the location
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *           minlength: 1
 *           maxlength: 25
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
