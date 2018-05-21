var images = require('./Images.js');




module.exports = function(fn) {
  return {
  run:async function fnCleanInstall(client,testData,testOutput){
    try{
      console.log(testData)
      console.log("_________TEstdata________")
        let testName=testData.desCaps.testName


        params=testData.desCaps.parameters;
        let appPackage=params.appPackage;
        let activityName=params.activityName;
        let apkFileName=params.apkFileName;

        const init=await client.init();    // appium init (lunch app)
        fn.logger.info("Running clean Install test with following paramters, appPackage: "+appPackage+" activityName: "+activityName+" apkFile: " + __dirname+'/apk/'+apkFileName+'.apk');
        fn.fnPushToOutputArray({"message":"Running clean Install test with following paramters, appPackage: "+appPackage+" activityName: "+activityName+" apkFile: " + __dirname+'/apk/'+apkFileName+'.apk'})
        // is apk installed ?
        let imageSize=await client.windowHandleSize();
        imageSize=imageSize.value.height;
        let status=await client.status();
        console.log(status);
        let appExists= await client.isAppInstalled(appPackage);
        if(appExists.value){                                        //if apk installed -> remove
          fn.logger.info("App exists in device => trying to remove");
           fn.fnPushToOutputArray({"message":"App exists in device => trying to remove"})
          await client.removeApp(appPackage).then(()=>{
            fn.logger.info("App removed")
            fn.fnPushToOutputArray({"message":"App removed"})
          })
        } 
        else{
          fn.logger.info("App does not exist in device ");
          fn.fnPushToOutputArray({"message":"App does not exist in device"})
        }                             
        fn.logger.info("Installing app to device "+ __dirname+'/apk/'+apkFileName+'.apk');
        fn.fnPushToOutputArray({"message":"Installing app to device "+ __dirname+'/apk/'+apkFileName+'.apk'})
        let options=[
          {"timeout": 1000},
          {"grantPermissions":true}
        ]
        
        await client.installApp(__dirname+'/apk/'+apkFileName+'.apk',options)
        let appExistsAfter= await client.isAppInstalled(appPackage);
        if(!appExistsAfter.value){                                        //if apk not installed error
          fn.logger.info("apk was not installed:"+ appExistsAfter.toString());
          fn.fnPushToOutputArray({"message":"apk was not installed:"+ appExistsAfter.toString()})
          throw new Error(appExistsAfter+"Apk is not installed");
        } 
        fn.logger.info("starting package : " + appPackage+" with activity name: "+activityName);
        fn.fnPushToOutputArray({"message":"starting package : " + appPackage+" with activity name: "+activityName})
        if(parseInt(testData.desCaps.sdk)>23){
          await client.startActivity(appPackage,activityName,"com.google.android.packageinstaller","com.android.packageinstaller.permission.ui.GrantPermissionsActivity");
        }else{
          await client.startActivity(appPackage,activityName,"com.android.packageinstaller","com.android.packageinstaller.permission.ui.GrantPermissionsActivity");

        }
        
        //client.findElement(By.id("com.android.packageinstaller:id/permission_message")).click(); 
        await fn.fnPermissionId(true,client);

        //await fnPermission(5,true,client);

        await fn.fnClick(images["x_OverIntroVideo"+"_"+imageSize],client,20,"Close intro Video ",25000);
        loading= await fn.fnTestFinish(images["matchTilesMessage"+"_"+imageSize],client,20,"Check if message is there If its there Test Completed",testName,6000,2000);
        fn.fnSaveTestOutput(testOutput,testData.outputDir);
        console.log(testOutput.steps)
        client.end();
      }
      catch(err){
        fn.fnPushToOutputArray({"message":err})
        fn.fnSaveTestOutput(testOutput,testData.outputDir);
        client.end();
        console.log(err);
        throw err;
      }
    }
  }
}