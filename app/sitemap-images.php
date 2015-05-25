<?php
/**
 * Generates a Image sitemap XML of Sharingear.com.
 * Crawlers must index item images and user images for tech profiles.
 * @author: Chris Hjorth
 */

define('API_URL', 'https://prod-api.sharingear.com/');

$ch = curl_init();
if(!$ch) {
	error_log('Could not initialize cURL session.');
	exit();
}

//Fetch gear images
if(!curl_setopt($ch, CURLOPT_URL, API_URL . '/gear/images')) {
	error_log('Error setting cURL URL: ' . API_URL . '/gear/images');
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

$gear_images = json_decode($result);

//Fetch van images
if(!curl_setopt($ch, CURLOPT_URL, API_URL . '/vans/images')) {
	error_log('Error setting cURL URL: ' . API_URL . '/vans/images');
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

$vans_images = json_decode($result);

//Fetch roadie images
if(!curl_setopt($ch, CURLOPT_URL, API_URL . '/roadies/images')) {
	error_log('Error setting cURL URL: ' . API_URL . '/roadies/images');
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

$roadies_images = json_decode($result);

curl_close($ch);

//Create header
header('Content-type: application/xml');
//Add non dynamic content
date_default_timezone_set('UTC');
$current_date = date('Y-m-d');

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
<?php
foreach($gear_images as $gear_item) {
	$gear_item->brand = htmlspecialchars(str_replace(' ', '-', $gear_item->brand), ENT_QUOTES);
	$gear_item->model = htmlspecialchars(str_replace(' ', '-', $gear_item->model), ENT_QUOTES);
	$gear_item->subtype = htmlspecialchars(str_replace(' ', '-', $gear_item->subtype), ENT_QUOTES);
?>
	<url>
		<loc>https://www.sharingear.com/#!gear/<?php echo $gear_item->id . '/' . $gear_item->brand . '-' . $gear_item->model . '-' . $gear_item->subtype; ?></loc>
<?php
	foreach($gear_item->images as $image_url) {
		if(strlen($image_url) > 0 && strpos($image_url, 'graph.facebook.com') === false) {
?>
		<image:image>
     		<image:loc><?php echo $image_url; ?></image:loc>
     	</image:image>
<?php
		}
	}
?>
	</url>
<?php
}

foreach($vans_images as $van_item) {
	$van_item->van_type = htmlspecialchars(str_replace(' ', '-', $van_item->van_type), ENT_QUOTES);
	$van_item->model = htmlspecialchars(str_replace(' ', '-', $van_item->model), ENT_QUOTES);
?>
	<url>
		<loc>https://www.sharingear.com/#!vans/<?php echo $van_item->id . '/' . $van_item->van_type . '-' . $van_item->model; ?></loc>
<?php
	foreach($van_item->images as $image_url) {
		if(strlen($image_url) > 0 && strpos($image_url, 'graph.facebook.com') === false) {
?>
		<image:image>
     		<image:loc><?php echo $image_url; ?></image:loc>
     	</image:image>
<?php
		}
	}
?>
	</url>
<?php
}

foreach($roadies_images as $roadie_item) {
	$roadie_item->name = htmlspecialchars(str_replace(' ', '-', $roadie_item->name), ENT_QUOTES);
	$roadie_item->surname = htmlspecialchars(str_replace(' ', '-', $roadie_item->surname), ENT_QUOTES);
	$roadie_item->roadie_type = htmlspecialchars(str_replace(' ', '-', $roadie_item->roadie_type), ENT_QUOTES);
	if(strlen($roadie_item->image_url) > 0 && strpos($image_url, 'graph.facebook.com') === false) {
?>
	<url>
		<loc>https://www.sharingear.com/#!technicians/<?php echo $roadie_item->id . '/' . $roadie_item->name . '-' . $roadie_item->surname . '-' . $roadie_item->roadie_type; ?></loc>
		<image:image>
     		<image:loc><?php echo $roadie_item->image_url; ?></image:loc>
     	</image:image>
	</url>
<?php
	}
}
?>
</urlset>
