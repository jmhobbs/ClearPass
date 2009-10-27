<?php
	define( 'CLEARPASS', true );
	require_once( 'config.php' );

	/*
		Every request (with the exception of three) must have these parameters:
			* action  - The action to perform.
			* user    - The user to work on.
			* data    - The data for the action. JSON encoded string, values are encrypted.
			* mac     - The message authentication hash. This is the sha1 of:
			            UserSecret . action . data . user . token

		There are three requests which do not require the "data" or "mac" parameters;
			* gettoken
			* expiretoken
			* endsession

		---- Actions ----

		gettoken - Fetches a new token for use in an action.

		expiretoken - Expire any tokens in the session.

		endsession - End the session, delete session file and cookie.

		validate - Just checks if the MAC used is good or not.

		create - Create a new entry.
			data Parameters:
				* title  - Required, string
				* fields - Required, array
				* tags   - Optional, array

		edit - Edit an existing entry.
			data Parameters:
				* id     - Required, int, NOT ENCRYPTED
				* title  - Required, string
				* fields - Required, array
				* tags   - Optional, array

		delete - Delete an entry.
			data Parameters:
				* id - Required, int, NOT ENCRYPTED

		get - Fetch the details of an entry (esp. fields)
			data Parameters:
				* id - Required, int, NOT ENCRYPTED

		list - Get a list of entries (id, title, tags). If "since" is specified, it
		       only sends back ones modified since that timestamp.
			data Parameters:
				* since - Optional, timestamp.

		---- The use of sessions ----

		We are not too concerned about the use of sessions, as they are only a
		convenience for storing the token, which is presumed to be known to any
		attacker already.

		But hey, let's just be paranoid anyway.
	*/
	@ini_set( 'session.cookie_httponly', 1 );
	@ini_set( 'session.cookie_lifetime', $cpTokenLife ); //! \todo Good number?
	@ini_set( 'session.use_trans_sid', 0 );
	@ini_set( 'session.use_only_cookies', 1 );
	@ini_set( 'session.name', $cpSessionCookieName );
	session_start();
	session_regenerate_id();

	header( 'Content-type: application/json; charset=utf-8' );

	$params = $_POST;
	$action = strtolower( $params['action'] );
	$user = strtolower( $params['user'] );

	// We have to have some kind of action at the very least.
	if( empty( $action ) )
		die( '{"error": true, "message": "Missing required parameter: action" }' );

	// Handle missing, empty or expired tokens, as well as generating & expiring tokens.
	// All of these actions do not require authentication.
	if( empty( $_SESSION['token'] ) || -1 == $_SESSION['token.expire'] ) {
		if( 'gettoken' != $action ) {
			// If we have no token, and we are not getting a token, we need to choke.
			die( '{"error": true, "message": "No current token." }' );
		}
		else {
			// ?action=gettoken
			$_SESSION['token'] = hash( 'sha1', time() . mt_rand( 0, 10000 ) . $cpTokenSalt );
			$_SESSION['token.expire'] = time() + $cpTokenLife;
			die( '{"error": false, "message": "", "token": "' . $_SESSION['token'] . '" }' );
		}
	}
	else if( time() > $_SESSION['token.expire'] || 'expiretoken' == $action ) {
		// Token has expired!
		$_SESSION['token'] = '';
		$_SESSION['token.expire'] = -1;
		die( '{"error": true, "message": "Token has expired." }' );
	}

	// We also must have the user name
	if( empty( $user ) )
		die( '{"error": true, "message": "Missing required parameter: user" }' );

	$MAC = $params['mac'];

	// Okay, check for the MAC.
	if( empty( $MAC ) )
		die( '{"error": true, "message": "No MAC." }' );

	//! \todo Fetch the real userhash from DB based on $user
	$userhash = 'supersecret';

	// Check validity of the MAC, using the raw data.
	$MAC2 = hash( 'sha1', $userhash . $params['action'] . $params['data'] . $params['user'] . $_SESSION['token'] );

	if( $MAC2 != $MAC )
		die( '{"error": true, "message": "Bad MAC." }' );

	// If we have made it here, then as far as we care, the user is the user
	switch( $action ) {
		default:
			die( '{"error": true, "message": "Invalid action" }' );
			break;
		case 'validate':
			die( '{"error": false, "message": "" }' );
			break;
		case 'create':
			break;
		case 'edit':
			break;
		case 'delete':
			break;
		case 'list':
			break;
		case 'get':
			break;
	}