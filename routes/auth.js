const express = require('express');

const router = express.Router();

const sign_up_controller = require('../controllers/signup-controller')
const log_in_controller = require('../controllers/login-controller')

router.get('/', (req, res, next) => {
    res.json({message: "Auth route"})
})
router.post('/signup', sign_up_controller.sign_up_post)
router.post('/login', log_in_controller.log_in_post)

module.exports = router