gce_instance { 'sharingear-static':
	ensure => absent,
	zone => 'europe-west1-a',
}
gce_disk { 'sharingear-static':
	ensure => absent,
	zone => 'europe-west1-a',
}
gce_firewall { 'allow-http':
	ensure => absent
}