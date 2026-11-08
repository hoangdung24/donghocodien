<?php
header( 'Content-Type: text/plain; charset=UTF-8' );

require_once __DIR__ . '/wp-load.php';

$plugin_root = WP_PLUGIN_DIR . '/woocommerce';
$action_scheduler = $plugin_root . '/vendor/woocommerce/action-scheduler';

echo "=== WORDPRESS ===\n";
echo 'wp_version        : ' . get_bloginfo( 'version' ) . "\n";
echo 'php_version       : ' . PHP_VERSION . "\n";
echo 'site_url          : ' . get_option( 'siteurl' ) . "\n";
echo 'home_url          : ' . get_option( 'home' ) . "\n";

echo "\n=== PATHS ===\n";
echo 'WP_PLUGIN_DIR     : ' . WP_PLUGIN_DIR . "\n";
echo 'plugin_root exists: ' . ( is_dir( $plugin_root ) ? 'YES' : 'NO' ) . "\n";
foreach ( array( 'woocommerce.php', 'includes/admin/class-wc-admin-reports.php', 'vendor/autoload.php' ) as $relative ) {
	echo str_pad( $relative, 44 ) . ': ' . ( file_exists( $plugin_root . '/' . $relative ) ? 'YES' : 'NO' ) . "\n";
}
echo 'action-scheduler dir: ' . ( is_dir( $action_scheduler ) ? 'YES' : 'NO' ) . "\n";
echo 'action-scheduler.php: ' . ( file_exists( $action_scheduler . '/action-scheduler.php' ) ? 'YES' : 'NO' ) . "\n";

if ( is_dir( $action_scheduler ) ) {
	$entries = @scandir( $action_scheduler );
	echo 'action-scheduler contents: ' . ( $entries ? implode( ', ', array_slice( $entries, 2, 25 ) ) : 'UNREADABLE' ) . "\n";
	$functions_file = $action_scheduler . '/functions.php';
	if ( file_exists( $functions_file ) ) {
		echo 'functions.php size : ' . filesize( $functions_file ) . " bytes\n";
		$contents = (string) @file_get_contents( $functions_file );
		echo 'defines as_has_scheduled_action: ' . ( str_contains( $contents, 'function as_has_scheduled_action' ) ? 'YES' : 'NO' ) . "\n";
	}
} else {
	$vendor = $plugin_root . '/vendor';
	if ( is_dir( $vendor ) ) {
		$vendor_entries = @scandir( $vendor );
		echo 'vendor/ contents   : ' . ( $vendor_entries ? implode( ', ', array_slice( $vendor_entries, 2, 25 ) ) : 'UNREADABLE' ) . "\n";
	}
}

echo "\n=== PLUGIN FILES ===\n";
$main_file = $plugin_root . '/woocommerce.php';
if ( file_exists( $main_file ) ) {
	$main_contents = (string) @file_get_contents( $main_file, false, null, 0, 4000 );
	if ( preg_match( '/Version:\s*([0-9.]+)/i', $main_contents, $matches ) ) {
		echo 'woocommerce.php Version header: ' . $matches[1] . "\n";
	}
	if ( preg_match( "/WC_VERSION',\s*'([0-9.]+)'/", $main_contents, $version_matches ) ) {
		echo "WC_VERSION constant          : " . $version_matches[1] . "\n";
	}
}

echo "\n=== LOADED CODE ===\n";
echo 'WC_VERSION constant      : ' . ( defined( 'WC_VERSION' ) ? WC_VERSION : 'UNDEFINED' ) . "\n";
echo 'as_has_scheduled_action  : ' . ( function_exists( 'as_has_scheduled_action' ) ? 'DEFINED' : 'UNDEFINED' ) . "\n";
echo 'as_next_scheduled_action : ' . ( function_exists( 'as_next_scheduled_action' ) ? 'DEFINED' : 'UNDEFINED' ) . "\n";
echo 'ActionScheduler class    : ' . ( class_exists( 'ActionScheduler' ) ? 'LOADED' : 'MISSING' ) . "\n";
echo "loaded ActionScheduler files:\n";
if ( class_exists( 'ActionScheduler' ) ) {
	$reflection = new ReflectionClass( 'ActionScheduler' );
	echo '  ' . $reflection->getFileName() . "\n";
}

echo "\n=== ACTION SCHEDULER HOOKS ===\n";
global $wp_filter;
$as_hooks = array( 'action_scheduler_init', 'action_scheduler_register_3_dot_9_dot_0', 'action_scheduler_after_process_queue' );
foreach ( $as_hooks as $hook ) {
	$registered = isset( $wp_filter[ $hook ] ) ? count( $wp_filter[ $hook ]->callbacks ) : 0;
	echo str_pad( $hook, 44 ) . ': ' . $registered . " callbacks\n";
}
$boot_hooks = array( 'plugins_loaded', 'woocommerce_loaded', 'init' );
foreach ( $boot_hooks as $hook ) {
	$callbacks = isset( $wp_filter[ $hook ] ) ? $wp_filter[ $hook ]->callbacks : array();
	$as_callbacks = array();
	foreach ( $callbacks as $priority => $registered ) {
		foreach ( $registered as $callable ) {
			$function = $callable['function'];
			$name = is_string( $function ) ? $function : ( is_array( $function ) ? ( is_object( $function[0] ) ? get_class( $function[0] ) : $function[0] ) . '::' . $function[1] : 'closure' );
			if ( stripos( $name, 'schedul' ) !== false || stripos( $name, 'as_' ) !== false ) {
				$as_callbacks[] = $priority . ' => ' . $name;
			}
		}
	}
	echo str_pad( $hook, 44 ) . ': ' . ( $as_callbacks ? implode( ' | ', $as_callbacks ) : 'none' ) . "\n";
}

echo "\n=== ACTIVE PLUGINS ===\n";
$active = (array) get_option( 'active_plugins', array() );
foreach ( $active as $plugin_file ) {
	$missing = file_exists( WP_PLUGIN_DIR . '/' . $plugin_file ) ? '' : '  <-- FILE MISSING';
	echo '  ' . $plugin_file . $missing . "\n";
}
if ( is_multisite() ) {
	echo "network active:\n";
	foreach ( (array) get_site_option( 'active_sitewide_plugins', array() ) as $plugin_file => $when ) {
		echo '  ' . $plugin_file . "\n";
	}
}

echo "\n=== MU PLUGINS ===\n";
$mu_dir = WPMU_PLUGIN_DIR;
if ( is_dir( $mu_dir ) ) {
	$mu_files = @scandir( $mu_dir );
	echo implode( ', ', array_filter( (array) $mu_files, function ( $entry ) { return $entry !== '.' && $entry !== '..'; } ) ) . "\n";
} else {
	echo "none\n";
}

echo "\n=== CACHES / CRON ===\n";
echo 'DISABLE_WP_CRON        : ' . ( defined( 'DISABLE_WP_CRON' ) && DISABLE_WP_CRON ? 'TRUE (cron disabled)' : 'false' ) . "\n";
echo 'ALTERNATE_WP_CRON      : ' . ( defined( 'ALTERNATE_WP_CRON' ) && ALTERNATE_WP_CRON ? 'TRUE' : 'false' ) . "\n";
echo 'WP_CRON_LOCK_TIMEOUT   : ' . ( defined( 'WP_CRON_LOCK_TIMEOUT' ) ? WP_CRON_LOCK_TIMEOUT : 'default' ) . "\n";
echo 'object-cache.php       : ' . ( file_exists( WP_CONTENT_DIR . '/object-cache.php' ) ? 'PRESENT' : 'absent' ) . "\n";
wp_cache_flush();
echo "object cache flushed   : done\n";

echo "\n=== SNIPPETS / HOOK CONSUMERS ===\n";
$hook_count = isset( $wp_filter['woocommerce_delete_shop_order_transients'] ) ? count( $wp_filter['woocommerce_delete_shop_order_transients']->callbacks ) : 0;
echo 'woocommerce_delete_shop_order_transients callbacks: ' . $hook_count . "\n";
if ( $hook_count ) {
	foreach ( $wp_filter['woocommerce_delete_shop_order_transients']->callbacks as $priority => $registered ) {
		foreach ( $registered as $callable ) {
			$function = $callable['function'];
			$name = is_string( $function ) ? $function : ( is_array( $function ) ? ( is_object( $function[0] ) ? get_class( $function[0] ) : (string) $function[0] ) . '::' . $function[1] : 'closure' );
			echo '  ' . $priority . ' => ' . $name . "\n";
		}
	}
}

echo "\n=== DONE ===\n";
