var images = require('./Images.js');
					   module.exports = function(fn) {
	  				   		return {
	  						run:async function FirstEditorTest(client,testData,testOutput){
	    						try{
							        let testName=testData.desCaps.testName
							        params=testData.desCaps.parameters;
							        const init=await client.init();    // appium init (lunch app)
							        fn.logger.info('Running First editor Test');
							        //////////////////////////////////// THIS CODE IS MANDATORY -> LEAVE IT HERE
							        let imageSize=await client.windowHandleSize();
							        imageSize=imageSize.value.height;
							        //////////////////////////////////// THIS CODE IS MANDATORY -> LEAVE IT HERE


fnIsOnScreen(images["3hs25"+"_"+imageSize],client, 10, await loading, 5000,5000);
fnClick(images["5szbo"+"_"+imageSize],client,8,click on login,5000,0,0);
fn.fnSaveTestOutput(testOutput,testData.outputDir);
	        	 client.end();
	      	  }
		      catch(err){
		        fn.fnPushToOutputArray({'message':err})
		        fn.fnSaveTestOutput(testOutput,testData.outputDir);
		        client.end();
		        throw err;
		      }
		    }
		  }
		}
