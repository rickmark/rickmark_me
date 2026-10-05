---
title: "Google: From the Citadel to the Dauntless"
date: "2022-07-30 01:20:53 +0000"
description: "DANGER: Incomplete analysis and conjecture based on real world observation. tl;dr Google’s Titan-M (codename citadel) is based on the prior generation of designs for the Chromebook EC (embeddedcontroller - Haven) which mediates the secure boot process. While Google referrers to regions of the flash known as RO_Aand…"
redirect_from:
  - /blog/untitled-2/
render_with_liquid: false
---
#

**DANGER: Incomplete analysis and conjecture based on real world observation.**

# tl;dr

Google’s Titan-M (codename citadel) is based on the prior generation of designs for the Chromebook EC (embeddedcontroller - Haven) which mediates the secure boot process.  While Google referrers to regions of the flash known as RO\_Aand RO\_B these are in fact not read-only but instead write protected.  While the code is verified, it also includes data such as the root-of-trust for the next stage.  The next generation chip known as codename dauntless doubled the size of the non-volatile area of storage, leading to the ability to confuse a citadel chip about the location of RO\_\* and allowing the writing into RO\_B.  As the citadel consulted very early by the Qualcomm XBL boot-loader via a UEFI DXE to verify aboot, this can allow code to run before the Android boot-loader and fastboot giving long term persistence despite a full device wipe and restore.

# Credit: Google fixed this problem

Later builds of the dauntless firmware checked for a eFUSE to ensure they don’t run on a citadel device.  It’s not clear when this was added and how many signed copies of early firmware got out before this correction was made, or if the eFUSE was always present and set since they handled this quietly.  It’s also not clear if the oem stage ec.rec and oem citadel rescue process with physical presence could undo this fix (yet, still researching, but it seems that some of the version hashes for PVT that were part of Google’s git history are no longer available).  Many of the affected versions seemed to reference v0.0.3 specifically.

# The Titan-M doesn’t always update…

One percent of the Titan-Ms don’t reliably update.  That’s a huge failure rate for a security device.  Most early load / boot-kits maintain persistence at all costs as most consumers and even security professionals look the other way to update failures such as these.  I too had this happen to my first Pixel 4a.  Upon inspection using fastboot oem citadel version it became clear that RO\_A had the wrong magic, which later was clearly the Dauntless.  I was able to somewhat restore the citadel via fastboot stage ec.rec and fastboot oem citadel rescue, but in reality may have locked in the change to the root-of-trust to the chip, as the goal isn’t entirely to get code execute on the Titan-M but instead to rewrite the portions used by XBL to verify aboot and for Verified Boot.
This also led to a very odd boot configuration for me, where RO\_B and RW\_A were being selected.  The updater isn’t very tolerant to this configuration by the way.

# The Pixel Boot Process and Qualcomm

## How to do some debug nonsense…

A Pixel device will let you watch it’s boot process, if you’re willing to get out the soldering iron and build a custom UART USB-C adapter.  In fact the Citadel will give up a full debug lane to you with fastboot oem citadel suzyq onand the right cable.

# The Origins and the “Haven”

The modern Titan-M in the Pixel 3 and later has it’s roots in the Chromebook EC (embedded controller).  The EC was the“B” series chip named the Haven.  This was evolved into the Titan-M which is known as the “Citadel”.  Google of course does publish some source code in this area but the design and technical documentation is generally internal.  The Titan-M2? (name unknown) will be codenamed the Dauntless (I think they are going to an A, B, C, D series of naming to make generational identification easier ala Ubuntu).

# The Pixel and the Citadel

The Pixel uses Qualcomm chips for both the AP (application processor) and BP or radio (Baseband Processor).  Others have written on the boot-up process of the Qualcomm chips.  For the Pixel AP, the PBL verifies and executes first, then xbl\_sec which is the EL3 TrustZone loader for the next stage against both the Qualcomm signing keys as well as OEM\_PKEY\_HASH (the OEM signing key, in this case Google).  This loads what is known as the QSEE or Qualcomm Secure Execution Environment.  The xbl\_sec then drops to non-secure EL2 and runs the verified xbl (extendable boot loader).  XBL is a UEFI environment, and therefore follows the same process of PEI (platform initialization), DXE(driver execution environment) and then APP or payload execution.  It lacks a SEC phase as that assurance is provided by PBL and xbl\_sec.  XBL then loads the hypervisor `hyp` or Qualcomm QHEE, which is in essence a abused EL2 / hypervisor for IOMMU or memory isolation.   The Pixel XBL includes a DXE for interfacing with the Titan-M over SPI, allowing XBL to use the Titan early in the boot process for verification of other boot components.  Unfortunately in this case they have not verified the Titan-M's security state prior and this allows any compromise of the Titan-M to become an EoP to early boot loader malware.  Bear in mind that all of this is happening before a single pixel is written to the display(no fastboot yet).  The DXE is used to verify aboot` or the Android Bootloader and provides services to it for the security state and dm-verity status.  The Titan-M also includes the root-of-trust for the Android operating system as Google attempted to eject early from dependence on the Qualcomm secure boot chain and bring it back under their own control.

# The Citadel / Dauntless Bug

Google made some sensible choices in the layout of the non-volatle memory layout of the Titan-M.  The copied the Chromebook EC design of cutting the memory in half, designating the top half as A and the bottom half as B.  This allows for A/B updating which has the benefit of upgrade as well as failsafe against a bad flash.  They then (unfortunately a misnomer) set the initial portions of A and B to “read-only” and by “read-only” we really mean “write protect” - the difference here is critically important and I urge companies to stop conflating the two.   The Citadel and Dauntless are largely comparable and an evolution.

## Now the bug…

The Dauntless has a non-volatle memory that is twice the size of the Citadel.   If you flash the Citadel A region with the Dauntless firmware, it will accidentally place the RO\_B region into the dauntless RW\_A region.  This breaks the security model of write protection and A/B for the Titan-M.  It seems this error only occurred with early builds of the Dauntless firmware, as there is now a one way fuse that disables booting Dauntless code on a Citadel.  It also indicates the failure of ever reusing signing keys between generations of devices that were not co-designed.
