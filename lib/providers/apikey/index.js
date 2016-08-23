var APIKeyAutograph = function(baseUrl, definition,options) {
	var util = require('util');
	this.baseUrl = baseUrl;
	if (options == undefined)
		options = definition;
	this.supportsRefresh = false;
	this.location = definition.location || 'header';
	this.keyMapping = definition.keyMapping;
	this.headerKeys = {};
	for (var key in keyMapping) { 
		if (keyMapping[key] && options[keyMapping[key]])
			headerKeys[key] = options[keyMapping[key]];
	}

	this.options = options;
	


	this.signRequest = function(request) { 

		if (this.location == 'header')
		{
			if (request.headers == undefined)
				request.headers = {};
			for (var key in this.headerKeys) { 
				request.headers[key] = this.headerKeys[key];
			}
		} else {
			if (request.qs == undefined)
				request.qs = {};
                        for (var key in this.headerKeys) {
                                request.qs[key] = this.headerKeys[key];
                        }
		}
		return request;
	}
	this.canSignRequest = function(request) { 
		return request.url.startsWith(this.baseUrl);
	}

};
module.exports = APIKeyAutograph;

