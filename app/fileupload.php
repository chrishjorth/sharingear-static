<?php
/**
 * Accept JPEG and PNG uploads and scale them to be a maximum of 4000px wide.
 * @author: Chris Hjorth
 */


define('IS_PRODUCTION', true);
define('FILENAME', 'uploadedfile');
define('SHARINGEAR_SECRET', '95b95a4a2e59ddc98136ce54b8a0f8d2');
define('SG_MAX_FILE_SIZE', 4000000); //4MB
define('MAX_SIZE', 2048); //1024 in retina
define('THUMB_SIZE', 512);

$accepted_host = 'dev.sharingear.com';
if(IS_PRODUCTION) {
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
$orientation = $img->getImageOrientation();
switch($orientation) {
    case imagick::ORIENTATION_BOTTOMRIGHT:
        $img->rotateimage("#000", 180); //rotate 180 degrees
        break;
    case imagick::ORIENTATION_RIGHTTOP:
        $img->rotateimage("#000", 90); //rotate 90 CW
        break;
    case imagick::ORIENTATION_LEFTBOTTOM:
        $img->rotateimage("#000", -90); //rotate 90 degrees CCW
        break;
}
$img->setImageOrientation(imagick::ORIENTATION_TOPLEFT);

//Scale down image if needed
$width = $img->getImageWidth();
$height = $img->getImageHeight();

if($width >= $height) {
    if($width > MAX_SIZE) {
        //resize by width
        $img->scaleImage(MAX_SIZE, 0);
    }
}
else {
    if($height > MAX_SIZE) {
        //resize by height
        $img->scaleImage(0, MAX_SIZE);
    }
}

$img->writeImage($tmpPath);

//Create thumbs
$thumb1 = clone $img;
$thumb2 = clone $img;

if($width >= $height) {
    $thumb1->thumbnailImage(THUMB_SIZE, 0);
    $thumb2->thumbnailImage(THUMB_SIZE * 2, 0);
}
else {
    $thumb1->thumbnailImage(0, THUMB_SIZE);
    $thumb2->thumbnailImage(0, THUMB_SIZE * 2);
}

$filename_components = explode('.', $filename);
$name = $filename_components[0];
$ext = $filename_components[1];

/*
//Upload for Google Storage
require_once 'autoload.php';

define('GOOGLE_API_KEY_LOCATION', '/home/chrishjorth/keys/google_api.p12');
define('GOOGLE_API_EMAIL', '157922460020-pu8ef7l5modnl618mgp8ovunssb1n7n8@developer.gserviceaccount.com');

$bucket = 'gearimages';
if(IS_PRODUCTION) {
    $bucket = 'sg-prod-images';
}
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

$obj_thumb1 = new Google_Service_Storage_StorageObject();
$obj_thumb1->setName($name . '_thumb.' . $ext);
$storage->objects->insert(
    $bucket,
    $obj_thumb1,
    ['name' => $name . '_thumb.' . $ext, 'data' => $thumb1->getImageBlob(), 'uploadType' => 'media']
);

$obj_thumb2 = new Google_Service_Storage_StorageObject();
$obj_thumb2->setName($name . '_thumb@2x.' . $ext);
$storage->objects->insert(
    $bucket,
    $obj_thumb2,
    ['name' => $name . '_thumb@2x.' . $ext, 'data' => $thumb2->getImageBlob(), 'uploadType' => 'media']
);*/

//Upload to AWS S3 with AWS SDK for PHP
require '/home/ubuntu/vendor/autoload.php';

define('AWS_SDK_KEY', 'AKIAIALFH3A36MGWPM6A');
define('AWS_SDK_SECRET', '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');

$bucket = 'sg-dev-images';
if(IS_PRODUCTION) {
    $bucket = 'sg-prod-images';
}

$sharedConfig = [
    'region'  => 'eu-west-1',
    'version' => 'latest',
    'credentials' => [
        'key' => AWS_SDK_KEY,
        'secret' => AWS_SDK_SECRET
    ]
];
$sdk = new Aws\Sdk($sharedConfig);

$client = $sdk->createS3();

$result = $client->putObject(array(
    'Bucket' => $bucket,
    'Key' => $filename,
    'SourceFile' => $tmpPath,
    'ContentType' => 'image/' . $ext
));

$result = $client->putObject(array(
    'Bucket' => $bucket,
    'Key' => $name . '_thumb.' . $ext,
    'Body' => $thumb1->getImageBlob(),
    'ContentType' => 'image/' . $ext
));

$result = $client->putObject(array(
    'Bucket' => $bucket,
    'Key' => $name . '_thumb@2x.' . $ext,
    'Body' => $thumb2->getImageBlob(),
    'ContentType' => 'image/' . $ext
));


//Clean up Imagick objects
$img->clear();
$img->destroy();
$thumb1->clear();
$thumb1->destroy();
$thumb2->clear();
$thumb2->destroy();

//Delete file
@unlink($tmpPath);

$url = 'http' . (((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == 443) ? 's' : '') . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']) . 'uploads/' . $bucket . '/' . $filename;

echo '{"url": "' . $url . '"}';
