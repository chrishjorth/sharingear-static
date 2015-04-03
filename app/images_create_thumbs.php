<?php
/**
 * Read JPEG and PNG images from Google Cloud Storage Bucket, resize if needed, create thumbs.
 * @author: Chris Hjorth
 */
require_once 'autoload.php';

define('IS_PRODUCTION', false);
define('GOOGLE_API_KEY_LOCATION', '/home/chrishjorth/keys/google_api.p12');
define('GOOGLE_API_EMAIL', '157922460020-pu8ef7l5modnl618mgp8ovunssb1n7n8@developer.gserviceaccount.com');
define('MAX_SIZE', 2048); //1024 in retina
define('THUMB_SIZE', 512);

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
	if(strpos($item->name, 'thumb') === false) {
		echo 'Working on ' . $item->name . ' <br>';
		
		$request = new Google_Http_Request($item->mediaLink, 'GET');
		$signed_request = $client->getAuth()->sign($request);
		$http_request = $client->getIo()->makeRequest($signed_request);

		$image = new Imagick();
		$image->readImageBlob($http_request->getResponseBody());

		$width = $image->getImageWidth();
		$height = $image->getImageHeight();

		if($width >= $height) {
			if($width > MAX_SIZE) {
				//resize by width
				echo 'Scale by width.<br>';
				$image->scaleImage(MAX_SIZE, 0);
			}
		}
		else {
			if($height > MAX_SIZE) {
				//resize by height
				echo 'Scale by height.<br>';
				$image->scaleImage(0, MAX_SIZE);
			}
		}

		//Create thumbs
		$thumb1 = clone $image;
		$thumb2 = clone $image;

		if($width >= $height) {
			$thumb1->thumbnailImage(THUMB_SIZE, 0);
			$thumb2->thumbnailImage(THUMB_SIZE * 2, 0);
		}
		else {
			$thumb1->thumbnailImage(0, THUMB_SIZE);
			$thumb2->thumbnailImage(0, THUMB_SIZE * 2);
		}

		echo 'Save files.<br>';

		$obj = new Google_Service_Storage_StorageObject();
		$obj->setName($item->name);
		$storage->objects->insert(
    		$bucket,
    		$obj,
    		['name' => $item->name, 'data' => $image->getImageBlob(), 'uploadType' => 'media']
		);

		$filename_components = explode('.', $item->name);
		$filename = $filename_components[0];
		$ext = $filename_components[1];

		$obj_thumb1 = new Google_Service_Storage_StorageObject();
		$obj_thumb1->setName($filename . '_thumb.' . $ext);
		$storage->objects->insert(
    		$bucket,
    		$obj_thumb1,
    		['name' => $filename . '_thumb.' . $ext, 'data' => $thumb1->getImageBlob(), 'uploadType' => 'media']
		);

		$obj_thumb2 = new Google_Service_Storage_StorageObject();
		$obj_thumb2->setName($filename . '_thumb@2x.' . $ext);
		$storage->objects->insert(
    		$bucket,
    		$obj_thumb2,
    		['name' => $filename . '_thumb@2x.' . $ext, 'data' => $thumb2->getImageBlob(), 'uploadType' => 'media']
		);

		$image->clear();
		$image->destroy();
		$thumb1->clear();
		$thumb1->destroy();
		$thumb2->clear();
		$thumb2->destroy();

		echo 'Done.<br><br>';
	}
}
