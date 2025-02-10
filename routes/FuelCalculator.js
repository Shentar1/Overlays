var express = require('express');
var router = express.Router();
/* GET Fuel Calculator page. */
router.get('/', function(req, res, next) {
  res.render('FuelCalculator', { title: 'FuelCalculator' });
});

module.exports = router;