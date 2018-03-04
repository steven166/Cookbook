var fs = require("fs");
var path = require('path');
var guid = require('guid');

var dataDir = path.join(process.cwd(), 'data');
var recipesDir = path.join(dataDir, 'recipes');
var imagesDir = path.join(dataDir, 'images');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}
if (!fs.existsSync(recipesDir)) {
  fs.mkdirSync(recipesDir);
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

function saveRecipe(recipe, imageFile) {
  return new Promise(function (resolve, reject) {
    if (imageFile) {
      var extention = imageFile.mimetype.split('/')[1];
      saveImage(imageFile.path, extention).then(function (fileName) {
        recipe.image = '/api/v1/images/' + fileName;
        saveRecipeData(recipe).then(resolve, reject);
      }, reject);
    } else {
      saveRecipeData(recipe).then(resolve, reject);
    }
  });
}

function saveImage(imagePath, ext) {
  return new Promise(function (resolve, reject) {
    findFileName(imagesDir, ext, function (fileName, filePath) {
      fs.rename(path.join(process.cwd(), imagePath), filePath, function(err){
        if (err) {
          reject(err);
        } else {
          resolve(fileName);
        }
      });
    });
  });
}

function findFileName(dir, ext, callback) {
  if(!callback){
    callback = ext;
    ext = undefined;
  }
  var fileName = guid.create().toString() + (ext ? '.' + ext : '');
  var filePath = path.join(dir, fileName);
  fs.exists(filePath, function (exists) {
    if (exists) {
      findFileName(callback);
    } else {
      callback(fileName, filePath);
    }
  });
}

function saveRecipeData(recipe) {
  return new Promise(function (resolve, reject) {
    if(!recipe.description || recipe.description.trim() === 'undefined'){
      recipe.description = '';
    }
    if(typeof(recipe.instructions) === 'string'){
      recipe.instructions = recipe.instructions.split(',').filter(function(instruction){
        return instruction && instruction.trim() !== '';
      });
    }
    if(typeof(recipe.ingredients) === 'string'){
      recipe.ingredients = recipe.ingredients.split(',').filter(function(ingredient){
        return ingredient && ingredient.trim() !== '';
      });
    }

    if (!recipe.id) {
      findFileName(recipesDir, 'json', function (fileName, filePath) {
        recipe.id = fileName.split('.')[0];
        var json = JSON.stringify(recipe);
        fs.writeFile(filePath, json, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(recipe.id);
          }
        });
      });
    } else {
      var filePath = path.join(recipesDir, recipe.id);
      var json = JSON.stringify(recipe);
      fs.writeFile(filePath, json, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(recipe.id);
        }
      });
    }
  });
}

function loadImage(id) {
  return new Promise(function (resolve, reject) {
    var filePath = path.join(imagesDir, id);
    fs.readFile(filePath, function (err, data) {
      if (err) {
        reject(err);
      } else {
        var dataUrl = data.toString();
        var mime = dataUrl.match(/^data:(.+);base64,/)[0];
        if (mime) {
          reject('No mime type found');
          return;
        }
        
      }
    });
  });
}

function loadRecipe(id) {
  return new Promise(function (resolve, reject) {
    var filePath = path.join(recipesDir, id);
    fs.readFile(filePath, function (err, data) {
      if (err) {
        reject(err);
      } else {
        var json = data.toString();
        var recipe = JSON.parse(json);
        resolve(recipe);
      }
    });
  });
}

function loadRecipes() {
  return new Promise(function (resolve, reject) {
    loadRecipeIds().then(function (ids) {
      var promisen = ids.map(function (id) {
        return loadRecipe(id);
      });
      Promise.all(promisen).then(function (result) {
        resolve(result);
      }, reject);
    }, reject);
  });
}

function loadRecipeIds() {
  return new Promise(function (resolve, reject) {
    fs.readdir(recipesDir, function (err, files) {
      if (err) {
        reject(err);
      }
      resolve(files);
    });
  });
}

module.exports = {
  saveRecipe: saveRecipe,
  loadRecipe: loadRecipe,
  loadRecipes: loadRecipes,
  loadImage: loadImage
};