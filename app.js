//require packages
var express             = require("express"),               //npm install express --save
    app                 = express(),                        //npm install ejs --save
    bodyParser          = require("body-parser"),           //npm install body-parser --save
    mongoose            = require("mongoose");              //npm install mongoose --save
    flash               = require("connect-flash");         //npm install connect-flash --save
    passport            = require("passport"),              //npm install passport --save
    LocalStrategy       = require("passport-local")         //npm install passport-local --save
    methodOverride      = require("method-override")        //npm install method-override --save
    Recipe              = require("./models/recipe"),
    Comment             = require("./models/comment"),
    User                = require("./models/user");
    app.locals.moment   = require("moment");
    
//require routes files from the routes directory
var commentRoutes       = require("./routes/comment"),
    recipeRoutes        = require("./routes/recipe"),
    authRoutes          = require("./routes/auth");

//more connections
//mongoose.connect("mongodb://localhost/recipe_website", { useNewUrlParser: true });
//mongoose.connect('mongodb://origvampire:ThisIsTh31@ds247178.mlab.com:47178/heroku_qpsvdnq4', 
    //{ 
     //   useNewUrlParser: true
    //});

mongoose.connect("mongodb+srv://origvampire:5SOSkeepcalm@cluster0-vcyz0.mongodb.net/recipe_website?retryWrites=true&w=majority", 
{ 
    useNewUrlParser: true,
    useUnifiedTopology: true 
});

app.use(bodyParser.urlencoded({extended: true})); //used all the time
app.set("view engine", "ejs"); //used so that you don't always have to type .ejs under render
app.use(express.static(__dirname+ "/public")); //directory where the script is running
app.use(methodOverride("_method")); //recommended method override
app.use(flash());
// seedDB();

//PASSPORT Configuration
app.use(require("express-session")({
    secret: "This is going well",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware to run for every route and keep track of the current user (logged in or out)
app.use(function(req, res, next){
    res.locals.currentUser = req.user; //empty if no one is signed in or contain username and id of current user
    res.locals.error = req.flash("error"); //if there's any error, it will be flashed
    res.locals.success = req.flash("success"); //if there was a success, it will be flashed
    next();
});

app.use("/recipes/:id/comments", commentRoutes);
app.use("/recipes", recipeRoutes);
app.use("/", authRoutes);

// Listen for ports
//app.listen(3000, function(){
//    console.log("Recipe server has started!")
//});

const PORT = process.env.PORT||'8080';
app.listen(PORT, function(){
    console.log("Server has started");
});

