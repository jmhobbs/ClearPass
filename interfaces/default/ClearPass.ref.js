// DEFINES
var ITEM_EMPTY       = 0; // No data is loaded
var ITEM_HALF_CLOSED = 1; // All data except for contents is loaded and encrypted
var ITEM_HALF_OPEN   = 2; // All data except for contents is loaded and decrypted
var ITEM_OPEN        = 3; // All data is lodaed and decrypted
var ITEM_CLOSED      = 4; // All data is loaded, and encrypted

// Extend some stuff...
String.prototype.trim = function () {
	return this.replace(/^\s*/, "").replace(/\s*$/, "");
}

/* Main Application Object */
ClearPass = {

	activePane: 'login',
	username: '',
	passphrase: '',
	uphash: '',

	items: new Array(),
	working: false,

	encode: function ( plaintext ) {
		return ClearPass.encodeArbitrary( plaintext, ClearPass.passphrase );
	},

	decode: function ( ciphertext ) {
		return ClearPass.decodeArbitrary( ciphertext, ClearPass.passphrase );
	},

	encodeArbitrary: function ( plaintext, passphrase ) {
		return GibberishAES.enc( plaintext, passphrase );
	},

	decodeArbitrary: function ( ciphertext, passphrase ) {
		return GibberishAES.dec( ciphertext, passphrase );
	},

	i18n: function ( key ) {
		if( undefined == i18n[key] )
			return '[' + key + ']';
		else
			return i18n[key];
	},

	// Show a pane
	show: function ( pane, internal, keeptab ) {
		internal = ( undefined == internal ) ? false : internal;
		keeptab = ( undefined == keeptab ) ? false : keeptab;

		if( ClearPass.working && !internal )
			return Notification.warn( ClearPass.i18n( 'busy-error' ) );

		if( !keeptab ) {
			$( '#cp-tab-' + ClearPass.activePane ).removeClass( 'active' );
			$( '#cp-tab-' + pane ).addClass( 'active' );
		}

		$( '#cp-pane-' + ClearPass.activePane ).stop();
		$( '#cp-pane-' + pane ).stop();
		$( '#cp-pane-' + ClearPass.activePane ).fadeOut(
			150,
			function () {
				$( '#cp-pane-' + ClearPass.activePane ).hide();
				$( '#cp-pane-' + pane ).fadeIn( 150 );
				ClearPass.activePane = pane;
			}
		);
	},

	showModal: function ( modal ) {
		$( '#cp-modal' ).fadeIn( 100, function () { $( '#cp-modal-' + modal ).fadeIn(); } );
	},

	hideModal: function () {
		for( i = 0; i < MODALS.length; ++i) {
			console.log( MODALS[i] );
			if( $( '#cp-modal-' + MODALS[i] ).is( ':hidden' ) )
				continue;
			else
				$( '#cp-modal-' + MODALS[i] ).fadeOut( function () {
					if( $( '#cp-modal' ).is( ':hidden' ) )
						return;
					$( '#cp-modal' ).fadeOut(100);
				});
		}
	},

	// Make tabs sexier with effects!
	setTabs: function ( tabs ) {
		j = 1;
		for(i = 0; i < PANES.length; ++i) {
			if( $( '#cp-tab-' + PANES[i] ).is(':hidden') )
				continue;
			else
				setTimeout('ClearPass.hideTab(\'' + PANES[i] + '\');', 100 + (++j * 100 ) );
		}

		for(i = 0; i < MODALS.length; ++i) {
			if( $( '#cp-tab-' + MODALS[i] ).is(':hidden') )
				continue;
			else
				setTimeout('ClearPass.hideTab(\'' + MODALS[i] + '\');', 100 + (++j * 100 ) );
		}

		for(i = 0; i < tabs.length; ++i) {
			setTimeout('ClearPass.showTab(\'' + tabs[i] + '\');', 100 + ( ( j + i ) * 100 ) );
		}
	},

	hideTab: function ( tab ) {
		$( '#cp-tab-' + tab ).fadeOut( 250 );
	},

	showTab: function ( tab ) {
		$( '#cp-tab-' + tab ).fadeIn( 250 );
	},

	clean: function ( tab ) {
		switch ( tab ) {
			default:
				break;
			case 'login':
				$( '#cp-login-username' ).val( '' );
				$( '#cp-login-passphrase' ).val( '' );
				break;
		}
	},

	api: function ( apijson, callback ) {
		Log.dataOut( ClearPass.i18n( 'api-data-out' ) + "<br/>\n" + Log.logify( apijson ) );
		$.post(
			'api.php',
			apijson,
			function ( data ) {
				Log.dataIn( ClearPass.i18n( 'api-data-in' ) + "<br/>\n" + Log.logify( data ) );
				// Thanks to vinse @ #jquery on Freenode
				// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Function/apply
				callback.apply(this, arguments);
			},
			'json'
		);
	},

	Logout: function () {
		ClearPass.hideModal();
		ClearPass.username = '';
		ClearPass.passphrase = '';
		ClearPass.uphash = '';
		ClearPass.items = new Array();
		ClearPass.working = false;
		ClearPass.show( 'login' );
		ClearPass.setTabs( ['login', 'create-account', 'about'] );
		setTimeout("Notification.inform( ClearPass.i18n( 'logout-complete' ) );", 1000);
	},

	Login: function () {
		if( ClearPass.working )
			return Notification.warn( ClearPass.i18n( 'busy-error' ) );

		ClearPass.username = $( '#cp-login-username' ).val().trim();
		if( ClearPass.username == '' )
			return Notification.warn( ClearPass.i18n( 'username-required' ) );

		ClearPass.passphrase = $( '#cp-login-passphrase' ).val().trim();
		if( ClearPass.passphrase == '' ) {
			$( '#cp-login-username' ).val( ClearPass.username );
			return Notification.warn( ClearPass.i18n( 'passphrase-required' ) );
		}

		ClearPass.working = true;
		ClearPass.show( 'busy' , true, true );
		Notification.inform( ClearPass.i18n( 'logging-in' ) );

		ClearPass.uphash = SHA256( ClearPass.username + ':' + ClearPass.passphrase );

		ClearPass.api(
			{
				'action' : 'validate-credentials',
				'user-name' : ClearPass.username,
				'user-hash' : ClearPass.uphash
			},
			function ( data ) {
				if( data.error ) {
					Notification.warn( data.message );
					ClearPass.uphash = '';
					ClearPass.passphrase = '';
					ClearPass.working = false;
					ClearPass.show( 'login' );
				}
				else {
					if( data.valid ) {
						Notification.inform( ClearPass.i18n( 'logged-in' ) );
						ClearPass.working = false;
						ClearPass.clean( 'login' );
						ClearPass.GetItems();
						ClearPass.setTabs( ['items', 'logout', 'new-item', 'notes', 'new-note'] );
					}
					else {
						Notification.warn( ClearPass.i18n( 'invalid-credentials' ) );
						ClearPass.uphash = '';
						ClearPass.passphrase = '';
						ClearPass.working = false;
						ClearPass.show( 'login' );
					}
				}
			}
		);
	},

	CreateAccount: function () {
		if( ClearPass.working )
			return Notification.warn( ClearPass.i18n( 'busy-error' ) );

		ClearPass.username = $( '#cp-create-account-username' ).val().trim();
		if( ClearPass.username == '' )
			return Notification.warn( ClearPass.i18n( 'username-required' ) );
		$( '#cp-create-account-username' ).val('');

		ClearPass.passphrase = $( '#cp-create-account-passphrase' ).val().trim();
		if( ClearPass.passphrase == '' ) {
			$( '#cp-create-account-username' ).val( ClearPass.username );
			return Notification.warn( ClearPass.i18n( 'passphrase-required' ) );
		}
		$( '#cp-create-account-passphrase' ).val('');

		ClearPass.working = true;
		ClearPass.show( 'busy' , true, true );
		Notification.inform( ClearPass.i18n( 'creating-account' ) );

		ClearPass.uphash = SHA256( ClearPass.username + ':' + ClearPass.passphrase );

		ClearPass.api(
			{
				'action' : 'create-account',
				'user-name' : ClearPass.username,
				'user-hash' : ClearPass.uphash
			},
			function ( data ) {
				if( data.error ) {
					Notification.warn( data.message );
					ClearPass.uphash = '';
					ClearPass.passphrase = '';
					ClearPass.working = false;
					ClearPass.show( 'create-account' );
				}
				else {
					if( data.created ) {
						Notification.inform( ClearPass.i18n( 'account-created' ) );
					}
					else {
						Notification.warn( data.message );
						ClearPass.uphash = '';
						ClearPass.passphrase = '';
						ClearPass.working = false;
						ClearPass.GetItems();
					}
				}
			}
		);

	},

	GetItems: function () {
		if( ClearPass.working )
			return Notification.warn( ClearPass.i18n( 'busy-error' ) );

		ClearPass.working = true;
		ClearPass.show( 'busy' , true, true );
		Notification.inform( ClearPass.i18n( 'getting-items' ) );

		ClearPass.api(
			{
				'action' : 'get-items',
				'user-name' : ClearPass.username,
				'user-hash' : ClearPass.uphash
			},
			function ( data ) {
				if( data.error ) {
					Notification.warn( data.message );
					ClearPass.working = false;
					ClearPass.show( 'error' );
				}
				else {
					ClearPass.show( 'items', true );
					ClearPass.working = false;
				}
			}
		);
	}

};


// Complete log of transactions.
Log = {

	logState: 'closed',

	toggle: function () {
		if( Log.logState == 'closed' ) {
			$( '#cp-log-toggle' ).text( ClearPass.i18n( 'hide-log' ) );
			$( '#cp-log' ).slideDown( 250, function () { Log.logState = 'open'; Log.scroll(); } );
		}
		else {
			$( '#cp-log-toggle' ).text( ClearPass.i18n( 'show-log' ) );
			$( '#cp-log' ).slideUp( 250, function () { Log.logState = 'closed'; } );
		}
	},

	logify: function ( obj ) {
		return JSON.stringify( obj )
		.replace( /,"/g, "\",<br/>\n\"" )
		.replace( /{"/g,"{<br/>\n\"" )
		.replace( /}/g,"<br/>\n}" );
	},

	scroll: function () {
		$( '#cp-log' ).animate( { scrollTop: $( '#cp-log' ).attr("scrollHeight") }, 150 );
	},

	log: function ( message ) {
		d = new Date();
		$( '#cp-log' ).append( '<br/><br/><div class="cp-log-date">(' + d + ')</div>' + message );
		Log.scroll();
	},

	inform: function ( message ) {
		Log.log( '<span class="cp-log-inform">' + message + '</span>' );
	},

	warn: function ( message ) {
		Log.log( '<span class="cp-log-warn">' + message + '</span>' );
	},

	fatal: function ( message ) {
		Log.log( '<span class="cp-log-fatal">' + message + '</span>' );
	},

	dataIn: function ( message ) {
		Log.log( '<span class="cp-log-data-in">' + message + '</span>' );
	},

	dataOut: function ( message ) {
		Log.log( '<span class="cp-log-data-out">' + message + '</span>' );
	}
}

/* Method of notification. Should also log automatically */
Notification = {

	inform: function ( message ) {
		Log.inform ( message );
		$.gritter.add( {
			title: ClearPass.i18n( 'information' ),
			text: message,
			image: WebRoot + 'resource/images/icons/info.png',
			sticky: false,
			time: 750
		} );
	},

	warn: function ( message ) {
		Log.warn ( message );
		$.gritter.add( {
			title: ClearPass.i18n( 'warn' ),
			text: message,
			image: WebRoot + 'resource/images/icons/critical.png',
			sticky: false,
			time: 1150
		} );
	},

	fatal: function ( message ) {
		Log.fatal ( message );
		$.gritter.add( {
			title: ClearPass.i18n( 'fatal' ),
			text: message,
			image: WebRoot + 'resource/images/icons/fatal.png',
			sticky: true,
			time: ''
		} );
	}
};

// Bind to all the needed links and buttons
$( document ).ready( function(){
	$( '#cp-login-submit' ).bind( 'click', function (e) { ClearPass.Login(); } );
	$( '#cp-create-account-submit' ).bind( 'click', function (e) { ClearPass.CreateAccount(); } );
	$( '#cp-log-toggle' ).bind( 'click', function (e) { Log.toggle(); } );
	$( '#cp-new-item-cancel' ).bind( 'click', function (e) { ClearPass.show( 'items' ); ClearPass.clean( 'new-item' ); } );
	$( '#cp-new-note-cancel' ).bind( 'click', function (e) { ClearPass.show( 'notes' ); ClearPass.clean( 'new-note' ); } );
	$( '#cp-modal' ).bind( 'click', function (e) { ClearPass.hideModal(); } );
	$( '#cp-logout-cancel' ).bind( 'click', function (e) { ClearPass.hideModal(); } );
	$( '#cp-logout-submit' ).bind( 'click', function (e) { ClearPass.Logout(); } );
} );