var DigestAutograph = function(baseUrl, definition,options) {
	var self = this;
	this.handle401 = function(response,request) { 

	this.setAuthChallenge(response.headers['www-authenticate']); 
	return this._doSignRequest(request);
}.bind(this);
	var util = require('util');
	var crypto = require('crypto');
	this.baseUrl = baseUrl;
	if (options == undefined)
		options = definition;
	this.supportsRefresh = false;


	this.definition = definition;
	this.options = options;
	var _parseChallenge = function parseChallenge(digest) {
  var challenge = {}
  var re = /([a-z0-9_-]+)=(?:"([^"]+)"|([a-z0-9_-]+))/gi
  for (;;) {
    var match = re.exec(digest)
    if (!match) {
      break
    }
    challenge[match[1]] = match[2] || match[3]
  }
return challenge;
	  };
	this.generateCNonce = function() { 
	var cnonceHash = crypto.createHash('md5');
		cnonceHash.update(Math.random().toString(36));
		cnonce = cnonceHash.digest('hex').substr(0, 8);
		this.cnonce = cnonce;
		this.nc = 0;
		return this.cnonce;
	}
	this.setAuthChallenge = function(challenge) {
		this.challenge = _parseChallenge(challenge);
	}	
	this.nc = 0;
	this.nextNonceCount = function() { 
		this.nc++;
		if (this.nc > 99999999)
			this.nc = 1;
		return ("00000000" + this.nc).substr(-8,8);
	};
	this._doSignRequest = function(request) {
                var ha1 = crypto.createHash('md5').update(util.format('%s:%s:%s', self.options.userName, self.challenge.realm, self.options.password));
                var path = require('url').parse(request.url);
                var ha2 = crypto.createHash('md5').update(util.format('%s:%s',request.method, path.path));
		if (self.challenge.qop && self.challenge.qop.indexOf( "auth-int" )>=0) {
			var ha2body = crypto.createHash('md5').update(request.body || '').digest('hex');
			ha2 =  crypto.createHash('md5').update(util.format('%s:%s:%s',request.method, path.path, ha2body));
		}
		var responseParts = [ ha1.digest('hex'), self.challenge.nonce ];
		var nc = '';
		var cnonce = '';
		if (self.challenge.qop)
		{
			nc = self.nextNonceCount();
			cnonce = self.generateCNonce();
			responseParts.push(nc);
			responseParts.push(cnonce);
			responseParts.push(self.challenge.qop);
		}
		responseParts.push(ha2.digest('hex'));
		var response = crypto.createHash('md5').update(responseParts.join(':')).digest('hex');
		var authParts = { username: self.options.userName, realm: self.challenge.realm, nonce: self.challenge.nonce, uri: path.path, qop : self.challenge.qop,
			response: response, opaque: self.challenge.opaque };
		if (self.challenge.qop)
		{
			authParts['nc'] = nc;
			authParts['cnonce'] = cnonce;
		}
		var strParts = [];
		for (var key in authParts) { 
			if (authParts[key]) {
				var format = '%s="%s"';
				if (key == 'qop' || key == 'nc')
					format = '%s=%s';
				strParts.push(util.format(format,key,authParts[key]));
			}
		}
		var header = "Digest " + strParts.join(', ');
		if (!request.headers)
			request.headers = {};
		request.headers['Authorization'] = header;
		return request;

	}

	this.signRequest = function(request) { 
		if (this.challenge)
			this._doSignRequest(request);
		return request;
	}
	this.canSignRequest = function(request) { 
		return request.url.startsWith(this.baseUrl);
	}

};
module.exports = DigestAutograph;

