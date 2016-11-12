'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var cfenv = require('cfenv');
var Client = require('ibmiotf');
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // for parsing application/json
var appEnv = cfenv.getAppEnv();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var config = null;
var credentials = null;
var cred = {
	"iotCredentialsIdentifier": "a2g6k39sl6r5",
	"mqtt_host": "xu8f7r.messaging.internetofthings.ibmcloud.com",
	"mqtt_u_port": 1883,
	"mqtt_s_port": 8883,
	"http_host": "xu8f7r.internetofthings.ibmcloud.com",
	"org": "xu8f7r",
	"apiKey": "a-xu8f7r-mlw4ablrem",
	"apiToken": "&Mfg42b6s+y_tF0ce("
};
if (process.env.VCAP_SERVICES) {
	config = JSON.parse(process.env.VCAP_SERVICES);

	var iotService = config['iotf-service'];
	for (var index in iotService) {
		if (iotService[index].name === 'discover-iot-try-service') {
			credentials = iotService[index].credentials;
		}
	}
} else {
	credentials = cred;
}

var basicConfig = {
	org: credentials.org,
	apiKey: credentials.apiKey,
	apiToken: credentials.apiToken
};

var options = {
	host: 'internetofthings.ibmcloud.com',
	port: 443,
	headers: {
	  'Content-Type': 'application/json'
	},
	auth: basicConfig.apiKey + ':' + basicConfig.apiToken
};

var appClientConfig = {
	"org" : credentials.org,
	"id" : credentials.iotCredentialsIdentifier,
	"auth-key" : credentials.apiKey,
	"auth-token" : credentials.apiToken
}

var appClient = null;

app.get('/position', function(req, res) {

	if (!appClient) {
		appClient = new Client.IotfApplication(appClientConfig);
	}

	if (!appClient.isConnected) {
		appClient.connect();
	}

    	appClient.on("connect", function () {
		
		console.log("Subscribing to device.");

        	appClient.subscribeToDeviceEvents("iot-phone","+","+","json");

    	});
    	appClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {

        	console.log("Device Event from :: "+deviceType+" : "+deviceId+" of event "+eventType+" with payload : "+payload);

		var parsedPayload = JSON.parse(payload);

		//var id = parsedPayload.d.id;
		//var ts = parsedPayload.d.ts;
		//var ax = parsedPayload.d.ax;
		//var ay = parsedPayload.d.ay;
		//var az = parsedPayload.d.az;
		//var oa = parsedPayload.d.oa;
		var ob = parsedPayload.d.ob;
		//var og = parsedPayload.d.og;

		if (!res.finished) {
			res.setHeader("Content-Type", "text/html");		
			//tested with iPhone6S
			if (ob < 1.5 && ob > -1.5) {
				// console.log("SMARTPHONE LYING")
				res.write("<p>SMARTPHONE LYING</p>");
			} else {
				// console.log("SMARTPHONE IN HAND");
				res.write("<p>SMARTPHONE IN HAND</p>");
			}
			res.end();
		}

		//appClient.unsubscribeToDeviceEvents("iot-phone","+","+","json");
		//appClient.disconnect();
		//appClient = null;

   	});
});

app.get('/credentials', function(req, res) {
	res.json(basicConfig);
});

app.get('/iotServiceLink', function(req, res) {
	var options = {
		host: basicConfig.org + '.internetofthings.ibmcloud.com',
		port: 443,
		headers: {
		  'Content-Type': 'application/json'
		},
		auth: basicConfig.apiKey + ':' + basicConfig.apiToken,
		method: 'GET',
		path: 'api/v0002/'
	}
	var org_req = https.request(options, function(org_res) {
		var str = '';
		org_res.on('data', function(chunk) {
			str += chunk;
		});
		org_res.on('end', function() {
			try {
				var org = JSON.parse(str);
				var url = "https://console.ng.bluemix.net/#/resources/serviceGuid=" + org.bluemix.serviceInstanceGuid + "&orgGuid=" + org.bluemix.organizationGuid + "&spaceGuid=" + org.bluemix.spaceGuid;
				res.json({ url: url });
			} catch (e) { console.log("Something went wrong...", str); res.send(500); }
			console.log("iotServiceLink end: ", str.toString());
		});
	}).on('error', function(e) { console.log("ERROR", e); });
	org_req.end();
});

app.post('/registerDevice', function(req, res) {
	console.log(req.body);
	var deviceId = null, typeId = "iot-phone", password = null;
	if (req.body.deviceId) { deviceId = req.body.deviceId; }
	if (req.body.typeId) { typeId = req.body.typeId; }
	if (req.body.password) { password = req.body.password; }

	var options = {
		host: basicConfig.org + '.internetofthings.ibmcloud.com',
		port: 443,
		headers: {
		  'Content-Type': 'application/json'
		},
		auth: basicConfig.apiKey + ':' + basicConfig.apiToken,
		method: 'POST',
		path: 'api/v0002/device/types'
	}

	var deviceTypeDetails = {
		id: typeId
	}
	console.log(deviceTypeDetails);
	var type_req = https.request(options, function(type_res) {
		var str = '';
		type_res.on('data', function(chunk) {
			str += chunk;
		});
		type_res.on('end', function() {
			console.log("createDeviceType end: ", str.toString());

			var dev_options = {
				host: basicConfig.org + '.internetofthings.ibmcloud.com',
				port: 443,
				headers: {
				  'Content-Type': 'application/json'
				},
				auth: basicConfig.apiKey + ':' + basicConfig.apiToken,
				method: 'POST',
				path: 'api/v0002/device/types/'+typeId+'/devices'
			}

			var deviceDetails = {
				deviceId: deviceId,
				authToken: password
			};
			console.log(deviceDetails);

			var dev_req = https.request(dev_options, function(dev_res) {
				var str = '';
				dev_res.on('data', function(chunk) {
					str += chunk;
				});
				dev_res.on('end', function() {
					console.log("createDevice end: ", str.toString());
					res.send({ result: "Success!" });
				});
			}).on('error', function(e) { console.log("ERROR", e); });
			dev_req.write(JSON.stringify(deviceDetails));
			dev_req.end();
		});
	}).on('error', function(e) { console.log("ERROR", e); });
	type_req.write(JSON.stringify(deviceTypeDetails));
	type_req.end();
});

app.listen(appEnv.port, function() {
	console.log("server starting on " + appEnv.url);
});
