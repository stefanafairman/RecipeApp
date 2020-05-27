require("dotenv").config();
//REQUIRE
var express = require("express");
var router = express.Router();
var Recipe = require("../models/recipe");
var Notification = require("../models/notification");
var middleware = require("../middleware"); //automatically requires index.js
var request = require("request");
//=======4/30========//
//configuring image upload
var multer = require("multer");
var storage = multer.diskStorage({
    filename: function(req, file, callback){
        callback(null, Date.now() + file.originalname); //creating a custom name for the file
    }
});
var imageFilter = function(req, file, cb){
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
        return cb(new Error("Only image files are allowed!"), false); //accept image files only
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });
// end configuring image upload

var cloudinary = require("cloudinary");
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//=============BEGIN ROUTES================//
//INDEX
router.get("/", function(req, res){
    var noMatch;
    if(req.query.search) {
        //
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        
        //get searched Recipes from database
        Recipe.find({name: regex}, function(err, allRecipes){
            if(err){
                console.log(err);
            }
            else {
                if(allRecipes.length < 1){
                    noMatch = "No recipes matched that query, please try again!";
                }
                res.render("recipes/index", {recipes: allRecipes, noMatch: noMatch});
            }
        }); 
    }
    else {
        //get all Recipes from database
        Recipe.find({}, function(err, allRecipes){
            if(err){
                console.log(err);
            }
            else {
                res.render("recipes/index", {recipes: allRecipes, noMatch: noMatch});
            }
        });    
    }
});

//show the form that will send the data to the Recipes post route
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("recipes/new");
});

//create Recipe
router.post("/", middleware.isLoggedIn, upload.single("image"), async function(req, res){
    //get data from form and add to Recipes array
    var name = req.body.name;
    var image = "";
    var desc = req.body.description;
    var category = req.body.category;
    var serving = req.body.serving;
    var ctime = req.body.ctime;
    var ptime = req.body.ptime;
    var ingredients = req.body.ingredients;
    var instructions = req.body.instructions;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newRecipe = {name: name, image: image, description: desc, category:category, serving: serving, ctime: ctime, ptime: ptime, ingredients: ingredients, instructions: instructions, author: author};
    
    //callback for the image upload
    await cloudinary.uploader.upload(req.file.path, function(result){
        newRecipe.image = result.secure_url;
        newRecipe.imageId = result.public_id;
    });

//========4/28======//
    try {
        let recipe = await Recipe.create(newRecipe);
        let user = await User.findById(req.user._id).populate("followers").exec();
        let newNotification = {
          username: req.user.username,
          recipeId: recipe.id
        }
        for(const follower of user.followers) {
          let notification = await Notification.create(newNotification);
          follower.notifications.push(notification);
          follower.save();
        }
  
        //redirect back to recipe page
        res.redirect(`/recipes/${recipe.id}`);
      } 
      catch(err) {
        req.flash('error', err.message);
        res.redirect('back');
      }
});

//SHOW
router.get("/:id", function(req, res){
    //find the Recipe with provided ID
    //populate it with the existing comments
    //execute the query
    Recipe.findById(req.params.id).populate("comments").exec(function(err, foundRecipe){
        if(err){
            console.log(err);
        }
        else{
            //render the show template with that Recipe
            res.render("recipes/show", {recipe: foundRecipe});
        }
    });
});

//EDIT
router.get("/:id/edit", middleware.checkRecipeOwnership, function(req, res){
    Recipe.findById(req.params.id, function(err, foundRecipe){
        res.render("recipes/edit", {recipe: foundRecipe});
    });
});

//UPDATE
router.put("/:id", upload.single("image"), middleware.checkRecipeOwnership, function(req, res){
    Recipe.findById(req.params.id, function(err, recipe){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            recipe.name = req.body.recipe.name;
            recipe.description = req.body.recipe.description;
            recipe.category = req.body.recipe.category;
            recipe.ingredients = req.body.ingredients;
            recipe.instructions = req.body.instructions;
            recipe.ctime = req.body.recipe.ctime;
            recipe.ptime = req.body.recipe.ptime;
            recipe.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/recipes/" + recipe._id);
        }
    });
});

//DESTROY
router.delete("/:id", middleware.checkRecipeOwnership, function(req, res){
    Recipe.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/recipes");
        }
        else{
            res.redirect("/recipes");
        }
    });
});

//match any characters globally
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;