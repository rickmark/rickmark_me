---
title: "The Lightning and USB Attack Surface: TOCTOU Storage, WebUSB and Accessory Signaling"
date: "2019-04-29 12:00:00 +0000"
description: "A working survey of the iOS physical-connector attack surface: a FUSE harness that gives malicious USB mass storage a time-of-check/time-of-use split, a WebUSB page that reaches a hidden Apple device configuration from a browser, and accessory-ID signaling that can force DFU. Draws together badusb, lightning_strike and lightning_dfu."
tags:
  - working draft
  - hardware security
render_with_liquid: false
---
*Working draft.* See [About 'WIP'](/blog/about-wip/). A survey drawn from three of my repositories: [badusb](https://github.com/rickmark/badusb) (USB mass-storage TOCTOU, 2019), [lightning_strike](https://github.com/rickmark/lightning_strike) (Lightning USB captures and a WebUSB proof of concept, 2019 and 2021) and [lightning_dfu](https://github.com/rickmark/lightning_dfu) (accessory-ID DFU signaling, 2021). The connector-specific parts are from 2021; the storage work is from 2019. It builds on the posts [PlugNPwn: Connect to Jailbreak](/blog/plugnpwn-connect-to-jailbreak/) and [ACE Controller Secrets](/blog/ace-controller-secrets/).

## Abstract

The physical connector is the part of a phone's trust boundary the user is least able to reason about. A cable or a dock looks inert, and a browser tab looks sandboxed, yet both can reach device interfaces that firmware treats as trusted. This survey collects three small studies of that surface. First, a FUSE harness that sits under USB mass storage, logs every read and write with content hashes, and serves different bytes on a later read than it served on the first, giving any verify-then-use consumer a time-of-check/time-of-use (TOCTOU) split. Second, a WebUSB page that opens an Apple device by vendor ID and selects a non-default USB configuration from an ordinary browser, with no driver and only a single click as the gate. Third, a microcontroller that drives the Lightning accessory-ID line to force a device into DFU. Together they argue that "it was signed" and "it is only a web page" are both weaker guarantees than they appear at the connector.

## 1. Mass storage is a promise, not a fact

A consumer that reads data from removable storage, verifies it, and then reads it again to use it has assumed the storage returns the same bytes both times. Removable storage is free to lie.

**The harness.** [badusb](https://github.com/rickmark/badusb) is a FUSE filesystem that passes reads and writes through to a backing image while instrumenting them. Every read and write is recorded to SQLite with its path, offset, length and a SHA-256 of the buffer, and read counts are kept per region. This alone is a useful forensic lens on exactly what a restore or verification process touches and in what order.

**The attack.** On top of the log sits an injector. A modifier watches for a trigger, such as "the STATE partition has now been read N times", and from that point rewrites the bytes served for a region, sourcing the replacement from a file, another partition, or a copy-on-write overlay. A `PartitionReplaceInject` tracks the GPT it has seen, locates the targeted partition, counts reads of its first byte, and swaps in a prepared bad image once the count passes a threshold. A verifier that reads a partition once to hash it and later reads it again to use it sees clean data at check time and attacker data at use time.

**Why it matters.** Restore and update flows read images from storage, check a signature or hash, and then consume them. If the check and the use are two separate reads of mutable storage, the signature was never a guarantee about the bytes that were used, only about the bytes that were checked. The defense is to verify the exact buffer that is consumed, from a single read into memory, rather than trusting that a second read matches the first.

## 2. A browser can reach the device

**The proof of concept.** [lightning_strike](https://github.com/rickmark/lightning_strike)'s `bad_web_usb.html` is a plain page. On a click, it calls `navigator.usb.requestDevice` filtered to an Apple vendor ID (`0x05ac`) and a specific product, opens the device, enumerates its configurations and interfaces, and calls `selectConfiguration` to switch it to a configuration that is not the default (configuration 5 in the code), then claims an interface.

**Why it matters.** WebUSB's gate is a single user gesture and the browser's device picker. Past that, a web page is talking to a physical USB device at the configuration and interface level, with no installed driver and no native code. Apple devices expose several USB configurations and alternate interfaces, some of them diagnostic; reaching one of those from a web page collapses the distance between "visited a link" and "spoke to a privileged device interface". The USB captures in the same repository (Total Phase traces of DFU entry, backup, personal hotspot and ordinary connection) are the raw material for working out which configurations and interfaces appear in which states.

## 3. The accessory can command the port

**The sketch.** [lightning_dfu](https://github.com/rickmark/lightning_dfu) is an early Tiva-C (TM4C123) microcontroller prototype aimed at triggering DFU or a reset through the Lightning accessory-identification path, the ACC_ID line, rather than the usual button chord.

**Why it matters.** DFU is a powerful state: it is where bootrom-level tooling and exploits such as checkm8 and PlugNPwn operate. If a cable or dock, which the user treats as passive, can push the device into DFU by itself through accessory signaling, then entering that state is no longer something only the device's owner can do with a deliberate button sequence. This is the hardware counterpart to the PlugNPwn work: the connector is not just a data path, it is a control path.

## 4. The common thread

Each study removes an assumption the connector quietly relies on:

- Mass storage is assumed to be stable between reads; the FUSE harness shows it need not be.
- A browser tab is assumed to be far from the hardware; WebUSB shows it is one click away from a device configuration.
- A cable is assumed to be passive; accessory signaling shows it can drive the port into DFU.

None of these is an exploit on its own. They are the preconditions an exploit chain draws on, and the reason the connector deserves the same scrutiny as the network stack.

## 5. Limitations and open work

- The TOCTOU harness demonstrates the primitive against a backing image; tying it to a specific signed restore flow, and showing a verifier that reads twice, is the next step.
- The WebUSB configuration switch is shown to succeed; mapping each Apple USB configuration and alternate interface to the device state that exposes it, from the captures, is unfinished.
- The DFU-over-accessory work is an early microcontroller sketch, not a reliable trigger, and the exact ACC_ID signaling needs to be pinned down and tested across devices.

## References

- [badusb](https://github.com/rickmark/badusb), [lightning_strike](https://github.com/rickmark/lightning_strike), [lightning_dfu](https://github.com/rickmark/lightning_dfu).
- [PlugNPwn: Connect to Jailbreak](/blog/plugnpwn-connect-to-jailbreak/) and [ACE Controller Secrets](/blog/ace-controller-secrets/).
- WebUSB specification, W3C. *(to add)*
- checkm8 and the SecureROM DFU attack surface. *(to add)*
