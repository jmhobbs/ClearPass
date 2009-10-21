<?php
		if( !defined( 'CLEARPASS' ) ) { die( 'No direct access.' ); }

	// Base API Output Formatter. Does nothing.
	class APIOutputFormatter {
		protected $content = null;
		protected $enabled = true;
		protected $headersSent = false;
		protected $_debug = null;

		function __construct () {}

		function __destruct () { $this->flush(); }

		function flush () {}

		function headers() {}

		function fatalError ( $message ) {}

		function addOutput ( $key, $value ) {}

		function debug ( $message ) {}
	}

	// Plain text formatter, good for debugging
	class PlainTextAPIOutputFormatter extends APIOutputFormatter {
		function __construct() {
			parent::__construct();
			$this->content = '';
			$this->_debug = '';
		}

		function __destruct() {
			parent::__destruct();
		}

		function flush () {
			if( $this->enabled ) {
				$this->headers();
				echo $this->content;
				flush();
				$this->content = '';
			}
		}

		function headers () {
			if( $this->headersSent )
				return;
			header('Content-type: text/plain; charset=utf-8');
		}

		function fatalError ( $message ) {
			$this->content .= "ERROR: " . $message . "\n";
			$this->flush();
			$this->enabled = false;
			exit();
		}

		function addOutput ( $key, $value ) {
			if( ! $this->enabled )
				return;

			ob_start();
			var_dump( $value );
			$var = ob_get_contents();
			ob_end_clean();
			$this->content .= $key . ' = ' . $var . "\n";
		}

		function debug ( $message ) {
			$this->_debug .= 'DEBUG: '. $message . "\n";
		}
	}

	// HTML formatter, better for debugging
	class HTMLAPIOutputFormatter extends APIOutputFormatter {
		protected $odd = false;

		function __construct() {
			parent::__construct();
			$this->content = '';
		}

		function __destruct() {
			parent::__destruct();
		}

		function flush () {
			if( $this->enabled ) {
				$this->headers();
				echo '<table cellpadding="5" cellspacing="0" border="1">' . $this->content . '</table>';
				flush();
				$this->content = '';
			}
		}

		function headers () {
			if( $this->headersSent )
				return;
			header('Content-type: text/html; charset=utf-8');
		}

		function fatalError ( $message ) {
			$this->content = "<h1>Error: $message </h1>";
			$this->flush();
			$this->enabled = false;
			exit();
		}

		function addOutput ( $key, $value ) {
			if( ! $this->enabled )
				return;

			ob_start();
			var_dump( $value );
			$var = ob_get_contents();
			ob_end_clean();
			if ( $this->odd )
				$style = ' style="background: #DDD;" ';
			$this->odd = !$this->odd;
			$this->content .= '<tr' . $style . '><td style="font-weight: bold; vertical-align: top;">' . $key . '</td><td style="vertical-align: top;"><pre>' . $var . "</pre></td></tr>\n";
		}
	}

	// JSON formatter, because JSON is better than XML ;-)
	class JSONAPIOutputFormatter extends APIOutputFormatter {
		function __construct() {
			parent::__construct();
			$this->content = array( 'error' => false );
		}

		function __destruct() {
			parent::__destruct();
		}

		function flush () {
			if( $this->enabled ) {
				$this->headers();
				echo json_encode( $this->content );
				flush();
				$this->enabled = false;
			}
		}

		function headers () {
			if( $this->headersSent )
				return;
			header('Content-type: application/javascript; charset=utf-8');
		}

		function fatalError ( $message ) {
			$this->content = array( 'error' => true, 'message' => $message );
			$this->flush();
			$this->enabled = false;
			exit();
		}

		function addOutput ( $key, $value ) {
			if( ! $this->enabled )
				return;

			$this->content[$key] = $value;
		}
	}
?>