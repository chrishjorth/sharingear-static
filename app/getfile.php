<?php
/**
 * Fetches files from Google Cloud Storage according to file name.
 * Requires a URL rewriting scheme sat up.
 * @author: Chris Hjorth
 */

//Get filename from URL scheme fx: /images/gearimages/filename.ext
$filename = basename($_SERVER['REQUEST_URI']);
echo 'filename: ';
echo $filename;
