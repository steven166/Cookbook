var express = require('express');
var router = express.Router();
var recipeRepo = require('../repository/recipe.repo');

/* GET users listing. */
router.get('/api/v1/recipes', function(req, res, next) {
  res.set('content-type', 'application/json');
  recipeRepo.loadRecipes(req.body).then(function(recipes){
    res.json(recipes);
  }, function(err){
    console.error(err);
    res.statusCode = 500;
    res.json({
      message: error.message,
      error: 'Internal Server Error',
      status: 500
    });
  });
});

module.exports = router;
