const Swagger = require('swagger-client');
const { exec } = require('child_process');
const wdio = require('webdriverio');
const SWAGGER_URL = 'http://localhost:7100/api/v1/swagger.json'
const AUTH_TOKEN  = '2a317fbae0e5495582e4a8388329d7518e1fc7874abb40fc8940d18ad593a5f1';
const { performance } = require('perf_hooks');
const fs =require("fs");
const cv = require('opencv4nodejs');
const winston = require('winston');

const jArguments=JSON.parse(process.argv[2]);
console.log(jArguments);
console.log("passin data____________")
let testName=jArguments.desCaps.testName;
const logger = new winston.Logger({
    level: 'info',
    transports: [
      new winston.transports.Console({
        timestamp: true
      }),
      new winston.transports.File({
        filename: __dirname+'/logs/app'+ jArguments.port+'.log',
        timestamp: true,
        prettyPrint : true,
        json:false,
      })
    ]
  });
imgAllowButton = cv.imread(__dirname+'/autoTest/allowButton.png');
imgDenyButton = cv.imread(__dirname+'/autoTest/denyButton.png');
imgAllowButton_1 = cv.imread(__dirname+'/autoTest/allowButton_1.png');
imgDenyButton_1 = cv.imread(__dirname+'/autoTest/denyButton_1.png');




logger.info('Test execution started');
logger.info("Got following options to run"+ JSON.stringify(jArguments))



let desCaps=jArguments.desCaps;
let testFileName=desCaps.testFileName;
let test = require('./Tests/'+testFileName+'/'+testFileName)(timeout,fnClickScalable,fnScalingDetect,fnScalingDetectOnce,fnIsOnScreenOnceScalable,fnIsOnScreenScalable,fnWriteValue,fnWriteValueOnce,fnPermissionId,fnPermission,fnPermssionOnce,fnLoading,fnIsLoadingOnce,fnClearKeyBoard,fnIsOnScreen,fnIsOnScreenOnce,fnClick,fnSaveScreenShot,SaveImage,fnTestFinish,fnTestFinishOnce,testName,logger);

console.log(desCaps.parameters)
console.log("____________________________argument")

//////////// capabilities options for appium//////////
let opts = {
      port: jArguments.port,
      desiredCapabilities:desCaps.desiredCapabilities
};


///// swagger client to authoriize openSTF/////////////
const clientSwag = new Swagger({
  url: SWAGGER_URL
, usePromise: true
, authorizations: {
    accessTokenAuth: new Swagger.ApiKeyAuthorization('Authorization', 'Bearer ' + AUTH_TOKEN, 'header')
  }
})






const serial = jArguments.UDID;          /////////// serial number of phone





console.log("serial:"+serial)





fnInit(); // entry point


















async function fnInit(){
  let UDID;
  try{
    UDID=await fnConnectStf(serial); /////////////connect to stf -> returns UDID 7
    opts.desiredCapabilities.udid=UDID                    //////////assign udid





    const client =wdio.remote(opts);       //getting appium client connection
    process.on('SIGINT', ()=>{
      client.end();
      fnDisconnect(UDID);  // disconnects from open stf
    });
    //await fnLoginTest(client);

    await test.run(client,desCaps.parameters).catch(err=>{
      logger.info("ERROR[MyERr]: TEST FINISHED WITH ERROR: "+err)
    }); // runs test
    await fnDisconnect(UDID);

    //await fnCleanInstall(client,"com.pointvoucher.playlondonpv","com.unity3d.player.UnityPlayerActivity","pl");
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




function fnWriteValue(client,value,expectedValue,repeats,selector){
iCounter=0;
let write= ()=> fnWriteValueOnce(client,value,expectedValue,selector).catch(err=>{
  console.log(err);
  iCounter++;
  if(iCounter==repeats){
    return Promise.reject("Could write correct Value")
  }
  return write();
});
return write();
}












async function fnWriteValueOnce(client,value,expectedValue,selector){
  if(selector===undefined){
    selector="android=new UiSelector().className(\"android.widget.EditText\")";
  }
  await client.keys(value);
  console.log("Iam out here")
  return client.getText(selector).then(data=>{

    if(!expectedValue.test(data)){
      throw new Error("Value is not correct")
    }
    return(true); 
})

  

}
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
    const createServer=await fnCreateServer(opts.port,jArguments.bpPort);
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
      })
    })
  })


}
/// creates appium server on port from opts 
function fnCreateServer(port,bpPort){
  return new Promise((resolve,reject)=>{
    logger.info('/home/trixo/Downloads/appium-1.8.0-beta3/build/lib/main.js -p '+port+' -bp' + bpPort+'  --log-timestamp --log /home/trixo/Code/javaRewrite/log'+port+'.txt');
    logger.info("Trying to create appium Server on port: "+ port)
    let appiumPort=port
    let appiumServer=exec('/home/trixo/Downloads/appium-1.8.0-beta3/build/lib/main.js -p '+port+' -bp '+ bpPort+'  --log-timestamp --log /home/trixo/Code/javaRewrite/log'+port+'.txt');
    appiumServer.stdout.on('data', function(data) {
      if(data.indexOf("listener started ")!=-1){
        logger.info("Appium server created on port: "+port )
        console.log("Server Created");
        resolve(true);
        
      }
    });
    appiumServer.stderr.on('data', function(data) {
      //logger.info("Appium err "+ data)
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





async function fnPermissionId(bValue,client){
  logger.info("Running fnPermission with value: "+bValue)
  if(bValue===null){
    return true;
  }
  else if(bValue === true){
    await client.click('android=new UiSelector().resourceId("com.android.packageinstaller:id/permission_allow_button")');
                                                                
  }
  else{
    await client.click('android=new UiSelector().resourceId("com.android.packageinstaller:id/permission_deny_button")');
  }
}




function fnPermission(repeat,bValue,client){
  logger.info("Running fnPermission with number of repeats: "+ repeat+" and value: "+bValue)
  let iCounter = 0;
  if(bValue===null){
    return true;
  }
  const attempt = () => fnPermssionOnce(iCounter,bValue,client).catch(err => {
      console.log(err.message+"Iam here");
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
    let passedPerm=false;
    let testId=0;
    let img;
    if(bValue===true){
      img=[imgAllowButton,imgAllowButton_1];
    }
    else if(bValue===false){
      img=[imgDenyButton,imgDenyButton_1]; 
    }
    else{
      return true;
    }
    return client.screenshot()
      .then((data) => {            
        let buf = new Buffer(data.value, 'base64');
        let img1 = cv.imdecode(buf)
        for(var x=0; x<img.length; x++){
          let result = img1.matchTemplate(img[x], 5).minMaxLoc(); 
          console.log(result);
          if (result.maxVal >= 0.65) {
            // All good

            logger.info("Found permission button going to click #"+iCounter)
            fnClick(img[x],client,repeats=5,"Click on permission button",0).then(()=>{
            return true;
            });
            break;
              //ok
              
          }
          else if(x==img.length-1){
            logger.info("WAiting for permission pop up#"+iCounter)
            const msg = "WAiting for permission pop up#"+iCounter;
            throw new Error(msg);            
          }
          else{

          }


        }


        

    });    

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
    .then(async (data) => {            
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

        return testId

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
function fnIsOnScreen(img,client, repeats = 5, desc, wait = 2000,repeatDelay) {
    logger.info("Looking for image on screen:" +desc +" with " + repeats + " repeats ");
    let iCounter = 0;
    let init = ()=> timeout(wait).then((asd)=>{
      const attempt = () => fnIsOnScreenOnce(img, desc, iCounter,client,repeatDelay).catch(err => {
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
async function fnIsOnScreenOnce(img, desc,iCounter,client,repeatDelay=0) {
  await timeout(repeatDelay);
  let screenshot= await client.screenshot()
        
  let buf = new Buffer(screenshot.value, 'base64');
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
}
















function fnIsOnScreenScalable(img,client, repeats = 5, desc,scaleCounter,scaleAmount, wait = 2000,repeatDelay) {
    logger.info("Looking for image on screen:" +desc +" with " + repeats + " repeats ");
    let iCounter = 0;
    let init = ()=> timeout(wait).then((asd)=>{
      const attempt = () => fnIsOnScreenOnceScalable(img, desc,scaleCounter,scaleAmount,iCounter,client,repeatDelay).catch(err => {
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
async function fnIsOnScreenOnceScalable(img, desc,scaleCounter,scaleAmount,iCounter,client,repeatDelay=0) {
  await timeout(repeatDelay);
  let screenshot= await client.screenshot()
        
  let buf = new Buffer(screenshot.value, 'base64');
  let img1 = cv.imdecode(buf)
  let scalDetect= await fnScalingDetect(img,img1,scaleCounter,scaleAmount);
  if(scalDetect==false){
    const msg = "Can't see object yet";
    throw new Error(iCounter === undefined ? msg : msg + " #" + iCounter+"->"+desc)
  }
 
        // All good
        logger.info("Found image on screen: "+desc);
        console.log(scalDetect);
        console.log("Found it");
        return scalDetect;
}


function fnScalingDetect(img,img2,repeats,scaleAmount){
  let iCounter=0;
  let func=()=> fnScalingDetectOnce(img,img2,scaleAmount).catch((err)=>{
    iCounter++;
    console.log(err);
    if(iCounter>=repeats){
      return Promise.reject(false)
    }
    img=err;
    return func()
  })
  return func();
}

function fnScalingDetectOnce(img,img1,scaleAmount){
  console.log(img)
  console.log("recived img")
return new Promise((resolve,reject)=>{
  let result = img1.matchTemplate(img, 5).minMaxLoc(); 
  if (result.maxVal <= 0.65) {
    let rescaled=img.rescale(scaleAmount);
      console.log(rescaled)
  console.log("rescaled img")
    reject(rescaled)
  }
  resolve(result);
})

}










//// main function to dettect if test finished
function fnTestFinish(img,client, repeats = 5, desc,testName, wait = 2000,repeatDelay) {
    logger.info("Looking for image on screen:" +desc +" with " + repeats + " repeats ");
    let iCounter = 0;
    let init = ()=> timeout(wait).then((asd)=>{
      const attempt = () => fnTestFinishOnce(img, desc, iCounter,client,testName,repeatDelay).catch(err => {
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

async function fnTestFinishOnce(img, desc,iCounter,client,testName,repeatDelay=0) {
  await timeout(repeatDelay);
  let screenshot= await client.screenshot()
        
  let buf = new Buffer(screenshot.value, 'base64');
  let img1 = cv.imdecode(buf)
  let result = img1.matchTemplate(img, 5).minMaxLoc(); 
  if (result.maxVal <= 0.65) {
      // Fail
      const msg = "Can't see object yet";
      throw new Error(iCounter === undefined ? msg : msg + " #" + iCounter+"->"+desc);
  }
        // All good
        logger.info("Found image on screen: "+desc);
        logger.info("Test:"+testName+"[FINISHED]");
        return result;
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


async function fnClickScalable(img,client,repeats=5,desc,scaleCounter,scaleAmount,wait,repeatDelay,offsetX=0,offsetY=0){
  try{
    logger.info("Running Scalaable click event : "+desc+" with "+ repeats + "repets");                     
    let coordinates= await fnIsOnScreenScalable(img,client, repeats, desc,scaleCounter,scaleAmount, wait,repeatDelay) 
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

    loading= await fnIsOnScreen(img2,client,20,"if on scree then test passed",6000,2000);
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
    const init=await client.init();    // appium init (lunch app)
    loading= await fnIsOnScreen(img2,client,20,"loading",6000,2000);
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
    const init=await client.init();    // appium init (lunch app)
    loading= await fnIsOnScreen(img3,client,20,"loading",6000,2000);
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