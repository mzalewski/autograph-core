function Provider() { 
}

Provider.prototype.signRequest = function(request) { 
  throw new Error("Provider.signRequest not implemented by subclass");
}


module.exports = Provider;
