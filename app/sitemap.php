<?php
/**
 * Generates a Sitemap XML of Sharingear.com.
 * Crawlers must index home, about us, insurance, terms of service, copyright, privacy, search-gear, search-vans,
 * search-tech, gear profiles, van profiles, tech profiles, user profiles.
 * @author: Chris Hjorth
 */

//Fetch gear

//Fetch vans
//Fetch tech
//Fetch users

//Create header
header('Content-type: application/xml');
//Add non dynamic content
date_default_timezone_set('UTC');
$current_date = date('Y-m-d');

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
//Add gear
//Add vans
//Add tech
//Add users
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
</urlset>