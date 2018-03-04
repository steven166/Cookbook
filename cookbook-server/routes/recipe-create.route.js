var express = require('express');
var router = express.Router();
var recipeRepo = require('../repository/recipe.repo');
var fs  = require('fs');
var multer  = require('multer');
var upload = multer({ dest: 'tmp' });

router.post('/api/v1/recipes', upload.single('image'), function(req, res, next) {
  res.set('content-type', 'application/json');
  var body = req.body;
  if(body) {
    recipeRepo.saveRecipe(req.body, req.file).then(function(id){
      res.statusCode = 204;
      res.json({id: id});
    }, function(err){
      console.error(err);
      res.statusCode = 500;
      res.json({
        message: error.message,
        error: 'Internal Server Error',
        status: 500
      });
    });
  }else{
    res.statusCode = 400;
    res.json({
      message: 'Missing request body',
      error: 'Bad Request',
      status: 400
    });
  }
});

module.exports = router;
