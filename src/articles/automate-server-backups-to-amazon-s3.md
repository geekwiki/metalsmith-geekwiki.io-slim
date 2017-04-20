---
title: "Automate server backups to Amazon S3"
template: posts.hbt
summary: "Automate server backups to Amazon S3"
featured_image: "assets/articles/amazon.png"
date: 2012-06-11
categories:
author:
  firstname: "Geoff"
  lastname: "Hatch"
  username: "ghatch"
tags: aws, s3, backup, automation
---
I've always tried to figure out what the best way would be to backup a server, without me having to do anything at all. I looked online and found a lot of great websites, software that does it but everything is extremely expensive especially for storing your backups. If there is a free method out there, I am one to try and go that route and give it a try to get everything set up properly before I start investing my money into paid products and what is really funny about that is sometimes the free products work WAY better than the paid products.

Anyway, here is how I automated my server backups to Amazon S3 using their free usage tier which provides 5 GB of Amazon S3 storage, 20,000 Get Requests, 2,000 Put Requests, and 15GB of data transfer out each month for one year. Yes, after the year is up you have to pay but even then if you look at the storage pricing it is [extremely cheap](https://aws.amazon.com/s3/pricing/)

First off you need to install a tool called s3cmd on your server. You can find the s3cmd page by navigating [here](http://s3tools.org/s3cmd)

Once you get s3cmd installed then you need to configure it using the --configure flag

```bash
# s3cmd --configure
```

Then input all of the information that it reqeusts such as access key and secret key (click [HERE](https://www.amazon.com/gp/redirect.html?ie=UTF8&amp;location=https%3A%2F%2Faws-portal.amazon.com%2Fgp%2Faws%2Fdeveloper%2Faccount%2Findex.html%2F?action=access-key&amp;tag=bucket-20) to be taken directly to your access keys), your encryption password which is used to password protect your files, https yes/no, http proxy settings, etc. Here is an example output:

```bash
# s3cmd --configure

Enter new values or accept defaults in brackets with Enter.
Refer to user manual for detailed description of all options.

Access key and Secret key are your identifiers for Amazon S3
Access Key []:
Secret Key []:

Encryption password is used to protect your files from reading
by unauthorized persons while in transfer to S3
Encryption password []:
Path to GPG program [/usr/bin/gpg]:

When using secure HTTPS protocol all communication with Amazon S3
servers is protected from 3rd party eavesdropping. This method is
slower than plain HTTP and can\'t be used if you\'re behind a proxy
Use HTTPS protocol [No]:

On some networks all internet access must go through a HTTP proxy.
Try setting it here if you can\'t conect to S3 directly
HTTP Proxy server name:

New settings:
 Access Key: <YOUR ACCESS KEY>;
 Secret Key: <YOUR SECRET KEY>;
 Encryption password: <YOUR PASSWORD>;
 Path to GPG program: /usr/bin/gpg
 Use HTTPS protocol: False
 HTTP Proxy server name:
 HTTP Proxy server port: 0

Test access with supplied credentials? [Y/n] y
Please wait...
Success. Your access key and secret key worked fine

Now verifying that encryption works...
Success. Encryption and decryption worked fine

Save settings? [y/N] y
Configuration saved to '/root/.s3cfg'
```

Once you have all of that setup and configured, then you need to create a backup directory, this is the directory that your backups will be placed in. I personally made it /backup and inside that directory create a Archive, Data, and MySQL directories. At the end of it your directory should look like this:

```bash
/backups
/backups/Archive
/backups/Data
/backups/MySQL
```

Now make sure you have File::NFSLock and Date::Format perl modules installed on your system if you don't install them via cpan (cpan -i File::NFSLock/Date::Format) and put the following script on your server:

```perl
#!/usr/bin/perl

use Fcntl qw(LOCK_EX LOCK_NB);
use File::NFSLock;
use Date::Format;

# Include the directories you wish to backup separated by space, like so:
# my $datadirs = "/home /root /var/tools /www";
my $datadirs = "### INPUT YOUR DIRECTORIES ###";

# Try to get an exclusive lock on myself.
my $lock = File::NFSLock->new($0, LOCK_EX|LOCK_NB);
die "$0 is already running!n" unless $lock;

my ( $sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst ) = localtime(time);
$year += 1900;
$mon += 1;
my $datestring = time2str( "%m-%d-%Y", time );
$logfile="/var/log/s3backup-$datestring.log";

open( LOGFILE , ">> $logfile" )
 or die "Can't open file '$logfile'. $!n";
select((select(LOGFILE), $| = 1)[0]); # autoflush LOGFILE

sub logh() {
 my $msg = shift(@_);
 my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = localtime(time);
 $mon += 1; $wday += 1; $year += 1900;

my @months = qw { Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec };
 my $dts;
 $dts = sprintf("%04d%3s%02d %02d:%02d:%02d",
 $year,$months[$mon],$mday,$hour,$min,$sec);
 my $pid = $$;
 printf LOGFILE ("$dts:$pid: $msgn" , @_);
}

sub backupDir {
 &logh("Creating tarball of directories");
 $dirfilename="data-$datestring.tar.gz";
 if (-e "/backups/$dirfilename") {
 &logh("Error: Backup file already exists: /backups/$dirfilename");
 }
 else {
 my $dirbak=`tar czPvf "/backups/Data/$dirfilename" $datadirs`;
 &logh("Directories tarball has been created");
 }

}

sub mysqlBackup {
 my $user ="root";
 my $password = "### INPUT ROOT MYSQL PASSWORD ###";
 my $outputdir = "/backups/MySQL";
 my $mysqldump = "/usr/bin/mysqldump";
 my $mysql = "/usr/bin/mysql";

&logh("Creating MySQL backup dump");
 $msqlfilename="mysql-$datestring.tar.gz";
 if (-e "/backups/$msqlfilename") {
 &logh("Error: MySQL backup file already exists: /backups/$dirfilename");
 }
 else {
 system("rm -rf $outputdir/*.gz");
 &logh("Deleted old backups..");
 my @dblist = `$mysql -u$user -p$password -e 'SHOW DATABASES;' | grep -Ev '(Database|information_schema)'`;
 for $db (@dblist) {
 chomp($db);
 my $execute = `$mysqldump -u $user -p$password $db | gzip > $outputdir/$db.sql.gz`;
 }
 my $mysqlbak=`tar czvf "/backups/Data/$msqlfilename" $outputdir/*.gz`;
 system("rm -rf $outputdir/*.gz");
 &logh("MySQL Backup dump has been created.");

}
}

sub createOne {
 &logh("Merging backups into one file");
 my $filename="ServerBackup-$datestring.tar.gz";
 if (-e "/backups/$filename") {
 &logh("Error: Backup file already exists: /backups/$filename");
 }
 else {
 my $arbak=`tar czvf /backups/Archive/$filename /backups/Data/*.gz`;
 system("rm -rf /backups/MySQL/* /backups/Data/*");
 &logh("Merge complete.");
 }
}

sub syncS3 {
 &logh("Syncing to S3.. ");
 my $sync=`s3cmd sync --delete-removed /backups/Archive/ s3://### INPUT YOUR BUCKET NAME ### >> $logfile`;
 if ($? == 0) { &logh("Sync to s3 complete."); }
}

sub cleanArchive {
 &logh("Removing backups older than 7 days");
 system("find /backups/Archive -type f -mtime +7 -print | xargs rm");
 &logh("Delete complete.");
}

&cleanArchive;

my $filename="ServerBackup-$datestring.tar.gz";
if (-e "/backups/Archive/$filename") {
 &logh("Error: Backup file already exists: /backups/$filename");
 exit 1;
}

&backupDir;
&mysqlBackup;
&createOne;
&syncS3;
```

In the above script you only need to change 3 values if you wish for your server to keep 7 days of backups, just search and replace the following values:

```
### INPUT YOUR DIRECTORIES ###
### INPUT YOUR BUCKET NAME ###
### INPUT ROOT MYSQL PASSWORD ###
```

You may also want to look at the sub mysqlBackup function if your MySQL installation is special or if you don't want to use the root user to login and backup your databases. Once you have done all that, simply test out the script by running it and if all is well then create a cron job to automatically run it every so often. I've also been meaning to make a mail function in this script to email me when a backup is completed/created I just haven't had the time to get around to it.. I'll update this post when I do so.
