var express = require('express')
  , router = express.Router()


router.use('/v1/app', require('./v1/app/mapping'))

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