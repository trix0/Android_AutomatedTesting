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

        await fnClick(images["FacebookLoginButton"+"_"+imageSize],client,5,"Click facebook Login button",2000);
        await fnClick(images["YesButton"+"_"+imageSize],client,5,"Click Yes age button",2000);
        //await fnClick(images["EnterEmailField"+"_"+imageSize],client,10,"Click on Enter Email field",5000);
        await fnClickScalable(images["EnterEmailField"],client,10,"Click on Enter Email field",50,0.9,5000,0)
        

        await timeout(10000);
        
        //await client.click("new UiSelector().Text(\"Email or Phone\")")
        await client.keys("msa@pointvoucher.com");
        await fnClearKeyBoard(client);
        //await fnClick(images["EnterPasswordField"+"_"+imageSize],client,5,"Click on Enter Password field",2000);
        client.click("new UiSelector().password(\"True\")")
        await client.keys("atTesting123");
        await fnClearKeyBoard(client);
        await fnClick(images["FacebookLogInButtonBlue"+"_"+imageSize],client,5,"Login Button ",1000);
        await fnClick(images["FacebookLoginContinueButton"+"_"+imageSize],client,5,"Continiue button",100);
        


        await fnClick(images["AcceptTermsCircle"+"_"+imageSize],client,5,"Accept terms circle",500);
        await fnClick(images["TermsNextButton"+"_"+imageSize],client,5,"terms next button",500);
        // There is no way for me to find out which hub should be openned. Its up to your account. You can pass properties in json file and use it in here to make different scenarious. Or build more tests with known results, because "If the account contains completed levels/hub the current active hub shall be opened." is not discoverable. 
        
        await fnIsOnScreen(images["CoinsIndicator"+"_"+imageSize],client,20,"If 0 coins then looged in",1000);
        await fnClick(images["x_OverIntroVideo"+"_"+imageSize],client,5," x Button  ",5000);
        await fnClick(images["SettingsButton"+"_"+imageSize],client,5,"Settings Button ",500);
        await fnClick(images["LogoutButton"+"_"+imageSize],client,5,"Logout Button ",500);
        await fnClick(images["BigOkLogout"+"_"+imageSize],client,5,"Big Ok Logout button ",500);
        await fnTestFinish(images["Login"+"_"+imageSize],client,20,"Logout status correct",testName,6000,2000);

        client.end();
      }

      catch(err){
        client.end();
        throw err;
      }
    }
  }
}


