---
title: "How to quickly and efficiently delete all data in a LARGE MySQL table using TRUNCATE"
template: posts.hbt
summary: "How to quickly and efficiently delete all data in a LARGE MySQL table using TRUNCATE"
featured_image: "assets/articles/mysql.jpeg"
date: 2012-06-21
categories:
author:
  firstname: "Kyle"
  lastname: "Corupe"
  username: "kcorupe"
tags:
---
If you have a very large table in MySQL and you need to delete all the data from it. Instead of using the DELETE syntax or DELETE FROM tablename; It is best to use the TRUNCATE syntax.

This will delete all data in the table very quickly. In MySQL the table is actually dropped and recreated, hence the speed of the query.

```bash
$ mysql> TRUNCATE TABLE tablename;
```

Query OK, 0 rows affected (10.34 sec)[/bash]

**Note:** The number of deleted rows for MyISAM tables returned is zero; for INNODB it returns the actual number deleted.
