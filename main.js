const express = require('express');
const readline = require('readline');
const child_process = require('child_process');
const { exec } = require('child_process');
const fs =require("fs");
const moment = require('moment');
const app = express();
const iExpressPort=3211;
let iTestId=parseInt(require('./idCounter.json'));
var ON_DEATH = require('death')({uncaughtException: true}) 
let systemPort=8200;
let port=4000;
let bpPort=6000;
let runningTests=[];
let runningTestTemplate={
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
					let UDID=devices[s];
					testName=JSON.parse(desCaps).testName;
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

		let devices=await fnGetAllDevices();
		if(devices.length<1){
			console.log("0 devices found")
		}
		else{
			console.log("play test");
			for(var r=0; r<devices.length; r++){
				let UDID=devices[r];
				testName=JSON.parse(desCaps).testName;
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
		console.log(runningTests)
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
				console.log(availableDevices);
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

	if(desCaps.groupTest){
		console.log(typeof desCaps.tests)
		console.log( desCaps.tests[0].testFolder)
    fnBlockLoop(desCaps.tests,desCaps, async function(desCaps){ 
    	let testJsonExists= await fnDoesTestExists(desCaps.tests[iIndex].testFolder,"json").catch(err=>{});
    	if(testJsonExists){
    		testName=desCaps.tests[iIndex].testFolder;
    		var desCaps= await fnReadFile(__dirname+"/Tests/"+testName+"/"+testName+".json");
    		jStatusFormat.id=iTestId;
			jStatusFormat.UDID=UDID;
			jStatusFormat.testName=testName;
			jStatusFormat.timeStamp=await moment().format();
			jStatusFormat.port=port;
			runningTests.push(jStatusFormat);
			console.log(UDID);
			jStatusFormat.status=await fnRunOnce(testName,UDID,desCaps,port,systemPort,bpPort)
			iTestId++;
			systemPort++;
			port++;
			bpPort++
			iIndex++	
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
		jStatusFormat.status=fnRunOnce(testName,UDID,desCaps,port,systemPort,bpPort)
		runningTests.push(jStatusFormat);
		iTestId++;
		systemPort++;
		port++;
		bpPort++

	}
	else{
		return new Error("Failed to run  Test");
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
			console.log(data.toString());
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








