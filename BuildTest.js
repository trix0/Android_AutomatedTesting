const fs =require("fs");
const cv = require('opencv4nodejs');



//// this is the screen size you build test on -> should be equal or bigger than the biggest device resolution -> cause we scale down 
const buildScreenSize={
"deviceWidth":1440,
"deviceHeight":2560
}



// list of all devices 
const allDevicesList=[
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
},
{
"deviceName":"Samsung Galaxy Tab 4",
"deviceUDID":"",
"deviceWidth":800,
"deviceHeight":1280
},
{
"deviceName":"Samsung Galaxy J7",
"deviceUDID":"",
"deviceWidth":720,
"deviceHeight":1280
},
{
"deviceName":"Samsung Galaxy S4",
"deviceUDID":"",
"deviceWidth":1080,
"deviceHeight":1920
},
{
"deviceName":"Samsung Galaxy S5",
"deviceUDID":"",
"deviceWidth":1080,
"deviceHeight":1920
},
{
"deviceName":"Samsung Galaxy S6",
"deviceUDID":"",
"deviceWidth":1440,
"deviceHeight":2560
},
{
"deviceName":"Samsung Galaxy S7",
"deviceUDID":"",
"deviceWidth":1440,
"deviceHeight":2560
},
{
"deviceName":"Xperia Z3 (D6653)",
"deviceUDID":"",
"deviceWidth":1080,
"deviceHeight":1920
},
]

// filter based on height 
let allDevices = allDevicesList.filter((device, index, self) =>
  index === self.findIndex((t) => (
    t.deviceHeight === device.deviceHeight
  ))
)

let fileTemplate="const cv = require('opencv4nodejs');\n";
let imageTemplate="module.exports.{{imaneName}} = cv.imread(__dirname+'/Images/{{imageNameFull}}');"

const testName=process.argv[2];
fnBuildTest(testName);


async function fnBuildTest(testName){
try{
const testExist=fnDoesTestExists(testName,"js");
	if(testExist){
		let images=await fnLoadFiles(testName);
		await fnBuildBaseImageNames(images);
		for(var x=0; x<allDevices.length; x++){
			for(var y=0; y<images.length; y++){
				await fnRescaleImage(testName,images[y],buildScreenSize.deviceHeight,allDevices[x].deviceHeight);
			}
		}



	}
	fs.writeFile(__dirname+'/Tests/'+testName+'/Images.js', fileTemplate, (err) => {
	  if (err) throw err;
	  console.log('Please manually verify that images are not corupted ');
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

async function fnBuildBaseImageNames(images){
	for(let image of images){
		let func=await (()=>{
			let imgTemplate=imageTemplate;
			let imageName=image.split(".");
			imgTemplate=imgTemplate.replace("{{imaneName}}",imageName[0]);
			imgTemplate=imgTemplate.replace("{{imageNameFull}}",imageName[0]+".png");
			fileTemplate+="\n"+imgTemplate;
		})();
	}

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



