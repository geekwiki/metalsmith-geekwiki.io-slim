---
title: "How to add a new Linux user account"
template: posts.hbt
summary: "How to add a new Linux user account"
featured_image: "assets/posts/adding-a-new-user.jpg"
date: 2013-07-15
categories:
author:
  firstname: "Geoff"
  lastname: "Hatch"
  username: "ghatch"
tags:
---
Adding a new user to a Linux machine is one of the simplest things to do. The useradd command works under any linux distro. You will however need to be root to add the new user via the useradd command, the syntax is as follows:

**useradd [options] (username)**

By using the above command, it will do everything for you including creating the user's home directory, adding them to /etc/passwd and /etc/shadow. So let's say you wanted to add a new user named digest, you would simply do the following:

```bash
$ useradd digest
```

One example that you can use for the options as well is to add a user to a particular group when you add them.. For example, let's say we wanted the digest user to be in the wheel group so they can sudo to root. We would simply issue the following command:

```bash
$ useradd -G wheel digest
```

Or if you wanted to create a group with the same username you can use the -U flag like so:

```bash
$ useradd -U digest
```

If you added the user, you then need to set a user's password. If you do not set a user's password the account will be in a locked status. To unlock it, simply issue the following command to set a password:

```bash
$ passwd digest
```

It then will prompt you to input the new password, and to confirm the new password.

There are many additional features and things you can do with the useradd command, simply run man useradd on a linux server to see all the different flags.
