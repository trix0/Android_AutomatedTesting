var images = require('./Images.js');
const express = require('express');
const app = express();
const iExpressPort=8762;
module.exports = function(fn) {
  return {
  run:async function GoToProfile(client,testData,testOutput){
    try{
        

        let testName=testData.desCaps.testName
        params=testData.desCaps.parameters;
        const init=await client.init();    // appium init (lunch app)

        fn.logger.info("Test Builder helper starting");

        //////////////////////////////////// THIS CODE IS MANDATORY -> LEAVE IT HERE
        let imageSize=await client.windowHandleSize();
        imageSize=imageSize.value.height;
        //////////////////////////////////// THIS CODE IS MANDATORY -> LEAVE IT HERE
        await fnImageRequest(fn,client);

        //fn.fnSaveTestOutput(testOutput,testData.outputDir);
        //client.end();
            fn.logger.info("end");
      }

      catch(err){
        fn.fnPushToOutputArray({"message":err})
        fn.fnSaveTestOutput(testOutput,testData.outputDir);
        client.end();
        throw err;
      }
    }
  }
}

function fnImageRequest(fn,client){
return new Promise(resolve=>{
    app.listen(iExpressPort, () => console.log('Express started at port '+iExpressPort))

    app.get('/screenshot', async function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
       var screenshot= await client.screenshot();
        res.send(screenshot)
    });
    var interval =setInterval(
       async function(){ 
            let activity = await client.currentActivity();
            fn.logger.info(activity);
        }
    , 30000);    
})

}





