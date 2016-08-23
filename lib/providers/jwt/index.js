var JWTAutograph = function(baseUrl, definition,options) {
	var util = require('util');
	this.baseUrl = baseUrl;
	if (options == undefined)
		options = definition;
	this.supportsRefresh = false;
	var jwa = require('jwa');

	this.jwa = jwa(definition.algorithm||options.algorithm);
	var header = base64Url(options.header, 'binary');
	var payload = base64Url(options.payload, options.encoding||'utf8');
	var unsignedToken = util.format('%s.%s', header, payload);

	if (options.secret)
		this.signedToken = this.jwa.sign(unsignedToken, options.secret);
	if (options.privateKeyFile) {
		var fs = require('fs');
		var privateKeyContent = fs.readFileSync(options.privateKey);
		this.signedToken = this.jwa.sign(unsignedToken, privateKeyContent);
	}	

	this.signature = util.format('%s.%s', unsignedToken, signedToken);


	this.definition = definition;
	this.options = options;
	

	this.sendRequest = function(request) { 
		console.log(request);
	}

	this.signRequest = function(request) { 

		request.headers['Authorization'] = 'Bearer ' +this.signature;
		return request; // Return request object containing changes
	}
	this.canSignRequest = function(request) { 
		return request.url.startsWith(this.baseUrl);
	}

};
module.exports = JWTAutograph;

