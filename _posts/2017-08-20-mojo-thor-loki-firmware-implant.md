---
title: "Mojo, Thor and Loki: Anatomy of a Mac Firmware and Kernel Implant"
date: "2017-08-20 12:00:00 +0000"
description: "A single-machine analysis of a Mac implant stack: modified SMC and EFI firmware reflashed over the Thunderbolt controller, and MojoKDP, a kernel debug-port module recovered from memory that exposes two serial ports and talks over a hardcoded MAC and IP. Artifacts, detection, and what stays unproven."
tags:
  - working draft
  - Apple security
render_with_liquid: false
---
*Working draft.* See [About 'WIP'](/blog/about-wip/). From [mojo_thor](https://github.com/rickmark/mojo_thor) (analysis begun 2017). This is a single-machine case built on artifacts recovered from compromised hardware, so some of the analysis was necessarily done on an untrusted system and is marked where it is inference rather than observation. This writeup stays with the technical artifacts: the firmware, the kernel module, and the detection steps. The tooling named here (`efivalidate`, `peiutil`, `smcutil`, `huffdiff`, `loki_remove`) is early and in progress.

## Abstract

"Mojo", "Thor" and "Loki" are the names used here for a layered Mac implant: modified SMC and EFI firmware, and a macOS kernel component called MojoKDP. On the machine studied, the firmware appears to have been reflashed through the Thunderbolt controller (via an Apple internal updater, `ThorUtil`), which is an Evil Maid vector with physical access rather than a remote one; the remote Thunderstrike paths it resembles were already closed by Apple. This draft documents what was recovered: four differing SMC payloads against a known-good image, the EFI module index, and MojoKDP itself, pulled from kernel memory and annotated. MojoKDP is a kernel debug-port module injected by DMA that projects two serial ports into the running OS and communicates over a hardcoded MAC and IP. The aim is to record the artifacts and the detection steps precisely, and to separate what was observed from what is inferred.

## 1. Delivery: firmware over Thunderbolt

The implant's persistence lives below the OS, in the SMC and EFI firmware. The suspected delivery is a reflash through the Thunderbolt controller using `ThorUtil`, an Apple internal updater found in the EFI partition under `UPDATERS/TBTH/`. That requires physical access; it is an Evil Maid attack, not a network compromise. This fits the broader picture of Mac EFI that silently fails to update: a machine whose firmware persistence survives OS reinstalls looks, from the outside, exactly like the unpatched-EFI population that others have measured.

**SMC.** Comparing the suspect SMC image to a known-good one, four encrypted SMC payloads differ (`5CE0F1`, `5CECE9`, `5CFAB5`, `5D1751`) along with a few submodules. The Apple `*.smc` format and the extraction are handled by `smcutil`.

**EFI.** The EFI volume's module index is catalogued in the repository, and `bad.fd` is the captured firmware from an affected machine. `peiutil` converts Terse Executable (TE/VZ) PEI modules to PE so they can be disassembled; `efivalidate` is an open reimplementation of Apple's `eficheck`, and `huffdiff` targets the Intel ME region.

## 2. MojoKDP: a kernel debug port as an implant

MojoKDP was recovered from kernel memory (injected by DMA) and disassembled with annotations in the repository.

- **Injection and placement.** It is loaded at the high end of user space (near `0x7FFFFFFFFFFFFFFF` minus its size) and replaces Apple's standard KDP key (`STDK`) with a Mojo key.
- **What KDP is.** KDP is the kernel debug port/proxy. This module stands up a serial transport with a hardcoded MAC and IP (`kdp_set_ip_and_mac_address("16.0.0.63", "6b:64:70:6d:6a:6f")` — note the MAC spells `kdpmjo`), which surfaces in the running OS as two serial ports in the Networking tab. CRC32-framed packets cross that serial link. It registers as `OSMetaClass MojoKDP` / `OSService MojoKDP` and matches boot-arg names `mojo`, `mojo1`, `mojo2`.
- **Obfuscation.** `kdp_core` is zlib-compressed at a fixed offset and the module appears to rewrite itself to obfuscate after `kmod` start.

## 3. Observed indicators

From the machine studied (some confirmed, some needing more data, and labeled as such in the notes):

- An IOKit `MojoKDP` node, visible even from recovery.
- `/dev/tty.MALS` and `/dev/tty.SOC` as the MojoKDP serial endpoints (earlier macOS showed these as two LPSS Serial Adapter connections); `SOC` is likely the link to the SMC.
- Inability to remove a device from the associated Apple ID despite a password change.
- Suspected DNS-based command and control: UDP/TCP 53 redirected to a local resolver showed many NXDOMAIN responses, and iPhone System Services reported DNS using a few percent of a gigabyte.
- DYLD-preload interposition of core services (AuthKit `AKMasterToken`, CoreTelephony, IMCore for SMS sync, CoreTime, AppleWirelessDiagnostics), as a mechanism noted in the analysis.

These are recorded as indicators from one environment, not a general signature.

## 4. Detection

- **macOS 10.12 and earlier.** Boot to recovery and check `ioreg | grep MojoKDP`.
- **macOS 10.13 and later, from external or air-gapped media.** `sudo /usr/libexec/firmwarecheckers/eficheck/eficheck --integrity-check`. Alternatively, extract the firmware with reFInd and a BootROM flash and verify it with `eficheck` or `efivalidate` on a separate, clean machine.
- **Serial endpoints.** Treat the presence of `/dev/tty.MALS` and `/dev/tty.SOC`, or two unexplained LPSS serial adapters, as suspect.

Removal below the OS is hard: because persistence is in firmware, an OS reinstall is not sufficient, and a clean firmware reflash from known-good media is the baseline. The in-progress `loki_remove` targets the OS-level component only.

## 5. Status and limitations

This is one case, analyzed in part on compromised hardware, which is a fundamental limitation on every conclusion here: tools running on an affected machine cannot be fully trusted. The firmware delivery via `ThorUtil` is a working theory supported by physical signs of service on an owner-only machine, not a proven chain. The names Mojo, Thor and Loki are labels for observed components, not an attribution. The value of the writeup is the concrete artifacts, the firmware diffs, the MojoKDP disassembly, and the detection steps, which others can check against their own machines.

## References

- Tooling: [efivalidate](https://github.com/rickmark/efivalidate), [peiutil](https://github.com/rickmark/peiutil), [smcutil](https://github.com/rickmark/smcutil), [huffdiff](https://github.com/rickmark/huffdiff), [loki_remove](https://github.com/rickmark/loki_remove).
- [The Apple of Your EFI: Mac Firmware Security Research](https://duo.com/blog/the-apple-of-your-efi-mac-firmware-security-research), Duo Security.
- [REcon 2014: Apple SMC, the place to be (for an implant)](https://www.youtube.com/watch?v=nSqpinjjgmg).
- Apple `eficheck`, introduced in macOS High Sierra.
- [mojo_thor](https://github.com/rickmark/mojo_thor): firmware, logs, and the annotated MojoKDP disassembly.
