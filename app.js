const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const createError = require('http-errors');

require('dotenv').config();
require('./config/DbConnection');
require('./config/RedisConnect');

const { varifyAccessToken } = require('./helpers/jwt_helpers');

const app=express();

const AuthRoutes = require('./Routes/Auth.route');
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', varifyAccessToken, async (req, res, next) => {
    res.send('get in the page');
});

app.use('/auth', AuthRoutes);

app.use((req, res, next) => {
    // const error = new Error('Not found');
    // error.status = 404;
    // next(error);
    next(createError.NotFound('path not exists'))
});

app.use((err, req, res, next) => {
    res.status = err.status || 500;
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })
})

const port = process.env.PORT || 3100;

app.listen(port, () => {
    console.log(`server runing on port: ${port} - 😍`);
});