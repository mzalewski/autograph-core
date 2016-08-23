function createSwaggerMethodFromDefinition(moduleName, definition) { 
	return function(opts) { 
		var base = require(moduleName);
		base.call(this,definition, opts);
	}
}
var swaggerAutograph = function(swaggerDefinition) { 
	this.supportedMethods = {
		'oauth2' : '../providers/oauth2'
	};
	this.getDefinition = function() {  
        	return swaggerDefinition.securityDefinitions;
	};
	this.methods = [];
	var self = this;
	for (var key in swaggerDefinition.securityDefinitions) { 
		if (this.supportedMethods[key]) {
			var supportedModule = this.supportedMethods[key];
			var definition = swaggerDefinition.securityDefinitions[key];
			this[key] = createSwaggerMethodFromDefinition(supportedModule, definition);
		}
	}
	this.getMethods = function() { return this.methods; };
}

module.exports = swaggerAutograph;
