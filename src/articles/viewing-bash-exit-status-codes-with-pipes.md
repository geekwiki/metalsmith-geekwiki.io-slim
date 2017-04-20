---
title: "Viewing Bash Exit Status Codes With Pipes"
template: posts.hbt
summary: "Viewing Bash Exit Status Codes With Pipes"
featured_image:
date: 2012-06-25
categories:
author:
  firstname: "Justin"
  lastname: "Hyland"
  username: "jhyland87"
tags: bash, tee, pipe, exit, codestee, exit, code
---
Recently I was executing bash scripts from within bash scripts, and executing commands based off of exit code, typically I just use

```bash
/bin/bash ./script.sh || echo "script.sh failed"
```

or just the typical

```bash
/bin/bash ./script.sh
if [ $? -ne 0 ]; then echo "script.sh failed"; fi
```

But now what if you are also piping the output of _script.sh_ through _tee_? Then you will see that $? is actually the exit code of the tee command.

I found a nifty bash variable/array, $PIPESTATUS. This is an array that contains the exit statuses of all of the exit codes ran by the last command.

By default, if you just echo $PIPESTATUS, you will get the first value, which in this case would be the exit value of /bin/bash ./script.sh.

The exit code of the scripts/commands are placed into the $PIPESTATUS array in the same order that they are executed. Heres an example of how to properly access the exit codes:

```bash
who | wc -l | foo

if [ ${PIPESTATUS[0]} -ne "0" ]; then
 echo "The 'who' command failed"
elif [ ${PIPESTATUS[1]} -ne "0" ]; then
 echo "The 'wc -l' command failed"
elif [ ${PIPESTATUS[2]} -ne "0" ]; then
 echo "The 'foo' command failed"
else
 echo "it worked!"
fi
```
