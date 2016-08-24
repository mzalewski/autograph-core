var ClientOAuth2 = require('client-oauth2');
var OAuth2Autograph = function(baseUrl, definition,options) {
	this.baseUrl = baseUrl;
	if (options == undefined)
		options = definition;
	 var grantTypes = [];
	if (!definition.flow || definition.flow == 'accessCode') {
		grantTypes.push('code');
	}
	this.supportsRefresh = true;
	this.oauth = new ClientOAuth2({
		clientId: options.clientId,
		clientSecret: options.clientSecret,
		redirectUri: options.redirectUri, // Not used? But include anyway...		
		scopes:	definition.scopes,
		authorizationGrants: grantTypes, 
		accessTokenUri: definition.tokenUrl,
		authorizationUri: definition.authorizationUrl,
		
	});
	this.definition = definition;
	this.options = options;
        this.handle401 = function(request,response, callback, errorCallback) {
	        console.log("Handling the OAUTH 401");
		this.refresh(function() { 
			console.log("callback");
			callback();
		}).catch(function() { errorCallback(new Error("Could not refresh OAuth token")); });

                return this.signRequest(request).request;
        }.bind(this);
	
	this.token = this.oauth.createToken(options.accessToken, options.refreshToken, options.tokenType || 'bearer');
	this.refresh = function(token, callback) { 
		var self = this;
		if (callback == undefined && typeof(token) === "function")
		{
			callback = token;
			token = null;
		}
		if (token) { 
			this.token = this.oauth.createToken("",token, options.tokenType || 'bearer');
		}
		return this.token.refresh().then(function(token) { 
			self.token = token;
			if (callback && typeof(callback) === 'function')
				callback.call(self,token);
			return token;
		});
	}	

	this.sendRequest = function(request) { 
		console.log(request);
	}

	this.signRequest = function(request, connector) {
		var requestToSign = {
			headers: request.getHeaders(),
			url: request.getUrl()
		};
				
		if ( !this.token || !this.token.accessToken )
			throw Error("Access Token Missing");
		this.token.sign(requestToSign);
		var mergedHeaders = {};
		Object.keys(requestToSign.headers).forEach(function(key) { 
			mergedHeaders[key.toLowerCase()] = requestToSign.headers[key];
		});
		request.setHeaders(mergedHeaders);
		request.setUrl(requestToSign.url);
			
		return { request: request, handler401: this.handle401 }; // Return request object containing changes
	}
	this.canSignRequest = function(request) { 
		return request.getUrl().startsWith(this.baseUrl);
	}
	this.setAccessToken = function(accessToken, refreshToken) { 
		 this.token = oauth.createToken(options.accessToken, options.refreshToken, 'bearer');

	}

};
module.exports = OAuth2Autograph;

