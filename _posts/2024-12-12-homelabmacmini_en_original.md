---
layout: post
title: "Build HomeLab With Mac Mini (English)"
description: "A complete guide to building your own HomeLab using a Mac Mini - from network gateway to media center, photo management, and IoT control."
categories: [技术, 玩]
tags: [HomeLab, Mac Mini, NAS, 网络代理, IoT, 家庭服务器]
---

* Kramdown table of contents
{:toc .toc}

# Build HomeLab With Mac Mini

Hello everyone, today I'm excited to share how to build a HomeLab using a Mac Mini. Let's explore it in three parts.

## Summary

- What is HomeLab?
- Why do I use Mac Mini for HomeLab?
- How to implement various functions with a Mac Mini?

## What is HomeLab?

Now, let's dive into the first topic: What is HomeLab?

HomeLab refers to a self-constructed server environment where you can develop, install applications, and practice various technical skills. It generally consists of a network, a server, and client devices. It typically needs to be online 24/7.

![HomeLab Overview]({{site.paths.image}}/20241212/1280X1280.png)

![HomeLab Devices]({{site.paths.image}}/20241212/1280X1280-2.png)

Here are some HomeLab images from the Internet. The left image shows an overall HomeLab setup. There are several devices in the frame: an HP MicroServer (Gen10 Plus series - also available in Gen8, Gen10, Gen11 variants), a UniFi switch, and a UniFi network router. UniFi is a company that provides a series of networking products, including switches, routers, access points, and controllers.

So, what can we do with a HomeLab? I believe we can accomplish many things because it's essentially a server - our best tool for creativity.

Here are some interesting things I've done with my HomeLab:

- **Network Gateway**: We often study English on YouTube, Netflix, or ChatGPT, so we use tools like Clash to help us connect to foreign websites. But not every device can install these tools. For example, Meta Quest is blocked by Meta when used with a Chinese network, and it can't install Clash. So we can use our HomeLab to build a Network Gateway, allowing the Quest to connect through our gateway to access foreign websites.

- **Photo Storage (NAS)**: We often take many photos on our phones, but phone storage is limited. We can use our HomeLab to build a NAS, upload photos from our phones, and then access them from any computer or device.

- **Media Center**: We often collect films to watch later. You might ask why not use Netflix or YouTube? Because the quality isn't always good enough. We can download high-quality films to our HomeLab and watch them on our phone or TV.

- **IoT Gateway**: Maybe you have many IoT devices from different brands, requiring different apps to control them. We can use our HomeLab to build an IoT Gateway. If you have an iPhone and want to use Siri to control your IoT devices, we can implement that too. Then you can say "Hey Siri, turn on the light in my room" to control your lights.

## Why Do I Use a Mac Mini for HomeLab?

We can build a HomeLab to do many things, and there are numerous ways to build one. Why did I choose a Mac Mini? The honest reason is that I happened to have one.

But here are some other good reasons:

- **Beautiful and compact**: It's a very elegant product, small enough for easy storage.
- **Low power consumption**: It uses very little power on standby.
- **Apple ecosystem integration**: It seamlessly integrates with the Apple Ecosystem.
- **Silent operation**: It runs quietly without noticeable noise.
- **Affordable**: A second-hand Mac Mini costs less than 2000 RMB. It offers good value for money.

## How to Implement Functions with a Mac Mini?

If you have a Mac Mini and want to accomplish these tasks, I'll share how to implement each function.

### Prerequisites

First, you need to complete some prerequisite operations. You need to change some settings to keep your Mac Mini always online and controllable from anywhere in your home.

1. **Network Connection**: Connect the Mac Mini to your network using an Ethernet cable. This ensures a stable network connection.

2. **Power and Login Settings**: Disable Low Battery Mode, disable screen auto-lock, configure automatic login with a default user when Mac starts up, and set apps to auto-start. After these changes, your Mac will automatically log in when started.

3. **Remote Access**: Enable Screen Sharing, File Sharing, and Remote Control. After this, you can operate your Mac Mini from another computer on the same network.

Then, test controlling your Mac Mini from another computer (Windows or Mac). If you can see the Mac Mini's desktop and control it, congratulations! You've completed the prerequisites successfully. You can now place the Mac Mini in a suitable position - it can even serve as a decoration.

### Set Up as Network Gateway (Bypass)

Now, let's set it up as a Network Gateway.

This function has several useful scenarios. You can use it to route your home network traffic, allowing any device to access foreign websites.

**Materials needed**: Mac Mini, Network Router, and Clash or Surge app.

**Steps**:

1. Log into your network router console and reserve a portion of the DHCP range.
2. Enable Enhanced Network Mode in the Clash/Surge app.
3. Configure your network as shown in the diagram.

After these operations, try visiting Google with Safari on your iPad to test your network. If successful, your iPad should access Google without issues. This is the least invasive approach.

### Build a Film Center

We can use our Mac Mini to build a Film Center. Imagine wanting to watch a movie on a weekend, but online quality isn't good enough. Online video players control their bandwidth costs, so their "4K" videos are compressed using algorithms like H.264/H.265. Instead, we can download high-quality video resources and store them on our Mac Mini, then watch them on our phone or TV.

**Materials needed**: Mac Mini, hard disk enclosure, and a player app like Infuse.

**Why a hard disk enclosure?** The Mac Mini's internal storage is limited, and we need space for many films. An external hard disk enclosure provides the necessary storage.

**About hard disk enclosures**: There are different types available. SSD enclosures are more expensive but very fast and stable - most support Thunderbolt 4 protocol with theoretical speeds up to 40 Gbps (5GB/s). HDD enclosures offer larger storage capacity at lower cost, with sufficient speed for media playback.

**Setup Steps**:

1. Connect the hard disk enclosure to the Mac Mini and format it.
2. Download films to the hard disk using a download manager.
3. Organize the films using TMM (TinyMediaManager) app.
   - Why? When you use a player app to scan movies, it identifies them and fetches posters and subtitles. TMM helps standardize file naming, improving identification accuracy.
4. Enable SMB service on your Mac Mini. Any device on the same local network can then connect to your storage via SMB.
5. Open your player app and add the SMB resource from your Mac Mini. You should see your downloaded movies.

Congratulations! You can now relax at home and enjoy high-quality movies prepared for the weekend.

### Build a Photo Center

After building the Film Center, setting up a Photo Center is straightforward.

Since we've already enabled SMB service on the Mac Mini, we only need to address two things:

1. How to sync photos to the Mac Mini via SMB.
2. How to view photos stored on the Mac Mini.

Fortunately, there are two applications that help:

- **PhotoSync**: Syncs photos from your phone to the Mac Mini via SMB.
- **PhotoPrism**: Provides a web interface to view and manage your photos.

### Data Center

If you want to upload or download other types of files, you can install the Alist application, which also supports the SMB protocol.

I won't go into details here, but you can visit the [Alist Homepage](https://alist.nn.ci/) for more information. It's easy to set up.

### IoT Control Center

This part might interest you. As we know, there are many IoT devices in the market from popular brands like Xiaomi and Huawei. When furnishing our homes, we often consider IoT devices - many from Xiaomi. If your phone is also Xiaomi, you can control everything through their voice assistant. But if you have an iPhone or devices from different brands, you can't control them all from a single app.

We can use our Mac Mini to build an IoT Control Center. You can use it to control all devices, or use "Hey Siri" to control them.

If you have a HomeLab server, it's easy to set up. Install an application called HomeAssistant. It has many plugins developed by the community. Search for keywords like "Xiaomi HomeAssistant" on Google to find installation guides.

The framework works like this: HomeAssistant acts as a gateway for different brand devices. You install plugins for each brand and control all IoT devices through HomeAssistant.

If you want to control them with Siri, install another plugin called HomeBridge. HomeBridge adapts devices to the Apple HomeKit protocol, registering them with Apple's IoT gateway. Then you can control your IoT devices using your iPhone.

I won't paste more details here - you can read the guide from the HomeAssistant official page.

### Backup Data

You might be concerned about the safety of data saved on your Mac Mini. Apple has a solution: Time Machine. It's very easy to use - read Apple's official guide for details.

Time Machine is an excellent solution. You can regularly backup data to external storage and restore it anytime you need.

### More Functions

If you want to access your HomeLab beyond your local network, there are several solutions:

- **Public Network IP**: Request a static public IP from your ISP.
- **VPN**: Set up WireGuard or OpenVPN for secure remote access.
- **FRP**: Use FRP for internal network penetration.
- **Remote Control**: Use services like Tailscale for zero-config networking.

## Conclusion

To summarize, if you build a HomeLab, you'll have many interesting possibilities to explore. A Mac Mini provides an excellent foundation - it's compact, quiet, power-efficient, and integrates beautifully with the Apple ecosystem.

Start small, experiment, and gradually expand your HomeLab capabilities. Happy building!
