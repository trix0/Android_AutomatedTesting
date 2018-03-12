const express = require('express');
const readline = require('readline');
const Swagger = require('swagger-client');
const SWAGGER_URL = 'http://localhost:7100/api/v1/swagger.json';
const AUTH_TOKEN  = '2a317fbae0e5495582e4a8388329d7518e1fc7874abb40fc8940d18ad593a5f1';
const child_process = require('child_process');
const { exec } = require('child_process');
const fs =require("fs");
const moment = require('moment');
const app = express();
const portfinder = require('portfinder');
const iExpressPort=3211;
stfChecker=false;
iTestId=fnLoadTestNumber();
ON_DEATH = require('death')({uncaughtException: true}) 
global.systemPort=8200;
global.port=4000;
global.bpPort=6000;
runningTests=[]; // array of running tests
runningTestTemplate={
	"testId":1,
	"systemPort":1,
	"port":1,
	"bpPort":1,
	"testName":"TestName",
	"deviceUDID":"cd21ccc5",
	"passed":false,
}

ON_DEATH(
	function(signal, err) {
		console.log(err);
	fs.writeFile("idCounter", iTestId, (err) => {
	  if (err) throw err;
	  console.log('The file has been saved!');
	  process.exit()
	})
})



app.get('/', (req, res) => {



})



fnIsPortFree(7100).then(data=>{
	console.log(data);
});

///// swagger client to authoriize openSTF/////////////
const clientSwag = new Swagger({
  url: SWAGGER_URL
, usePromise: true
, authorizations: {
    accessTokenAuth: new Swagger.ApiKeyAuthorization('Authorization', 'Bearer ' + AUTH_TOKEN, 'header')
  }
})


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){
    fnExecuteCommand(line);
})

app.listen(iExpressPort, () => console.log('Express started at port '+iExpressPort))

fnGetAllDevices2().catch(err=>{
	console.log(err);
});


async function fnExecuteCommand(data){

try{
	// if there is run command 
	if(data.indexOf("run ")===0){ 
		console.log("recognized command run");
		let datasplit=data.split(" ");
		let serials=datasplit[1];
		let testName=datasplit[2];
		let testJsonExists= await fnDoesTestExists(testName,"json").catch(err=>{});
		let groupTestJsonExists= await fnDoesGroupTestExists(testName,"json").catch(err=>{});
		if(testJsonExists){
			var desCaps= await fnReadFile(__dirname+"/Tests/"+testName+"/"+testName+".json");
			console.log("Executing normal test")	
		}
		else if(groupTestJsonExists){
			var desCaps= await fnReadFile(__dirname+"/Tests/"+testName+".json");	
			console.log("Executing group test")
		}
		else{
			return new Error("Test Does not Exists!!!-> Make sure you entered correct test name")
		}
			// if there is more udids separated by comma
			if(serials.indexOf(",")> -1){
				serials=serials.split(",");
				let runID=0;
				desCaps=JSON.parse(desCaps);
				for(var s=0; s<serials.length; s++){
					let UDID=serials[s];
					testName=desCaps.testName;

					fnRunBundle(testName,UDID,desCaps,runID)
					runID++;
				}
			}
			// just one udid
			else{

				let UDID=serials;
				desCaps=JSON.parse(desCaps);
				testName=desCaps.testName;
				fnRunBundle(testName,UDID,desCaps,0)


			}
	}
	// if there is a runOnAll Command 
	else if(data.indexOf("runOnAll")===0){
		let datasplit=data.split(" ");
		let testName=datasplit[1];
		let testType="";

		let testJsonExists= await fnDoesTestExists(testName,"json").catch(err=>{}); // checks if test exists
		let groupTestJsonExists= await fnDoesGroupTestExists(testName,"json").catch(err=>{
			console.log("asd")
		});// checks if group test exists
		if(testJsonExists){
			var desCaps= await fnReadFile(__dirname+"/Tests/"+testName+"/"+testName+".json");
			console.log("normal")	
			testType="normal";
		}
		else if(groupTestJsonExists){
			var desCaps= await fnReadFile(__dirname+"/Tests/"+testName+".json");	
			console.log("group")
			testType="group";
		}
		else{

			throw new Error("Test Does not Exists!!!-> Make sure you entered correct test name")
		}

		let devices=await fnGetAllDevices2();
		let runID=0;
		desCaps=JSON.parse(desCaps);
			for(var r=0; r<devices.length; r++){
				if(devices[r]!=undefined){
					let UDID=devices[r];
					testName=desCaps.testName;
					console.log(desCaps)
					console.log("desCaps_______________")
					systemPort++;
					bpPort++;
					port++;
					fnRunBundle(testName,UDID,desCaps,runID)
					runID++;					
				}	
					
				
		}
	





	}
	// build test ( scale images, create images.js to export images )
	else if(data.indexOf("buildTest ")===0){
		let datasplit=data.split(" ");
		let testName=datasplit[1];
		fnBuildTest(testName);	
	}
	// show json output of all running tests
	else if(data.indexOf("Tests")===0){
		console.log(JSON.stringify(runningTests))
		return true;
	}
	else{
		console.log("Command not recognized");
	}

}
catch(err){
	console.log(err);
}


}




function fnReadFile(filePath){
	return new Promise(resolve=>{
		fs.readFile(filePath,"utf-8",((err,data)=>{
			if(err){
				throw err;
			}
			else{
				resolve(data);
			}
		}))
	})
}



// get all available devices
function fnGetAllDevices2(){ // needs fix 
	return new Promise(async (resolve)=>{
		try{
			let stfUp=await fnIsStfUp();
			if(stfUp){

				const getDevices=await clientSwag.then((api)=>{
			      return api.devices.getDevices({fields: 'serial,present,ready,using,owner'})
			    }).catch(err=>{
			    	throw(err);
			    })
			    let allDevices=getDevices.obj.devices.map(async device=>{
			    	if(device.present&&device.ready&&!device.using){
			    		return device.serial;
			    	}
			    	return;
			    })
			    const devices = await Promise.all(allDevices);
			    console.log(devices)
			    resolve(devices);
			}			
		}
		catch(err){
			console.log(err);
		}

	})


}


// build test (rescales images and builds images.js)
function fnBuildTest(testName){
	let aOptions=[__dirname+'/BuildTest.js',testName] 
	let path = "."
	let ls = child_process.spawn('node', aOptions,)

	ls.stdout.on('data', function (data) {
	    console.log(data.toString());

	});
	ls.stderr.on('data', (data) => {
	  console.log(`stderr: ${data}`);
	});	
}


// checks if test exists
function fnDoesTestExists(testName,fileType){
	return new Promise((resolve,reject)=>{
		fs.readFile('Tests/'+testName+"/"+testName+"."+fileType,"utf-8",(err, data) => {  
		    if (err){
		    	reject(new Error("File does not exists"));
		    }
		    else{
		    	resolve(true)
		    }
		});
	})
}

// checks if group test exists
function fnDoesGroupTestExists(testName,fileType){
	return new Promise((resolve,reject)=>{
		fs.readFile('Tests/'+testName+"."+fileType,"utf-8",(err, data) => {  
		    if (err){
		    	reject(new Error("File does not exists"));
		    }
		    else{
		    	resolve(true)
		    }
		});
	})
}


// all configuration for running a test
async function fnRunBundle(testName,UDID,desCaps,runID=0){

	return new Promise(async (resolve,reject)=>{
		try{
			console.log("runID:"+runID)
			let previousTestSkipValue;
			var iIndex=0;
			let jStatusFormat={
				"id":null,
				"UDID":"",
				"testName":"",
				"status":null,
				"timeStamp":"",
				"port":0
			}
			let jGroupTestFormat={
				"id":null,
				"testName":"",
				"tests":[]
			}
				
				iTestId++
				let testId=iTestId;
				let testIndex=0;


			if(desCaps.groupTest){

			jGroupTestFormat.id=testId;
			jGroupTestFormat.testName=testName;
			runningTests.push(jGroupTestFormat);
		    fnBlockLoop(desCaps.tests,desCaps, async function(desCaps,cb){ 
			jStatusFormat={
				"id":null,
				"UDID":"",
				"testName":"",
				"status":null,
				"timeStamp":"",
				"port":0
			}
		    	let testJsonExists= await fnDoesTestExists(desCaps.tests[iIndex].testFolder,"json").catch(err=>{});
		    	if(testJsonExists){
		    		testName=desCaps.tests[iIndex].testFolder;
		    		let groupTestCaps=desCaps;
		    		var desCaps= await fnReadFile(__dirname+"/Tests/"+testName+"/"+testName+".json");
		    		console.log("before port:"+port)
					let iSystemPort=systemPort+1;
					let iPort=port+1;
					let iBpPort=bpPort+1;
		    		systemPort++;
					port++;
					bpPort++
		    		console.log("after port:"+port)
					iIndex++	
		    		jStatusFormat.id=testIndex;
					testIndex++
					jStatusFormat.UDID=UDID;
					jStatusFormat.testName=testName;
					jStatusFormat.timeStamp=await moment().format();
					jStatusFormat.port=port;
					jStatusFormat.status="Test not completed";
					desCaps=JSON.parse(desCaps);
					let stfCheck=await fnStfCheck(UDID,20,2000);
					if(stfCheck===false){
						jStatusFormat.status="Could not reach device."
						runningTests[fnPushTestToGroupTest(testId)].tests.push(jStatusFormat);
						throw new Error("Could not reach device: "+UDID)
					}
					runningTests[fnPushTestToGroupTest(testId)].tests.push(jStatusFormat);

					let runStatus;
					if(desCaps.parameters.length>1){
					desCaps.parameters=desCaps.parameters[runID];
					}
					
					jStatusFormat.status, runStatus=await fnRunOnce(desCaps.testName,UDID,desCaps,iSystemPort,iPort,iBpPort,jGroupTestFormat.id,jStatusFormat.id);
					previousTestSkipValue=groupTestCaps.tests[iIndex-1].conitnueOnFail;
					if(previousTestSkipValue===false&&runStatus.indexOf("ERROR[MyERr]")>-1){
						console.log(previousTestSkipValue)
						console.log("We should stop group test Here")
						fnChangeTestProperty(testId,testIndex-1,"status","Test Failed: "+runStatus);
						throw new Error("Test Failed, Can not Continue")
					}
					else if(runStatus.indexOf("ERROR[MyERr]")>-1){
						fnChangeTestProperty(testId,testIndex-1,"status","Test Failed: "+runStatus);
					}
					else{
						fnChangeTestProperty(testId,testIndex-1,"status","Test Finished");	
					}
					
		    	}
		    	else{
		    		throw new Error("Test does not exists")
		    	}

		    } ).catch(err=>{
		    	console.log(err);
		    });
					
			}
			else if(!desCaps.groupTest){
				console.log("Single Test")
				let iSystemPort=systemPort+1;
				let iPort=port+1;
				let iBpPort=bpPort+1;
	    		systemPort++;
				port++;
				bpPort++
				iTestId++;
				jStatusFormat.id=iTestId;
				jStatusFormat.UDID=UDID;
				jStatusFormat.testName=testName;
				jStatusFormat.timeStamp=moment().format();
				jStatusFormat.port=port;
				jStatusFormat.status="Test not completed"
				let stfCheck=await fnStfCheck(UDID,20,2000);

				if(stfCheck===false){
					jStatusFormat.status="Could not reach device."
					runningTests.push(jStatusFormat);
					throw new Error("Could not reach device: "+UDID)
				}
				runningTests.push(jStatusFormat);
				console.log(desCaps);
				if(desCaps.parameters.length>1){
					desCaps.parameters=desCaps.parameters[runID];
				}
				console.log("desCaps________");
				console.log(desCaps);
				console.log("desCaps________");
				jStatusFormat.status=await fnRunOnce(testName,UDID,desCaps,iSystemPort,iPort,iBpPort,jStatusFormat.id)


			}
			else{
				return new Error("Failed to run  Test");
			}

		}
		catch(err){
			console.log(err)
		}		
	})


}


// push to array in group test to have test under 1 json object
function fnPushTestToGroupTest(groupID,testId){
	for(var x=runningTests.length-1; x>=0; x--){
		if(groupID===runningTests[x].id){
			return x
			break;
		}
	}

}

// changes test property based on test id and index
function fnChangeTestProperty(groupID,testId,field,value){
	for(var x=runningTests.length-1; x>=0; x--){
		if(groupID===runningTests[x].id){
			let groupsTests=runningTests[x].tests;
			for(var y=groupsTests.length-1; y>=0; y--){
				if(groupsTests[y].id===testId){
					runningTests[x].tests[y][field]=value;
					break;
				}
			}

			break;
		}
	}

}



// function which spawns child process and executes test
function fnRunOnce(testName,UDID,desCaps,iSystemPort,iPort,iBpPort,testID,testChildren=null){

	return new Promise((resolve,reject)=>{
		let jCustomOpt=
					{
						"testID":testID,
						"testChildren":testChildren,
						"testName":testName,
						"UDID":UDID,
						"port":iPort,
						"systemPort":iSystemPort,
						"bpPort":iBpPort,
						"desCaps":desCaps

					}
		jCustomOpt=JSON.stringify(jCustomOpt);
		let aOptions=['./connect.js',jCustomOpt]
		let ls = child_process.spawn('node', aOptions,)
		ls.stdout.on('data', function (data) {
			console.log(data.toString('utf8'));
			if(data.indexOf("Test:"+testName+"[FINISHED]")>-1){
				console.log("Promise Resolved after test")
				resolve("Finished");
					
			}
			else if(data.indexOf("ERROR[MyERr]")>-1){
				console.log("detected err")
				resolve(data.toString('utf8'))
			}
			

		});
		ls.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
			reject(data);
		});	

	})
}





// easy timeout
function timeout(delay){
  return new Promise((resolve)=>{
    setTimeout(resolve,delay)
  })
}






// block loop (in sequence)
async function fnBlockLoop(input,param,func){
    for(const item of input){
        let funct = await func(param);
    }
}




// checks if device accesable
function fnIsDeviceAccesable(serial,repeats,repeatDelay) {

    let iCounter = 0;

      const attempt = () => fnIsDeviceAccesableOnce(serial,repeatDelay).catch(err => {
              iCounter++;
              if (iCounter === repeats) {
                  // Failed, out of retries
                  return(false);
              }
              // Retry after waiting
              return attempt();
          });
          return attempt();  
     
    
   return attempt();
}

// used in fnIsDeviceAccesable
async function fnIsDeviceAccesableOnce(serial,repeatDelay){
await timeout(repeatDelay);
    const getDevices=await clientSwag.then((api)=>{
      return api.devices.getDeviceBySerial({
      serial: serial
      , fields: 'serial,present,ready,using,owner'
      })
    }).catch(err=>{
    	throw(err);
    })
    let device = getDevices.obj.device;

    const avaiDevices= await clientSwag.then(async (api)=>{
      if (!device.present || !device.ready ) {
        throw new Error('Device is not available')
      }
      else if(device.using){
      	// disconnect device here
      	await fnDisconnect(serial)
      	throw new Error('Trying disconect device')
      }

      
    });
    return (true);;
}


// check if stf is up and running -> used in fnStfCheck
async function fnIsStfUp(){
	return new Promise(async (resolve)=>{
		let CheckBool= await fnIsPortFree(7100);
		if(CheckBool){
			resolve(false);
		}
		else if(!CheckBool){
			resolve(true);
		}
		else{
			throw new Error("Stf Error");
		}
	})
}


// check if stf is up and running
async function fnStfCheck(serial,repeats,repeatDelay){
	console.log("stf check")
 let isUp=await fnIsStfUp();
 console.log(isUp+"isup")
 let deviceAcces=await fnIsDeviceAccesable(serial,repeats,repeatDelay);
 if(!isUp&&!stfChecker){
 	stfChecker=true;
 	let status=await fnStartStf("local")
 	if(!status){
 		return false;
 	}
 	stfChecker=false
 }
 else if(!deviceAcces){
 	console.log("Couldnt access device "+serial+" after "+ (repeatDelay*repeats)/1000 +"seconds ")
 	return false
 }
 return true
}


// should start stf if not running
function fnStartStf(url){
	return new Promise(resolve=>{
		let stf=exec("stf " + url);
		    stf.stdout.on('data', function(data) {

		    });
		    stf.stderr.on('data', function(data) {
		    	console.log(data+ " there")
		    	console.log(data.indexOf("Providing all"))
		    	if(data.indexOf("Providing all")!== -1){
		    		console.log("stf started")
		    		resolve(true);
		    	}
		    	return data;
		    });
		    stf.on('close', function(code) {
		    	    	console.log(code)
		    	return code
		    });		
	})
	
}


// loads test index from file at the beginning of file
function fnLoadTestNumber(){

	let testNumber=fs.readFileSync('./idCounter','utf-8');
	if(!parseInt(testNumber)){
		return 0;
	}
	else{
		return parseInt(testNumber);
	}
}



// checks if port is free -> does not work needs replace
async function fnIsPortFree(port){ // needs to be replace with soemthing else
	return new Promise(resolve=>{
		portfinder.basePort=port
			try{	
			 portfinder.getPort(function (err, freePort) {
		    //
			    if(port===freePort){
			    	resolve(true);
			    }
			    else{
			    	resolve(false);
			    }

		  	});
			}
			catch(err){
				console.log(err);
			}		
	})
	

}


// releases device to be available to use
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
        //logger.info("Device Des not exists"+ UDID+" => open STF ")
        throw new Error('Device Des not exists')
      }

      return api.user.deleteUserDeviceBySerial({
        serial: serial
      })
      .then(function(res) {
        if (!res.obj.success) {
         // logger.info("Could not disconnect "+UDID+" => open STF ")
          throw new Error('Could not disconnect to device: '+ res)

        }
        //logger.info("Disconnected "+UDID+"=> open STF ")
        console.log("Disconnected!")
      })
    })
  })


}