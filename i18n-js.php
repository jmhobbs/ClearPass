<?php
	// Make sure we spit out language files in UTF-8
	header( 'Content-Type: application/x-javascript; charset=utf-8' );
	$locale = basename( $_REQUEST['locale'] );
	require_once( 'i18n/' . $locale . '/i18n.php' );
	echo "var i18n = new Object();\n";
	foreach( $i18n as $key => $message ) {
		echo "i18n['$key'] = '$message';\n";
	}
	exit();
?>