<?php
header( 'Content-Type: text/plain; charset=UTF-8' );

require_once __DIR__ . '/wp-load.php';

$plugin_root      = WP_PLUGIN_DIR . '/woocommerce';
$action_scheduler = $plugin_root . '/vendor/woocommerce/action-scheduler';
$mail_vendor_as   = WP_PLUGIN_DIR . '/wp-mail-smtp-pro/vendor/woocommerce/action-scheduler';

echo "=== PLUGIN FOLDERS ===\n";
$folders = glob( WP_PLUGIN_DIR . '/*', GLOB_ONLYDIR );
$woocommerce_folders = array_values( array_filter( $folders, function ( $folder ) {
	return stripos( basename( $folder ), 'woocommerce' ) !== false;
} ) );
foreach ( $woocommerce_folders as $folder ) {
	$main_file = $folder . '/woocommerce.php';
	$version   = 'no main file';
	if ( file_exists( $main_file ) ) {
		$head = (string) @file_get_contents( $main_file, false, null, 0, 4000 );
		if ( preg_match( '/Version:\s*([0-9.]+)/i', $head, $matches ) ) {
			$version = $matches[1];
		}
	}
	$as_file = $folder . '/vendor/woocommerce/action-scheduler/action-scheduler.php';
	echo basename( $folder ) . '  version=' . $version . '  action-scheduler=' . ( file_exists( $as_file ) ? 'YES' : 'NO' ) . "\n";
}

echo "\n=== ACTIVE COPIED FILES ===\n";
$main_file = $plugin_root . '/woocommerce.php';
if ( file_exists( $main_file ) ) {
	$head = (string) @file_get_contents( $main_file, false, null, 0, 4000 );
	if ( preg_match( '/Version:\s*([0-9.]+)/i', $head, $matches ) ) {
		echo 'woocommerce/woocommerce.php header Version: ' . $matches[1] . "\n";
	}
}
echo 'WC_VERSION                       : ' . ( defined( 'WC_VERSION' ) ? WC_VERSION : 'UNDEFINED' ) . "\n";
echo 'class-wc-admin-reports.php       : ' . ( file_exists( $plugin_root . '/includes/admin/class-wc-admin-reports.php' ) ? 'present' : 'MISSING' ) . "\n";
$reports_file = $plugin_root . '/includes/admin/class-wc-admin-reports.php';
if ( file_exists( $reports_file ) ) {
	$reports_source = (string) @file_get_contents( $reports_file, false, null, 0, 6000 );
	echo 'reports file has as_has_scheduled_action call: ' . ( str_contains( $reports_source, 'as_has_scheduled_action' ) ? 'YES' : 'NO' ) . "\n";
}

echo "\n=== VENDOR TREE ===\n";
$vendor = $plugin_root . '/vendor';
if ( is_dir( $vendor ) ) {
	$entries = @scandir( $vendor );
	echo 'vendor/ : ' . ( $entries ? implode( ', ', array_filter( $entries, function ( $entry ) { return $entry !== '.' && $entry !== '..'; } ) ) : 'UNREADABLE' ) . "\n";
	if ( is_dir( $vendor . '/woocommerce' ) ) {
		$inner = @scandir( $vendor . '/woocommerce' );
		echo 'vendor/woocommerce/ : ' . ( $inner ? implode( ', ', array_filter( $inner, function ( $entry ) { return $entry !== '.' && $entry !== '..'; } ) ) : 'UNREADABLE' ) . "\n";
	}
}
echo 'action-scheduler dir exists    : ' . ( is_dir( $action_scheduler ) ? 'YES' : 'NO' ) . "\n";
if ( is_dir( $action_scheduler ) ) {
	$entries = @scandir( $action_scheduler );
	echo 'action-scheduler contents      : ' . ( $entries ? implode( ', ', array_slice( array_filter( $entries, function ( $entry ) { return $entry !== '.' && $entry !== '..'; } ), 0, 20 ) ) : 'EMPTY/UNREADABLE' ) . "\n";
	$functions_file = $action_scheduler . '/functions.php';
	if ( file_exists( $functions_file ) ) {
		$source = (string) @file_get_contents( $functions_file );
		echo 'functions.php size             : ' . filesize( $functions_file ) . " bytes\n";
		echo 'defines as_has_scheduled_action: ' . ( str_contains( $source, 'function as_has_scheduled_action' ) ? 'YES' : 'NO' ) . "\n";
	} else {
		echo "functions.php                  : MISSING\n";
	}
}
echo 'mail-smtp bundled AS exists    : ' . ( is_dir( $mail_vendor_as ) ? 'YES' : 'NO' ) . "\n";

echo "\n=== RUNTIME ===\n";
echo 'as_has_scheduled_action : ' . ( function_exists( 'as_has_scheduled_action' ) ? 'DEFINED' : 'UNDEFINED' ) . "\n";
echo 'as_next_scheduled_action: ' . ( function_exists( 'as_next_scheduled_action' ) ? 'DEFINED' : 'UNDEFINED' ) . "\n";
if ( class_exists( 'ActionScheduler' ) ) {
	$reflection = new ReflectionClass( 'ActionScheduler' );
	echo 'ActionScheduler loaded from: ' . $reflection->getFileName() . "\n";
} else {
	echo "ActionScheduler class      : MISSING\n";
}
if ( function_exists( 'as_get_scheduled_actions' ) && class_exists( 'ActionScheduler_Versions' ) ) {
	$versions = ActionScheduler_Versions::instance();
	$latest   = $versions->latest_version();
	echo 'Action Scheduler version  : ' . ( $latest ? $latest : 'unknown' ) . "\n";
}

echo "\n=== BOOT ORDER ===\n";
global $wp_filter;
foreach ( array( 'plugins_loaded', 'action_scheduler_init' ) as $hook ) {
	echo $hook . ":\n";
	if ( ! isset( $wp_filter[ $hook ] ) ) {
		echo "  none\n";
		continue;
	}
	foreach ( $wp_filter[ $hook ]->callbacks as $priority => $registered ) {
		foreach ( $registered as $callable ) {
			$function = $callable['function'];
			$name     = is_string( $function ) ? $function : ( is_array( $function ) ? ( is_object( $function[0] ) ? get_class( $function[0] ) : (string) $function[0] ) . '::' . $function[1] : 'closure' );
			if ( stripos( $name, 'schedul' ) !== false || stripos( $name, 'WPMailSMTP' ) !== false ) {
				echo '  ' . $priority . ' => ' . $name . "\n";
			}
		}
	}
}

echo "\n=== DONE ===\n";
