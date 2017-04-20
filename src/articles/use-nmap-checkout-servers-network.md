---
title: "Use NMAP to Checkout Servers On Your Network"
template: posts.hbt
summary: "Use NMAP to Checkout Servers On Your Network"
featured_image: "assets/articles/nmap_logo_vx.jpg"
date: 2014-02-20
categories:
author:
  firstname: "Justin"
  lastname: "Hyland"
  username: "jhyland87"
tags: Linux, nmap
---
First... _What is NMAP?_
> nmap (Network Mapper) is a security scanner originally written by Gordon Lyon (also known by his pseudonym Fyodor Vaskovich)[1] used to discover hosts and services on a computer network, thus creating a "map" of the network. To accomplish its goal, Nmap sends specially crafted packets to the target host and then analyzes the responses.

Most places if worked, for some reason, don't use Nmap as much as you would think. Occasionally I'll have someone walk over and ask me if I know something about an IP (what OS, what application, etc), I'll ask what they've done so far, and typically the reply is something along the line of "I ran a ping and tried to get the hostname". Well weather or not the ping was successful, it wont tell you much, and unless theres a very specific hostname convention, and a PTR record for that IP, you still won't get much.

One of Nmaps most famous features is OS Guessing, what it does is scans the targets open ports, and looks through an [OS Detection Database](https://svn.nmap.org/nmap/nmap-os-db), then spits back the ports/protocols, and which OS's it think may be on the device.  

Now if you work in the network, you would know right away if it's just a Linux server, Oracle appliance, MySQL server, Firewall, F5... etc etc.  

The following examples are me running NMAP from my local Macbook Pro against my personal [www.justinhyland.com](http://www.justinhyland.com) hosted server, so don't expect to find anything special.  

The three flags you will almost always want to use are

*   **-v** - Verbose
*   **-O** - OS GUess
*   **-Pn** - Skip the ping step (incase the target has ICMP disabled)

So let's start with a simple Nmap query using the flags listed above...

```bash
$ sudo nmap -v -Pn -O 23.227.177.25

Starting Nmap 6.25 ( http://nmap.org ) at 2014-02-19 23:32 MST
Initiating Parallel DNS resolution of 1 host. at 23:32
Completed Parallel DNS resolution of 1 host. at 23:32, 0.07s elapsed
Initiating SYN Stealth Scan at 23:32
Scanning 23-227-177-25-vpsdime.com (23.227.177.25) [1000 ports]
Discovered open port 22/tcp on 23.227.177.25
Discovered open port 80/tcp on 23.227.177.25
Discovered open port 8090/tcp on 23.227.177.25
Discovered open port 3322/tcp on 23.227.177.25
Completed SYN Stealth Scan at 23:33, 4.46s elapsed (1000 total ports)
Initiating OS detection (try #1) against 23-227-177-25-vpsdime.com (23.227.177.25)
Nmap scan report for 23-227-177-25-vpsdime.com (23.227.177.25)
Host is up (0.050s latency).
Not shown: 992 closed ports
PORT     STATE    SERVICE
22/tcp   open     ssh
25/tcp   filtered smtp
80/tcp   open     http
135/tcp  filtered msrpc
139/tcp  filtered netbios-ssn
445/tcp  filtered microsoft-ds
3322/tcp open     active-net
8090/tcp open     unknown
Device type: general purpose
Running: Linux 3.X
OS CPE: cpe:/o:linux:linux_kernel:3
OS details: Linux 3.1 - 3.4
Uptime guess: 27.680 days (since Thu Jan 23 07:13:26 2014)
Network Distance: 14 hops
TCP Sequence Prediction: Difficulty=260 (Good luck!)
IP ID Sequence Generation: All zeros
```

So from the above Nmap result, you can pretty much immediately tell its a Linux server, with some abnormal ports open (8090, 3322), as well as a good guess of what application is running on those ports. It also gives you a pretty accurate OS guess. Heres the output of uname from the target server itself

```bash
# # uname -r -o
2.6.32-042stab084.12 GNU/Linux
```

So it got the kernel version pretty close _(Linux 2.6.19 - 2.6.35)_, and it got the OS correct _(Linux)_

Lets add some more useful flags..
*   **--allports** - Don't exclude any ports from version detection
*   **--reason** - Host and port state reasons
*   **-n** - Never do DNS resolution (Also makes it quicker)
*   **-sV** - Probe open ports to determine service/version info

```bash
$ sudo nmap -v -Pn -n -sV --allports -O --reason 23.227.177.25

Starting Nmap 6.25 ( http://nmap.org ) at 2014-02-19 23:33 MST
NSE: Loaded 19 scripts for scanning.
Initiating SYN Stealth Scan at 23:33
Scanning 23.227.177.25 [1000 ports]
Discovered open port 22/tcp on 23.227.177.25
Discovered open port 80/tcp on 23.227.177.25
Discovered open port 3322/tcp on 23.227.177.25
Discovered open port 8090/tcp on 23.227.177.25
Completed SYN Stealth Scan at 23:33, 2.10s elapsed (1000 total ports)
Initiating Service scan at 23:33
Overriding exclude ports option! Some undesirable ports may be version scanned!
Scanning 4 services on 23.227.177.25
Completed Service scan at 23:33, 31.00s elapsed (4 services on 1 host)
Initiating OS detection (try #1) against 23.227.177.25
NSE: Script scanning 23.227.177.25.
Nmap scan report for 23.227.177.25
Host is up, received user-set (0.049s latency).
Not shown: 992 closed ports
Reason: 992 resets
PORT     STATE    SERVICE      REASON      VERSION
22/tcp   open     ssh          syn-ack     OpenSSH 5.3 (protocol 2.0)
25/tcp   filtered smtp         no-response
80/tcp   open     http         syn-ack     Apache httpd 2.2.15 ((CentOS))
135/tcp  filtered msrpc        no-response
139/tcp  filtered netbios-ssn  no-response
445/tcp  filtered microsoft-ds no-response
3322/tcp open     ssl/http     syn-ack     ZNC IRC bouncer http config 0.097 or later
8090/tcp open     http         syn-ack     Apache Tomcat/Coyote JSP engine 1.1
Device type: general purpose
Running: Linux 3.X
OS CPE: cpe:/o:linux:linux_kernel:3
OS details: Linux 3.1 - 3.4
Uptime guess: 27.681 days (since Thu Jan 23 07:13:25 2014)
Network Distance: 14 hops
TCP Sequence Prediction: Difficulty=257 (Good luck!)
IP ID Sequence Generation: All zeros
```

Granted, all of this information is nothing more than openly accessible information from the system, it sure tells you a lot more than you would be able to find out on your own.

You can also use Nmap to scan entire subnets, to find any hosts that you don't know are on your network. Or say you just plugged in a new device, cant login to it, your router hasn't cached the network layout yet, you could use nmap to simply scan the subnet. The example command is..
```bash
$ sudo nmap -sS -O 192.168.1.1/24
```

Another feature of Nmap that I like a lot is the _-oX filename.xml_ flag, which outputs all of the information into XML format in the filename filename.xml. This is very useful if you plan to script against your results. Much more useful than just using _grep_, _awk_ or _sed_ against the output.  

Thats it! Now before you run to someone else about a system you have no idea about, use **Nmap**!
