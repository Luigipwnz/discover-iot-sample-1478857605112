# discover-iot-sample

Just adding this to see the change. Testing if github on mac works.

Sample application for connecting a smartphone to IBM IBM Watson IoT Platform.

-- Modified during IBM Workshop --

Goal of the modification:
Use movement and/or acceleration data to detect if smartphone 
is lying flat on the table or not and send back message containing the information.

Be aware that there commit messages are very bad. 

If you want to run this example:
* Deploy the app to bluemix (link in the bottom modified but not tested
* Then edit the "cred" (credentials) variable in the app.js file. Copy credentials of your "Internet of Things Platform"-Serivce into there.
* If you want to run the app on your computer set everything up for node.js development and then call `node app.js`
* Look for the IP of your compuer and then open webbrowser of your smartphone and go to `YOURIPHERE:6001`
* Open the link probalby `YOURIP:6001/iot-phone`. Enter id and password. Then the app should connect to IBM`s IoT Platform service and start sending data.
* In another tab (use your computer because smartphone might not support more then 1 tab active) go to `YOURIPHERE:6001/position`. If your smartphone is connected it will show you if it is lying flat on the table or is in your hand.

(https://discover-iot.mybluemix.net)

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/lukbrand/discover-iot-sample-1478857605112)
