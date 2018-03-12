const Swagger = require('swagger-client');
const { exec } = require('child_process');
const wdio = require('webdriverio');
const SWAGGER_URL = 'http://localhost:7100/api/v1/swagger.json'
const AUTH_TOKEN  = '2a317fbae0e5495582e4a8388329d7518e1fc7874abb40fc8940d18ad593a5f1';
const { performance } = require('perf_hooks');
const fs =require("fs");
const cv = require('opencv4nodejs');
const winston = require('winston');
let htmlTemplate = fs.readFileSync(__dirname+"/templateResult.html","utf-8");



const jArguments=JSON.parse(process.argv[2]);
console.log(jArguments);
console.log("passin data____________")
const outputDir=__dirname+"/logs/"+jArguments.testID+"_"+jArguments.desCaps.testFileName+"_"+jArguments.UDID;
jArguments.outputDir=outputDir;
const folder=fnCreateFolder(outputDir);
let testName=jArguments.desCaps.testName;


const logger = new winston.Logger({
    level: 'info',
    transports: [
      new winston.transports.Console({
        timestamp: true
      }),
      new winston.transports.File({
        filename:outputDir+'/CustomLog.log',
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

let fn={};
fn.timeout=timeout;
fn.fnScrollAndFind=fnScrollAndFind;
fn.fnScrollAndFindOnce=fnScrollAndFindOnce;
fn.fnClickScalable=fnClickScalable;
fn.fnScalingDetect=fnScalingDetect;
fn.fnScalingDetectOnce=fnScalingDetectOnce;
fn.fnIsOnScreenOnceScalable=fnIsOnScreenOnceScalable;
fn.fnIsOnScreenScalable=fnIsOnScreenScalable;
fn.fnWriteValue=fnWriteValue;
fn.fnWriteValueOnce=fnWriteValueOnce;
fn.fnPermissionId=fnPermissionId;
fn.fnPermssionOnce=fnPermssionOnce;
fn.fnClearKeyBoard=fnClearKeyBoard;
fn.fnIsOnScreen=fnIsOnScreen;
fn.fnIsOnScreenOnce=fnIsOnScreenOnce;
fn.fnClick=fnClick;
fn.fnSaveScreenShot=fnSaveScreenShot;
fn.SaveImage=SaveImage;
fn.fnTestFinish=fnTestFinish;
fn.fnTestFinishOnce=fnTestFinishOnce;
fn.testName=testName;
fn.logger=logger;
fn.fnPushToOutputArray=fnPushToOutputArray;
fn.fnMarkOnImage=fnMarkOnImage;
fn.fnSaveTestOutput=fnSaveTestOutput;

let desCaps=jArguments.desCaps;
let testFileName=desCaps.testFileName;
let test = require('./Tests/'+testFileName+'/'+testFileName)(fn);


//////////// capabilities options for appium//////////
let opts = {
      port: jArguments.port,
      desiredCapabilities:desCaps.desiredCapabilities
};
opts.desiredCapabilities.systemPort=jArguments.systemPort

///// swagger client to authoriize openSTF/////////////
const clientSwag = new Swagger({
  url: SWAGGER_URL
, usePromise: true
, authorizations: {
    accessTokenAuth: new Swagger.ApiKeyAuthorization('Authorization', 'Bearer ' + AUTH_TOKEN, 'header')
  }
})
const testOutput=jArguments;
testOutput.steps=[];


const serial = jArguments.UDID;          /////////// serial number of phone
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

    await test.run(client,jArguments,testOutput).catch(err=>{
      logger.info("ERROR[MyERr]: TEST FINISHED WITH ERROR: "+err)
    }); // runs test
    await fnDisconnect(UDID);

  }
  catch(err){
    fnDisconnect(UDID);
    throw err;
  }

}



//////////////////////// func def/////////////////////

function fnSaveTestOutput(object,path){
  console.log("saveing test output")
  object=JSON.stringify(object);
  htmlTemplate=htmlTemplate.replace("{{testData}}",object)
fs.writeFile(path+"/testOutput.html",htmlTemplate, (err) => {
  if (err) throw err;
  console.log('The file has been saved!');
});
}



function fnPushToOutputArray(object){
  testOutput.steps.push(object)
}

function fnMarkOnImage(screenshot,smallImg,result,outputFolder){
let random=Math.random().toString(36).substr(2, 5);
let point2=result.maxLoc;
let newPoint=cv.Point(point2.x+(smallImg.cols/2),point2.y+(smallImg.rows/2))
screenshot.drawCircle(newPoint, 50, cv.Vec(244, 66, 66) ,15,8,0)
screenshot.drawCircle(newPoint, 51, cv.Vec(0, 0, 0) ,5,8,0)
console.log("saving img:"+outputFolder+"/img_"+random+"a.png")
cv.imwrite (outputFolder+"/img_"+random+"a.png" ,screenshot)
return outputFolder+"/img_"+random+"a.png";
}



async function fnCreateFolder(path){
  try{
    console.log(path);
    fs.access(path, (err) => {
      if (!err) {
        throw new Error(path+' already exists');
      } 
      fs.mkdir(path, err=>{
        if(err){
          throw err; 
        }
        return path
       
      }); 
    })
  }
  catch(err){
    console.log(err);
  }
}









function fnScrollAndFind(img,client,deviceHeight,scrollAmount,movePosition,repeats,desc,wait,repeatDelay){
  if(deviceHeight>scrollAmount){
    let iCounter=0;
    let func=()=> fnScrollAndFindOnce(img, desc,iCounter,client).then(async data=>{

    let imagepath=fnMarkOnImage(data.screenshot,img,data,outputDir)
    let description={};
    description.action="scroll and find";
    description.desc=desc;
    description.repeats=repeats;
    description.wait=wait;
    description.img=imagepath;
    description.message="found "+desc+" on scrollable area";

    fnPushToOutputArray(description)

      if(movePosition>0){
        console.log(data.maxLoc);
        await client.touchAction(
        [
            { action: 'press', x: 0, y:data.maxLoc.y},
            { action: 'moveTo', x: 0, y: movePosition },
            { action: 'wait', ms: 500},
            'release',
        ])       
      }


    })
    .catch(async err => {
      console.log(err);
      iCounter++;
      if(iCounter==repeats){
        // we should scroll
        iCounter=0;
         await client.touchAction(
          [
              { action: 'press', x: 0, y:scrollAmount},
              { action: 'moveTo', x: 0, y: 1 },
              { action: 'wait', ms: 500},
              'release',
          ])
      }
      return func();

    })
    return func();   
  }
  logger.info(new Error("scrollAmount is Too Big"))
  throw new  Error("scrollAmount is Too Big");


}

async function fnScrollAndFindOnce(img, desc,iCounter,client){
  let screenshot= await client.screenshot()      
  let buf = new Buffer(screenshot.value, 'base64');
  let img1 = cv.imdecode(buf)
  let result = img1.matchTemplate(img, 5).minMaxLoc(); 
  result.screenshot=img1
  if (result.maxVal <= 0.65) {
      // Fail
      const msg = "Can't see object yet";
      throw new Error(iCounter === undefined ? msg : msg + " #" + iCounter+"->"+desc);
  }
        // All good
        logger.info("Found image on screen: "+desc);
        return result;
}




function fnIsOnScreen(img,client, repeats = 5, desc, wait = 2000,repeatDelay) {
    logger.info("Looking for image on screen:" +desc +" with " + repeats + " repeats ");
    let iCounter = 0;
    let init = ()=> timeout(wait).then((asd)=>{
      const attempt = () => fnIsOnScreenOnce(img, desc, iCounter,client,repeatDelay).then((data=>{
        let imagepath=fnMarkOnImage(data.screenshot,img,data,outputDir)
        let description={};
        description.action="Is image on screen ?";
        description.desc=desc;
        description.repeats=repeats;
        description.wait=wait;
        description.img=imagepath;
        description.message="is this correct element ? if is then it was found correctly";
        fnPushToOutputArray(description)
      return data;
      })).catch(err => {
              iCounter++;
              if (iCounter === repeats) {
                  // Failed, out of retries
                  logger.info("Object not found : " + desc);

                  let imagepath=fnMarkOnImage(err.value.screenshot,img,err.value,outputDir)
                  let description={};
                  description.action="Is image on screen ?";
                  description.desc=desc;
                  description.repeats=repeats;
                  description.wait=wait;
                  description.img=imagepath;
                  description.message="Could not find following image";
                  fnPushToOutputArray(description)
                  return Promise.reject("Object not found : " + desc);
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
  result.screenshot=img1;
  if (result.maxVal <= 0.65) {
      // Fail
      logger.info("Can't see "+desc+" yet");
      throw new MyError("Error!!!", result);
  }
        // All good
        console.log("result:"+result)
        logger.info("Found image on screen: "+desc);
        return result;
}




















//Needs to be implemented
// function fnScrollAndFindScalable(){
//   fnIsOnScreenScalable(img,client, repeats = 5, desc,scaleCounter,scaleAmount, wait = 2000,repeatDelay);
// }



function fnWriteValue(client,value,expectedValue,repeats,selector){
iCounter=0;
if(selector===undefined){
  selector="android=new UiSelector().className(\"android.widget.EditText\")";
 
}
let write= ()=> fnWriteValueOnce(client,value,expectedValue,selector).catch(err=>{
  console.log(err);
  iCounter++;
  if(iCounter==repeats){
    logger.info("Could not write correct Value" + value)
    return Promise.reject("Could not write correct Value")
  }
  let description={};
  description.action="write value and check if its correct: "+value;
  description.repeats=repeats;
  description.selector=selector;
  description.message="value '"+value+"' was written corectly"

  fnPushToOutputArray(description)
  return write();
});
return write();
}



async function fnWriteValueOnce(client,value,expectedValue,selector){

  await client.keys(value);
  return client.getText(selector).then(data=>{

    if(!expectedValue.test(data)){
      logger.info("Value is not correct -> repeating")
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
        console.log(err);
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
        logger.info("You are not owner of "+ UDID+" => open STF ")
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
    logger.info('/home/trixo/Downloads/appium-1.8.0-beta3/build/lib/main.js -p '+port+' -bp '+ bpPort+'  --log-timestamp --log '+outputDir+'/Appium.log');
    logger.info("Trying to create appium Server on port: "+ port)
    let appiumPort=port
    let appiumServer=exec('/home/trixo/Downloads/appium-1.8.0-beta3/build/lib/main.js -p '+port+' -bp '+ bpPort+'  --log-timestamp --log '+outputDir+'/Appium.log');
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
// function fnConnect(UDID){
//   return new Promise((resolve,reject)=>{
//     const client = wdio.remote(opts);
//     client.init(opts, (error) =>{
//       if (error) {
//         reject(new Error('Session did not start properly. Please make sure you sauce credentials are correct'));
//       }    
    
//     })
//     .then(()=>{
//       return(client);
//     })   
    
//   })
// }


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
      let description={};
      description.action="Clear keyboard";
      description.desc="Clearing keyboard";

      fnPushToOutputArray(description)
      resolve(true);
    }).catch((err)=>{
      reject(err);
    })
  })
}


//// main function to dettect if image is on screen


//  detecting elements that are not scaled same way the game interface is. // be care about scale counter and scaleAmount !!!!
function fnIsOnScreenScalable(img,client, repeats = 5, desc,scaleCounter,scaleAmount, wait = 2000,repeatDelay) {
    logger.info("Looking for image on screen:" +desc +" with " + repeats + " repeats ");
    let iCounter = 0;
    let init = ()=> timeout(wait).then((asd)=>{
      const attempt = () => fnIsOnScreenOnceScalable(img, desc,scaleCounter,scaleAmount,iCounter,client,repeatDelay).then((data)=>{
          let imagepath=fnMarkOnImage(data.screenshot,img,data,outputDir)
          let description={};
          description.action="is On screen scalable";
          description.desc=desc;
          description.repeats=repeats;
          description.wait=wait;
          description.img=imagepath;
          description.message=desc+" is on screen ";
          description.scaleCounter=scaleCounter
          description.scaleAmount=scaleAmount

          fnPushToOutputArray(description)
          return data        
      }).catch(err => {
              console.log(err.message+"I am here");
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

/////// function used in fnIsOnScreenScalable() to repeat 
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
        return scalDetect;
}

/// used in fnIsOnScreenOnceScalable -> scales the image down 
function fnScalingDetect(img,img2,repeats,scaleAmount){
  let iCounter=0;
  let func=()=> fnScalingDetectOnce(img,img2,scaleAmount).then((data)=>{
    return data;
  }).catch((err)=>{
    iCounter++;
    
    if(iCounter>=repeats){
      console.log(err);
      return Promise.reject(false)
    }
    img=err;
    return func()
  })
  return func();
}

// img = template
// img 1 = screenshot 
function fnScalingDetectOnce(img,img1,scaleAmount){
return new Promise((resolve,reject)=>{
    let result = img1.matchTemplate(img, 5).minMaxLoc();
    result.screenshot=img1
    console.log(result); 
    if (result.maxVal <= 0.65) {
      let rescaled=img.rescale(scaleAmount);
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
      const attempt = () => fnTestFinishOnce(img, desc, iCounter,client,testName,repeatDelay).then(async data=>{
        let imagepath=await fnMarkOnImage(data.screenshot,img,data,outputDir)
        let description={};
        description.action="Test Finish";
        description.desc=desc;
        description.repeats=repeats;
        description.wait=wait;
        description.img=imagepath;
        description.message="is this correct element ? if is then test passed";
         fnPushToOutputArray(description)
      }).catch(err => {

              iCounter++;
              if (iCounter === repeats) {
                  // Failed, out of retries
                  logger.info("Object not found : " + desc);

                  let imagepath=fnMarkOnImage(err.value.screenshot,img,err.value,outputDir)
                  let description={};
                  description.action="Test finish ?";
                  description.desc=desc;
                  description.repeats=repeats;
                  description.wait=wait;
                  description.img=imagepath;
                  description.message="Could not find end of the test";
                  fnPushToOutputArray(description)
                  return Promise.reject("Object not found : " + desc);
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
  result.screenshot=img1
  if (result.maxVal <= 0.65) {
      // Fail
      logger.info("Can't see "+desc+" yet");
      throw new MyError("cant see object", result);
  }
        // All good
        logger.info("Found image on screen: "+desc);
        logger.info("Test:"+testName+"[FINISHED]");
        return result;
}




////// functions used to click on elements -> find based on image -> template matching 
/// be care with offsets its not calculated based on screen size !
async function fnClick(img,client,repeats=5,desc,wait,offsetX=0,offsetY=0){
  try{
    logger.info("Running click event : "+desc+" with "+ repeats + "repets");
    let coordinates= await fnIsOnScreen(img,client,repeats,desc,wait);
    console.log(coordinates);
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
    let imagepath=fnMarkOnImage(coordinates.screenshot,img,coordinates,outputDir)
    let description={};
    description.action="click";
    description.desc=desc;
    description.repeats=repeats;
    description.wait=wait;
    description.img=imagepath;
    description.message="clicked on : "+desc +" with following coordinates x="+xLocation+" y="+yLocation;

    logger.info("clicked on : "+desc +" with following coordinates x="+xLocation+" y="+yLocation);
    fnPushToOutputArray(description)
    console.log("Click Performed: "+desc);
    return(true);
  }
  catch(err){
    console.log(err);
    throw (err)
  }
    
  
}

// scalable click function, be careful with scaleCounter and scaleAmount
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
    let imagepath=fnMarkOnImage(coordinates.screenshot,img,coordinates,outputDir)
    let description={};
    description.action="Click scalable";
    description.desc=desc;
    description.repeats=repeats;
    description.wait=wait;
    description.img=imagepath;
    description.message=desc+" clicked  ";
    description.scaleCounter=scaleCounter;
    description.scaleAmount=scaleAmount;

    fnPushToOutputArray(description)
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




class MyError extends Error {

    constructor(message, value) {
        super(message);
        this._value = value;
    }

    get value() {

        return this._value;

    }

}
