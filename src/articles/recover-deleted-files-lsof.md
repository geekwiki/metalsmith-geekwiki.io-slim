---
title: "Recover Deleted Files With LSOF"
template: posts.hbt
summary: "Recover Deleted Files With LSOF"
featured_image: "assets/articles/forensics.jpg"
date: 2014-06-23
categories:
author:
  firstname: "Justin"
  lastname: "Hyland"
  username: "jhyland87"
tags: deleted, descriptors, file, files, forensics, recovery, Linux, lsof
---
![Forensics](/assets/articles/foren.jpg)

Linux has a very lengthy list of powerful commands and tools, some are specific to certain distributions and thus, can't be used on every server. One of my favorite commands would be [lsof](http://linux.die.net/man/8/lsof "Man Page - lsof (List Open Files)"), which stands for _List Open Files_. It's an extremely useful and powerful command, which means it takes some practice to get familiar with it, but it's worth it! _It's one of those commands that every Linux Sysadmin should know!_ Today, I made a mistake, thank God I was able to do some research and recover the data I deleted. I typically use [tar](http://linuxcommand.org/man_pages/tar1.html) to create tar.gz format files, to archive and compress, very rarely do I gzip files or deal with just gzip'd files.

I gunzip'd a gz'd log file, and opened it up in less and started poking around. Then I went into another terminal and deleted the file I was looking at with less.

I forgot that when you gunzip a file, you delete the .gz version of the file itself, so you shouldn't just delete it, you should gzip it again.

So at first thought, the file was gone!... Until I learned a little trick. You can recover files with open file descriptors using lsof.

Basically, when you delete a file that's open by another process, it deletes the inode, not the data on the file that the inode contains the location to.

Lets show by example...

Execute..

```bash
$ echo 'this is a test file' > /tmp/delete-me.txt && less /tmp/delete-me.txt
```

Now open another console session **(important)**, sudo into root, and cd into /tmp and delete delete-me.txt

```bash
$ rm /tmp/delete-me.txt
```

Now if you know much about the lsof command, you know the command  _lsof +L1_ will show you all the open file descriptors to deleted files ([Also covered in this article](http://www.linuxdigest.org/2014/02/commands-du-df-whats-difference/)) , as well as the process ID, command and the file descriptor. So run this command and grep for your deleted file.

```bash
$ lsof +L1 | grep delete-me.txt
less 12780 jhyland 4r REG 8,6 20 0 4980757 /tmp/delete-me.txt (deleted)
```

Pay attention to the columns with the PID (second) and the File Descriptor (fourth).

This information helps you find the information inside the /proc directory, using the PID, and the FD, you can recover the data (if its still being held open by whatever command is using it, in this case, less)

Lets take a look at the file descriptor...

```bash
$ sudo cat /proc/12780/fd/4
this is a test file
```

There ya go! The 'deleted' data is right there. You can cat the file descriptor and redirect the output to another file.

```bash
$ sudo cat /proc/12780/fd/4 > /tmp/recovered-file.txt
```

File recovered :)
