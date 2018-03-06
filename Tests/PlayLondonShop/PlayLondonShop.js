var images = require('./Images.js');
module.exports = function(timeout,fnScrollAndFind,fnScrollAndFindOnce,fnClickScalable,fnScalingDetect,fnScalingDetectOnce,fnIsOnScreenOnceScalable,fnIsOnScreenScalable,fnWriteValue,fnWriteValueOnce,fnPermissionId,fnPermission,fnPermssionOnce,fnClearKeyBoard,fnIsOnScreen,fnIsOnScreenOnce,fnClick,fnSaveScreenShot,SaveImage,fnTestFinish,fnTestFinishOnce,testName,logger) {
  return {
  run:async function fnPlayLondonShop(client,params){
    try{

        const init=await client.init();    // appium init (lunch app)

        logger.info("Play london shop test");

        //////////////////////////////////// THIS CODE IS MANDATORY -> LEAVE IT HERE
        let imageSize=await client.windowHandleSize();
        imageSize=imageSize.value.height;
        //////////////////////////////////// THIS CODE IS MANDATORY -> LEAVE IT HERE
        await fnIsOnScreen(images["Login"+"_"+imageSize],client,20,"If on screen then app Loaded,Logout state true",4000,2000);
        await fnClick(images["Login"+"_"+imageSize],client,5,"Click Login button",2000);

        await fnClick(images["EmailLoginButton"+"_"+imageSize],client,5,"Click Email Login button",2000);
        await fnClick(images["YesButton"+"_"+imageSize],client,5,"Click Yes age button",2000);
        await fnClick(images["EnterEmailField"+"_"+imageSize],client,5,"Click on Enter Email field",2000);
        await client.keys("msa@pointvoucher.com");
        await fnClearKeyBoard(client);
        await fnClick(images["EmailNextButton"+"_"+imageSize],client,5,"Next email",500);
        await fnClick(images["EnterPasswordField"+"_"+imageSize],client,5,"Click on Enter Password field",2000);
        await client.keys("123123");
        await fnClearKeyBoard(client);
        await fnClick(images["PasswordNextButton"+"_"+imageSize],client,5,"Next password",100);
        //await fnClick(images["AcceptTermsCircle"+"_"+imageSize],client,5,"Accept terms circle",500);
        //await fnClick(images["TermsNextButton"+"_"+imageSize],client,5,"terms next button",500);           

        await fnIsOnScreen(images["CoinsIndicator"+"_"+imageSize],client,20,"If 0 coins then looged in",1000);
        
        //await fnClick(images["x_OverIntroVideo"+"_"+imageSize],client,5," x Button  ",5000);
        await fnClick(images["BackArrow"+"_"+imageSize],client,5,"back arrow button ",500);
        await fnClick(images["VoucherShop"+"_"+imageSize],client,10,"Voucher shop button ",5000);
        await fnIsOnScreen(images["VoucherShopIsOpenned"+"_"+imageSize],client,20,"Voucher shop openned",1000);
        await fnClick(images["CloseShopButton"+"_"+imageSize],client,5,"close voucher shop",500);
        await fnIsOnScreen(images["HubIcons"+"_"+imageSize],client,20,"check if we are in hub",1000);
        await fnClick(images["CoinsButton"+"_"+imageSize],client,5," on coins",500);
        await fnClick(images["LetsGoButton"+"_"+imageSize],client,5,"LEts go button",500);
        await fnIsOnScreen(images["VoucherShopIsOpenned"+"_"+imageSize],client,20,"voucher shop openned",1000);
        await fnClick(images["CloseShopButton"+"_"+imageSize],client,5,"close voucher shop ",500);
        await fnIsOnScreen(images["YourVouchers"+"_"+imageSize],client,20,"are we in your vouchers",1000);
        await fnClick(images["x_OverIntroVideo"+"_"+imageSize],client,5," x Button  ",5000);
        await fnClick(images["SettingsButton"+"_"+imageSize],client,5,"Settings Button ",500);
        await fnClick(images["LogoutButton"+"_"+imageSize],client,5,"Logout Button ",500);
        await fnClick(images["BigOkLogout"+"_"+imageSize],client,5,"Big Ok Logout button ",500);
        await fnClick(images["x_OverIntroVideo"+"_"+imageSize],client,10," x Button  ",2000);
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


