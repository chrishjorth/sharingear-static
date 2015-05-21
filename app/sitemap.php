<?php
/**
 * Generates a Sitemap XML of Sharingear.com.
 * Crawlers must index home, about us, insurance, terms of service, copyright, privacy, search-gear, search-vans,
 * search-tech, gear profiles, van profiles, tech profiles, user profiles.
 * @author: Chris Hjorth
 */

define('API_URL', 'https://prod-api.sharingear.com/');

$ch = curl_init();
if(!$ch) {
	error_log('Could not initialize cURL session.');
	exit();
}

//Fetch gear
if(!curl_setopt($ch, CURLOPT_URL, API_URL . '/gear')) {
	error_log('Error setting cURL URL: ' . API_URL . '/gear');
	exit();
}

if(!curl_setopt($ch, CURLOPT_RETURNTRANSFER, true)) {
	error_log('Error setting cURL output option');
	exit();
}

$result = curl_exec($ch);
if(!$result) {
	error_log('Error executing cURL: ' . curl_error($ch));
	exit();
}

$gear = json_decode($result);

//Fetch vans
if(!curl_setopt($ch, CURLOPT_URL, API_URL . '/vans')) {
	error_log('Error setting cURL URL: ' . API_URL . '/vans');
	exit();
}

if(!curl_setopt($ch, CURLOPT_RETURNTRANSFER, true)) {
	error_log('Error setting cURL output option');
	exit();
}

$result = curl_exec($ch);
if(!$result) {
	error_log('Error executing cURL: ' . curl_error($ch));
	exit();
}

$vans = json_decode($result);

//Fetch tech
if(!curl_setopt($ch, CURLOPT_URL, API_URL . '/roadies')) {
	error_log('Error setting cURL URL: ' . API_URL . '/roadies');
	exit();
}

if(!curl_setopt($ch, CURLOPT_RETURNTRANSFER, true)) {
	error_log('Error setting cURL output option');
	exit();
}

$result = curl_exec($ch);
if(!$result) {
	error_log('Error executing cURL: ' . curl_error($ch));
	exit();
}

$roadies = json_decode($result);

//Fetch users
if(!curl_setopt($ch, CURLOPT_URL, API_URL . '/users')) {
	error_log('Error setting cURL URL: ' . API_URL . '/users');
	exit();
}

if(!curl_setopt($ch, CURLOPT_RETURNTRANSFER, true)) {
	error_log('Error setting cURL output option');
	exit();
}

$result = curl_exec($ch);
if(!$result) {
	error_log('Error executing cURL: ' . curl_error($ch));
	exit();
}

$users = json_decode($result);

curl_close($ch);

//Create header
header('Content-type: application/xml');
//Add non dynamic content
date_default_timezone_set('UTC');
$current_date = date('Y-m-d');

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc>https://www.sharingear.com/</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!about-us</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!insurance</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!terms-of-service</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!copyright-policy</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!privacy-policy</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!search-gear</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!search-vans</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!search-technicians</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!copenhagen</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!copenhagen-instruments-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!copenhagen-van-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!copenhagen-technician-hire</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!copenhagen-backline-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!london</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!london-instruments-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!london-van-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!london-technician-hire</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!london-backline-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!birmingham</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!birmingham-instruments-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!birmingham-van-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!birmingham-technician-hire</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!birmingham-backline-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!leeds</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!leeds-instruments-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!leeds-van-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!leeds-technician-hire</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!leeds-backline-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!glasgow</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!glasgow-instruments-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!glasgow-van-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!glasgow-technician-hire</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!glasgow-backline-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!amsterdam</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!amsterdam-instruments-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!amsterdam-van-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!amsterdam-technician-hire</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!amsterdam-backline-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!berlin</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!berlin-instruments-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!berlin-van-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!berlin-technician-hire</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
	<url>
		<loc>https://www.sharingear.com/#!berlin-backline-rental</loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
<?php
//Add gear: https://www.sharingear.com/#!gear/310/gibson-les-paul-electric-guitar
foreach($gear as $gear_item) {
	$gear_item->brand = htmlspecialchars(str_replace(' ', '-', $gear_item->brand), ENT_QUOTES);
	$gear_item->model = htmlspecialchars(str_replace(' ', '-', $gear_item->model), ENT_QUOTES);
	$gear_item->subtype = htmlspecialchars(str_replace(' ', '-', $gear_item->subtype), ENT_QUOTES);
?>
	<url>
		<loc>https://www.sharingear.com/#!gear/<?php echo $gear_item->id . '/' . $gear_item->brand . '-' . $gear_item->model . '-' . $gear_item->subtype; ?></loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
<?php
}

//Add vans: https://www.sharingear.com/#!vans/21/splitter-ford-t
foreach($vans as $van) {
	$van->van_type = htmlspecialchars(str_replace(' ', '-', $van->van_type), ENT_QUOTES);
	$van->model = htmlspecialchars(str_replace(' ', '-', $van->model), ENT_QUOTES);
?>
	<url>
		<loc>https://www.sharingear.com/#!vans/<?php echo $van->id . '/' . $van->van_type . '-' . $van->model; ?></loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
<?php
}

//Add tech: https://www.sharingear.com/technicians/69/chris-hjorth-roadie
foreach($roadies as $roadie) {
	$roadie->name = htmlspecialchars(str_replace(' ', '-', $roadie->name), ENT_QUOTES);
	$roadie->surname = htmlspecialchars(str_replace(' ', '-', $roadie->surname), ENT_QUOTES);
	$roadie->roadie_type = htmlspecialchars(str_replace(' ', '-', $roadie->roadie_type), ENT_QUOTES);
?>
	<url>
		<loc>https://www.sharingear.com/#!technicians/<?php echo $roadie->id . '/' . $roadie->name . '-' . $roadie->surname . '-' . $roadie->roadie_type; ?></loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
<?php
}

//Add users: https://www.sharingear.com/users/1/chris-h
foreach($users as $user) {
	$user->name = htmlspecialchars(str_replace(' ', '-', $user->name), ENT_QUOTES);
	$user->surname = htmlspecialchars(str_replace(' ', '-', $user->surname), ENT_QUOTES);
?>
	<url>
		<loc>https://www.sharingear.com/#!users/<?php echo $user->id . '/' . $user->name . '-' . $user->surname; ?></loc>
		<lastmod><?php echo $current_date; ?></lastmod>
	</url>
<?php
}

?>
</urlset>