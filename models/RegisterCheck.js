const express = require('express');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
var bodyParser = require('body-parser')
const router = express.Router()
var models = require('.')
const User = require('./User');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json())

