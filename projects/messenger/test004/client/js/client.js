window.onload = function() {
	initDatabase(function() {
		loadFromDatabase(function() { 
			display();

			let serverName = 'localhost';
			let socketPort = 8080;
			let wsUrl = 'ws://'+serverName+':'+socketPort;
			websocket.init(wsUrl);
		});
	});
};