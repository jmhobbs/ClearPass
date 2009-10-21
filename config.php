<?php
	if( ! defined( 'CLEARPASS' ) ) { die( 'No direct access.' ); }

	// This is added into what is hashed for token generation.
	// It can be anything you want _except_ for the default. Change it NOW.
	// Do not share this with friends.
	$cpTokenSalt = 'iasduhf897h134fuygbsadcasdf';
	// Change this as you wish. It's token life in seconds. Shorter is better, but
	// that's entirely up to you. Really, you shouldn't get a token until you are
	// ready to use the token.
	$cpTokenLife = 30;
	// Change this to gibberish too. Alpha-numeric ONLY.
	$cpSessionCookieName = 'ISF34589SADRUI023SD';