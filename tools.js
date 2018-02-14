
const cv = require('opencv4nodejs');
const imgAllowButton = cv.imread(__dirname+'/autoTest/allowButton.png');
const imgDenyButton = cv.imread(__dirname+'/autoTest/denyButton.png');



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



module.exports = {
    fnPermission: function(repeat,bValue,client,logger){
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
},
    otherMethod: function() {}
}

