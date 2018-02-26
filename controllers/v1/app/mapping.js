var express = require('express')
  , router = express.Router()
router.use('/login', require('./modules/login.js'))
router.use('/project', require('./modules/project.js'))
router.use('/employee', require('./modules/employee.js'))
router.use('/report', require('./modules/report.js'))
router.use('/validations', require('./modules/validations.js'))
router.use('/social_media', require('./modules/socialMedia.js'))
router.use('/send_mail', require('./modules/sendMail.js'))
// router.use('/google_analytics', require('./modules/googleAnalytics.js'))
router.use('/linkedin', require('./modules/linkedin.js'))
router.use('/benchmarks', require('./modules/benchmark.js'))
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