module.exports = {
	Connector: require('./connector.js'),
	Provider: require('./provider.js'),
	Providers: { 
		'OAuth1': require('./providers/oauth1'),
		'APIKey': require('./providers/apikey'),
		'Basic': require('./providers/basic'),
		'Digest': require('./providers/digest'),
		'JWT': require('./providers/jwt'),
		'OAuth2': require('./providers/oauth2')
	}

}
