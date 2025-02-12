var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('TrackMap', { title: 'track map' });
});

module.exports = router;