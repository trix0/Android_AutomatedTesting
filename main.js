const express = require('express');
const readline = require('readline');
const Swagger = require('swagger-client');
const SWAGGER_URL = 'http://localhost:7100/api/v1/swagger.json';
const AUTH_TOKEN  = '26cd01ab067140ec8f6934253c41eceba51ec96c0b1440f1a4fe1c6aa42c7507';
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
systemPort=8200;
port=4000;
bpPort=6000;
runningTests=[];
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


//fnStartStf("local");

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

fnGetAllDevices2();


async function fnExecuteCommand(data){

try{
	if(data.indexOf("run ")===0){ 
		console.log("recognized command run");
		let datasplit=data.split(" ");
		let serials=datasplit[1];
		let testName=datasplit[2];
		let testJsonExists= await fnDoesTestExists(testName,"json").catch(err=>{});
		let groupTestJsonExists= await fnDoesGroupTestExists(testName,"json").catch(err=>{});
		if(testJsonExists){
			var desCaps= await fnReadFile(__dirname+"/Tests/"+testName+"/"+testName+".json");
			console.log("normal")	
		}
		else if(groupTestJsonExists){
			var desCaps= await fnReadFile(__dirname+"/Tests/"+testName+".json");	
			console.log("group")
		}
		else{
			return new Error("Test Does not Exists!!!-> Make sure you enter correct test name")
		}

			
			//console.log(desCaps);
			if(serials.indexOf(",")> -1){
				// if there is more udids separated by comma
				serials=serials.split(",");
				for(var s=0; s<serials.length; s++){
					let UDID=serials[s];
					testName=JSON.parse(desCaps).testName;
					iTestId++
					fnRunBundle(testName,UDID,desCaps,port,systemPort,bpPort)


				}
			}
			else{
				// just one udid
				let UDID=serials;
				testName=JSON.parse(desCaps).testName;
				fnRunBundle(testName,UDID,desCaps,port,systemPort,bpPort)


			}

		// fnRunOnce(serial,port,systemPort,bpPort).catch(err=>{
		// 	throw err;
		// });

	}
	else if(data.indexOf("runOnAll")===0){
		let datasplit=data.split(" ");
		let testName=datasplit[1];


		let testJsonExists= await fnDoesTestExists(testName,"json").catch(err=>{});
		let groupTestJsonExists= await fnDoesGroupTestExists(testName,"json").catch(err=>{});
		if(testJsonExists){
			var desCaps= await fnReadFile(__dirname+"/Tests/"+testName+"/"+testName+".json");
			console.log("normal")	
		}
		else if(groupTestJsonExists){
			var desCaps= await fnReadFile(__dirname+"/Tests/"+testName+".json");	
			console.log("group")
		}
		else{
			return new Error("Test Does not Exists!!!-> Make sure you enter correct test name")
		}

		let devices=await fnGetAllDevices2();
			for(var r=0; r<devices.length; r++){
				if(devices[r]!=undefined){
					let UDID=devices[r];
					testName=JSON.parse(desCaps).testName;
					iTestId++
					fnRunBundle(testName,UDID,desCaps,port,systemPort,bpPort)					
				}	
					
				
		}
	





	}
	else if(data.indexOf("runG ")===0){
		console.log("Running Group Test")
	}
	else if(data.indexOf("runGAll")===0){
		console.log("Running Group Test on all devices")
	}
	else if(data.indexOf("help")===0){
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

async function getUsers (userIds) {
  const pArray = userIds.map(async userId => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  });
  const users = await Promise.all(pArray);
  // ... do some stuff
  return users;
}

function fnGetAllDevices2(){ // needs fix 
	return new Promise(async (resolve)=>{
		let stfUp=await fnIsStfUp();
		let adbDevices=await fnGetAllDevices();
		if(stfUp&&!adbDevices.length<1){

			const getDevices=await clientSwag.then((api)=>{
		      return api.devices.getDevices({fields: 'serial,present,ready,using,owner'})
		    }).catch(err=>{
		    	throw(err);
		    })
		    let allDevices=getDevices.obj.devices.map(async device=>{
		    	if(device.present&&device.ready&&!device.using){
		    		console.log("deviceeeee")
		    		return device.serial;
		    	}
		    	return;
		    })
		    const devices = await Promise.all(allDevices);
		    console.log(devices)
		    resolve(devices);
		}
	})


}




function fnGetAllDevices(){ // needs fix 
	return new Promise((resolve)=>{
		let availableDevices=[];
			exec('adb devices','',async(err, stdout, stderr)=>{

				let data=stdout.split(/\r?\n/);
				data.shift();
				for(var t=0; t<data.length; t++){
					if(data[t].indexOf("device")!=-1){
						let currentData=data[t].toString();
						currentData=currentData.replace("device","")
						currentData=currentData.replace("\t","")
						availableDevices.push(currentData);

					}

				}
				resolve(availableDevices);
			});			
	})



}


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

function fnDoesGroupTestExists(testName,fileType){
	return new Promise((resolve,reject)=>{
		fs.readFile('Tests/'+testName+"."+fileType,"utf-8",(err, data) => {  
		    if (err){
		    	console.log(err);
		    	reject(new Error("File does not exists"));
		    }
		    else{
		    	resolve(true)
		    }
		});
	})
}



async function fnRunBundle(testName,UDID,desCaps){
	return new Promise(async (resolve,reject)=>{
		try{

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
				desCaps=JSON.parse(desCaps);
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
					systemPort++;
					port++;
					bpPort++
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
					
					jStatusFormat.status, runStatus=await fnRunOnce(desCaps.testName,UDID,desCaps,port,systemPort,bpPort);
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
				jStatusFormat.status=await fnRunOnce(testName,UDID,desCaps,port,systemPort,bpPort)


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


function fnPushTestToGroupTest(groupID,testId){
	for(var x=runningTests.length-1; x>=0; x--){
		if(groupID===runningTests[x].id){
			return x
			break;
		}
	}

}

function fnChangeTestProperty(groupID,testId,field,value){
	for(var x=runningTests.length-1; x>=0; x--){
		if(groupID===runningTests[x].id){
			let groupsTests=runningTests[x].tests;
			for(var y=groupsTests.length-1; y>=0; y--){
				if(groupsTests[y].id===testId){
					runningTests[x].tests[y][field]=value;
					console.log(runningTests[x].tests[y]);
					break;
				}
			}

			break;
		}
	}

}


function fnRunOnce(testName,UDID,desCaps,port,systemPort,bpPort){

	return new Promise((resolve,reject)=>{
		let jCustomOpt=
					{
						"testName":testName,
						"UDID":UDID,
						"port":port,
						"systemPort":systemPort,
						"bpPort":bpPort,
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






function timeout(delay){
  return new Promise((resolve)=>{
    setTimeout(resolve,delay)
  })
}





function timeoutTest(delay){
  return new Promise((resolve)=>{
  	console.log("testing")
    setTimeout(resolve,delay)
  })
}

async function fnBlockLoop(input,param,func){
    for(const item of input){
        let funct = await func(param);
    }
}





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

async function fnStfCheck(serial,repeats,repeatDelay){
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



function fnLoadTestNumber(){

	let testNumber=fs.readFileSync('./idCounter','utf-8');
	if(!parseInt(testNumber)){
		return 0;
	}
	else{
		return parseInt(testNumber);
	}
}




async function fnIsPortFree(port){
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