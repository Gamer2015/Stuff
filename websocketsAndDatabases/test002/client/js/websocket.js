let websocket = (function() {
    let socket = null;
    let requests = {};

    let generateRequestToken = () => {
        let token = randomBigInt(requestTokenLength).toString(16);
        debug("open requests", requests);
        while(token in requests) {
            token = randomBigInt(requestTokenLength).toString(16);   
        }
        return token;
    }


    return {
        init: function(url) {
            // establish websocket connection
            // authenticate for channels
            // handler for incoming data
            socket = new WebSocket(url);
            socket.onopen = function() {
                debug("WebSocket connection established.");
            };
            socket.onmessage = function(e) {
                let data = JSON.parse(e.data);
                debug("received message", data);
                if(data["message"] == "response") {
                    let request = requests[data["requestToken"]];
                    delete requests[request.requestToken];

                    request.callback.method(data, request);
                }
            };
        },
        send: function(request) {
            // add request token
            // store callback information
            // send minified data
            request.requestToken = generateRequestToken();
            requests[request.requestToken] = request;

            minified = Object.assign({}, request);
            delete minified['callback'];

            socket.send(JSON.stringify(minified));
            debug("sending request", minified);
        },
    };
})()

// server-side database operation integration
function requestChannel(callback) {
    let password = generateSecret();

    websocket.send({
        message: "create channel",
        password: password.toString(16),
        callback: {
            method: function(serverData, clientData) {
                if(serverData["status"] == "success") {
                    let channel = {
                        id: serverData.id,
                        password: clientData.callback.password,
                    };

                    storeChannel(channel);

                    if(callback) {
                        callback(channel);
                    }
                } else {
                    error("create channel request failed");
                }
            },
            password: password
        }
    });
}