const express = require('express');
const readline = require('readline');
const child_process = require('child_process');
const { exec } = require('child_process');
const fs =require("fs");
const moment = require('moment');
const app = express();
const iExpressPort=3211;
 iTestId=parseInt(require('./idCounter.json'));
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
app.get('/', (req, res) => {



})

fnCreateServer(port,bpPort)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){
    fnExecuteCommand(line);
})

app.listen(iExpressPort, () => console.log('Express started at port '+iExpressPort))


ON_DEATH(
	function(signal, err) {
	fs.writeFile("idCounter.json", iTestId, (err) => {
	  if (err) throw err;
	  console.log('The file has been saved!');
	  process.exit()
	})
})

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

					fnRunBundle(testName,UDID,desCaps,port,systemPort,bpPort)
					iTestId++;
					systemPort++;
					port++;
					bpPort++	

				}
			}
			else{
				// just one udid
				let UDID=serials;
				testName=JSON.parse(desCaps).testName;
				fnRunBundle(testName,UDID,desCaps,port,systemPort,bpPort)
				iTestId++;
				systemPort++;
				port++;
				bpPort++	

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

		let devices=await fnGetAllDevices();
		if(devices.length<1){
			console.log("0 devices found")
		}
		else{
			for(var r=0; r<devices.length; r++){
				let UDID=devices[r];
				testName=JSON.parse(desCaps).testName;
				fnRunBundle(testName,UDID,desCaps,port,systemPort,bpPort)
				iTestId++;
				systemPort++;
				port++;
				bpPort++	
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
		    	console.log(err);
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



function fnRunBundle(testName,UDID,desCaps,port,systemPort,bpPort){
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
	jGroupTestFormat.id=testId;
	jGroupTestFormat.testName=testName;
	runningTests.push(jGroupTestFormat);
	if(desCaps.groupTest){
    fnBlockLoop(desCaps.tests,desCaps, async function(desCaps,cb){ 

    	let testJsonExists= await fnDoesTestExists(desCaps.tests[iIndex].testFolder,"json").catch(err=>{});
    	if(testJsonExists){
    		testName=desCaps.tests[iIndex].testFolder;
    		var desCaps= await fnReadFile(__dirname+"/Tests/"+testName+"/"+testName+".json");
    		jStatusFormat.id=testIndex;
			jStatusFormat.UDID=UDID;
			jStatusFormat.testName=testName;
			jStatusFormat.timeStamp=await moment().format();
			jStatusFormat.port=port;
			jStatusFormat.status="Test not completed";
			desCaps=JSON.parse(desCaps);
			console.log(desCaps);
			systemPort++;
			port++;
			bpPort++
			iIndex++	
			
			runningTests[fnPushTestToGroupTest(testId)].tests.push(jStatusFormat);
			jStatusFormat.status=await fnRunOnce(desCaps.testName,UDID,desCaps,port,systemPort,bpPort);

		console.log("finished looping group")
    	}
    	else{
    		throw new Error("Test does not exists")
    	}

    } );
			
	}
	else if(!desCaps.groupTest){
		console.log("Single Test")

		jStatusFormat.id=iTestId;
		jStatusFormat.UDID=UDID;
		jStatusFormat.testName=testName;
		jStatusFormat.timeStamp=moment().format();
		jStatusFormat.port=port;
		iTestId++;
		systemPort++;
		port++;
		bpPort++
		jStatusFormat.status=fnRunOnce(testName,UDID,desCaps,port,systemPort,bpPort)
		runningTests.push(jStatusFormat);


	}
	else{
		return new Error("Failed to run  Test");
	}








}


function fnPushTestToGroupTest(groupID,testId){
	for(var x=runningTests.length-1; x>=0; x--){
		if(groupID===runningTests[x].id){
			return x
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
			

		});
		ls.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
			reject(data);
		});	

	})
}




function fnGroupTest(){

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




function fnCreateServer(port,bpPort){
  return new Promise((resolve,reject)=>{
    // logger.info('/home/trixo/Downloads/appium-1.8.0-beta3/build/lib/main.js -p '+port+' -bp' + bpPort+'  --log-timestamp --log /home/trixo/Code/javaRewrite/log'+port+'.txt');
    // logger.info("Trying to create appium Server on port: "+ port)
    let appiumPort=port
    let appiumServer=exec('/home/trixo/Downloads/appium-1.8.0-beta3/build/lib/main.js -p '+port+' -bp '+ bpPort+'  --log-timestamp --log /home/trixo/Code/javaRewrite/log'+port+'.txt');
    appiumServer.stdout.on('data', function(data) {
      if(data.indexOf("listener started ")!=-1){
        // logger.info("Appium server created on port: "+port )
        console.log("Server Created");
        resolve(true);
        
      }
    });
    appiumServer.stderr.on('data', function(data) {
      // logger.info("Appium err "+ data)
      reject(data)
    });
    appiumServer.on('close', function(code) {
            // logger.info("Appium on close  "+ code)
      reject(code);
    });
// ...

  })
}




