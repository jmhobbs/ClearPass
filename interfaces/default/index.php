<?php if( !defined( 'CLEARPASS' ) ) { die( 'No direct access.' ); } ?>
<html>
	<head>
		<?php cp_head(); ?>
		<link rel="stylesheet" href="<?php cp_skin_path( 'css/main.css' ); ?>" />
	</head>
	<body>
		<div id="container">
			<div id="header">
				<div id="header-ctr">
					<div id="header-right"><a class="finger" id="cp-log-toggle"><?php cp_i18n( 'show-log' ); ?></a></div>
					<div id="header-left"><?php cp_i18n( 'project-name' ); ?></div>
					<br/>
					<?php cp_tabs(); ?>
				</div>
			</div>
			<div id="content">
			<?php cp_panes(); ?>
			</div>
			<div id="footer"><?php cp_credits(); ?></div>
		</div>
		<div id="cp-log"></div>
		<div id="cp-modal"></div>
	</body>
</html>