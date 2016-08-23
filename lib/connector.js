function Connector() { 
}

Connector.prototype.mapFrom = function(request) { 
  throw new Error("Connector.mapFrom not implemented by subclass");
};

Connector.prototype.mapTo = function(target, request) { 
  throw new Error("Connector.mapTo not implemented by subclass");
};
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

}

Connector.prototype.proxy = function() { 
	throw new Error("Connector.proxy not implemented by subclass");
}

Connector.subclass = function(subclass) { 
	require('util').inherits(subclass,Connector);
	subclass.connect = Connector.connect.bind(subclass);
}

module.exports = Connector;
