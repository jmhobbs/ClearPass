<?php
	define( 'CLEARPASS', true );

	require_once( 'config.php' );
	require_once( 'functions.php' );
	require_once( 'api-output-formatters.php' );

	// Replaces network lag, fast responses wierd me out...
	if( isset( $debugAPISleep ) )
		sleep( $debugAPISleep );

	switch( strtolower( $_REQUEST['format'] ) ) {
		default:
		case 'json':
			$out = new JSONAPIOutputFormatter ();
			break;
		case 'plain':
			$out = new PlainTextAPIOutputFormatter ();
			break;
		case 'html':
			$out = new HTMLAPIOutputFormatter ();
			break;
	}

	$link = mysql_connect( $dbHost, $dbUser, $dbPassword );
	if (!$link) {
		$out->fatalError( cp_gi18n( 'database-connection-failed' ) );
	}

	if ( !mysql_select_db( $dbName, $link ) ) {
		$out->fatalError( cp_gi18n( 'database-selection-failed' ) );
	}

	$action = strtolower( $_REQUEST['action'] );

	// Check User
	$id = -1;
	if( $action != 'create-account' ) {
		$res = mysql_query( "
			SELECT id
			FROM {$dbPrefix}user
			WHERE name = '".mysql_real_escape_string( strtolower( $_REQUEST['user-name'] ) )."'
			AND hash = '".mysql_real_escape_string( strtolower( $_REQUEST['user-hash'] ) )."'
		");
		if( false === $res )
			$out->fatalError( cp_gi18n( 'database-query-error' ) );

		if( 1 != mysql_num_rows( $res ) )
			$out->fatalError( cp_gi18n( 'invalid-credentials' ) );

		$row = mysql_fetch_row( $res );
		$id = intval( $row[0] );
	}

	// Execute the api action
	switch( strtolower( $_REQUEST['action'] ) ) {
		default:
			$out->fatalError( cp_gi18n( 'invalid-api-action' ) );
			break;

		case 'create-account':
			$res = mysql_query( "
				SELECT COUNT(*)
				FROM {$dbPrefix}user
				WHERE name = '".mysql_real_escape_string( strtolower( $_REQUEST['user-name'] ) )."'
			");

			if( false === $res || 1 != mysql_num_rows( $res ) )
				$out->fatalError( cp_gi18n( 'database-query-error' ) );

			$row = mysql_fetch_row( $res );
			if( $row[0] != 0 ) {
				$out->addOutput( 'created', false );
				$out->addOutput( 'message', cp_gi18n( 'account-exists' ) );
			}
			else {
				$res = mysql_query( "
					INSERT INTO {$dbPrefix}user
					VALUES (
						null,
						'".mysql_real_escape_string( strtolower( $_REQUEST['user-name'] ) )."',
						'".mysql_real_escape_string( strtolower( $_REQUEST['user-hash'] ) )."',
						NOW()
					)
				" );

				if( false === $res )
					$out->fatalError( cp_gi18n( 'database-query-error' ) );
				else {
					$out->addOutput( 'created', true );
				}
			}
			break;

		case 'validate-credentials':
			$out->addOutput( 'valid', true );
			break;

		case 'get-items':
			$res = mysql_query( "
				SELECT id, name, tags
				FROM {$dbPrefix}item
				WHERE user_id = '{$id}'
			");

			if( false === $res )
				$out->fatalError( cp_gi18n( 'database-query-error' ) );

			$return = array();
			while( $row = mysql_fetch_assoc( $res ) )
				$return[] = $row;

			$out->addOutput( 'items', $return );
			break;

		case 'get-item':
			$itemId = intval( $_REQUEST['item-id'] );

			$res = mysql_query( "
				SELECT *
				FROM {$dbPrefix}item
				WHERE user_id = '{$id}'
				AND id = '{$itemId}'
			");

			if( false === $res )
				$out->fatalError( cp_gi18n( 'database-query-error' ) );

			if( 1 != mysql_num_rows( $res ) )
				$out->fatalError( cp_gi18n( 'invalid-item' ) );

			$row = mysql_fetch_assoc( $res );

			$out->addOutput( 'item', $row );
			break;
	}

?>