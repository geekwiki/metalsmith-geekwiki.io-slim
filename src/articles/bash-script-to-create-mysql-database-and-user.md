---
title: "Bash script to create MySQL database and user"
template: posts.hbt
summary: "Bash script to create MySQL database and user"
featured_image: "assets/articles/bash-create-mysql-db-user.jpeg"
date: 2012-06-10
categories:
author:
  firstname: "Geoff"
  lastname: "Hatch"
  username: "ghatch"
tags: bash, mysql, script, database, user
---
I don't know about you, but often times I find myself needing to create a MySQL database and I simply forget all of the commands. This is really something that I should remember, but for some strange reason I just never am able to remember it. So like any other admin would do, you script it out to make it easier on yourself. This bash script will allow you to create new databases on the fly quickly and easily. This has been nothing but a time-saver.

```bash
#!/bin/bash

echo -n "Enter the MySQL root password: "
read -s rootpw
echo -n "Enter database name: "
read dbname
echo -n "Enter database username: "
read dbuser
echo -n "Enter database user password: "
read dbpw

db="create database $dbname;GRANT ALL PRIVILEGES ON $dbname.* TO $dbuser@localhost IDENTIFIED BY '$dbpw';FLUSH PRIVILEGES;"
mysql -u root -p$rootpw -e "$db"

if [ $? != "0" ]; then
 echo "[Error]: Database creation failed"
 exit 1
else
 echo "------------------------------------------"
 echo " Database has been created successfully "
 echo "------------------------------------------"
 echo " DB Info: "
 echo ""
 echo " DB Name: $dbname"
 echo " DB User: $dbuser"
 echo " DB Pass: $dbpw"
 echo ""
 echo "------------------------------------------"
fi
```
