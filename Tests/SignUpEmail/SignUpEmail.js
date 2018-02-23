var images = require('./Images.js');

module.exports = function(timeout,fnClickScalable,fnScalingDetect,fnScalingDetectOnce,fnIsOnScreenOnceScalable,fnIsOnScreenScalable,fnWriteValue,fnWriteValueOnce,fnPermissionId,fnPermission,fnPermssionOnce,fnLoading,fnIsLoadingOnce,fnClearKeyBoard,fnIsOnScreen,fnIsOnScreenOnce,fnClick,fnSaveScreenShot,SaveImage,fnTestFinish,fnTestFinishOnce,testName,logger) {
  return {
  run:async function fnSignUpEmail(client,params){
    try{

        const init=await client.init();    // appium init (lunch app)

        logger.info("Running Signup email");

        let random=Math.random().toString(36).substr(2, 5);
        //////////////////////////////////// THIS CODE IS MANDATORY -> LEAVE IT HERE
        let imageSize=await client.windowHandleSize();
        imageSize=imageSize.value.height;
        //////////////////////////////////// THIS CODE IS MANDATORY -> LEAVE IT HERE
        await fnIsOnScreen(images["Login"+"_"+imageSize],client,20,"If on screen then app Loaded,Logout state true",4000,2000);
        await fnClick(images["Login"+"_"+imageSize],client,5,"Click Login button",2000);

        await fnClick(images["EmailLoginButton"+"_"+imageSize],client,5,"Click Email Login button",2000);
        await fnClick(images["YesButton"+"_"+imageSize],client,5,"Click Yes age button",2000);
        await fnClick(images["EnterEmailField"+"_"+imageSize],client,5,"Click on Enter Email field",2000);
        await client.keys("msa_"+random+"@pointvoucher.com");
        await fnClearKeyBoard(client);
        await fnClick(images["EmailNextButton"+"_"+imageSize],client,5,"Next email",500);
        await fnClick(images["EnterPasswordField"+"_"+imageSize],client,5,"Click on Enter Password field",2000);
        await client.keys("123123");
        await fnClearKeyBoard(client);
        await fnClick(images["PasswordNextButton"+"_"+imageSize],client,5,"Next password",100);
        await fnClick(images["AcceptTermsCircle"+"_"+imageSize],client,5,"Accept terms circle",500);
        await fnClick(images["TermsNextButton"+"_"+imageSize],client,5,"terms next button",500);
        await fnClick(images["MyaccountButton"+"_"+imageSize],client,5,"My account button",500);
        await fnClick(images["FillYourNameField"+"_"+imageSize],client,5,"Fill name",500);
        await client.keys("testName");
        await fnClearKeyBoard(client);
        await fnClick(images["BirthdayField"+"_"+imageSize],client,5,"BirthdayField ",500);
        var regEx = new RegExp(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|2[0-9]))/);
        await fnWriteValue(client,"19951111",regEx,10);               

        await fnClearKeyBoard(client);
        await fnClick(images["CreateProfileButton"+"_"+imageSize],client,5,"create profile button ",500);
        await fnIsOnScreen(images["CoinsIndicator"+"_"+imageSize],client,20,"If 0 coins then looged in",1000);
        await fnClick(images["x_OverIntroVideo"+"_"+imageSize],client,5," x Button  ",5000);
        await fnClick(images["SettingsButton"+"_"+imageSize],client,5,"Settings Button ",500);
        await fnClick(images["LogoutButton"+"_"+imageSize],client,5,"Logout Button ",500);
        await fnClick(images["BigOkLogout"+"_"+imageSize],client,5,"Big Ok Logout button ",500);
        await fnTestFinish(images["Login"+"_"+imageSize],client,20,"Logout status correct",testName,6000,2000);
        await client.closeApp();
         var activity = await client.currentActivity()
         console.log(activity);

        //loading= await fnTestFinish(images["x_OverIntroVideo"+"_"+imageSize],client,20,"IntroVideo",testName,6000,2000);
        client.end();
      }

      catch(err){
        client.end();
        throw err;
      }
    }
  }
}


