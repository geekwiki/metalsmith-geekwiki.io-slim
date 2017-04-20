---
title: "MacbookPro SD Write Problem - Solved... Kinda?"
template: posts.hbt
summary: "MacbookPro SD Write Problem - Solved... Kinda?"
featured_image: "assets/articles/SD_Card-write_protection_switch.jpg"
date: 2014-02-20
categories:
author:
  firstname: "Justin"
  lastname: "Hyland"
  username: "jhyland87"
tags: raspberry pi, SD card, xbmc
---
So lately, I've been playin around with [Raspberry PI](http://www.raspberrypi.org/) a lot. In doing so, (Assuming you are on a Macbook), you have to use the Disk Utility quite a bit.

You have to plug in your SD card, unmount it's partitions (without ejecting the whole SD Card), then use DD to write the image to the SD card.

The problem i've been having, is that the SD cards are mounted in read only mode, even when the side switch isn't on _locked_. And according to The Google Gods, I'm not the only one with this problem.

Whenever I mount the SD card, and open Disk Util, then look at the Info tab, it shows it's not writeable. I was able to go out and get an external SD card reader to fix the issue, but I wanted the one that came on my Macbook pro to work... because it should work, like a PRO.

After many nights of Googling and link hopping, I came across the dumbest solution that I never thought would work. I read it, and I thought "This guys gotta be doing something else wrong".

Solution: You know the switch on the side that some OS's ignore, but Macbook doesn't? Don't switch it to on, or off, leave it in the middle... yeah... leave it in the middle. I did that, and guess what.... It was writable again!

If you find some other solution, please let me know!
