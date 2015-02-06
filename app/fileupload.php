<?php
/**
 * Accept JPEG and PNG uploads and scale them to be a maximum of 4000px wide.
 * @author: Chris Hjorth
 */
require_once 'autoload.php';

define('IS_PRODUCTION', false);
define('FILENAME', 'uploadedfile');
define('SHARINGEAR_SECRET', '95b95a4a2e59ddc98136ce54b8a0f8d2');
define('SG_MAX_FILE_SIZE', 4000000); //4MB
define('GOOGLE_API_KEY_LOCATION', '/home/chrishjorth/keys/google_api.p12');
define('GOOGLE_API_EMAIL', '157922460020-pu8ef7l5modnl618mgp8ovunssb1n7n8@developer.gserviceaccount.com');

$bucket = 'gearimages';
$accepted_host = 'dev.sharingear.com';
if(IS_PRODUCTION) {
    $bucket = 'sg-prod-images';
    $accepted_host = 'www.sharingear.com';
}

header('Content-Type: application/json');

//Abort if we are not on the server, ie. localhost
if(strcmp($_SERVER['HTTP_HOST'], $accepted_host) !== 0) {
	echo json_encode([
        'status' => 'error',
        'message' => 'Wrong host: ' . $_SERVER['HTTP_HOST'],
        'code' => '401'
    ]);
    exit;
}

if(!isset($_FILES[FILENAME]) || empty($_FILES[FILENAME]) || $_FILES[FILENAME]['error'] || !$_FILES[FILENAME]['tmp_name'] || !$_FILES[FILENAME]['name']) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Upload failed - no file.',
        'code' => '401'
    ]);
    exit;
}

// Move uploaded file to temporary location and verify that it is a successful upload
$filename = $_POST['fileName'];
$tmpPath = __DIR__ . '/uploads/' . $filename;
if(!move_uploaded_file($_FILES[FILENAME]['tmp_name'], $tmpPath)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Upload failed',
        'code' => '401'
    ]);
    exit;
}

//Check that file size does not exceed max size
$filesize = $_FILES[FILENAME]['size'];
if($filesize > SG_MAX_FILE_SIZE) {
    // Delete invalidly uploaded files
    @unlink($tmpPath);

    echo json_encode([
        'status' => 'error',
        'message' => 'Upload failed - File size too large.',
        'code' => '401'
    ]);
    exit;
}

//Check extension
$ext = strtolower(pathinfo($tmpPath, PATHINFO_EXTENSION));
if($ext !== 'jpg' && $ext !== 'png') {
    // Delete invalidly uploaded files
    @unlink($tmpPath);

    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid extension',
        'code' => '401'
    ]);
    exit;
}

//Check the secret
$secretproof = $_POST['secretProof'];
$hmac = hash_hmac('sha256', $filename, SHARINGEAR_SECRET);

if(strcmp($secretproof, $hmac) !== 0) {
	@unlink($tmpPath);
    echo json_encode([
        'status' => 'error',
        'message' => 'Someone tampered with things.',
        'code' => '401'
    ]);
    exit;
}

//Strip EXIF data from image, this is to avoid confusing desktop browsers with images uploaded from iPhone
$img = new Imagick($tmpPath);
$img->stripImage();
$img->writeImage($tmpPath);
$img->clear();
$img->destroy();

//Get Google authorization for service accounts
$client = new Google_Client();
$client->setApplicationName('Sharingear');
$key = file_get_contents(GOOGLE_API_KEY_LOCATION);
$cred = new Google_Auth_AssertionCredentials(GOOGLE_API_EMAIL, array('https://www.googleapis.com/auth/devstorage.read_write'), $key);
$client->setAssertionCredentials($cred);

//Send file to Google Cloud Storage with Google API
$storage = new Google_Service_Storage($client);
$obj = new Google_Service_Storage_StorageObject();
$obj->setName($filename);
$storage->objects->insert(
    $bucket,
    $obj,
    ['name' => $filename, 'data' => file_get_contents($tmpPath), 'uploadType' => 'media']
);

//Delete file
@unlink($tmpPath);

$url = 'http' . (((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == 443) ? 's' : '') . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']) . 'uploads/' . $bucket . '/' . $filename;

echo '{"url": "' . $url . '"}';
