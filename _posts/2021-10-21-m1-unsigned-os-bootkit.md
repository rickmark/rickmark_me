---
title: "A Bootkit from the Sanctioned Path: Abusing M1 Unsigned-OS Mode and auto-boot"
date: "2021-10-21 12:00:00 +0000"
description: "Apple silicon lets an authorized admin boot a fully unsigned OS so the Mac isn't locked to macOS. A working draft on how that sanctioned path, plus auto-boot and no insecure-boot indicator, can be turned into a persistent, low-visibility bootkit, and what would detect or prevent it."
tags:
  - working draft
  - Apple security
render_with_liquid: false
---
*Working draft.* See [About 'WIP'](/blog/about-wip/). Written up from my notes in [eff_you_os](https://github.com/rickmark/eff_you_os) (October 2021). It is an attack design, not a demonstrated exploit; the SEP-emulation step in particular is a sketch. A companion draft looks at the equivalent sanctioned-path attack on Windows: [Windows Blue Pill](/blog/windows-blue-pill-secure-boot-rollback/).

## Abstract

When Apple brought macOS to the M1, it avoided locking the Mac to a single OS by letting an authorized administrator approve a "fully unsigned OS" (FUOS): the system records a hash of a chosen next stage and boots it. This is a deliberate feature. We argue that the same feature, combined with `auto-boot`, the absence of any on-screen indicator that the current boot is not fully secure, and software control of the power LED and power button, can be assembled into a persistent bootkit with no exploit at all. The attack needs local administrative access once; after that it controls the earliest boot stages, lowers the OS security state before handing off to XNU, and uses social engineering of the power button to keep control. We describe the construction, then argue that the right fixes are an insecure-boot indicator and a separate firmware credential, both of which Apple has shipped before.

## 1. The sanctioned path

The community's first worry about the M1 Mac was iOS-style lock-in. Apple's answer was a signing system in which an authorized administrator can modify the device's policy database to permit a fully unsigned OS, selecting a hash of the next stage as the thing to boot. That is the intended escape hatch for people who want to run their own systems.

The escape hatch is also an authorized way to make the machine run attacker-chosen code before macOS, provided the attacker can get administrative approval once. On a valuable target, local access happens: a shoulder-surfed password, a poorly placed security camera, or a fake `sudo` prompt. The security boundary here is one admin event, not a cryptographic one.

## 2. Turning it into a bootkit

**Run before macOS.** With a FUOS target selected and `auto-boot=true`, a payload runs ahead of the macOS loader. There is no visual sign that the machine is booting a FUOS target, so the owner cannot tell that an earlier stage may have tampered with the macOS that then loads.

**Stay resident.** This revives the old "dark wake" idea. The payload hooks the boot loader and uses the watchdog-timer alarm to wake occasionally and respond, keeping a foothold in the early boot stages while the system appears to sleep.

**Control what the user sees and does.** The SEP under OS control can already drive the power LED, including an S-O-S blink pattern in recovery, which shows the color and pattern are software-controlled. A bootkit can therefore hide its state behind a normal-looking LED, and by responding to a long power-button press before the system does, it can socially engineer the user into releasing the button before the real gesture (DFU, recovery) registers, preserving persistence across what the user thinks was a recovery attempt.

**Break secure boot on the way up.** Before booting XNU, the bootkit lowers the OS's security properties, so the system that loads is already running with reduced protection.

**Avoid One True Recovery.** 1TR is the trusted recovery environment. The plan is to break 1TR first and to respond to the long press before the watchdog does, so the user cannot reach a clean recovery to notice or undo the change.

## 3. The hardest part: faking the SEP

The weakest step, and the one most clearly still a sketch, is intercepting the Secure Enclave. The idea is to emulate the SEP, by rewriting DeviceTree addresses or using an EL2 mapping so that commands destined for the SEP reach the bootkit instead, reproducing the same mailbox and command set. I recall seeing an open-source virtualized SEP that implements this mailbox; I have not relocated it. Without this step the attack cannot forge the SEP's answers, so this is the part that most needs to be proven or abandoned.

## 4. Countermeasures

**Detection.** Boot to DFU, then to Recovery, and use `getenv` to query the machine's state. This depends on changes to libimobiledevice to read the relevant state, so it is itself a work in progress.

**Removal.** Enter DFU with `macvdmtool`, a high-integrity way to reach DFU, then have a clean technician workstation reinstall `UniversalMac.ipsw`. This destroys the data partition, so it is a last resort rather than a fix.

**An insecure-boot indicator.** A Mac set to boot FUOS first could bring up graphics, show a clear indicator such as an unlocked padlock with a support link, and pause a few seconds, the way Chrome OS devices flag a non-secure boot. This is the same gap the T2 had throughout its life: nothing tells the owner when the machine is booting with less than full security, or into update or recovery where SIP is not protecting the system.

**A separate firmware credential.** Older Macs kept a firmware password distinct from the user's admin password, so a day-to-day admin compromise could not escalate to the platform security state. The M1 merged the two. Separating them again, at least as an option for higher-security use, would mean one shoulder-surfed admin password no longer authorizes a FUOS boot.

## 5. Limitations

Nothing here is a working exploit. The SEP-emulation step in Section 3 is unproven and may not be feasible as described. The attack assumes one instance of administrative access, which is the whole security boundary it crosses. The point of writing it up is that each step after that access uses a sanctioned mechanism, which is why the proposed fixes are about visibility and credential separation rather than patching a bug.

## References

- Asahi Linux: [m1n1](https://github.com/AsahiLinux/m1n1) and [docs](https://github.com/AsahiLinux/docs).
- Apple Platform Security Guide (startup security, recovery, LocalPolicy). *(to add sections)*
- [eff_you_os](https://github.com/rickmark/eff_you_os): the original notes.
