var express = require("express");
var app = express();
var cors = require('cors');
app.use(cors());
var path = require('path');
var DButilsAzure = require('./DButils');
const jwt = require("jsonwebtoken");
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'public')));
var userRouter = require("./user");


var secret = "Everyonelovesberlin6";

var port = 3000;
app.listen(port, function () {
    console.log('app is listening on port ' + port);
});


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


/**
 * this function check the token for the user.
 */
app.use("/private", (req, res,next) => {
    const token = req.header("token");
    // no token
    if (!token) res.status(401).send("Access denied. No token provided.");
    // verify token
    try {
        const decoded = jwt.verify(token, secret);
        req.decoded = decoded;
        next(); //move on to the actual function
    } catch (exception) {
        res.status(400).send("Invalid token.");
    }
});
app.use("/private/user",userRouter);


/**
 * function that register a new user
 */
app.post('/Register', (req, res) => {
    async function Reg(){
        try{
            var username = req.body.UserName
            var password = req.body.Password
            var fName = req.body.FirstName
            var lName = req.body.LastName
            var city = req.body.City
            var country = req.body.Country
            var FOI = req.body.FieldOfInterest
            var question = req.body.Question
            var answer = req.body.Answer
            var checkUser = await DButilsAzure.execQuery("SELECT UserName FROM tbl_Users WHERE UserName='" + username + "'")
            
            if (checkUser.length > 0)
                res.send("User name already exist")
            else if (checkUser.length > 0 || question.length != answer.length || FOI.length < 2)
                res.send(err)
            else{
                await DButilsAzure.execQuery("INSERT INTO tbl_Users (UserName, Password, FirstName, LastName, City, Country) VALUES ('" + username + "', '" + password + "', '" + fName +"', '" + lName +"', '" + city +"', '" + country +"')")
    
                for (var i = 0; i < question.length; i++){
                    await DButilsAzure.execQuery("INSERT INTO tbl_User_RecoveryQA (UserName, Question, Answer) VALUES ('" + username + "', '" + question[i] + "', '" + answer[i] + "')")
                }
                for (var i = 0 ; i < FOI.length; i++)
                    await DButilsAzure.execQuery("INSERT INTO tbl_User_FOI (UserName, FieldOfInterest) VALUES ('" + username + "', '" + FOI[i] + "')")
            }
            res.send("success")
        }
        catch(err){
            res.send(err)
        }
    }
    Reg();
});


/**
 * this function checks the user id and password and assign a token to him
 */
app.post("/login", (req, res) => {
    async function login(){
        try{
            var username = req.body.UserName
            var password = req.body.Password
            var result = await DButilsAzure.execQuery("SELECT Password FROM tbl_Users WHERE UserName='" + username + "'")
            var strWithoutSpace = result[0].Password.replace(/\s*$/,'');
            if (strWithoutSpace == password){
                payload = { UserName: username };
	            options = { expiresIn: "2h" };
	            const token = jwt.sign(payload, secret, options);
	            res.send(token);
            }
            else{
                res.send("Wrong User Name Or Password")
            }
        }
        catch(err){
            res.send(err)
        }
    }
    login();
});


/**
 * this function restores a user password according to QA recovery verification
 */
app.post("/RestorePassword", (req, res) => {
    async function restore(){
        try{
            var username = await req.body.UserName
            var answer = req.body.Answers
            var checkUser = await DButilsAzure.execQuery("SELECT UserName FROM tbl_Users WHERE UserName='" + username + "'")
            
            if (checkUser.length == 0)
                res.send("User name does not exist")

            var result = await DButilsAzure.execQuery("SELECT Answer FROM tbl_User_RecoveryQA WHERE UserName='" + username + "'")
            var aWithoutSpace = "";
            var flag = true;
            for (i = 0; i < result.length && flag; i++){
                aWithoutSpace = result[i].Answer.replace(/\s*$/,'');
                if (aWithoutSpace != answer[i]){
                    flag = false;
                }
            }
            if (flag){
                var pass = await DButilsAzure.execQuery("SELECT Password FROM tbl_Users WHERE UserName='" + username + "'")
                res.send(pass[0].Password.replace(/\s*$/,''))
            }
            else{
                res.send("Wrong answers")
            }
        }
        catch(err){
            res.send(err)
        }
    }
    restore();
});


/**
 * function that returns a given POI details
 */
app.get('/getPOI_info/:POI', function(req, res){
    async function getPOIf(){
        try{
            var r = await req.params.POI
            result = await DButilsAzure.execQuery("SELECT * FROM tbl_POI WHERE POIName='" + r + "'")
            if (result.length == 0)
                res.send("No such POI")
            for (var i = 0; i < result.length; i++){
                result[i].POIName = result[i].POIName.replace(/\s*$/,'');
                result[i].CategoryName = result[i].CategoryName.replace(/\s*$/,'');
                result[i].Description = result[i].Description.replace(/\s*$/,'');
                result[i].Rank = result[i].Rank * 20 + "%";
            }
            var reviews = await DButilsAzure.execQuery("SELECT TOP 2 * FROM tbl_User_Review WHERE POIName='" + r + "' ORDER BY Date DESC")
            res.send(result.concat(reviews))
        }
        catch(err){
            res.send(err)
        }
    }
    getPOIf();
})


/**
 * function that returns all POI's belongs to a given category
 */
app.get('/getCatPOI/:category', function(req, res){
    var r = req.params.category
    var query = "SELECT * FROM tbl_POI WHERE CategoryName='" + r + "'"
    if (r == "All"){
        query = "SELECT * FROM tbl_POI"
    }
    DButilsAzure.execQuery(query)
    .then(function(result){
        if (result.length == 0)
            res.send("No POI match to this category")
        
        else
        res.send(result)
    })
    .catch(function(err){
        res.send(err)
    })
})


/**
 * function that returns a given user verification questions
 */
app.get('/getQuestions/:user', function(req, res){
    async function getQuestionsf(){
        try{
            var username = await req.params.user
            var queryResult = await DButilsAzure.execQuery("SELECT Question FROM tbl_User_RecoveryQA WHERE UserName='" + username + "'")
            if (queryResult.length == 0)
                res.send("No such user name")
            for (var i = 0; i < queryResult.length; i++){
                queryResult[i].Question = queryResult[i].Question.replace(/\s*$/,'');
            }
            res.send(queryResult)
        }
        catch(err){
            res.send(err)
        }
    }
    getQuestionsf();
})


/**
 * function that returns random POI's 
 */
app.get('/GetRandomPOI/:minRank', (req, res) => {
	async function getRecomendedPOI(){
        try{
            var minRank = await req.params.minRank
            var POIs = await DButilsAzure.execQuery("SELECT * FROM tbl_POI WHERE Rank >= '" + minRank + "'")
            var counter = 0
            var toSend = []
            if (POIs.length < 4){
                for (var i = 0; i < POIs.length; i++){
                    toSend[counter] = POIs[i]
                    counter++
                }
            }
            else
            {
                var rand = Math.random();
                var fhinished = false
                while (!fhinished){
                    for (var i = 0; !fhinished && counter < 4 &&  i < POIs.length; i++){
                        if (rand > 0.5){
                            if (toSend.includes(POIs[i])){
                                continue
                            }
                            toSend[counter] = POIs[i];
                            counter++
                            if (counter == 4){
                                fhinished = true
                            }
                        }
                        rand = Math.random();
                    }
                }
            }
            res.send(toSend)
    }
        catch(err){
            res.send(err)
        }
    }
    getRecomendedPOI();
    
});