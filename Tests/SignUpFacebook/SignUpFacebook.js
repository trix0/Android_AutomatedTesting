var images = require('./Images.js');
module.exports = function(fn) {
  return {
  run:async function GoToProfile(client,testData,testOutput){
    try{

        let testName=testData.desCaps.testName
        params=testData.desCaps.parameters;
        const init=await client.init();    // appium init (lunch app)

        fn.logger.info("Running Signup facebook");

        //////////////////////////////////// THIS CODE IS MANDATORY -> LEAVE IT HERE
        let imageSize=await client.windowHandleSize();
        imageSize=imageSize.value.height;
        //////////////////////////////////// THIS CODE IS MANDATORY -> LEAVE IT HERE
        await fn.fnIsOnScreen(images["Login"+"_"+imageSize],client,20,"If on screen then app Loaded,Logout state true",4000,2000);
        await fn.fnClick(images["Login"+"_"+imageSize],client,5,"Click Login button",2000);

        await fn.fnClick(images["FacebookLoginButton"+"_"+imageSize],client,5,"Click facebook Login button",2000);
        await fn.fnClick(images["YesButton"+"_"+imageSize],client,5,"Click Yes age button",2000);

        await fn.fnClickScalable(images["EnterEmailField"],client,10,"Click on Enter Email field",10,0.9,5000,0)
        
        await client.keys(params.email);
        fn.fnPushToOutputArray({"message":"send email keys:" +params.email})
        await client.hideDeviceKeyboard('tapOutside');

        await fn.fnClickScalable(images["EnterPasswordField"],client,10,"Click on password field",10,0.9,5000,0)
        await client.keys(params.password);
        fn.fnPushToOutputArray({"message":"send password keys: "+params.password})
        await client.hideDeviceKeyboard('tapOutside');
        //await fn.fnClickScalable(images["FacebookLogInButtonBlue"],client,10,"Click on login button",10,0.9,5000,0)
        let loginButton=await client.element("android=new UiSelector().className(\"android.widget.Button\")")
        console.log(loginButton)
        await client.click("android=new UiSelector().className(\"android.widget.Button\")")

        //await fn.fnClickScalable(images["FacebookLogInButtonBlue"],client,10,"Click on log in ",10,0.9,5000,0)

        await fn.fnIsOnScreenScalable(images["FacebookLoginContinueButton"],client,20, "detect continiue button",10,0.9,5000) 
        await fn.fnClickScalable(images["FacebookLoginContinueButton"],client,10,"Click on continiue button",10,0.9,5000,0)
        
        // await fn.fnClick(images["AcceptTermsCircle"+"_"+imageSize],client,5,"Accept terms circle",500);
        // await fn.fnClick(images["TermsNextButton"+"_"+imageSize],client,5,"terms next button",500);
        // There is no way for me to find out which hub should be openned. Its up to your account. You can pass properties in json file and use it in here to make different scenarious. Or build more tests with known results, because "If the account contains completed levels/hub the current active hub shall be opened." is not discoverable. 
        
        await fn.fnIsOnScreen(images["CoinsIndicator"+"_"+imageSize],client,20,"If 0 coins then looged in",1000);
        await fn.fnClick(images["x_OverIntroVideo"+"_"+imageSize],client,20," x Button  ",7000);
        await fn.fnClick(images["SettingsButton"+"_"+imageSize],client,5,"Settings Button ",500);
        await fn.fnClick(images["LogoutButton"+"_"+imageSize],client,5,"Logout Button ",500);
        await fn.fnClick(images["BigOkLogout"+"_"+imageSize],client,5,"Big Ok Logout button ",500);
        await fn.fnTestFinish(images["Login"+"_"+imageSize],client,20,"Logout status correct",testName,6000,2000);
        fn.fnSaveTestOutput(testOutput,testData.outputDir);
        client.end();
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


