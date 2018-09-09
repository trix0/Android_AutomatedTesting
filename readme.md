
## Automated Testing for android games build in Unity
Is used for automated testing for Unity games on Android using appium.
It provides eazy way to build,execute and monitor  tests.
Project uses template matching to find elements on screen.
[![Watch the video](https://raw.github.com/GabLeRoux/WebMole/master/ressources/WebMole_Youtube_Video.png)](http://youtu.be/vt5fpE0bzSY)
https://www.youtube.com/watch?v=ucUbYSGEFx4&feature=youtu.be



## Dependencies
Appium 1.8.0-Beta
Open stf 

## Known Issues

stf check function does not work correctly.

## Usage Instructions

1. Install all dependencies and download project.
2. Create tests.
3. Build tests.
4. Execute Tests.
5. Check if tests passed.










## Create Tests

To create the test. Ceate the folder with a test name in folder "Tests"
* Example ("CleanInstall" or "FacebookLogin"). from now just testName

Every test folder consist of 2 main files and images.
Create "Images" folder in your Test folder(FacebookLogin or similar not in "Tests").
Thats the place where you have to store your images for the test.

1# required file is a json file. IT has to following name. testName.json where testName is a name of your test !!!! in this file you can  store all desired capabilities, diferent parameters for test and so on.(Check more on appium for desired capabilities). Parameters accepts array. If the parameters consist of array You are able to pass different parameters to tests.(useful for running Grouped tests with different paramters)
0 index of array to 1st executed test
1 index of array to 2nd executed test
...


Example:
```
{
"testName":"Clean Install",
"testFileName":"CleanInstall",
"groupTest":false,
"desiredCapabilities": {
        "platformName": "Android",
        "deviceName": "Android",
        "appPackage":"com.gorro.nothing",
        "appActivity":"com.gorro.nothing.NothingActivity",
        "fullReset":false,
	"noReset":true,
        "newCommandTimeout":120000,
        "skipUnlock":true,
        "androidInstallTimeout":150000
      },
"parameters":[{
	"appPackage":"com.pointvoucher.playlondonpv",
	"activityName":"com.unity3d.player.UnityPlayerActivity",
	"apkFileName":"pl"
},
{
    "appPackage":"com.pointvoucher.playlondonpv",
    "activityName":"com.unity3d.player.UnityPlayerActivity",
    "apkFileName":"pl"
}
]

}
```
2# required file is testName.js This file consist of javascript code which is executed.
+ images is a variable where all of your images are stored.
+ fn is variable where all functions are. You can call it with fn.functionName()
+ testData are all test data for current test-> you can find parameters in here
+ imageSize is needed to determine which size of images to use. 
⋅⋅* Platform uses prebuild images for image recognition( There are as well scaling functions but try to avoid them).


Example:
```
var images = require('./Images.js');
module.exports = function(fn) {
  return {
  run:async function PlayLondnoShop(client,testData,testOutput){
    try{

        let testName=testData.desCaps.testName
        params=testData.desCaps.parameters;
        const init=await client.init();    // appium init (lunch app)

        fn.logger.info("Play london shop test");

        //////////////////////////////////// THIS CODE IS MANDATORY -> LEAVE IT HERE
        let imageSize=await client.windowHandleSize();
        imageSize=imageSize.value.height;
        //////////////////////////////////// THIS CODE IS MANDATORY -> LEAVE IT HERE
        await fn.fnIsOnScreen(images["Login"+"_"+imageSize],client,20,"If on screen then app Loaded,Logout state true",4000,2000);
        await fn.fnClick(images["Login"+"_"+imageSize],client,5,"Click Login button",2000);

        await fn.fnClick(images["EmailLoginButton"+"_"+imageSize],client,5,"Click Email Login button",2000);
        await fn.fnClick(images["YesButton"+"_"+imageSize],client,5,"Click Yes age button",2000);
        await fn.fnClick(images["EnterEmailField"+"_"+imageSize],client,5,"Click on Enter Email field",2000);
        await client.keys("msa@pointvoucher.com");
        fn.fnPushToOutputArray({"message":"sends keys:msa@pointvoucher.com"})
        await fn.fnClearKeyBoard(client);
        await fn.fnClick(images["EmailNextButton"+"_"+imageSize],client,5,"Next email",500);
        await fn.fnClick(images["EnterPasswordField"+"_"+imageSize],client,5,"Click on Enter Password field",2000);
        await client.keys("123123");
        fn.fnPushToOutputArray({"message":"sends keys:123123"})
        await fn.fnClearKeyBoard(client);
        await fn.fnClick(images["PasswordNextButton"+"_"+imageSize],client,5,"Next password",100);
        //await fnClick(images["AcceptTermsCircle"+"_"+imageSize],client,5,"Accept terms circle",500);
        //await fnClick(images["TermsNextButton"+"_"+imageSize],client,5,"terms next button",500);           

        await fn.fnIsOnScreen(images["CoinsIndicator"+"_"+imageSize],client,20,"If 0 coins then looged in",1000);
        
        //await fnClick(images["x_OverIntroVideo"+"_"+imageSize],client,5," x Button  ",5000);
        await fn.fnClick(images["BackArrow"+"_"+imageSize],client,5,"back arrow button ",500);
        await fn.fnClick(images["VoucherShop"+"_"+imageSize],client,10,"Voucher shop button ",5000);
        await fn.fnIsOnScreen(images["VoucherShopIsOpenned"+"_"+imageSize],client,20,"Voucher shop openned",1000);
        await fn.fnClick(images["CloseShopButton"+"_"+imageSize],client,5,"close voucher shop",500);
        await fn.fnIsOnScreen(images["HubIcons"+"_"+imageSize],client,20,"check if we are in hub",1000);
        await fn.fnClick(images["CoinsButton"+"_"+imageSize],client,5," on coins",500);
        await fn.fnClick(images["LetsGoButton"+"_"+imageSize],client,5,"LEts go button",500);
        await fn.fnIsOnScreen(images["VoucherShopIsOpenned"+"_"+imageSize],client,20,"voucher shop openned",1000);
        await fn.fnClick(images["CloseShopButton"+"_"+imageSize],client,5,"close voucher shop ",500);
        await fn.fnIsOnScreen(images["YourVouchers"+"_"+imageSize],client,20,"are we in your vouchers",1000);
        await fn.fnClick(images["x_OverIntroVideo"+"_"+imageSize],client,5," x Button  ",5000);
        await fn.fnClick(images["SettingsButton"+"_"+imageSize],client,5,"Settings Button ",500);
        await fn.fnClick(images["LogoutButton"+"_"+imageSize],client,5,"Logout Button ",500);
        await fn.fnClick(images["BigOkLogout"+"_"+imageSize],client,5,"Big Ok Logout button ",500);
        await fn.fnClick(images["x_OverIntroVideo"+"_"+imageSize],client,10," x Button  ",2000);
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
```




## Build tests


# Single test 

Every test has to be prebuild in order to create all the images and image exports.

In main folder there is a file called "BuildTest.js". Please file all your available devices into that file in order to build correct sizes.

Build Screen size should be the biggest device you have available for the testing.
```
const buildScreenSize={
"deviceWidth":1440,
"deviceHeight":2560
}
```

allDevicesList consist all of your available devices. Make sure to fill width and height of screen correctly.


```
// list of all devices 
const allDevicesList=[
{
"deviceName":"Samusng A3",
"deviceUDID":"cd21ccc5",
"deviceWidth":540,
"deviceHeight":960
},
{
"deviceName":"Nexus",
"deviceUDID":"",
"deviceWidth":768,
"deviceHeight":1280
},
{
"deviceName":"Samsung Galaxy S5",
"deviceUDID":"",
"deviceWidth":1080,
"deviceHeight":1920
},
{
"deviceName":"Samsung Galaxy S6",
"deviceUDID":"",
"deviceWidth":1440,
"deviceHeight":2560
}
]
```
To build a test all you need to do is to have all the files from  Create Tests and images inside Images folder.

Then you simply lunch app by "node main" and run following command:


```
buildTest YourTestName
```
This will generate images for all screen sizes  and as well images.js with exports so the images are accessable. 




# Group tests

You can group test together in order to lunch them in suite one after another(in sequence).

To build a group test all you need to do is to create a new json file inside Tests foder.

Call your json file with the testname that you would like to execute.(testName.js or SmokeTest.js)

inside json file there is a testName which is only for display purposes !!! You have to call your test by the filename!!!

All you need to do is insert into array tests which test you want to execute and if it should continue on error or not.


Example:
```
{
	"testName":"Smoke Test",
	"groupTest":true,
	"tests":[
		{
		"testName":"Clean Install",
		"testFolder":"CleanInstall",
		"conitnueOnFail":false
		},
		{
		"testName":"Sign up Email",
		"testFolder":"SignUpEmail",
		"conitnueOnFail":true
		},
		{
		"testName":"Sign up Facebook",
		"testFolder":"SignUpFacebook",
		"conitnueOnFail":true
		},
		{
		"testName":"PlayLondon Shop",
		"testFolder":"PlayLondonShop",
		"conitnueOnFail":true
		},
		{
		"testName":"Go To Profile",
		"testFolder":"GoToProfile",
		"conitnueOnFail":true
		}
	]
}
```







## Execute Tests.

To execute test you simply use one of the methods to run the tests.(more in docs)


To execute a group test from previous example you would use.

run SmokeTest <device UDID>(run SmokeTest cd21ccc5/ run SmokeTest emulator-5554)
its important to always use fileNames not a testame you wrote into the files!


## Check if tests passed.

You can use fronend to check for a results.
If some of your tests failed you can simply go into the logs folder and find test by id and testName. 
You can find there Appium log, custom log, and html output to find out what the test error is. 

















## function description
All the functions are stored in connect.js
#### fn.timeout=timeout;
#### fn.fnScrollAndFind=fnScrollAndFind;
#### fn.fnScrollAndFindOnce=fnScrollAndFindOnce;
#### fn.fnClickScalable=fnClickScalable;
#### fn.fnScalingDetect=fnScalingDetect;
#### fn.fnScalingDetectOnce=fnScalingDetectOnce;
#### fn.fnIsOnScreenOnceScalable=fnIsOnScreenOnceScalable;
#### fn.fnIsOnScreenScalable=fnIsOnScreenScalable;
#### fn.fnWriteValue=fnWriteValue;
#### fn.fnWriteValueOnce=fnWriteValueOnce;
#### fn.fnPermissionId=fnPermissionId;
#### fn.fnPermssionOnce=fnPermssionOnce;
#### fn.fnClearKeyBoard=fnClearKeyBoard;
#### fn.fnIsOnScreen=fnIsOnScreen;
#### fn.fnIsOnScreenOnce=fnIsOnScreenOnce;
#### fn.fnClick=fnClick;
#### fn.fnSaveScreenShot=fnSaveScreenShot;
#### fn.SaveImage=SaveImage;
#### fn.fnTestFinish=fnTestFinish;
#### fn.fnTestFinishOnce=fnTestFinishOnce;
#### fn.testName=testName;
#### fn.logger=logger;
#### fn.fnPushToOutputArray=fnPushToOutputArray;
#### fn.fnMarkOnImage=fnMarkOnImage;
#### fn.fnSaveTestOutput=fnSaveTestOutput;




//////////////////////// func def/////////////////////



####fnSaveTestOutput(json object, string path) path usually => testData.outputDir

Saves Test output to a html file.
Usually used on the end of the test or in error handling.




####fnPushToOutputArray(json object)
Pushes object into testOutput 


#### fnMarkOnImage(mat screenshot,mat smallImg, opencv result result,string outputFolder)
Marks on a screnshot based on coordinates in result



#### fnCreateFolder(string path)
Creates the folder for output dir




####fnScrollAndFind(img,client,int deviceHeight,int scrollAmount, int movePosition,int repeats,string desc,int wait,int repeatDelay)
Scrolls down and look for image on screenshot before it scrolls again
movePosition-> is a position where should be found element scrlled from top of the device 





#### fnIsOnScreen(img,client, int repeats = 5, string desc,int wait = 2000,int repeatDelay)
Looks for Image on screenshot 



#### function fnScrollAndFindScalable()
Needs to be implemented


####fnWriteValue(client,string value,regex expectedValue,int repeats, string selector)
Writes Value and verify if its correct

  





####fnPermissionId(bValue,client)
Clicks on perrmission button 
null -> nothinf
false -> click no
true-> click yes




####fnClearKeyBoard(client)
clears keyboard 



####fnIsOnScreenScalable(img,client, repeats = 5, desc,scaleCounter,scaleAmount, wait = 2000,repeatDelay)
detecting elements that are not scaled same way the game interface is. // be care about scale counter and scaleAmount !!!!



####fnTestFinish(img,client, repeats = 5, desc,testName, wait = 2000,repeatDelay) 
 main function to dettect if test finished Use it on the end of the test (detect last element and so on.)







####fnClick(img,client,int repeats=5, string desc,int wait,int offsetX=0,int offsetY=0)
 functions used to click on elements -> find based on image -> template matching 
 be care with offsets its not calculated based on screen size !



####fnClickScalable(img,client,int repeats=5,string desc,int scaleCounter,int scaleAmount,int wait,int repeatDelay,int offsetX=0,intoffsetY=0)
 scalable click function, be careful with scaleCounter and scaleAmount

