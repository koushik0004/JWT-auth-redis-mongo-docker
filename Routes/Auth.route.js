const express = require('express');
const createError = require('http-errors');
const User = require('../Models/User.model');
const {authSchema} = require('../helpers/ValidationSchema');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwt_helpers');
const router = express.Router();
const client = require('../config/RedisConnect');

router.post('/register', async (req, res, next) => {
    try {
        // if(!email || !password) {
        //     throw createError.BadRequest('Some required data is missing or bad request');
        // }
        const resultBody = await authSchema.validateAsync(req.body);

        const dataExists = await User.findOne({email: resultBody.email});
        if(dataExists) throw createError.Conflict(`${resultBody.email} user already exists`);

        const user = new User(resultBody);
        const saveUser = await user.save();
        const accessToken = await signAccessToken(saveUser.id);
        const refreshToken = await signRefreshToken(saveUser.id);
        res.status(200).json({accessToken, refreshToken});
    } catch (error){
        if(error.isJoi === true){
            error.status = 422;
        }
        next(error);
    }
});
router.post('/login', async (req, res, next) => {
    try {
        const resultBody = await authSchema.validateAsync(req.body);
        const user = await User.findOne({email: resultBody.email});
        if(!user) {
            throw createError.NotFound('username/passowrd not found');
        }
        const isPasswordMatched = await user.isValidPassword(resultBody.password);
        if(!isPasswordMatched) {
            throw createError.Unauthorized('username/passowrd not valid');
        }
        const accessToken = await signAccessToken(user.id);
        const refreshToken = await signRefreshToken(user.id);
        res.status(200).json({accessToken, refreshToken});
    } catch (error) {
        if(error.isJoi === true) {
            return next(createError.BadRequest('Invalid Username/Password'));
        }
        next(error);
    }
});
router.post('/refresh-token', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if(!refreshToken) throw createError.BadRequest();
        const userId = await verifyRefreshToken(refreshToken);

        const accessToken = await signAccessToken(userId);
        const refToken = await signRefreshToken(userId);
        res.status(200).json({accessToken, refreshToken: refToken});
    } catch (error) {
        next(error);
    }
});
router.delete('/logout', (req, res, next) => {
    res.send('logout route');
});


module.exports = router;