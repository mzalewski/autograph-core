function Connector() { 
}

function implementError(name) { 
  return function() {
 throw new Error("Connector." + name + " not implemented by subclass");
}
}

var mappingMethods = ['Headers','Url','Method','Query', 'StatusCode','ResponseHeaders' ]

mappingMethods.forEach(function(key) { 
  Connector.prototype['get'+key] = implementError("get" + key);
  Connector.prototype['set'+key] = implementError("set" + key);
});

Connector.prototype.createRequestData =  function(data) { 
	var self = this;
	var requestData = {};
	mappingMethods.forEach(function(key) { 
		requestData['get'+key] = self['get'+key].bind(self,data);
		requestData['set'+key] = self['set'+key].bind(self,data);
	});
	return requestData;
}

Connector.connect = function(autograph, original) {
  var ctor = this;
  if (original == undefined) {
        return new ctor(autograph).proxy();
  }
  // autograph is either a provider or an Autograph object - methods should be identical
  if (ctor.canConnect == undefined)
	throw new Error("Connector.canConnect has not been implemented");
  if (ctor.canConnect(original))
  {
        return new ctor(autograph, original).proxy();
  }
  return false;

};

Connector.map = function(subclass, propertyName, getter,setter) {
	subclass.prototype['get'+propertyName] = getter;
	subclass.prototype['set'+propertyName] = setter;
};

Connector.prototype.proxy = function() { 
	throw new Error("Connector.proxy not implemented by subclass");
}

Connector.subclass = function(subclass) { 
	require('util').inherits(subclass,Connector);
	subclass.connect = Connector.connect.bind(subclass);
}
Connector.prototype.beforeCreate = function(args,next) { 
        var requestData = this.createRequestData(args);
        this.autograph.signRequest(requestData);
        var requestObj = next(args);
  
}
Connector.prototype.handle401Response = function(requestData,responseData, retry) {
	 var provider = this.autograph;
                if (provider.getSupportedProvider)
                        provider = provider.getSupportedProvider(requestData);
                if (provider.handle401) {
                        provider.handle401(requestData,responseData, function() {
                                provider.signRequest(requestData);
                                retry();
                        });
                } else {
                        console.log("No 401 Handling!");
                }
}
Connector.prototype.beforeResponse = function(originalArgs,args,next, retry) { 

	var responseData = this.createRequestData(args);
	if (responseData.getStatusCode() == '401')
	{
		this.handle401Response(this.createRequestData(originalArgs), responseData, retry.bind(this,originalArgs));
	} else {
		next(args);
	}
};
Connector.prototype.validateCreateArgs = function(args) { 
 return args;

};
Connector.prototype.makeProxy = function(targetFunction, options) { 
	var self = this;
	options = options || {};
	var onCall = options.onCall|| this.beforeCreate;
	var onResponse = options.onResponse || this.beforeResponse;
	var onRetry = options.onRetry;
	function proxifiedCallback(createArgs, modifiedRequestArgs, callback, proxySelf) { 
		var  selfObj = this;
		return function() { 
			return onResponse.call(self,createArgs,arguments, function(args) { return callback.apply(selfObj,args); }, onRetry||proxifiedFunction.bind(proxySelf));
		};
	}
	function proxifiedFunction() { 
		
		var selfObj = this;
		var newArgs = Array.from(arguments);
		if (!options.skipValidateArgs)
        		newArgs = self.validateCreateArgs(newArgs);
		var originalArgs = Array.from(newArgs);
		var lastArg = newArgs[newArgs.length-1];
		if (typeof lastArg === "function") {
			newArgs[newArgs.length-1] = proxifiedCallback(originalArgs,newArgs,lastArg,selfObj);
		}
              
		return onCall.call(self,newArgs, function(args) {  return targetFunction.apply(selfObj,args);} );
		
			
	}
	proxifiedFunction.connector = this;
	return proxifiedFunction;

};

module.exports = Connector;
