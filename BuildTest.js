const fs =require("fs");
const cv = require('opencv4nodejs');




const buildScreenSize={
"deviceWidth":1440,
"deviceHeight":2560
}

const allDevices=[
{
"deviceName":"buildDevice",
"deviceUDID":"",
"deviceWidth":1440,
"deviceHeight":2560
},
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
}

]

let fileTemplate="const cv = require('opencv4nodejs');\n";
let imageTemplate="module.exports.{{imaneName}} = cv.imread(__dirname+'/Images/{{imageNameFull}}');"

const testName=process.argv[2];
fnBuildTest(testName);


async function fnBuildTest(testName){
try{
const testExist=fnDoesTestExists(testName,"js");
	if(testExist){
		let images=await fnLoadFiles(testName);
		for(var x=0; x<allDevices.length; x++){
			for(var y=0; y<images.length; y++){
				fnRescaleImage(testName,images[y],buildScreenSize.deviceHeight,allDevices[x].deviceHeight);
			}
		}



	}
	fs.writeFile(__dirname+'/Tests/'+testName+'/Images.js', fileTemplate, (err) => {
	  if (err) throw err;
	  console.log('The file has been saved!');
	});
}
catch(err){
console.log(err);
}

}

function fnLoadFiles(testName){
	let images=fs.readdirSync('Tests/'+testName+"/Images")
	return images;
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




function fnRescaleImage(testName,imageName,baseHeight,targetHeight){
	return new Promise(resolve=>{
		let imgTemplate=imageTemplate;
		let sourceImg=cv.imread(__dirname+"/Tests/"+testName+"/Images/"+imageName);
		let rescaleIndex=targetHeight/baseHeight;
		let rescaled=sourceImg.rescale(rescaleIndex);
		imageName=imageName.split(".");
		imageNameFull=imageName[0]+"_"+targetHeight
		imgTemplate=imgTemplate.replace("{{imaneName}}",imageNameFull);
		imgTemplate=imgTemplate.replace("{{imageNameFull}}",imageNameFull+".png");
		fileTemplate+="\n"+imgTemplate;
		cv.imwrite(__dirname+"/Tests/"+testName+"/Images/"+imageNameFull+".png", rescaled );	
	resolve(true);
	})

}



