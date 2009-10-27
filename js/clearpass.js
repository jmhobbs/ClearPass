
var ClearPass = {

	// Convert a simple passphrase into a stronger key.
	GenerateEncryptionKey: function ( passphrase, username, status_callback, result_callback ) {
		pbkdf2 = PBKDF2( passphrase, str_sha1( passphrase + username ), 1000, 16 );
		pbkdf2.deriveKey( status_callback, result_callback );
	},

	// Generates the shared secret key used by the server/client to authenticate requests
	GenerateConfirmKey: function ( passphrase, username ) {
		return str_sha1( passphrase + username );
	},

	// Non-mac request
	GetToken: function ( key ) {
		$.post(
			'api.php',
			{
				action: 'gettoken'
			},
			function ( data ) {
				obj = JSON.parse( data );
				ClearPass.token = obj.token
			},
			'json'
		);
	},

	GetListing: function ( key, token, username ) {

		params = JSON.stringify(
			{
				action: 'list',
				user: username,
				data: {},
				token: token
			}
		);

		mac = b64_sha1( key + params + token );

		$.post(
			'api.php',
			{
				params: params,
				mac: mac
			},
			function ( data ) {},
			'json'
		);
	},
	// Encrypt from scratch
// 	Encrypt: function ( passphrase, username, plaintext ) {
// 		return GibberishAES.enc( plaintext, ClearPass.PassphraseToKey( passphrase, username ) );
// 	},
//
// 	// Decrypt from scratch
// 	Decrypt: function ( passphrase, username, ciphertext ) {
// 		return GibberishAES.dec( ciphertext, ClearPass.PassphraseToKey( passphrase, username ) );
// 	},

}