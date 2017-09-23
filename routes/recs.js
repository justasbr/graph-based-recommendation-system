let express = require('express');
let router = express.Router();

let recommendations = require('../core/recommendations');

router.get('/:id?', function (req, res) {
  let recommendations = req.params.id ? personalizedRecs(req.params.id) : defaultRecs();

  res.json(recommendations)
});

function personalizedRecs(id) {
  return recommendations.getClosest(id);
}

function defaultRecs() {
  return {
    id: -1
  }
}

module.exports = router;
