var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var favicon = require('serve-favicon');

const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
var indexRouter = require(path.join(__dirname, 'app_server', 'routes', 'index'));
var usersRouter = require(path.join(__dirname, 'app_server', 'routes', 'users'));
var studentsRouter = require(path.join(__dirname, 'app_server', 'routes', 'students'));
var studentsAjvRouter = require(path.join(__dirname, 'app_server', 'routes', 'students_ajv'));
var studentsDocRouter = require(path.join(__dirname, 'app_server', 'routes', 'students_documented'));

var app = express();
// Opciones de configuración de Swagger
const swaggerOptions = {
  definition: {
  openapi: '3.0.0', // Versión de OpenAPI
  info: {
  title: 'API de Estudiantes',
  version: '1.0.0',
  description: 'Una API sencilla para gestionar estudiantes',
  },
  },
  // Ruta a los archivos donde se documentará la API
  apis: ['./app_server/routes/*.js'],
  };
  const swaggerSpec = swaggerJSDoc(swaggerOptions);
  // Sirve la documentación generada en /docs
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
// view engine setup
app.set('views', path.join(__dirname, 'app_server','views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/students', studentsRouter);
app.use('/api/students_ajv', studentsAjvRouter);
app.use('/api/students_doc', studentsDocRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
