var request = require('request');
var http = require('http');



App = {

	APIhost: "https://api.spotify.com/v1/",
	accountHost: 'https://accounts.spotify.com/api/token',
	clientID: '[PUT SOMETHING HERE]',
	clientSecret: '[PUT SOMETHING HERE]',
	httpServer: null,

	auth: {
		access_token: '[PUT SOMETHING HERE]',
		refresh_token: '[PUT SOMETHING HERE]'
	},

	init: function(){
		App.createServer();
		//App.callAPI('users/richblend/starred', App.showStarred);
	},

	createServer: function(){
		App.httpServer = http.createServer();
		App.httpServer.on('request', function(request, response){
			App.processRequest(request, response);
		});
		App.httpServer.listen(8001);
	},

	processRequest: function(request, response){
		if(request.url == '/starred'){
			App.callAPI('users/richblend/starred/tracks?offset=0&limit=1000', function(data){
				
				data = App.filterStarredTracks(data);
				response.writeHead(200, { 
					'Content-Type' : 'application/json',
					'Access-Control-Allow-Origin': '*' 
				});
                response.end(JSON.stringify(data)); //yeah, Im requesting JSON from spotify, converting it to JS objects, making new objects, and then stringifying it again. Shoot me. 
                
			});
		}
	},

	refreshToken: function(endpoint, callback){
		
		var hash = Utils.base64Encode(App.clientID + ':' + App.clientSecret);
				
		var options = {
			url: App.accountHost,
			method: 'POST',
			headers: {
				'content-type': 'application/x-www-form-urlencoded', //ARGHHHHH!!!!! request wont send off the POST data unless this is in the headers
				'Authorization': 'Basic ' + hash
			},
			body: "grant_type=refresh_token&refresh_token=" + App.auth.refresh_token
		};

		request(options, function (error, response, body) {
			
			if (!error && response.statusCode == 200) {
				var data = JSON.parse(body);
				App.auth.access_token = data['access_token'];
				App.authOk(endpoint, callback);
			}
		})
	},

	authOk: function(endpoint, callback){
		App.callAPI(endpoint, callback);
	},

	callAPI: function(endpoint, callback){
		var options = {
			url: App.APIhost +  endpoint,
			method: 'GET',
			headers: {'Authorization': 'Bearer ' + App.auth.access_token}
		};

		request(options, function (error, response, body) {
			
			if(response.statusCode == 401){
				App.refreshToken(endpoint, callback);

			}
			if (!error && response.statusCode == 200) {
				console.log(body);
				callback(JSON.parse(body));
			}
		})
	},

	filterStarredTracks: function(data){
		
		var returnArr = [];
		var tracks = data.items;
		for(var i = 0; i < tracks.length; i++){
			
			returnArr.push({
				title: tracks[i].track.name,
				image: tracks[i].track.album.images[tracks[i].track.album.images.length-2].url,
				trackNum: tracks[i].track.track_number
			});
		}
		return returnArr;
	}
}


Utils = {
	base64Encode: function(str){
		var b = new Buffer(str);
		return b.toString('base64');
	}
}



App.init();

