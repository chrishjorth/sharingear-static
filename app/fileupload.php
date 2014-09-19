<?php
/**
 * Accept JPEG and PNG uploads and scale them to be a maximum of 4000px wide.
 * @author: Chris Hjorth
 */
define('FILENAME', 'uploadedfile');
define('SHARINGEAR_SECRET', '95b95a4a2e59ddc98136ce54b8a0f8d2');

header('Content-Type: application/json');

//Abort if we are not on the server, ie. localhost
if(strcmp($_SERVER['HTTP_HOST'], 'dev.sharingear.com') !== 0) {
	echo json_encode([
        'status' => 'error',
        'message' => 'Not on server.',
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

// Move uploaded file to temporary location
$filename = $_POST['fileName'];

$tmpPath = __DIR__ . '/uploads/' . $filename;
//$tmpPath = '/usr/share/nginx/www/uploads/' . $filename;
//echo '{"url": "' . $tmpPath . '"}';
//exit;
if(!move_uploaded_file($_FILES[FILENAME]['tmp_name'], $tmpPath)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Upload failed',
        'code' => '401'
    ]);
    exit;
}

//Check extension
$ext = strtolower(pathinfo($tmpPath, PATHINFO_EXTENSION));
if($ext !== 'jpg' && $ext !== 'jpeg' && $ext !== 'jpe' && $ext !== 'png') {
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

$url = 'http' . (((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == 443) ? 's' : '') . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']) . 'uploads/' . $filename;

echo '{"url": "' . $url . '"}';
