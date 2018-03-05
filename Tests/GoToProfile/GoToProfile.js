var images = require('./Images.js');
module.exports = function(timeout,fnScrollAndFind,fnScrollAndFindOnce,fnClickScalable,fnScalingDetect,fnScalingDetectOnce,fnIsOnScreenOnceScalable,fnIsOnScreenScalable,fnWriteValue,fnWriteValueOnce,fnPermissionId,fnPermission,fnPermssionOnce,fnClearKeyBoard,fnIsOnScreen,fnIsOnScreenOnce,fnClick,fnSaveScreenShot,SaveImage,fnTestFinish,fnTestFinishOnce,testName,logger) {
  return {
  run:async function fnPlayLondonShop(client,params){
    try{

        const init=await client.init();    // appium init (lunch app)

        logger.info("Play london profile test");

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
        await fnClick(images["CoinsIndicator"+"_"+imageSize],client,5,"coins button ",0);
        await fnClick(images["MyAccountButton"+"_"+imageSize],client,10,"My Account button ",2000);
        await timeout(3000)
        await fnIsOnScreen(images["ProfileX"+"_"+imageSize],client,20,"profile webview openned",3000);
        await fnScrollAndFind(images["EmailLabel"+"_"+imageSize],client,imageSize,500,150,2,"scrolling",7000,1000)
        await fnClick(images["ProfileDropDown"+"_"+imageSize],client,5,"My profile open dropdown ",500);
        await fnClick(images["ProfileBirthday"+"_"+imageSize],client,5,"Opening birthday ",1000,10);
        let birthday=await client.getText("android=new UiSelector().resourceId(\"android:id/date_picker_header_date\")")
        let expectedBirthday;
        let expectedCountry;
        if(birthday=="Fri, Apr 14"){
            // click 21
            await fnClick(images["DatePicker21"+"_"+imageSize],client,5,"Click 21 on date Picker",1000);
            expectedBirthday="1995-04-21";
            expectedCountry="Zimbabwe";

        }
        else if(birthday=="Fri, Apr 21"){
            // click 20
            await fnClick(images["DatePicker14"+"_"+imageSize],client,5,"Click 14 on date Picker",1000);
            expectedBirthday="1995-04-14";
            expectedCountry="Zambia"
        }
        else{
            throw new Error("Couldnt get birthday")
        }

        await fnClick(images["DatePickerSet"+"_"+imageSize],client,5,"Click on set in datepicker",500);
        let gender= await  client.element("android=new UiSelector().text(\"Male\")")
        let expectedGender;
        if(gender.state=="failure"){
        console.log("We should choose Male")
        expectedGender="Male";
        }
        else{
        console.log("We should choose Female")
        expectedGender="Female";

        }
        await fnClick(images["ProfileGender"+"_"+imageSize],client,5,"Opening gender ",1000,10);
        await fnClick(images[""+expectedGender+"Checkbox"+"_"+imageSize],client,5,"select gender",500);
        await fnClick(images["ProfileCountry"+"_"+imageSize],client,5,"Opening country select ",1000,10);

        await fnClick(images[""+expectedCountry+"Country"+"_"+imageSize],client,5,"select country",500);
        await fnClick(images["UpdateProfileButton"+"_"+imageSize],client,5,"Click update profile Button",500);
        await fnClick(images["AlertOkButton"+"_"+imageSize],client,5,"Click ok on alert button",500);

        await fnClick(images["CloseShopButton"+"_"+imageSize],client,5,"close voucher shop",500);
        await fnClick(images["MyAccountButton"+"_"+imageSize],client,10,"My Account button ",2000);
        await timeout(3000)

        await fnIsOnScreen(images["ProfileX"+"_"+imageSize],client,20,"profile webview openned",3000);
        await fnScrollAndFind(images["EmailLabel"+"_"+imageSize],client,imageSize,500,150,2,"scrolling",7000,1000)
        await fnClick(images["ProfileDropDown"+"_"+imageSize],client,5,"My profile open dropdown ",500);
        await timeout(3000);

        let newBirthday=await client.getText("android=new UiSelector().resourceId(\"birthday\")");
        let newGender=await client.element("android=new UiSelector().text(\""+expectedGender+"\")");
        let newCountry=await client.element("android=new UiSelector().text(\""+expectedCountry+"\")");
        let testCountry=await client.element("android=new UiSelector().text(\"Zambia\")");
        console.log(testCountry)
        console.log("testCountry")
        if(newBirthday!=expectedBirthday||newGender.state=="failure"||newCountry.state=="failure"){
            console.log(newBirthday);
            console.log(expectedBirthday);
            console.log(newGender);
            console.log(newCountry);

            throw new Error("Profile is not updated!")
        }
        else{
            logger.info("Profile is updated")
        }
        await fnClick(images["CloseShopButton"+"_"+imageSize],client,5,"close voucher shop",500);
        await fnClick(images["x_OverIntroVideo"+"_"+imageSize],client,5," x Button  ",5000)
        await fnClick(images["x_OverIntroVideo"+"_"+imageSize],client,5," x Button  ",5000)
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


