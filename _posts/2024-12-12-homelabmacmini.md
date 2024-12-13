---
layout: post
title: ""
description: ""
categories: [玩]
tags: [HomeLab]
---

* Kramdown table of contents
{:toc .toc}


# Build HomeLab With MacMini

Hello everyone, today I'm excited to share how to build a HomeLab using a Mac Mini. Let's explore this in three parts.

## Summary

* What is HomeLab?

* Why do I use Mac Mini for home lab?

* How to implement some functions with a Mac Mini?


## What is HomeLab?

Now, we are stepping into the first point, what is HomeLab?  

HomeLab refers to a self-constructed service that you can develop on and install some applications to help you to learn and practice. It generally consists of a network, a server, and a client. It also generally needs to be online every day and every hours.  

![]({{site.paths.image}}/20241212/1280X1280.png)  

I pasted a image of HomeLab from the Internet. The left image shows the overall of one HomeLab. There are some devices in the frame: one service that belongs to the product of HP MicroServer named Gen10 Plus, and there are some different skus in this product like Gen8, Gen10, etc. one of the devices is a UniFi's switch. By the way, UniFi is a company that provides a series of products, including a switch, a router, a AP, etc. The Network Router in the images is a product of UniFi.  

So, if we build a HomeLab, what can we do with our HomeLab? I think we can used it do a lot of things, because it is a server that is our the best tool for creativity.  

I list some very interesting things that I have done with my HomeLab to share with you.  

* We often study English on Youtube, Netfix or ChatGPT, so we use some tools of science like Crash to help us connect to the Internet when we are not in our company. But you know, not every device can install those tools, for example, Mate Quest, it is locked by the company when we use it with a Chinese network. It also can't install a tool of science in it. So we can use our HomeLab build a Network Gateway. Then we can let the Quest connect to our Gateway to connect to the Internet.  
* We often take a lot of photos on our phone, but the memory in our phone is not enough. So we can use our HomeLab to build a NAS. Then we can use our phone to upload the photos to the NAS, and then we can use our other computer or phone to download the photos from the NAS.  
* We often collect a lot of Films to watch later. Maybe you want to ask why we don't use a cloud service like Netfix or Youtube to watch the films. Because the quality of the films is not good enough. So we can download the films to our HomeLab and then use our phone or our TV to watch the high quality films.  
* Maybe there are a lot of IOT devices in your house, and there are some different brand of those, you need to install different software to control them. So we can use our HomeLab to build a IOT Gateway. More then that, maybe you have an IPhone, and you want to use the Siri in your IPhone to control your IOT devices. So we can use our HomeLab to build a IOT Gateway. Then you can say "Hey Siri, turn on the light in my room".  

## Why do I use Mac Mini for home lab?

We can build a home lab to do a lot of things, and there are numerous ways to build a home lab. Why I choose Mac Mini for my home lab?  I think the deep reason is that I happen to have a Mac mini.  

But I still list some other reasons why I choose Mac Mini for my home lab.

* It is a very beautiful product, and it is small enough for easy storage.  
* It spend very little power when it on standby.  
* It is seamless intergrated with the Apple Ecosystem.  
* It is slient.
* It is perhaps become a little bit value for money.

## How to implement some functions with a Mac Mini?

Now, you have got a Mac Mini, and you want to do those things with it. So I will share how to implement those functions with a Mac Mini.

### Prepare operations

First, you need to do some prepare work. You need to change some settings to keep your Mac Mini always online and can be control everywhere in your home.

1. Connect the Mac Mini to the network using an Ethernet cable. After these, your mac will be connected to the network.
2. Close the Low Battery Mode, Close auto lock the Mac's screen, Use a default user to login when the Mac starts up and let some apps auto start up where Mac starts up. After these, you mac will auto login and start up some important apps when it is started up.  
3. Open share the screen and file system and open remote login. After these, you can operate your Mac Mini with another computer.

Then, you need have a test to control your Mac Mini on another computer, whatever Windows or Mac. If you can control, congradulations, you can place the Mac Mini confidently in a suitable location. It can even be used as a decoration.  

### Set up as Bypass

And now, we will set it up as a Network Gateway. There are some metarials that you need to prepare: Mac mini, Network router and a Clash app or Surge app.  

1. We need to login the contral console of the Network router and remain a blank fragment of DHCP
2. Open the Enhanced Network Mode in the Clash/Surge app.  
3. Set your network frame like this.  

After those options, you can try to visit Google to test your network if meets expectations.  

### Contribute a Film center  

We can use our Mac Mini to build a Film center. Imagine that you want to see a movie on a weekenday, but the quality of the movie that online is not good enough.Because we all know that online video player need to control their cost of network, so the 4k vedios are not really 4k, they are all compacted by some data compression algorithms. But we can search the video resource on the Internet and download it to our Mac Mini, then we can use our phone or TV to watch the it.

But how to do it? we need to prepare some metarials:a Mac mini, a hard disk enclosure, a player app like 网易爆米花 or infuse.

Why we need to prepare a hard disk enclosure? Because the hard disk in the Mac mini is too small, and we need to store a lot of films. So we need to prepare a hard disk enclosure to store the films.

About the hard disk enclosure, there are some different types that we can select. For example, we can select a SSD enclosure, or a HDD enclosure. The SSD enclosure is a little expensive than the magnetic, but it is very fast and stable, because most of them support the  Thunderbolt™ 4 protocol, whose theatrical speed is up to 40 Gbps as known as 5GB/s. If we choise the HDD, we can build a very large storage and the transfer speed is also enough. The theoretical speed is up to 5Gbps as known as 400MB/s.

After we have prepared these materials, we can start to build our Film center.

1. Connect the hard disk enclosure to the Mac mini and format it. like this image.
2. We can download the films to the hard disk enclosure by XunLei.  
3. We can prepare these films use the TMM(tinymediamanager) app.  
   1. Why we need to do it? When we download a film to the hard disk, the bottom line is that we need change the file's name to the movie's name. When we use the player app scan these movies, it will idntify the movie and research its posters and subtitles. But how to help to increase the accuracy? We can use the TMM app pre format it, then the player will inditicy it very accurately.
4. Open our Mac mini SMB service. After that, any devices on the same local network will use SMB connected to your disk storage.  
5. Open the player app, add the SMB resource that our Mac mini provide. Then, if you add it sucessfully, you will see the movies that you downloaded.  

Congradulations! You can lie at home and enjoy a high-quality movie that has been prepared for the weekends.  

### Contribute a Photo center

When we finish build the film center, we can contribute a photo center conveniently.  

we have open the Mac mini's SMB service, so we only need to think about two things:

1. How to sync our photos to the Mac mini with SMB.  
2. How to view our photos on the Mac mini.  

It is very lucky that we just find two applications to help us:

* Photosync can help us sync our photos to the Mac mini with SMB.
* Photoprism can help us view our photos on the Mac mini. 

These images are the details.

### Data center

If you want to upload or dowload other type files, you can install the Alist application, it also can use the SMB protocol.

I will not tell the details here, but I past the Alist home pager here: [Alist HomePager](https://alist.nn.ci/zh/ ), you can read it, it is very easy for you.  

### IOT Control Center

Maybe you are interested in this part, because as we know now, there are a lot of IOT devices in the market, and some brands are very popular, like Xiaomi, HuaWei, etc. when we furnish our home, we will more and less consider some IOT devices. you can buy mostly devices from Xiaomi. If your phone's brand is Xiaomi, you can control all of them by 小爱同学. But if the phone of you is IPhone or you have some different brand of IOT devices, you can not control them by a same app. So we can use our Mac mini to build a IOT Control Center. You can use the IOT Controller to control these devices or you can use "Hi siri" to control them.  

If you have a HomeLab server, It is very easy to do it. you need to install a application named HomeAssistant. There are a lot of plugins for it that other developers have developed. You can research some keywords like "XiaoMi Homeassistant" in Google, then you can find a guide to install it.

The frame like this image: Installing some plugins in HomeAssistant and install another plugin named HomeBride, the HomeBridge can help you emulat the Apple HomeKit protocol to registe to a Apple IOT Gateway, then you can control your IOT devices by you Iphone.

I don't past more details here, you can read the guide from HomeAssistant main paper.

### Backup Data

Maybe you are afraid of the safety of the data that you saved in your Mac mini, Apple has a solution for it. You can use the Time Machine to backup your data. It is very easy to use. You can read the guide from Apple's main paper.

Time Machine is a very good solution, you can regularly backup the data in an Apple device to a storage and then you can restore the data from the storage anytime if you want.

### More Funtions

If you are not limited to using your homelab within a local area network. There are also some solution for you.  

* Public Network IP
* VPM
* Frp
* Remote Control




