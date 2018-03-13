

Is used for automated testing for Unity games on Android using appium.
It provides eazy way to build,execute and monitor  tests.
Project uses template matching to find elements on screen.




## Dependencies
Appium 1.8.0-Beta
Open stf 

## Known Issues

stf check function does not work correctly.

## Usage Instructions

1. Install all dependencies and download project.
2. Create tests.
3. Build tests.
4. Execute Tests.
5. Check if tests passed.










## Create Tests

To create the test. Ceate the folder with a test name in folder "Tests"
* Example ("CleanInstall" or "FacebookLogin"). from now just testName

Every test folder consist of 2 main files and images.
Create "Images" folder in your Test folder(FacebookLogin or similar not in "Tests").
Thats the place where you have to store your images for the test.

1# required file is a json file. IT has to following name. testName.json where testName is a name of your test !!!! in this file you can  store all desired capabilities, diferent parameters for test and so on.(Check more on appium for desired capabilities). Parameters accepts array. If the parameters consist of array You are able to pass different parameters to tests.(useful for running Grouped tests with different paramters)
0 index of array to 1st executed test
1 index of array to 2nd executed test
...


Example:
```
{
"testName":"Clean Install",
"testFileName":"CleanInstall",
"groupTest":false,
"desiredCapabilities": {
        "platformName": "Android",
        "deviceName": "Android",
        "appPackage":"com.gorro.nothing",
        "appActivity":"com.gorro.nothing.NothingActivity",
        "fullReset":false,
	"noReset":true,
        "newCommandTimeout":120000,
        "skipUnlock":true,
        "androidInstallTimeout":150000
      },
"parameters":[{
	"appPackage":"com.pointvoucher.playlondonpv",
	"activityName":"com.unity3d.player.UnityPlayerActivity",
	"apkFileName":"pl"
},
{
    "appPackage":"com.pointvoucher.playlondonpv",
    "activityName":"com.unity3d.player.UnityPlayerActivity",
    "apkFileName":"pl"
}
]

}
```
2# required file is testName.js This file consist of javascript code which is executed.
+ images is a variable where all of your images are stored.
+ fn is variable where all functions are. You can call it with fn.functionName()
+ testData are all test data for current test-> you can find parameters in here
+ imageSize is needed to determine which size of images to use. 
⋅⋅* Platform uses prebuild images for image recognition( There are as well scaling functions but try to avoid them).


Example:
```
var images = require('./Images.js');
module.exports = function(fn) {
  return {
  run:async function PlayLondnoShop(client,testData,testOutput){
    try{

        let testName=testData.desCaps.testName
        params=testData.desCaps.parameters;
        const init=await client.init();    // appium init (lunch app)

        fn.logger.info("Play london shop test");

        //////////////////////////////////// THIS CODE IS MANDATORY -> LEAVE IT HERE
        let imageSize=await client.windowHandleSize();
        imageSize=imageSize.value.height;
        //////////////////////////////////// THIS CODE IS MANDATORY -> LEAVE IT HERE
        await fn.fnIsOnScreen(images["Login"+"_"+imageSize],client,20,"If on screen then app Loaded,Logout state true",4000,2000);
        await fn.fnClick(images["Login"+"_"+imageSize],client,5,"Click Login button",2000);

        await fn.fnClick(images["EmailLoginButton"+"_"+imageSize],client,5,"Click Email Login button",2000);
        await fn.fnClick(images["YesButton"+"_"+imageSize],client,5,"Click Yes age button",2000);
        await fn.fnClick(images["EnterEmailField"+"_"+imageSize],client,5,"Click on Enter Email field",2000);
        await client.keys("msa@pointvoucher.com");
        fn.fnPushToOutputArray({"message":"sends keys:msa@pointvoucher.com"})
        await fn.fnClearKeyBoard(client);
        await fn.fnClick(images["EmailNextButton"+"_"+imageSize],client,5,"Next email",500);
        await fn.fnClick(images["EnterPasswordField"+"_"+imageSize],client,5,"Click on Enter Password field",2000);
        await client.keys("123123");
        fn.fnPushToOutputArray({"message":"sends keys:123123"})
        await fn.fnClearKeyBoard(client);
        await fn.fnClick(images["PasswordNextButton"+"_"+imageSize],client,5,"Next password",100);
        //await fnClick(images["AcceptTermsCircle"+"_"+imageSize],client,5,"Accept terms circle",500);
        //await fnClick(images["TermsNextButton"+"_"+imageSize],client,5,"terms next button",500);           

        await fn.fnIsOnScreen(images["CoinsIndicator"+"_"+imageSize],client,20,"If 0 coins then looged in",1000);
        
        //await fnClick(images["x_OverIntroVideo"+"_"+imageSize],client,5," x Button  ",5000);
        await fn.fnClick(images["BackArrow"+"_"+imageSize],client,5,"back arrow button ",500);
        await fn.fnClick(images["VoucherShop"+"_"+imageSize],client,10,"Voucher shop button ",5000);
        await fn.fnIsOnScreen(images["VoucherShopIsOpenned"+"_"+imageSize],client,20,"Voucher shop openned",1000);
        await fn.fnClick(images["CloseShopButton"+"_"+imageSize],client,5,"close voucher shop",500);
        await fn.fnIsOnScreen(images["HubIcons"+"_"+imageSize],client,20,"check if we are in hub",1000);
        await fn.fnClick(images["CoinsButton"+"_"+imageSize],client,5," on coins",500);
        await fn.fnClick(images["LetsGoButton"+"_"+imageSize],client,5,"LEts go button",500);
        await fn.fnIsOnScreen(images["VoucherShopIsOpenned"+"_"+imageSize],client,20,"voucher shop openned",1000);
        await fn.fnClick(images["CloseShopButton"+"_"+imageSize],client,5,"close voucher shop ",500);
        await fn.fnIsOnScreen(images["YourVouchers"+"_"+imageSize],client,20,"are we in your vouchers",1000);
        await fn.fnClick(images["x_OverIntroVideo"+"_"+imageSize],client,5," x Button  ",5000);
        await fn.fnClick(images["SettingsButton"+"_"+imageSize],client,5,"Settings Button ",500);
        await fn.fnClick(images["LogoutButton"+"_"+imageSize],client,5,"Logout Button ",500);
        await fn.fnClick(images["BigOkLogout"+"_"+imageSize],client,5,"Big Ok Logout button ",500);
        await fn.fnClick(images["x_OverIntroVideo"+"_"+imageSize],client,10," x Button  ",2000);
        await fn.fnTestFinish(images["Login"+"_"+imageSize],client,20,"Logout status correct",testName,6000,2000);
        fn.fnSaveTestOutput(testOutput,testData.outputDir);
        client.end();
      }

      catch(err){
        fn.fnPushToOutputArray({"message":err})
        fn.fnSaveTestOutput(testOutput,testData.outputDir);
        client.end();
        throw err;
      }
    }
  }
}
```




## Build tests

Every test has to be prebuild in order to create all the images and image exports.

In main folder there is a file called "BuildTest.js". Please file all your available devices into that file in order to build correct sizes.

Build Screen size should be the biggest device you have available for the testing.
```
const buildScreenSize={
"deviceWidth":1440,
"deviceHeight":2560
}
```

allDevicesList consist all of your available devices. Make sure to fill width and height of screen correctly.


```
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
}
]
```
To build a test all you need to do is to have all the files from  Create Tests and images inside Images folder.

Then you simply lunch app by "node main" and run following command:


```
buildTest YourTestName
```

### The server start window

#### Starting a simple server

![Start a basic server](docs/images/screen-start-simple.png)

When you open Appium Desktop, you are greeted with the server start window. The
basic option is to start an Appium server with all its defaults and the ability
to modify the host and port. The start button will also let you know which
version of the Appium server you are running, which can be useful when
reporting issues to the Appium team.

#### Starting a server with advanced options

![Start an advanced server](docs/images/screen-start-advanced.png)

By clicking on the 'Advanced' tab, you have the ability to set all the server
flags that are available in Appium. This is for advanced users and should only
be modified after consulting the Appium documentation.

#### Server presets

![Server presets](docs/images/screen-start-presets.png)

If you use the advanced server options, you have the ability to save
a configuration for later use. Simply save the preset on the 'Advanced' tab,
and you will subsequently be able to recall and start the server with that
configuration from the 'Preset' tab.

### The server console output window

Once you start the server, it will launch on the host and port you specified,
and open a new window displaying the server log output.

![Server console](docs/images/screen-logs.png)

This is fairly straightforward and no real interaction is possible, beyond
using the button to stop the server. You can also copy-and-paste the logs from
this window which is useful in reporting Appium issues.

One other button is available: 'Start New Session'. Clicking this will open up
the New Session window enabling you to start an Inspector session on the
currently-running server.

### The New Session window

The New Session window allows you to construct a set of Appium desired
capabilities used to launch an Appium session. You can launch a session against
the currently-running Appium Desktop server (which is the default), or you can
launch a session against a variety of other endpoints.

![New session window](docs/images/screen-new-session.png)

Since it's not required to run against Appium Desktop's own server, you can get
to the New Session window without starting an Appium Desktop server. Simply go
to "File" (Windows/Linux) or "Appium" (Mac) and choose "New Session...", which
will open the New Session window without having to start a local server. In
this case, attaching to the local server will be disabled.

#### Appium Endpoints

These are the options for launching a session against a non-local Appium server:

* A custom host/port configuration: this is useful if you want to launch an Inspector session against an Appium server running on another machine in your network, for example.
* Sauce Labs: if you don't have access to, say, iOS simulators on your machine, you can leverage your [Sauce Labs](https://saucelabs.com) account to start an Appium session in the cloud.
* TestObject: you can also utilize [TestObject](https://testobject.com)'s cloud of real devices for a real device-based Inspector session.

It should be straightforward to get set up with any of these options. Simply
enter your details in the input fields provided.

#### Desired Capabilities

Desired capabilities are how you configure your Appium session. They tell the
Appium server what kind of platform and app you want to automate. If you are
unfamiliar with the concept of desired capabilities, or which desired
capabilities are required to launch Appium sessions of various types, you
should consult the Appium documentation.

Appium Desktop does not restrict your creation of desired capabilities in any
way, nor will it validate them for you. It simply provides a nice UI for
entering them in, and saving them for later use. Under the 'Desired
Capabilities' tab, you can use the form fields and '+' button to enter as many
desired capabilities as you need. You will also see a representation of the
resulting JSON, which is what is actually sent to the Appium server. This can
be useful for verifying your capabilities, or for copy-and-pasting when
reporting issues.

Once you have set your desired capabilities, you might wish to save them so you
can run the same type of session later. Simply click the 'Save As...' button to
give your capability set a name. You can then access it under the 'Saved
Capability Sets' tab, for later editing or session launching.

Once your server type and capabilities are set, click 'Start Session' to launch
the Appium Desktop Inspector.

#### Attach to an Existing Session

If you click on the "Attach to Session..." tab, you can select an existing
session from a list of currently running sessions on your selected server, or you
can input a session ID of a currently-running session.  That session should be
running on the server details you specified in the server type section above.
Attaching to an existing session is possible because the Inspector is just an
Appium client. This could be useful if you want to debug the middle of a running
test. When you quit the Inspector window of an existing session, Appium Desktop
will not quit the session as it does normally.

### The Inspector

The Inspector is a visual representation of the state of your application along
with the ability to perform certain interactions in your application through
Appium.

![Inspector window](docs/images/screen-inspector.png)

Appium sessions can take some time to load, especially on cloud services, so
please be patient. When the session loads, a screenshot of your app will appear
on the left. You can mouse over various UI elements in your application, and
see them highlighted.

In the middle of the Inspector window is your app's hierarchy, represented as
XML. You can navigate this tree by clicking through it, or by clicking on
elements in the screenshot view. They will then be highlighted.

When an element is highlighted, its information will appear in the detail view
on the right side of the Inspector. This detail view consists of potential
actions to take against the element, and a table of the element's properties.
These properties are valuable in determining how the element might accessed
using a particular Appium locator strategy. With an element selected, you can
also 'Tap' the element, or 'Send Keys' to the element (if it is a text field).

When you take such an action with an element, the Inspector will send the
command to Appium, which will execute it. If the action is successful, a new
screenshot will be generated and you should see the updated state and XML of
your app. If it's not successful, you'll have an opportunity to see the error
message.

The top of the Inspector window contains a small toolbar with icons
representing the ability to take certain actions in the Inspector:

* Back (call `driver.back`)
* Refresh (refresh the source and screenshot)
* Start Recording (open the recorder, see the next section for more information on the recorder)
* Quit the session (call `driver.quit` and close the Inspector)

### The Recorder

Appium Desktop comes with a very basic action recorder, that watches for
actions taken using Appium Desktop and displays language-and-framework-specific
code that represents those actions. The code can then be copied-and-pasted into
the appropriate Appium client code and used for tests.

**NB:** the goal of the Recorder is not to produce production-ready test code.
It is designed as a tool to help explore the Appium API, and demonstrate how
certain automation behaviors correspond to method calls in a particular
language and Appium library. In sum, it is a learning tool, not a robust code
generation feature, and should be used as such.

When you start recording, the Inspector will show an additional window:

![Inspector window with recorder](docs/images/screen-recorder-empty.png)

At first, the Recorder will show no code. You will first have to take some
action, like finding an element in the hierarchy and tapping on it, or sending
keystrokes to it. When you do this, code will appear in the recorder window,
corresponding to the particular language and framework you have chosen (which
can be adjusted in the drop-down menu at the top right of the Recorder):

![Recorder with code](docs/images/screen-recorder-detail.png)

This code can be copied to your clipboard using the appropriate button at the
top right of the Recorder pane. Note that by default what is shown are simply
lines of code corresponding to the specific actions you have taken while
recording---in general you cannot paste these lines into an empty text file and
run the code. To run Appium test scripts in code requires that various
dependencies (like the Appium client libraries) be installed, and that script
boilerplate (like instantiating a driver and initializing a session) be
present. To show this additional code, you can click the "Show Boilerplate"
button. With boilerplate code shown, it is possible to copy and paste the code
into a new file and run it.

![Recorder with boilerplate](docs/images/screen-recorder-boilerplate.png)

The power of the Recorder will continue to grow as we add more languages,
frameworks, and actions to Appium Desktop.

### Conclusion

This is everything you need to know to use Appium Desktop successfully!
Remember, Appium Desktop is not a replacement for understanding Appium
itself---it is simply a convenient tool for working with Appium on your
desktop, and an Inspector for exploring your app. Have fun!

## Reporting Issues and Requesting Features

Appium Desktop is open source, and we use GitHub for issue tracking. Please
simply report issues at our [issue
tracker](https://github.com/appium/appium-desktop/issues). We will endeavor to
determine whether the issue you are reporting is related to Appium Desktop or
Appium Server. If it's not related to Appium Desktop specifically, we will
close the issue and ask you to open a general Appium issue at [Appium's main
issue tracker](https://github.com/appium/appium/issues). Please, save
yourselves and us valuable time by getting clear on whether the issue you're
experiencing is related to Appium Desktop specifically or instead is a general
Appium issue. You can do this by seeing whether the issue reproduces with the
Appium command line server as well. If it does, direct your report to Appium's
issue tracker.

Have a feature request? Follow the same process and submit an issue to the
appropriate tracker! (Either here in this repo if the request is specifically
for Appium Desktop, or Appium's main tracker if the request is for Appium more
generally.)

## Advanced Topics and Troubleshooting

#### Appium can't detect environment variables on Mac

Appium uses environment variables like `ANDROID_HOME` as well as relying on
various binaries in your `PATH` and so on. When running from the command line
in an environment where you have set these variables appropriately, Appium has
no problem in picking them up. However, Appium Desktop does not run in a shell
or a command-line environment, and so by default it does not have access to
environment variables you have set in your shell startup script or profile. To
work around this, we use the
[shell-env](https://github.com/sindresorhus/shell-env) package to pick up
environment variables defined in your shell. This package only looks in certain
common init scripts, however, like `~/.bashrc`, `~/.bash_profile`, and
`~/.zshrc`. If you set your Appium environment variables in some other way, you
will need to create one of these default init scripts and set your environment
variables there as well, so that Appium Desktop will successfully pick them up.

#### Warnings about being on a read-only file system

This probably means you tried to launch Appium Desktop from the downloaded disk
image (`.dmg` file). This is not a supported mode of running Appium Desktop. To
correctly install Appium Desktop, copy the application from the disk image to
your local filesystem, to somewhere like `/Applications`. Then, run the app
from that new location.

## Developer Instructions

Want to hack on Appium Desktop? Awesome! Head on over to our [Contributing
Doc](CONTRIBUTING.md) for information on how to get a dev environment set up
and submit changes back to the project.
