const JWT = require('jsonwebtoken');
const createError = require('http-errors');
const client = require('../config/RedisConnect');

module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {};
            const secret = process.env.SECTER_ACCESS_TOKEN;
            const options = {
                expiresIn: '30s',
                issuer: 'localhost:3000',
                audience: userId
            };
            JWT.sign(payload, secret, options, (error, token) => {
                if(error) {
                    console.log(error.message);
                    reject(createError.InternalServerError());
                    return;
                }
                resolve(token);
            });
        })
    },
    signRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {};
            const secret = process.env.SECRET_REFRESH_TOKEN;
            const options = {
                expiresIn: '1y',
                issuer: 'localhost:3000',
                audience: userId
            };
            JWT.sign(payload, secret, options, (error, token) => {
                if(error) {
                    console.log(error.message);
                    reject(createError.InternalServerError());
                    return;
                }
                client.SET(userId, token, 'EX', 365*24*60*60, (error, _) => {
                    if(error) {
                        console.log(error.message);
                        return reject(createError.InternalServerError());
                    }
                    resolve(token);
                })
                
            });
        })
    },
    varifyAccessToken: (req, res, next) => {
        if(!req.headers['authorization']) {
            return next(createError.Unauthorized());
        }
        const authHeaders = req.headers['authorization'];
        const bearerToken = authHeaders.split(' ');
        const token = bearerToken[1];
        console.log(token);
        JWT.verify(token, process.env.SECTER_ACCESS_TOKEN, (err, payload) => {
            if(err) {
                const messageErr = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
                return next(createError.Unauthorized(messageErr));
            }
            req.payload = payload;
            next();
        });
    },
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            JWT.verify(
                refreshToken,
                process.env.SECRET_REFRESH_TOKEN,
                (err, payload) => {
                    if(err) {
                        return reject(createError.Unauthorized());
                    }
                    const userId = payload.aud;
                    client.GET(userId, (err, result) => {
                        if(err) {
                            console.log(err.message);
                            return reject(createError.InternalServerError());
                        }
                        if(refreshToken !== result) {
                            return reject(createError.Unauthorized());
                        }
                        resolve(userId);
                    })
                }
            )
        });
    }
}