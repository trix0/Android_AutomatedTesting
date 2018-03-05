var images = require('./Images.js');

module.exports = function(timeout,fnScrollAndFind,fnScrollAndFindOnce,fnClickScalable,fnScalingDetect,fnScalingDetectOnce,fnIsOnScreenOnceScalable,fnIsOnScreenScalable,fnWriteValue,fnWriteValueOnce,fnPermissionId,fnPermission,fnPermssionOnce,fnClearKeyBoard,fnIsOnScreen,fnIsOnScreenOnce,fnClick,fnSaveScreenShot,SaveImage,fnTestFinish,fnTestFinishOnce,testName,logger) {
  return {
  run:async function fnCleanInstall(client,params){
    try{
        let appPackage=params.appPackage;
        let activityName=params.activityName;
        let apkFileName=params.apkFileName;

        const init=await client.init();    // appium init (lunch app)
        logger.info("Running clean Install test with following paramters, appPackage: "+appPackage+" activityName: "+activityName+" apkFile: " + __dirname+'/apk/'+apkFileName+'.apk');
        // is apk installed ?
        let imageSize=await client.windowHandleSize();
        imageSize=imageSize.value.height;
        let appExists= await client.isAppInstalled(appPackage);
        if(appExists.value){                                        //if apk installed -> remove
          logger.info("App exists in device => trying to remove");
          await client.removeApp(appPackage).then(()=>{
            logger.info("App removed")
          })
        } 
        else{
          logger.info("App does not exist in device ");
        }                             
        logger.info("Installing app to device "+ __dirname+'/apk/'+apkFileName+'.apk');
        await client.installApp(__dirname+'/apk/'+apkFileName+'.apk')
        let appExistsAfter= await client.isAppInstalled(appPackage);
        if(!appExistsAfter.value){                                        //if apk not installed error
          logger.info("apk was not installed:"+ appExistsAfter);
          throw new Error(appExistsAfter+"Apk is not installed");
        } 
         logger.info("starting package : " + appPackage+" with activity name: "+activityName);
        await client.startActivity(appPackage,activityName,"com.android.packageinstaller","com.android.packageinstaller.permission.ui.GrantPermissionsActivity");
        //client.findElement(By.id("com.android.packageinstaller:id/permission_message")).click(); 
        await fnPermissionId(true,client);

        //await fnPermission(5,true,client);

        await fnClick(images["x_OverIntroVideo"+"_"+imageSize],client,20,"Close intro Video ",30000);
        loading= await fnTestFinish(images["matchTilesMessage"+"_"+imageSize],client,20,"Check if message is there If its there Test Completed",testName,6000,2000);
        await timeout(10000);
        client.end();
      }














      catch(err){
        client.end();
        console.log(err);
        throw err;
      }
    }
  }
}