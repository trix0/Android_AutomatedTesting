const Swagger = require('swagger-client');
const { exec } = require('child_process');
const wdio = require('webdriverio');
const SWAGGER_URL = 'http://localhost:7100/api/v1/swagger.json'
const AUTH_TOKEN  = '26cd01ab067140ec8f6934253c41eceba51ec96c0b1440f1a4fe1c6aa42c7507';
const { performance } = require('perf_hooks');
const fs =require("fs");
const cv = require('opencv4nodejs');
const winston = require('winston');

const logger = new winston.Logger({
    level: 'info',
    transports: [
      new winston.transports.Console({
        timestamp: true
      }),
      new winston.transports.File({
        filename: __dirname+'/logs/app.log',
        timestamp: true,
        prettyPrint : true,
        json:false,
      })
    ]
  });


logger.info('Test execution started');











const jArguments=JSON.parse(process.argv[2]);
console.log(jArguments);
logger.info("Get following options to run"+ JSON.stringify(jArguments))

///////////// images for img recognition////////////////////
const img2 = cv.imread(__dirname+'/autoTest/CreateAccount.png');
const img3 = cv.imread(__dirname+'/autoTest/LoginButton.png');
const imgAllowButton = cv.imread(__dirname+'/autoTest/allowButton.png');
const imgDenyButton = cv.imread(__dirname+'/autoTest/denyButton.png');
const imgLoginEmail = cv.imread(__dirname+'/autoTest/loginEmail.png');
const imgBigOkButton = cv.imread(__dirname+'/autoTest/bigOkButton.png');
const imgloginPassed = cv.imread(__dirname+'/autoTest/loginPassed.png');
const imgHideKeyboard = cv.imread(__dirname+'/autoTest/hideKeyBoard.png');
const imgLogOutButton = cv.imread(__dirname+'/autoTest/logOutYellow.png');
const imgloginPassed2 = cv.imread(__dirname+'/autoTest/login2finished.png');
const imgLoginPassword = cv.imread(__dirname+'/autoTest/loginPassword.png');
const imgSettingsButton = cv.imread(__dirname+'/autoTest/settingsButton.png');
const imgFriendsForEverX = cv.imread(__dirname+'/autoTest/friendsForEverX.png');
const imgloginPassLogout = cv.imread(__dirname+'/autoTest/loginTest1Finish.png');
const imgloginEnterEmail = cv.imread(__dirname+'/autoTest/loginEnterEmail.png');
const imgloginAgeConfirmYes = cv.imread(__dirname+'/autoTest/loginAgeConfirmYes.png');
const imgloginAcceptConditions = cv.imread(__dirname+'/autoTest/loginAcceptConditions.png');
const imgloginYellowNextButton = cv.imread(__dirname+'/autoTest/loginYellowNextButton.png');



//////////// capabilities options for appium//////////
const opts = {
      port: jArguments.port,
      desiredCapabilities: {
        platformName: "Android",
        deviceName: "Android",
        systemPort:jArguments.systemPort,
        //automationName: "uiautomator2",
        udid:"", //cd21ccc5 emulator-5554
        //app: __dirname+"/apk/pl.apk",
        appPackage:"com.gorro.nothing",
        appActivity:"com.gorro.nothing.NothingActivity",
        // appPackage:"com.pointvoucher.playlondonpv",
        // appActivity:"com.unity3d.player.UnityPlayerActivity",
        noReset:jArguments.noReset,/////////// false adds around 3Sec
        fullReset:false,
        newCommandTimeout:120000,
        skipUnlock:true,
      }
};


///// swagger client to authoriize openSTF/////////////
const clientSwag = new Swagger({
  url: SWAGGER_URL
, usePromise: true
, authorizations: {
    accessTokenAuth: new Swagger.ApiKeyAuthorization('Authorization', 'Bearer ' + AUTH_TOKEN, 'header')
  }
})


///////////////////////////Init call///////////////
const serial = jArguments.serial;          /////////// serial number of phone

fnInit();

async function fnInit(){
  let UDID;
  try{
    UDID=await fnConnectStf(serial); /////////////connect to stf -> returns UDID 
    opts.udid=UDID;                       //////////assign udid

    const client = wdio.remote(opts);       //getting appium client connection
    process.on('SIGINT', ()=>{
      client.end();
      fnDisconnect(UDID);  // disconnects from open stf
    });
    const init=await client.init();    // appium init (lunch app)
    await fnCleanInstall(client,"com.pointvoucher.playlondonpv","com.unity3d.player.UnityPlayerActivity","pl");
    //await fnPermission(5,null,client);
    // const loading=await fnLoading(40,client); // loading time 40 screenshots request afterwards error
    // if(loading==1){
    //   console.log("running test1");
    //   const fnTest=await fnLoginTest(client);
    // }
    // else{
    //   console.log("running test 2");
    //   const fnTest=await fnLoginTest2(client);
    // }

    //await fnDisconnect(UDID);
  }
  catch(err){
    fnDisconnect(UDID);
    throw err;
  }

}



//////////////////////// func def/////////////////////


// conect to stf///
async function fnConnectStf(serial){
  logger.info("Trying to connect to openSTF with serial number "+serial)
  try{
    const getDevices=await clientSwag.then((api)=>{
      return api.devices.getDeviceBySerial({
      serial: serial
      , fields: 'serial,present,ready,using,owner'
      })
    })
    let device = getDevices.obj.device;
    const avaiDevices= await clientSwag.then((api)=>{
      if (!device.present || !device.ready || device.using || device.owner) {
        logger.info("Device is not available => open STF ")
        throw new Error('Device is not available')
      }
      return api.user.addUserDevice({
        device: {
          serial: device.serial
        , timeout: 900000
        }
      })
    });
    const remoteConnect= await clientSwag.then((api)=>{
      if (!avaiDevices.obj.success) {
        logger.info("Could not connect to device => open STF ")
        throw new Error('Could not connect to device')

      }
      return api.user.remoteConnectUserDeviceBySerial({
        serial: device.serial
      })
    })
    const remoteConnectUDID= await (()=>{
      logger.info("executing command adb connect  " + remoteConnect.obj.remoteConnectUrl)
      exec('adb connect '+remoteConnect.obj.remoteConnectUrl+'','',(err, stdout, stderr)=>{
      });
      return remoteConnect.obj.remoteConnectUrl
    })();
    process.on('SIGINT', ()=>{
      fnDisconnect(remoteConnectUDID);
    });
    const createServer=await fnCreateServer(opts.port);
    return(remoteConnectUDID);
  }
  catch(err){
    throw err;
  }


}


// disconnect from OPenSTf
function fnDisconnect(UDID){
  clientSwag.then(function(api) {
    return api.user.getUserDevices({
      serial: serial
    , fields: 'serial,present,ready,using,owner'
    })
    .then(function(res) {
        // check if device can be added or not
      var devices = res.obj.devices

      var hasDevice = false
      devices.forEach(function(device) {
        if(device.serial === serial) {
          hasDevice = true;
        }
      })

      if (!hasDevice) {
        logger.info("You are not owner "+ UDID+" => open STF ")
        throw new Error('You are not owner')
      }

      return api.user.deleteUserDeviceBySerial({
        serial: serial
      })
      .then(function(res) {
        if (!res.obj.success) {
          logger.info("Could not disconnect "+UDID+" => open STF ")
          throw new Error('Could not disconnect to device')

        }
        logger.info("Disconnected "+UDID+"=> open STF ")
        console.log("Disconnected!")
      })
    })
  })


}
/// creates appium server on port from opts 
function fnCreateServer(port){
  return new Promise((resolve,reject)=>{
    logger.info("Trying to create appium Server on port: "+ port)
    let appiumPort=port
    let appiumServer=exec('/home/trixo/Downloads/appium-1.8.0-beta3/build/lib/main.js -p '+port+' --session-override --log-timestamp --log /home/trixo/Code/javaRewrite/log.txt');
    appiumServer.stdout.on('data', function(data) {
      if(data.indexOf("listener started ")!=-1){
        logger.info("Appium server created on port: "+port )
        console.log("Server Created");
        resolve(true);
        
      }
    });
    appiumServer.stderr.on('data', function(data) {
      logger.info("Appium err "+ data)
      reject(data)
    });
    appiumServer.on('close', function(code) {
            logger.info("Appium on close  "+ code)
      reject(code);
    });
// ...

  })
}


//rconnect to device 
function fnConnect(UDID){
  return new Promise((resolve,reject)=>{
    const client = wdio.remote(opts);
    client.init(opts, (error) =>{
      if (error) {
        reject(new Error('Session did not start properly. Please make sure you sauce credentials are correct'));
      }    
    
    })
    .then(()=>{
      return(client);
    })   
    
  })
}


/// nice timeout function
function timeout(delay){
  logger.info("Running delay for : "+delay )
  return new Promise((resolve)=>{
    setTimeout(resolve,delay)
  })
}



function fnPermission(repeat,bValue,client){
  logger.info("Running fnPermission with number of repeats: "+ repeat+" and value: "+bValue)
  if(bValue===null){
    return true;
  }
  let iCounter = 0;
  const attempt = () => fnPermssionOnce(iCounter,bValue,client).catch(err => {
      console.log(err.message);
      iCounter++;
      if (iCounter === repeat) {
          // Failed, out of retries
          logger.info("Couldnt find permission screen: "+bValue+" in "+ repeat +" repeats" )
          return Promise.reject( new Error("Couldnt find permission screen"));
      }
      // Retry 
      return attempt();
  });
  return attempt();    
}


function fnPermssionOnce(iCounter,bValue,client){
  return new Promise(resolve=>{
    let testId=0;
    let img;
    if(bValue===true){
      img=imgAllowButton;
    }
    else if(bValue===false){
      img=imgDenyButton; 
    }
    else{
      return true;
    }
    return client.screenshot()
      .then((data) => {            
        let buf = new Buffer(data.value, 'base64');
        let img1 = cv.imdecode(buf)
          let result = img1.matchTemplate(img, 5).minMaxLoc(); 

          if (result.maxVal >= 0.65) {
              // Fail
              
          }
          else{
            logger.info("WAiting for permission pop up#"+iCounter)
            const msg = "WAiting for permission pop up#"+iCounter;
            throw new Error(msg);
          }
          // All good
          logger.info("Found permission button going to click #"+iCounter)
          fnClick(img,client,repeats=5,"Click on permission button",0).then(()=>{
            resolve();
          });
          
        

    });    
  })

}



/// main loading function 
function fnLoading(repeat,client){
  let iCounter = 0;
  const attempt = () => fnIsLoadingOnce(iCounter,client).catch(err => {
      console.log(err.message);
      iCounter++;
      if (iCounter === repeat) {
          // Failed, out of retries
          logger.info("Could not find loading screen")
          return Promise.reject( new Error("Couldnt find loading screen"));
      }
      // Retry 
      return attempt();
  });
  return attempt();      
}


// loading once //// used to repeat in fnLoading()
function fnIsLoadingOnce(iCounter,client){
  let testId=0;
  return client.screenshot()
    .then((data) => {            
      let buf = new Buffer(data.value, 'base64');
      let img1 = cv.imdecode(buf)
      for(var t=0; t<2; t++){
        let result = img1.matchTemplate(img2, 5).minMaxLoc(); 
        let result2 = img1.matchTemplate(img3, 5).minMaxLoc(); 

        if (result.maxVal >= 0.65) {
            // Fail
            testId=1;
            
        }
        else if(result2.maxVal>=0.65){
            testId=2;
        }
        else{
          logger.info("Still Loading #"+iCounter);
          const msg = "Still Loading #"+iCounter;
          throw new Error(msg);
        }
        // All good
        logger.info("Loading finished on  #"+iCounter +"repets");
        return testId;
      }

  });
}








/// clears keyboard 
function fnClearKeyBoard(client){
  logger.info("Running clear keyboard (click on x0y0");
  return new Promise((resolve,reject)=>{
    client.touchPerform([{
      action: 'tap',
      options: {
        x: 0,   // x offset
        y: 0,   // y offset
        count: 1 // number of touches
      }
      }])
    .then(()=>{
      logger.info("Keyboard cleared");
      resolve(true);
    }).catch((err)=>{
      reject(err);
    })
  })
}


//// main function to dettect if image is on screen
function fnIsOnScreen(img,client, repeats = 5, desc, wait = 2000) {
    logger.info("Looking for image on screen:" +desc +" with " + repeats + " repeats ");
    let iCounter = 0;
    let init = ()=> timeout(wait).then((asd)=>{
      const attempt = () => fnIsOnScreenOnce(img, desc, iCounter,client).catch(err => {
              console.log(err.message);
              iCounter++;
              if (iCounter === repeats) {
                  // Failed, out of retries
                  logger.info("Looking for image on screen #"+iCounter);
                  return Promise.reject("Object not found : " + desc);
                  throw new Error("Object not found : " + desc);
              }
              // Retry after waiting
              return attempt();
          });
          return attempt();      
    })
    return init();
    
   
}
/////// function used in fnIsOnScreen() to repeat 
function fnIsOnScreenOnce(img, desc,iCounter,client) {
  return client.screenshot()
    .then((data) => {
        
        let buf = new Buffer(data.value, 'base64');
        let img1 = cv.imdecode(buf)
        let result = img1.matchTemplate(img, 5).minMaxLoc(); 
        if (result.maxVal <= 0.65) {
            // Fail
            const msg = "Can't see object yet";
            throw new Error(iCounter === undefined ? msg : msg + " #" + iCounter+"->"+desc);
        }
        // All good
        logger.info("Found image on screen: "+desc);
        return result;
    });
}


////// functions used to click on elements -> find based on image -> template matching 

async function fnClick(img,client,repeats=5,desc,wait,offsetX=0,offsetY=0){
  try{
    logger.info("Running click event : "+desc+" with "+ repeats + "repets");
    let coordinates= await fnIsOnScreen(img,client,repeats,desc,wait);
    let xLocation=coordinates.maxLoc.x+(img.cols/2)+offsetX;
    let yLocation=coordinates.maxLoc.y+(img.rows/2)+offsetY;
    let performClick= await  client.touchPerform([{
        action: 'tap',
        options: {
            x: xLocation,   // x offset
            y: yLocation,   // y offset
            count: 1 // number of touches
        }
      }])
    logger.info("clicked on : "+desc +" with following coordinates x="+xLocation+" y="+yLocation);
    console.log("Click Performed: "+desc);
    return(true);
  }
  catch(err){
    console.log(err);
    throw (err)
  }
    
  
}

///// function that saves screenshots

function fnSaveScreenShot(client){

  console.log("Saving screenshot of passed test");
  return new Promise((resolve,reject)=>{
    client.screenshot().then((data)=>{
          SaveImage(data.value,__dirname+"/passedTest/Screenshot.png")
          .then((data)=>{
             resolve(true)   
          })
          .catch((err)=>{
            console.log(err);
          })
         
    })
  })
}


///// saves image -> used in fnSaveScreenShot() to save img
function SaveImage (imageData,imageName){
  return new Promise((resolve,reject)=>{
    let buf = new Buffer(imageData, 'base64');
    fs.writeFile(imageName, buf, (err) => {
      if (err){
        reject(err);
      }
      else{
        console.log('The file has been saved!');
        resolve(true);
      }

    });
  })

}

////////////////////////////////////TESTS/////////////////////////////////////////////


async function fnCleanInstall(client,appPackage,activityName,apkFileName){
  try{
    let logcat=await client.log('logcat')
    logger.info(logcat);
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

    loading=await fnLoading(40,client);
    logcat=await client.log('logcat')
    logger.info(logcat);
    client.end();
  }
  catch(err){
    client.end();
    throw err;
  }
}



async function fnLoginTest(client){
  console.log("Login test running");
  try{
    await fnClick(imgLoginEmail,client,5,"Email button",500);
    await fnClick(imgloginAgeConfirmYes,client,5,"Confirm Age button",2000);
    await fnClick(imgloginEnterEmail,client,5,"Enter Email",1200);
    client.keys("matusko.satara@gmail.com");
    await fnClearKeyBoard(client);
    await fnClick(imgloginYellowNextButton,client,5,"Next",500);
    await fnClick(imgLoginPassword,client,5,"enter Password",2000);
    client.keys("123123");
    await fnClearKeyBoard(client);
    await fnClick(imgloginYellowNextButton,client,5,"Next",500);
    await fnClick(imgloginAcceptConditions,client,5,"Accept Conditions",500);
    await fnClick(imgloginYellowNextButton,client,5,"Next",500);
    await fnClick(imgloginPassed,client,5,"x",500);
    await fnIsOnScreen(imgFriendsForEverX,client,25,"waiting for another loading (x)",2000);
    await fnClick(imgFriendsForEverX,client,5,"x",500);
    await fnClick(imgSettingsButton,client,5,"settings Button",500);
    await fnClick(imgLogOutButton,client,5,"Logout Button",500);
    await fnClick(imgBigOkButton,client,5,"big ok Button",500);
    await fnIsOnScreen(img3,client,20,"if on scree then test passed",4000);
    await fnSaveScreenShot(client);
    await client.end();
  }
  catch(err){
    client.end();
    throw err;
  }


}


async function fnLoginTest2(client){
  console.log("Login test running");
  try{
    await fnClick(img3,client,5,"login button",500);
    await fnClick(imgLoginEmail,client,5,"Email button",500);
    await fnClick(imgloginAgeConfirmYes,client,5,"Confirm Age button",2000);
    await fnClick(imgloginEnterEmail,client,5,"Enter Email",1200);
    client.keys("matusko.satara@gmail.com");
    await fnClearKeyBoard(client);
    await fnClick(imgloginYellowNextButton,client,5,"Next",500);
    await fnClick(imgLoginPassword,client,5,"enter Password",2000);
    client.keys("123123");
    await fnClearKeyBoard(client);
    await fnClick(imgloginYellowNextButton,client,5,"Next",500);
    await fnClick(imgFriendsForEverX,client,20,"x",500);
    await fnClick(imgSettingsButton,client,5,"settings Button",500);
    await fnClick(imgLogOutButton,client,5,"Logout Button",500);
    await fnClick(imgBigOkButton,client,5,"big ok Button",500);
    await fnIsOnScreen(img3,client,20,"if on scree then test passed",2000);
    await fnSaveScreenShot(client);
    client.end();
  }
  catch(err){
    client.end();
    throw err;
  }


}