var express = require('express')
  , router = express.Router()
router.use('/login', require('./modules/login.js'))

router.get('/', function(req, res) {
  res.send('Home page')
})

router.get('/about', function(req, res) {
  res.send('Learn about us')
})
router.get('/signup', function(req, res) {
  res.send('sign up page')
})

module.exports = router