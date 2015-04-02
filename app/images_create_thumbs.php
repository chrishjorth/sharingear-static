<?php
/**
 * Read JPEG and PNG images from Google Cloud Storage Bucket, resize if needed, create thumbs.
 * @author: Chris Hjorth
 */
require_once 'autoload.php';

define('IS_PRODUCTION', false);
define('GOOGLE_API_KEY_LOCATION', '/home/chrishjorth/keys/google_api.p12');
define('GOOGLE_API_EMAIL', '157922460020-pu8ef7l5modnl618mgp8ovunssb1n7n8@developer.gserviceaccount.com');

//Get Google authorization for service accounts
$client = new Google_Client();
$client->setApplicationName('Sharingear');
$key = file_get_contents(GOOGLE_API_KEY_LOCATION);
$cred = new Google_Auth_AssertionCredentials(GOOGLE_API_EMAIL, array('https://www.googleapis.com/auth/devstorage.read_write'), $key);
$client->setAssertionCredentials($cred);

$bucket = 'gearimages';
if(IS_PRODUCTION) {
    $bucket = 'sg-prod-images';
}

$storage = new Google_Service_Storage($client);
$list = $storage->objects->listObjects($bucket);

foreach($list['items'] as $item) {
	$request = new Google_Http_Request($item->mediaLink, 'GET');
	$signed_request = $client->getAuth()->sign($request);
	$http_request = $client->getIo()->makeRequest($signed_request);
	$image = new Imagick();
	var_dump($http_request->getResponseBody());
	//$image->readImageBlob($http_request->getResponseBody());

	//var_dump($image->getSize());



	exit();
}
