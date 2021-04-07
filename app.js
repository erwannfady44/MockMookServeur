const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const yaml = require('yamljs');
const userRouter = require('./routes/user');
const moduleRouter = require('./routes/module');
const pathRouter = require('./routes/path');
const tagRouter = require('./routes/tag');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = yaml.load('./swagger.yaml');
const asyncLib = require('async');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors({origin: '*'}));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.disable('etag');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//app.use(cors({origin: 'http://localhost:4200'}));

app.use('/api/user', userRouter);
app.use('/api/module', moduleRouter);
app.use('/api/path', pathRouter);
app.use('/api/tag', tagRouter);
app.use('/api-docs/', swaggerUi.serve);
app.get('/api-docs/', swaggerUi.setup(swaggerDocument));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
    next();
});


mongoose.connect('mongodb://localhost:27017/mockmooc', {useUnifiedTopology: true, useNewUrlParser: true});

module.exports = app;
