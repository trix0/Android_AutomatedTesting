const Swagger = require('swagger-client');
const { exec } = require('child_process');
const wdio = require('webdriverio');
const SWAGGER_URL = 'http://localhost:7100/api/v1/swagger.json'
const AUTH_TOKEN  = '26cd01ab067140ec8f6934253c41eceba51ec96c0b1440f1a4fe1c6aa42c7507';
const { performance } = require('perf_hooks');
const fs =require("fs");
const cv = require('opencv4nodejs');



///////////// images for img recognition////////////////////
const img2 = cv.imread('./autoTest/CreateAccount.png');
const img3 = cv.imread('./autoTest/LoginButton.png');
const imgAllowButton = cv.imread('./autoTest/allowButton.png');
const imgDenyButton = cv.imread('./autoTest/denyButton.png');
const imgLoginEmail = cv.imread('./autoTest/loginEmail.png');
const imgBigOkButton = cv.imread('./autoTest/bigOkButton.png');
const imgloginPassed = cv.imread('./autoTest/loginPassed.png');
const imgHideKeyboard = cv.imread('./autoTest/hideKeyBoard.png');
const imgLogOutButton = cv.imread('./autoTest/logOutYellow.png');
const imgloginPassed2 = cv.imread('./autoTest/login2finished.png');
const imgLoginPassword = cv.imread('./autoTest/loginPassword.png');
const imgSettingsButton = cv.imread('./autoTest/settingsButton.png');
const imgFriendsForEverX = cv.imread('./autoTest/friendsForEverX.png');
const imgloginPassLogout = cv.imread('./autoTest/loginTest1Finish.png');
const imgloginEnterEmail = cv.imread('./autoTest/loginEnterEmail.png');
const imgloginAgeConfirmYes = cv.imread('./autoTest/loginAgeConfirmYes.png');
const imgloginAcceptConditions = cv.imread('./autoTest/loginAcceptConditions.png');
const imgloginYellowNextButton = cv.imread('./autoTest/loginYellowNextButton.png');



//////////// capabilities options for appium//////////
const opts = {
      port: 4755,
      desiredCapabilities: {
        platformName: "Android",
        deviceName: "Android",
        //automationName: "uiautomator2",
        udid:"", //cd21ccc5 emulator-5554
        appPackage:"com.pointvoucher.playlondonpv",
        appActivity:"com.unity3d.player.UnityPlayerActivity",
        fullReset:false,
        noReset:false,/////////// false adds around 3Sec
        //noPermsCheck:true,
        //launch:true,
        //autoGrantPermissions:true,
        //disableAndroidWatchers:true,
        skipUnlock:true,
        noSign:true,
        //gpsEnabled:false,
        //ignoreUnimportantViews:true
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
const serial = "cd21ccc5"            /////////// serial number of phone

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
    await performance.mark('A'); 
    const init=await client.init();    // appium init (lunch app)
    await performance.mark('B'); 
    performance.measure('A to B', 'A', 'B');
    let measure = performance.getEntriesByName('A to B')[0];
    console.log("Loading Time "+measure.duration/1000+" s"); 
    await fnPermission(5,true,client);
    const loading=await fnLoading(40,client); // loading time 40 screenshots request afterwards error
    if(loading==1){
      console.log("running test1");
      const fnTest=await fnLoginTest(client);
    }
    else{
      console.log("running test 2");
      const fnTest=await fnLoginTest2(client);
    }

    
    await performance.mark('C'); 
    await fnDisconnect(UDID);
    performance.measure('A to C', 'A', 'C');
    measure = performance.getEntriesByName('A to C')[0];
    console.log("Test Finished in "+measure.duration/1000+" s"); 
  }
  catch(err){
    fnDisconnect(UDID);
    throw err;
  }

}



//////////////////////// func def/////////////////////


// conect to stf///
async function fnConnectStf(serial){
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
        throw new Error('Could not connect to device')
      }
      return api.user.remoteConnectUserDeviceBySerial({
        serial: device.serial
      })
    })
    const remoteConnectUDID= await (()=>{
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
        throw new Error('You are not owner')
      }

      return api.user.deleteUserDeviceBySerial({
        serial: serial
      })
      .then(function(res) {
        if (!res.obj.success) {
          throw new Error('Could not disconnect to device')

        }
        console.log("Disconnected!")
      })
    })
  })


}
/// creates appium server on port from opts 
function fnCreateServer(port){
  return new Promise((resolve,reject)=>{
    let appiumPort=port
    let appiumServer=exec('appium -p '+port+' --session-override --log-timestamp --log /home/trixo/Code/javaRewrite/log.txt');
    appiumServer.stdout.on('data', function(data) {
      if(data.indexOf("listener started ")!=-1){

        console.log("Server Created");
        resolve(true);
        
      }
    });
    appiumServer.stderr.on('data', function(data) {
      reject(data)
    });
    appiumServer.on('close', function(code) {
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
  return new Promise((resolve)=>{
    setTimeout(resolve,delay)
  })
}



function fnPermission(repeat,bValue,client){
  if(bValue===null){
    return true;
  }
  let iCounter = 0;
  const attempt = () => fnPermssionOnce(iCounter,bValue,client).catch(err => {
      console.log(err.message);
      iCounter++;
      if (iCounter === repeat) {
          // Failed, out of retries
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
            const msg = "WAiting for permission pop up#"+iCounter;
            throw new Error(msg);
          }
          // All good
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
          const msg = "Still Loading #"+iCounter;
          throw new Error(msg);
        }
        // All good
        return testId;
      }

  });
}








/// clears keyboard 
function fnClearKeyBoard(client){
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
      resolve(true);
    }).catch((err)=>{
      reject(err);
    })
  })
}


//// main function to dettect if image is on screen
function fnIsOnScreen(img,client, repeats = 5, desc, wait = 2000) {
    let iCounter = 0;
    let init = ()=> timeout(wait).then((asd)=>{
      const attempt = () => fnIsOnScreenOnce(img, desc, iCounter,client).catch(err => {
              console.log(err.message);
              iCounter++;
              if (iCounter === repeats) {
                  // Failed, out of retries
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
        return result;
    });
}


////// functions used to click on elements -> find based on image -> template matching 

async function fnClick(img,client,repeats=5,desc,wait,offsetX=0,offsetY=0){
  try{
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
          SaveImage(data.value,"passedTest/Screenshot.png")
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
    await fnIsOnScreen(img3,client,20,"if on scree then test passed",2000);
    await fnSaveScreenShot(client);
    client.end();
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
    await fnIsOnScreen(imgloginPassed2,client,20,"if on scree then test passed",2000);
    await fnSaveScreenShot(client);
    client.end();
  }
  catch(err){
    client.end();
    throw err;
  }


}