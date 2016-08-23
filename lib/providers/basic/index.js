var BasicAutograph = function(baseUrl, definition,options) {
	var util = require('util');
	this.baseUrl = baseUrl;
	if (options == undefined)
		options = definition;
	this.supportsRefresh = false;

	this.signature = new Buffer(util.format('%s:%s', options.userName, options.password)).toString('base64');
	console.log(this.signature);	

	this.definition = definition;
	this.options = options;
	


	this.signRequest = function(request) { 
console.log(this.signature);
		request.headers['Authorization'] = 'Basic ' +this.signature;
		return request;
	}
	this.canSignRequest = function(request) { 
		return request.url.startsWith(this.baseUrl);
	}

};
module.exports = BasicAutograph;

