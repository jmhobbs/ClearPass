
var ClearPass = {
	// Convert a simple passphrase into a stronger key.
	// \todo Would prefer S2K salted => http://www.faqs.org/rfcs/rfc2440
	PassphraseToKey: function ( passphrase, username ) {
		return SHA256.digest( username + ":" + passphrase );
	},

	// Encrypt from scratch
	Encrypt: function ( passphrase, username, plaintext ) {
		return GibberishAES.enc( plaintext, ClearPass.PassphraseToKey( passphrase, username ) );
	},

	// Decrypt from scratch
	Decrypt: function ( passphrase, username, ciphertext ) {
		return GibberishAES.dec( ciphertext, ClearPass.PassphraseToKey( passphrase, username ) );
	},

}