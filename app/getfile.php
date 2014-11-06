<?php
/**
 * Fetches files from Google Cloud Storage according to file name.
 * Requires a URL rewriting scheme sat up.
 * @author: Chris Hjorth
 */

require_once 'autoload.php';

define('GOOGLE_API_KEY_LOCATION', '/home/chrishjorth/keys/Sharingear-a60392948890.p12');
define('GOOGLE_API_EMAIL', '157922460020-pu8ef7l5modnl618mgp8ovunssb1n7n8@developer.gserviceaccount.com');

//Get filename from URL scheme fx: /uploads/gearimages/filename.ext
$filename = basename($_SERVER['REQUEST_URI']);
$bucket = explode('/', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$bucket = $bucket[count($bucket) - 2];
$ext = array_pop(explode('.', $filename));

//Get Google authorization for service accounts
$client = new Google_Client();
$client->setApplicationName('Sharingear');
$key = file_get_contents(GOOGLE_API_KEY_LOCATION);
$cred = new Google_Auth_AssertionCredentials(GOOGLE_API_EMAIL, array('https://www.googleapis.com/auth/devstorage.read_write'), $key);
$client->setAssertionCredentials($cred);

$storage = new Google_Service_Storage($client); //https://github.com/google/google-api-php-client/blob/master/src/Google/Service/Storage.php line 551 and line 1504
$object = $storage->objects->get($bucket, $filename);

$request = new Google_Http_Request($object->mediaLink, 'GET');
$signed_request = $client->getAuth()->sign($request);
$http_request = $client->getIo()->makeRequest($signed_request);
$file = $http_request->getResponseBody();

header("Content-Type: image/" . $ext);
header("Content-Length: " . $object->size);

echo $file;