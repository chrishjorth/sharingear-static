<?php
/**
 * Fetches files from Google Cloud Storage according to file name.
 * Requires a URL rewriting scheme sat up.
 * @author: Chris Hjorth
 */

//Get filename from URL scheme fx: /uploads/gearimages/filename.ext
$filename = basename($_SERVER['REQUEST_URI']);
$bucket = explode('/', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$bucket = $bucket[count($bucket) - 2];
$ext = array_pop(explode('.', $filename));

/*
//Get file for Google Cloud Storage
require_once 'autoload.php';

define('GOOGLE_API_KEY_LOCATION', '/home/chrishjorth/keys/google_api.p12');
define('GOOGLE_API_EMAIL', '157922460020-pu8ef7l5modnl618mgp8ovunssb1n7n8@developer.gserviceaccount.com');

//Get Google authorization for service accounts
$client = new Google_Client();
$client->setApplicationName('Sharingear');
$key = file_get_contents(GOOGLE_API_KEY_LOCATION);
$cred = new Google_Auth_AssertionCredentials(GOOGLE_API_EMAIL, array('https://www.googleapis.com/auth/devstorage.read_write'), $key);
$client->setAssertionCredentials($cred);

$storage = new Google_Service_Storage($client); //https://github.com/google/google-api-php-client/blob/master/src/Google/Service/Storage.php
$object = $storage->objects->get($bucket, $filename);
$file_size = $object->size;

$request = new Google_Http_Request($object->mediaLink, 'GET');
$signed_request = $client->getAuth()->sign($request);
$http_request = $client->getIo()->makeRequest($signed_request);
$file = $http_request->getResponseBody();

*/

//Get file for AWS S3 with AWS SDK for PHP
require '/home/ubuntu/vendor/autoload.php';

define('AWS_SDK_KEY', 'AKIAIALFH3A36MGWPM6A');
define('AWS_SDK_SECRET', '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');

$sharedConfig = [
    'region'  => 'us-west-2',
    'version' => 'latest',
    'credentials' => [
    	'key' => AWS_SDK_KEY,
    	'secret' => AWS_SDK_SECRET
    ]
];
$sdk = new Aws\Sdk($sharedConfig);

$client = $sdk->createS3();

echo 'bucket: ' . $bucket . "<br>";
echo 'key: ' . $key . "<br>";

$result = $client->getObject([
    'Bucket' => $bucket,
    'Key'    => $filename
]);

var_dump($result);
exit;

$file = $result['Body'];

header("Content-Type: image/" . $ext);
header("Content-Length: " . $file_size);
header("Expires: " . gmdate("D, d M Y H:i:s", time() + 3600) . " GMT");
header("Cache-Control: max-age=3600");

echo $file;

