gce_firewall { 'allow-http':
    ensure => present,
    network => 'default',
    description => 'allows incoming HTTP connections',
    allowed => 'tcp:80',
}

gce_instance { 'sharingear-static':
    ensure => present,
    description => 'web server',
    machine_type => 'n1-standard-1',
    zone => 'europe-west1-a',
    puppet_master => '',
    puppet_service => present,
    on_host_maintenance => 'migrate',
    network => 'default',
    image => 'projects/debian-cloud/global/images/debian-7-wheezy-v20140814',
    tags => ['web'],
    manifest => 'class nginx {
        Exec { path => [ "/bin/", "/sbin/" , "/usr/bin/", "/usr/sbin/", "/etc/init/" ] }

        exec { "apt-update":
            command => "sudo apt-get update",
        }

        package { "nginx":
            ensure => installed,
            require => Exec["apt-update"],
        }

        service { "nginx":
            ensure => running,
            require => Package["nginx"],
        }

        #Add a vhost template
        file { "default-vhost":
            path => "/etc/nginx/sites-available/127.0.0.1",
            ensure => file,
            require => Package["nginx"],
            content => \'server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/www;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}\'          ,
        }

        # Disable the default nginx vhost
        file { "default-nginx-disable":
            path => "/etc/nginx/sites-enabled/default",
            ensure => absent,
            require => Package["nginx"],
        }

        # Symlink our vhost in sites-enabled to enable it
        file { "vhost-nginx-enable":
            path => "/etc/nginx/sites-enabled/127.0.0.1",
            target => "/etc/nginx/sites-available/127.0.0.1",
            ensure => link,
            require => [
                File["default-vhost"],
                File["default-nginx-disable"],
            ],
            notify => Service["nginx"],
        }

        exec { "restart-nginx":
            command => "sudo service nginx restart",
            require => Service["nginx"],
        }
    }
    include nginx',
}