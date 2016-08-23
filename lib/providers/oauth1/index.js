var OAuth1Autograph = function(options) { 
	this.oauth = new oauth.OAuth( options.requestUrl, options.accessUrl, options.clientId, options.clientSecret, options.version, options.callback, options.signatureMethod, options.nonceSize, options.customHeaders );
	this._data = options;
	this.signRequest = function(request) { 
		// Request should be: {method:,url:,body:,qs:,headers:}
		var signedUrl = this.oauth.signUrl(request.url,this._data.accessToken,this._data.tokenSecret,request.method);
		request.url = signedUrl;
		return request; // Return request object containing changes
	}
	this.setAccessToken = function(accessToken, tokenSecret) { 
		this._data.accessToken = accessToken;
		this._data.tokenSecret = tokenSecret;
	}
};
var oauth = require('oauth');
module.exports = { 
	"oauth1": function(definition) { 
		return function(appData) { 		
			return new OAuth1Autograph({
				requestUrl: definition.requestUrl,
				accessUrl: definition.tokenUrl,
				authorizationurl: definition.authorizationUrl,
				clientId: appData.clientId,
				clientSecret: appData.clientSecret,
				accessToken: appData.accessToken,
				tokenSecret: appData.tokenSecret
			});	
		}
	}
}
