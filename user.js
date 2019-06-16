var express = require("express");
var router = express.Router();
var DButilsAzure = require('./DButils');


/**
 * function that returns a given user FOI's details
 */
router.get('/getFOI/:user', function(req, res){
    async function getFoif(){
        try{
            var r = req.params.user
            var checkUser = await DButilsAzure.execQuery("SELECT UserName FROM tbl_Users WHERE UserName='" + username + "'")
                    
                if (checkUser.length == 0)
                    res.send("User name does not exist")

            var result = await DButilsAzure.execQuery("SELECT FieldOfInterest FROM tbl_User_FOI WHERE UserName='" + r + "'")
            if (result.length == 0)
                res.send("No FOI for this user name")
            for (var i = 0; i < result.length; i++)
                result[i].FieldOfInterest = result[i].FieldOfInterest.replace(/\s*$/,'');
            res.send(result)
        }
        catch(err){
            res.send(err)
        }
    }
    getFoif();
    
})


/**
 * function that saves a POI for a user
 */
router.post('/savePOI', (req, res) => {
    async function poiSave(){
        try{
            var username = req.body.UserName
            var poiname = req.body.POIName
            var checkUser = await DButilsAzure.execQuery("SELECT UserName FROM tbl_Users WHERE UserName='" + username + "'")
            
            if (checkUser.length == 0)
                res.send("User name does not exist")

            var result = await DButilsAzure.execQuery("SELECT * FROM tbl_Saved_POI WHERE UserName='" + username + "' AND POIName='" + poiname + "'")
            if (result.length == 0){
                result = await DButilsAzure.execQuery("INSERT INTO tbl_Saved_POI (UserName, POIName) VALUES ('" + username + "', '" + poiname + "')")
                res.send("success")
            }
            else{
                res.send("POI Already Saved")
            }
        }
        catch(err){
            res.send(err)
        }
    }
    poiSave();
});


/**
 * function that returns recommended POI's for a given user, according to his FOI's, number of views and minimum rank 
 */
router.get('/getRecomendedPOI/:user', (req, res) => {
	async function getRecomendedPOI(){
        try{
            var username = req.params.user
            var checkUser = await DButilsAzure.execQuery("SELECT UserName FROM tbl_Users WHERE UserName='" + username + "'")
            
            if (checkUser.length == 0)
                res.send("User name does not exist")

            var queryFOIResult = await DButilsAzure.execQuery("SELECT FieldOfInterest FROM tbl_User_FOI WHERE UserName='" + username + "'")
            var strWithoutSpace = "";
            var finalQuery = "";
            for (var i = 0; i < queryFOIResult.length; i++){
                strWithoutSpace = queryFOIResult[i].FieldOfInterest.replace(/\s*$/,'');
                var queryPOIResult = await DButilsAzure.execQuery("SELECT * FROM tbl_POI WHERE (CategoryName='" + strWithoutSpace +
             "' AND NumOfViews >= 10000 AND Rank >= 4.0)")
                if (finalQuery.length == 0){
                    finalQuery = queryPOIResult;
                }
                else if (queryPOIResult.length != 0 && finalQuery.length != 0){
                        finalQuery = finalQuery.concat(queryPOIResult)
                }
            }
            for (var i = 0; i < finalQuery.length; i++){
                finalQuery[i].CategoryName = finalQuery[i].CategoryName.replace(/\s*$/,'');
                finalQuery[i].POIName = finalQuery[i].POIName.replace(/\s*$/,'');
            }
            res.send(finalQuery)
        }
        catch(err){
            res.send(err)
        }
    }
    getRecomendedPOI();
    
});


/**
 * function that return the saved POI of a user
 */
router.get('/GetPOISaved/:user', (req, res) => {
    async function getSavedPOI(){
        try{
            var username = req.params.user
            var checkUser = await DButilsAzure.execQuery("SELECT UserName FROM tbl_Users WHERE UserName='" + username + "'")
            
            if (checkUser.length == 0)
                res.send("User name does not exist")

            var result = await DButilsAzure.execQuery("SELECT POIName FROM tbl_Saved_POI WHERE UserName='" + username + "'")
            for (var i = 0; i < result.length; i++){
                result[i].POIName = result[i].POIName.replace(/\s*$/,'');
            }
            var toReturn;
            var resultPOI;
            for (i = 0; i < result.length; i++){
                resultPOI = await DButilsAzure.execQuery("SELECT * FROM tbl_POI WHERE POIName='" + result[i].POIName + "'")
                if (i == 0){
                    toReturn = resultPOI;
                }
                else{
                    toReturn.push(resultPOI[0])
                }
            }
            
            res.send(toReturn)
        }
        catch(err){
            res.send(err)
        }
    }
    getSavedPOI();
});


/**
 * function that remove POI from the user POI saved list
 */
router.post('/RemovePOI', (req, res) => {

    async function RemoveSavedPOI(){
        try{
            var username = req.body.UserName
            var checkUser = await DButilsAzure.execQuery("SELECT UserName FROM tbl_Users WHERE UserName='" + username + "'")
            
            if (checkUser.length == 0)
                res.send("User name does not exist")

            var poiname = req.body.POIName
            if (poiname == "All"){
                await DButilsAzure.execQuery("DELETE FROM tbl_Saved_POI WHERE UserName='" + username +"'")
            }
            else{
                await DButilsAzure.execQuery("DELETE FROM tbl_Saved_POI WHERE UserName='" + username + "' AND POIName='" + poiname + "'")
            }      
            res.send("success")
        }
        catch(err){
            res.send(err)
        }
    }
    RemoveSavedPOI();
});


/**
 * function that clears the savedPOI of a user and inserting the new POIs.
 */
router.post('/UpdatePOIList', (req, res) => {

    async function UpdatePOI(){
        try{
            var username = req.body.UserName
            var checkUser = await DButilsAzure.execQuery("SELECT UserName FROM tbl_Users WHERE UserName='" + username + "'")
                    
                if (checkUser.length == 0)
                    res.send("User name does not exist")

            var POIs = req.body.POIName
            var POIArr = POIs.split(',')
            result = DButilsAzure.execQuery("DELETE FROM tbl_Saved_POI WHERE UserName='" + username +"'")
            for (var i = 0 ; i < POIArr.length; i++)
                await DButilsAzure.execQuery("INSERT INTO tbl_Saved_POI (UserName, POIName) VALUES ('" + username + "', '" + POIArr[i] + "')")
            res.send("success")
        }
        catch(err){
            res.send(err)
        }
    }
    UpdatePOI();
});


/**
 * function that saves a user review for a given POI and update rank for POI after review
 */
router.post('/SaveUsersReview', (req, res) => {
    async function saveReview(){
        try{
            var newRank = 0;
            var username = req.body.UserName
            var poiname = req.body.POIName
            var Rank = req.body.Rank
            var Review = req.body.Description
            var newNumOfReviews = 0;
            var reviewDate = new Date();
            var date = reviewDate.getFullYear()+'-'+(reviewDate.getMonth()+1)+'-'+reviewDate.getDate();
            var alreadyReviewd = await DButilsAzure.execQuery("SELECT * FROM tbl_User_Review WHERE POIName='" + poiname + "' AND UserName='" + username + "'");
            

            if (alreadyReviewd.length > 0){//updating the review by the user.
                
                //getting the old rank of user to the new avgRank culc.
                var oldUserRank = await DButilsAzure.execQuery("SELECT * FROM tbl_User_Review WHERE POIName='" + poiname + "' AND UserName='" + username + "'");
                var numOfReviews = await DButilsAzure.execQuery("SELECT * FROM tbl_User_Review WHERE POIName='" + poiname + "'");
                var oldRank = 0
                for (var i = 0 ; i < numOfReviews.length; i = i + 1){
                    oldRank = oldRank + numOfReviews[i].Rank
                }
                //update the user review.
                await DButilsAzure.execQuery("UPDATE tbl_User_Review SET Rank=" + Rank + ",Review='" + Review + "',Date='" + date + "' WHERE POIName='" + poiname + "' AND UserName='" + username + "'");

                            
                newRank = ((oldRank - oldUserRank[0].Rank) * (numOfReviews.length - 1) + parseFloat(Rank))/(numOfReviews.length);
                //update the POI table with the new avgRank
                await DButilsAzure.execQuery("UPDATE tbl_POI SET Rank=" + newRank + ",NumOfViews='" + numOfReviews.length +"'  WHERE POIName='" + poiname + "'");
                res.send("Update success")
            }
            else{   //did not reviewed by the user.
                var numOfReviews = await DButilsAzure.execQuery("SELECT * FROM tbl_User_Review WHERE POIName='" + poiname + "'");
                if (numOfReviews.length > 0){//there are reviews on the POI.
                    var oldRank = 0
                    for (var i = 0 ; i < numOfReviews.length; i = i + 1){
                        oldRank = oldRank + numOfReviews[i].Rank
                    }
                    newRank = (oldRank * (numOfReviews.length) + parseFloat(Rank))/(numOfReviews.length + 1);
                    newNumOfReviews = numOfReviews.length + 1

                    //inserting the review of the user to the user review table.
                    result = await DButilsAzure.execQuery("INSERT INTO tbl_User_Review (UserName,POIName,Rank,Review,Date) VALUES ('" + username + "', '" + poiname + "', '" + Rank + "', '"  + Review +"', '" + date + "')");

                    //update the POI table with the new avgRank.
                    await DButilsAzure.execQuery("UPDATE tbl_POI SET Rank=" + newRank + ",NumOfViews='" + newNumOfReviews +"'  WHERE POIName='" + poiname + "'");
                }
                else{//first review of the POI
                    result = await DButilsAzure.execQuery("INSERT INTO tbl_User_Review (UserName,POIName,Rank,Review,Date) VALUES ('" + username + "', '" + poiname + "', '" + Rank + "', '"  + Review +"', '" + date + "')");
                    result = await DButilsAzure.execQuery("UPDATE tbl_POI SET Rank=" + newRank + ",NumOfViews='" + 1 +"'  WHERE POIName='" + poiname + "'");
                }
                res.send("success")
            }
        }
        catch(err){
            res.send(err)
        }
    }
    saveReview();
});

module.exports = router;