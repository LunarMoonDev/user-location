const express = require('express');
const passport = require('passport');
const authController = require('../../controllers/auth.controller');
const { refresh } = require('../../middlewares/auth');
const { oauth } = require('../../config/config');

const router = express.Router('passport');

router.get('/google', passport.authenticate('google', { accessType: 'offline', prompt: 'consent' }));
router.get('/google/callback', passport.authenticate('google', { ...oauth.redirectUrls }));
router.get('/failure', authController.failure);
router.get('/success', refresh, authController.success);
router.post('/logout', authController.logout);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Oauth 2.0 authentication, authorization code flow
 */

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Authorization URL of the flow
 *     tags: [Auth]
 *     security:
 *       - oAuthSample:
 *          - profile
 *          - email
 *     responses:
 *       "401":
 *          $ref: '#/components/responses/Unauthorized'
 *       "403":
 *          #ref: '#components/responses/forbidden'
 */

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Redirection from google our app
 *     tags: [Auth]
 *     security:
 *       - oAuthSample:
 *          - profile
 *          - email
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: authentication code
 *       - in: query
 *         name: scope
 *         required: true
 *         schema:
 *           type: string
 *         description: scope of oauth 2.0
 *       - in: query
 *         name: authUser
 *         required: true
 *         schema:
 *           type: number
 *         description: TBD
 *       - in: query
 *         name: promt
 *         required: true
 *         schema:
 *           type: string
 *         description: this is for refresh token
 *     responses:
 *       "401":
 *          $ref: '#/components/responses/Unauthorized'
 *       "403":
 *          #ref: '#components/responses/forbidden'
 */

/**
 * @swagger
 * /auth/success:
 *   get:
 *     summary: checks if the api is authenticated
 *     tags: [Auth]
 *     security:
 *       - oAuthSample:
 *          - profile
 *          - email
 *     responses:
 *       "201":
 *         description: authenticated
 *         content:
 *           text/plain:
 *              schema:
 *                type: string
 *                example: Authentication success
 */

/**
 * @swagger
 * /auth/failure:
 *   get:
 *     summary: sends message for failed authentication
 *     tags: [Auth]
 *     security:
 *       - oAuthSample:
 *          - profile
 *          - email
 *     responses:
 *       "401":
 *          $ref: '#/components/responses/Unauthorized'
 *       "403":
 *          #ref: '#components/responses/forbidden'
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: logs out the user from authentication
 *     tags: [Auth]
 *     security:
 *       - oAuthSample:
 *          - profile
 *          - email
 *     responses:
 *       "201":
 *         description: logged out
 *         content:
 *           text/plain:
 *              schema:
 *                type: string
 *                example: Successfully logged out
 */
