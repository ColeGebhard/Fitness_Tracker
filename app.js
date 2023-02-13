require("dotenv").config()

var bodyParser = require('body-parser')
const express = require("express")
const app = express()

const router = require('./api');
const morgan = require('morgan');
const cors = require('cors');


// Setup your Middleware and API Router here

app.use(bodyParser.json());

app.use('/api', router);

app.use(morgan('dev'));

app.use(cors())

module.exports = app;
