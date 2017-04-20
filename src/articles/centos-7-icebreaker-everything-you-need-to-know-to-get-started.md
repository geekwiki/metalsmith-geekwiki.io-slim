---
title: "CentOS 7 Icebreaker - Everything you need to know to get started"
template: posts.hbt
summary: "A simple guide showing how to setup a CentOS 7 server"
featured_image: "assets/articles/centos7.png"
date: 2016-04-12
categories: Linux Administration, RHEL, RedHat OS" ]
author:
  firstname: "Justin"
  lastname: "Hyland"
  username: "jhyland87"
tags: centos6, centos7, ext4, firewalld, network-manager, rhel6, rhel7, xfs
---
There's actually quite a bit of changes from CentOS 6 to CentOS 7, some new commands, packages and some new services. Some older packages have been discontinued and replaced with newer packages, as well as some packages introduced that make it easier to automate some tasks that were previously done via just editing flat text files. In here, I'll cover the ones that I have used thus far in my job and at home. Hopefully this post will make your transition from CentOS 6 to 7 fast and painless, and maybe even fun!

## CentOS 7 Package/Command Replacements
### _ifconfig -> ip_
In the previous CentOS/RHEL releases, the command to view the interface configuration was just ifconfig, but in r7, theres a few different ways, the primary one would be via the new command: _**ip**_; Which is installed by default (even on the minimal install).

To get the same information you would get via _ifconfig_, you can type _**ip addr show**_, or simply just _**ip addr**_. Heres an example of the output:

```bash
$ ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP qlen 1000
    link/ether 08:00:27:cd:98:f7 brd ff:ff:ff:ff:ff:ff
    inet 192.168.0.49/24 brd 192.168.0.255 scope global enp0s3
       valid_lft forever preferred_lft forever
    inet6 fe80::a00:27ff:fecd:98f7/64 scope link
       valid_lft forever preferred_lft forever
3: enp0s8: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP qlen 1000
    link/ether 08:00:27:02:5c:4e brd ff:ff:ff:ff:ff:ff
    inet 192.168.0.50/24 brd 192.168.0.255 scope global enp0s8
       valid_lft forever preferred_lft forever
    inet6 fe80::a00:27ff:fe02:5c4e/64 scope link
       valid_lft forever preferred_lft forever
4: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN
    link/ether 02:42:9f:f9:3c:56 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.1/16 scope global docker0
       valid_lft forever preferred_lft forever
```

___
### _service -> systemctl_
That's right, the service <service> <stop|start|status|restart> isn't the recommended method for managing services, there's now the **_systemctl_** command (which is also used to manage _runlevels_, effectively replacing _chkconfig_ as well, well cover that separately though). The systemctl does come with a lot more functionality though, the commands that are used to interact with services are:
* **list-units** - List known units (Default command).
* **list-sockets** - List socket units ordered by listening address.
* **list-timers** - List timer units ordered by the time they elapse next.
* **start** - Start (activate) one or more units specified on the command line.
* **stop** - Stop (deactivate) one or more units specified on the command line.
* **reload** - Asks all units listed on the command line to reload their configuration. Note that this will reload the service-specific configuration, not the unit configuration file of systemd. If you want systemd to reload the configuration file
of a unit, use the daemon-reload command. In other words: for the example case of Apache, this will reload Apache's httpd.conf in the web server, not the apache.service systemd unit file.
* **restart** -  Restart one or more units specified on the command line. If the units are not running yet, they will be started
* **try-restart** - Restart one or more units specified on the command line if the units are running. This does nothing if units are not running.
* **reload-or-restart** - Reload one or more units if they support it. If not, restart them instead. If the units are not running yet, they will be started.
* **reload-or-try-restart** - Reload one or more units if they support it. If not, restart them instead. This does nothing if the units are not running. Note that, for compatibility with SysV init scripts, force-reload is equivalent to this command.
* **isolate** - Start the unit specified on the command line and its dependencies and stop all others.
* **kill** - Send a signal to one or more processes of the unit.
* **is-active** - heck whether any of the specified units are active (i.e. running).
* **is-failed** - Check whether any of the specified units are in a "failed" state.
* **status** - Show terse runtime status information about one or more units, followed by most recent log data from the journal.
* **show** - Show properties of one or more units, jobs, or the manager itself.
* **cat** - Show backing files of one or more units.
* **set-property** - Set the specified unit properties at runtime where this is supported.
* **reset-failed** - Reset the "failed" state of the specified units, or if no unit name is passed, reset the state of all units.
* **list-dependencies** - Shows units required and wanted by the specified unit.

The above descriptions were taken right from the man page, but some are shortened to make this post a quicker read, but you can view the man page itself, [here](https://www.freedesktop.org/software/systemd/man/systemctl.html)

The syntax is:

```bash
$ /usr/bin/systemctl <em>command</em> <em>service</em>.service
```

Where _<command>_ is one of the commands listed above, and _<service>_ is the name of the service.

So instead of using:

```bash
$ service httpd restart
```

You would type:

```bash
$ systemctl restart httpd.service
```

Do keep in mind that when you're simply starting/stoping/restarting a service, it doesn't show the _Stopping... [ OK ]_ and _Starting... [ OK ]_ anymore, but the status command definitely is much more verbose and helpful than it was with the service package:

```bash
$ systemctl status httpd.service
httpd.service - The Apache HTTP Server Loaded: loaded (/usr/lib/systemd/system/httpd.service; disabled; vendor preset: disabled) Active: active (running) since Sat 2016-04-09 06:25:40 MST; 41s ago Docs: man:httpd(8) man:apachectl(8) Process: 12920 ExecStop=/bin/kill -WINCH ${MAINPID} (code=exited, status=0/SUCCESS) Main PID: 12925 (httpd) Status: ";Total requests: 0; Current requests/sec: 0; Current traffic: 0 B/sec"; CGroup: /system.slice/httpd.service ├─12925 /usr/sbin/httpd -DFOREGROUND ├─12927 /usr/sbin/httpd -DFOREGROUND ├─12928 /usr/sbin/httpd -DFOREGROUND ├─12929 /usr/sbin/httpd -DFOREGROUND ├─12930 /usr/sbin/httpd -DFOREGROUND └─12931 /usr/sbin/httpd -DFOREGROUND Apr 09 06:25:40 localhost.localdomain systemd[1]: Starting The Apache HTTP Server... Apr 09 06:25:40 localhost.localdomain httpd[12925]: AH00558: httpd: Could not reliably determine the server\'s fully qualified domain name, using localhost.localdomain. Set the 'ServerName' directive globally to suppress this message Apr 09 06:25:40 localhost.localdomain systemd[1]: Started The Apache HTTP Server.
```

**Note:** Even though the _service_ command is no longer used for managing the service status, if you attempt to use it, _systemctl_ will intercept the command, translate it to the _systemctl_ equivalent, and tell you the command it's actually running, so you can see what should be typed:

```bash
$ service httpd restart
Redirecting to /bin/systemctl restart  httpd.service
```
___

#### How SystemD Works
The _systemd_ method of targeting runlevels for specific applications also works differently than in previous releases. In earlier releases, you would create startup scripts in _/etc/init.d_, then create symlinks to said scripts in the _/etc/rc*.d_ directories. Systemd stores various files inside the **/lib/systemd/system** directory, each with a specific suffix to specify what the file is meant to do:
* automount
* mount
* path
* service
* slice
* socket
* target
* timer
* wants
These files are not simply bash scripts, they're actual configuration files that specify settings such as the default runlevel, the nice level, the kill signals, the directories, and other service configuration settings and default settings.

Now if you look in the **/etc/systemd/system** directory, you will notice some folders that are named after the runlevel targets, with a **.wants** suffix, these are the equivalent of the _/etc/rc*.d_ directories in CentOS 6. Inside these subfolders are where the symlinks are kept, these symlinks have a** .service** suffix, and are pointed at the service configuration file located at **/usr/lib/systemd/system**.

Now that we have an idea how it works, let's look at the Apaches service. We know that it's targeted to run at **multi-user**, so lets see whats located at **/etc/systemd/system/multi-user.target.wants/httpd.service**.

```bash
$ ls -alrth /etc/systemd/system/multi-user.target.wants/httpd.service
lrwxrwxrwx. 1 root root 37 Apr 14 12:15 /etc/systemd/system/multi-user.target.wants/httpd.service -> /usr/lib/systemd/system/httpd.service
```

Ok, so it's a symlink, lets take a look at the content (I haven't changed anything, so it's all default):

```bash

$ cat /usr/lib/systemd/system/httpd.service
[Unit]
Description=The Apache HTTP Server
After=network.target remote-fs.target nss-lookup.target
Documentation=man:httpd(8)
Documentation=man:apachectl(8)

[Service]
Type=notify
EnvironmentFile=/etc/sysconfig/httpd
ExecStart=/usr/sbin/httpd $OPTIONS -DFOREGROUND
ExecReload=/usr/sbin/httpd $OPTIONS -k graceful
ExecStop=/bin/kill -WINCH ${MAINPID}
# We want systemd to give httpd some time to finish gracefully, but still want
# it to kill httpd after TimeoutStopSec if something went wrong during the
# graceful stop. Normally, Systemd sends SIGTERM signal right after the
# ExecStop, which would kill httpd. We are sending useless SIGCONT here to give
# httpd time to finish.
KillSignal=SIGCONT
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

And there you have it, that's how systemd manages the targeted runlevels. I haven't had time to look into them yet, but you can tell by all of the other suffixes that the files in the **/lib/systemd/system** directory have, that systemd can do a lot more than just managing the service runlevels... Maybe I'll write a separate post on that when I dive into it.
### _chkconfig -> systemctl_
The _chkconfig_ command was also replaced by _systemctl_, which I personally love that managing the service status as well as the runlevels can both be done with the same binary.

One of the first things you need to realize, is that instead of using run-levels, you now use targets, the targets are listed below, and if there is a corresponding runlevel in the previous CentOS/RHEL releases, I put that right next to it:

* poweroff.target, runlevel0.target - Runlevel 0
* poweroff.target, runlevel0.target - Runlevel 0
* rescue.target, runlevel1.target - Runlevel 1
* multi-user.target, runlevel2.target, runlevel3.target, runlevel4.target - Runlevels 2 3 and 4
* graphical.target, runlevel5.target - Runlevel 5
* reboot.target, runlevel6.target - Runlevel 6
* default.target
* emergency.target
* halt.target
* kexec.target
* suspend..target
* hibernate.target
* hybrid-sleep.target
* basic.target
* getty.target
* sockets.target
* sysinit.target
* system-update.target

As you can see, they tried to make the transition easier. If you don't know the exact target name, you can simply use **runlevel_<0-6>_.target** as the target, but do realize that some of the new targets actually correspond with more than one runlevel, so I suggest you get use to the new targets.

The _default.target_ can be set to any runlevel you want to use as the default. In the previous releases, it would default to whatever runlevel you were currently in, but in CentOS 7, it's set to the _multi-user.target_, and you can verify that via the _get-default_ command:

```bash
$ systemctl get-default
multi-user.target
```

And the default target can be just as easily set via the _set-default_ command:

```bash
$ systemctl set-default multi-user.target
Removed symlink /etc/systemd/system/default.target.
Created symlink from /etc/systemd/system/default.target to /usr/lib/systemd/system/multi-user.target.
```

If you're looking for more details on managing _systemd_ targets via _systemctl_, you can look at the [RedHat documentation](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/System_Administrators_Guide/sect-Managing_Services_with_systemd-Targets.html), it's very detailed and useful, as always.

___

### _hostname -> hostnamectl_
Setting the hostname is now done via the hostnamectl package, which really doesn't have too much to it, it just manages the systems hostname:

```bash
$ hostnamectl set-hostname c7box.justinhyland.local
$ hostname
c7box.justinhyland.local
```

___

Timezone Management

To change the timezone in a <r7 release, you would have to symlink the timezone file located in _/usr/share/zoneinfo/<timezone>_ to _/etc/localtime_. CentOS 7 comes with _timedatectl_, making it much easier:

```bash
$ timedatectl set-timezone America/Phoenix
```

Thats all, not much to the timezone management really.

___
### _iptables -> firewalld_
iptables is still available, and it's actually more effective for IPv6 packet filtering than before, but, theres a new firewall management package called **firewalld**, and I think it's awesome!

The _firewalld_ service is managed via the _firewall-cmd_ command, and it's actually pretty easy to use. Basically, you manage **zones**, a network zone defines the level of trust for network connections. This is a one to many relation, which means that a connection can only be part of one zone, but a zone can be used for many network connections. So basically connections get assigned to one or more _zones_, then the filtering is done to the zones themselves, you can think of zones as groups.

There's no way I can cover everything in the new firewalld package, so I'll just cover the very basics, and list some of the most useful/common commands.

After you install an application (Apache, for example), you can either whitelist whatever ports it will be using like so:

```bash
$ firewall-cmd --permanent --zone=public --add-port=80/tcp
```

Or, if you plan on using multiple ports for Apache, and you don't want to have to add each one of them to the firewall, you can add the service itself:

```bash
$ firewall-cmd --permanent --zone=public --add-service=http
```

After any changes are made, you need to reload firewalld:

```bash
$ firewall-cmd --reload
```

Most useful firewall-cmd commands:
* **firewall-cmd --list-all** - List everything added for or enabled in zone.
* **firewall-cmd --list-all-zones** - List everything added for or enabled in all zones
* **firewall-cmd --zone=<zone> --list-services** - List all services available to a specific zone
* **firewall-cmd --permanent --zone=_<zone>_ --add-service=_<service>_** - Permanently whitelist all connections for a specific service within a specific zone
* **firewall-cmd --permanent --zone=_<zone>_ --add-port=_<port>/<tcp|udp>_** - Permanentlywhitelist a port (or port range) within a specific zone
* **firewall-cmd --get-active-zones** - Get the list of active zones
* **firewall-cmd --reload** - Reload any changes that were made
(Ill add more detail to this one later)

The _firewalld_ package wasn't installed by default for me, but then again, I only installed the minimal iso, to install it, just _yum install firewalld_

The changes made via _firewall-cmd_ will only be part of the runtime configuration, thus, they will be reset on the next reboot, to make them permanent, you need to add **--permanent** to the command.

If you don't like the new _firewalld_, you can still use the old _iptables_ package, just follow [this](https://www.digitalocean.com/community/tutorials/how-to-migrate-from-firewalld-to-iptables-on-centos-7) guide.

___

## New Packages/Features
In addition to providing newer and more powerful substitutions to some well-known and highly used packages, there's quite a few new packages that were included

### Network Manager (nmcli)
In the previous releases of CentOS/RHEL, the tool that was used to manage the network interfaces was some crappy GUI tool called _[System-Config-Network](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Migration_Planning_Guide/chap-Migration_Guide-Networking.html)_, which I never used, and I don't know anyone that used it. Typically, the most common approach was just to script it yourself, since all you're really doing is managing flat files inside _/etc/sysconfig/network-scripts/ifcfg-*_. In release 7, the new tool of choice is called the Network-Manager, a very easy yet powerful package that lets you manage just about every aspect of the network interfaces. You interact with it via the **nmcli** command.

A good example scenario would be if you wanted to change a current network interface from using DHCP to static, previously, you would either edit the _ifcfg-eth#_ file directly, then restart the network service, but now it can be done via a series of commands:

```bash
$ nmcli connection modify enp0s3 ipv4.address 192.168.1.48
$ nmcli connection modify enp0s3 ipv4.gateway 192.168.1.1
$ nmcli connection modify enp0s3 ipv4.method manual
$ nmcli connection modify enp0s3 ipv4.dns ";8.8.8.8";
$ nmcli connection reload enp0s3
```

There's really too much to cover in the new Network Manager, so I recommend that you take a look at the [documentation](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Networking_Guide/sec-Using_the_NetworkManager_Command_Line_Tool_nmcli.html), but heres a few of the common commands I've been using thus far, or commands I thought were intriguing:
* **nmcli connection edit <interface-name>** - Opens the interactive editor to edit said interface
* **nmcli device show** - Show network interfaces
* **nmcli connection show** - Show all network connections
* **nmcli connection show --active** - Show only active connections
* **nmcli -f all dev show enp0s3** - Show all fields for the device called _enp0s3_

Out of all of the packages I'm covering in this post, I would say that the Network Manager is the one of the more advanced ones, and I barely just covered the tip of the iceberg. For more detail, look at RedHats [Network Manager documentation](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Networking_Guide/sec-Using_the_NetworkManager_Command_Line_Tool_nmcli.html)

___

##Other Changes

### Network Interface Names
Release 7 introduces a new naming convention for the NIC names, it's called **[Predictable Network Interface Names](https://www.freedesktop.org/wiki/Software/systemd/PredictableNetworkInterfaceNames/)**, and just like the title says, it provides a more 'predictable' name for the network interfaces. At first, you're going to see the names of your interfaces, and think "How in the world is THAT predictable?...", and you would even think having the old _ifcfg-eth#_ or _ifcfg-wlan#_ interface names would be more predictable.. But once you read a little more into it, you'll see the sense in it.

The primary problem they were trying to solve was unpredictability of what interfaces would get assigned to what numeric value (as in _ifcfg-eth#_), have you ever rebooted a server that had multiple interfaces, and noticed that the interface names were switched once you booted it back up? I have. It typically happens when you haven't statically configured the interface configurations, and haven't binded them to a Mac address (or _HWDADDR_). Obviously this problem isn't too difficult to fix, but it still opens up the possibilities of network issues, security issues, application issues, etc etc.

The new convention is setup so you should actually be able to predict exactly what the interface names will be named, even before the system is booted up! I haven't quite got the convention down to pat just yet, but from reading the documentation (which is all referenced), I can summarize it for you..

The name comes with a two character prefix, which is based on the interface type:
* **en** -- Ethernet
* **sl** -- serial line IP (slip)
* **wl** -- wlan
* **ww** -- wwan

Then the rest of the interface name is based off of:
* Firmware/bios-provided index numbers for on-board devices
* Firmware-provided pci-express hotplug slot index number
* Physical/geographical location of the hardware
* The interface's MAC address

If you want to see what the schema looks like _exactly_... heres some **[documentation](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Networking_Guide/sec-Understanding_the_Predictable_Network_Interface_Device_Names.html)**, or look directly in the **[source](https://github.com/systemd/systemd/blob/master/src/udev/udev-builtin-net_id.c#L20)**.

Undoubtedly, there's going to be quite a few people out there who aren't a fan of the new "predictable" interface names, and if thats the case for you, you can disable it, just read over the documentation found **[here](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Networking_Guide/sec-Disabling_Consistent_Network_Device_Naming.html)**.

___

### Systemd Log Parsing
Instead of just handing you some parsing tools (_cat, head, tail, grep,_ etc), and pointing you in the direction of the _systemd_ log files, you get another tool! It's called, _The Journal_ (**journalctl**).

Whenever I parse log files while debugging an application or service, there's usually some pretty tedious little things I need to do, things that aren't very complicated, but they're just a pain in the ass.. Such as grabbing logs between specific timestamps, changing the timestamps to the local time, parsing the previously rotated logs with the current one, etc etc. These are the types of things that _Journal_ does for you.

Heres just some of the included features I've found so far:
* The priority of entries is marked visually. Lines of error priority and higher are highlighted with red color and a bold font is used for lines with notice and warning priority
* The time stamps are converted for the local time zone of your system
* All logged data is shown, including rotated logs
* The beginning of a boot is tagged with a special line
* Specify different verbosity levels of the log content to be viewed
* Specify what fields should be shown
* Reverse the output of the logs (placing newest data at top)

Obviously theres nothing here you can't do with some already existing binaries, so it's more of a convenience factor I suppose.

___

### File System
Every time RHEL publishes a new OS release, they change the default filesystem - RHEL 5 was on _ext3_, RHEL 6 was on _ext4_, and RHEL 7 is on **xfs**. Since the filesystems aren't completely compatible, you can't just migrate from _ext3/4_ to _xfs_, but that doesn't mean you'll lose any functionality after migrating to _xfs._ I looked around for quite a bit for any loss of functionality when moving to xfs, and came up with nothing, other than awesome performance boosts.

Obviously since the underlying filesystem has been changed, the commands used to manage them will be different as well. The chart below should help you, it lists the task, then the commands to accomplish said task in _ext3/4_, then how to accomplish the same thing on an _xfs_ filesystem:

|Task|ext3/4|xfs|
|--- |--- |--- |
|Create new FS|mkfs.ext4 or mkfs.ext3|mkfs.xfs|
|Check filesystem|e2fsck|xfs_repair|
|Resize FS|resize2fs|xfs_growfs|
|Create image of the FS|e2image|xfs_metadump & xfs_mdrestore|
|Tune or label an FS|tune2fs|xfs_admin|
|Backup a FS|dump and restore|xfsdump & xfsrestore|

The last thing I'll bring up is the file size limitations, In RHEL6 using ext4, the largest a single filesystem could get would be **16TB** - That limit has been increased to **500TB** in RHEL7 using xfs

___

**Sources**
* [Fedora Project](https://fedoraproject.org/wiki/FirewallD#What_is_a_zone.3F)
* [RHEL 7 - Systemd Targets](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/System_Administrators_Guide/sect-Managing_Services_with_systemd-Targets.html)
* [RHEL 7 - Firewalls](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Security_Guide/sec-Using_Firewalls.html)
* [RHEL 7 - Network Manager](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Networking_Guide/sec-Using_the_NetworkManager_Command_Line_Tool_nmcli.html)
* [RHEL 7 - Predictable Network Interface Names](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Networking_Guide/sec-Understanding_the_Predictable_Network_Interface_Device_Names.html)
* [RHEL 7 - Migrating from ext4 to xfs](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Storage_Administration_Guide/ch06s09.html)
* [RHEL 5/6/7 Cheatsheet](https://access.redhat.com/sites/default/files/attachments/rhel_5_6_7_cheatsheet_27x36_1014_jcs_web.pdf)
* [RedHat - Filesystem Limitations](https://access.redhat.com/solutions/1532)
* [SystemD Manual](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
