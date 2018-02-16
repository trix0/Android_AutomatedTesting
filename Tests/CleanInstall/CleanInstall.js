var images = require('../../images.js');

module.exports = function(timeout,fnPermission,fnPermssionOnce,fnLoading,fnIsLoadingOnce,fnClearKeyBoard,fnIsOnScreen,fnIsOnScreenOnce,fnClick,fnSaveScreenShot,SaveImage,fnTestFinish,fnTestFinishOnce,testName,logger) {
  return {
  run:async function fnCleanInstall(client,params){
    try{
        let appPackage=params.appPackage;
        let activityName=params.activityName;
        let apkFileName=params.apkFileName;

        const init=await client.init();    // appium init (lunch app)
        logger.info("Running clean Install test with following paramters, appPackage: "+appPackage+" activityName: "+activityName+" apkFile: " + __dirname+'/apk/'+apkFileName+'.apk');
        // is apk installed ?
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
        await fnPermission(5,true,client);

        loading= await fnTestFinish(images.img2,client,20,"Loading screen",testName,6000,2000);
        client.end();
      }












      catch(err){
        client.end();
        throw err;
      }
    }
  }
}