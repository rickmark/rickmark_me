---
title: "Windows Blue Pill: Compromise Without Breaking Secure Boot"
date: "2022-05-30 12:00:00 +0000"
description: "A working draft on how a Windows machine could be turned into a hypervisor-level rootkit without breaking Secure Boot or the kernel driver model: roll the Secure Boot chain back to an older signed bootmgfw, run Windows as a Hyper-V guest, and use local kernel debugging from the host. Plus the undocumented BCD settings this surfaced."
tags:
  - working draft
  - platform security
render_with_liquid: false
---
*Working draft.* See [About 'WIP'](/blog/about-wip/). Written up from my notes and captured boot artifacts in [windows-bluepill](https://github.com/rickmark/windows-bluepill) (analysis files May 2022). It is based on observations in the wild and is a hypothesis about how a compromise could work, not a demonstrated exploit. A companion draft covers the equivalent sanctioned-path attack on Apple silicon: [A Bootkit from the Sanctioned Path](/blog/m1-unsigned-os-bootkit/).

## Abstract

A "blue pill" rootkit runs the real operating system as a guest inside a hypervisor it controls. We describe how this could be done on a stock Windows machine without breaking either Secure Boot or the signed kernel-driver model, so there is no exploit for a defender to find. The ingredients are all legitimate: Secure Boot verifies only the first boot binary and does not, by default, reject older signed versions of it; Windows ships Hyper-V in every install since Virtualization-Based Security arrived; and Windows kernel debugging offers a stable, documented contract with the guest. Loop the Secure Boot chain from `bootx64.efi` to a differently-signed `bootmgfw.efi`, boot Windows as a Hyper-V guest, and drive it from the host through local kernel debugging while passing the graphics and HID through so the user sees a normal desktop. Along the way the analysis surfaced a set of undocumented Boot Configuration Database settings that deserve attention in their own right.

## 1. Why no exploit is needed

A blue pill wants the most stable possible interface to the guest, because it has to survive OS updates without detection. Kernel debugging is that interface: well documented, stable across versions, and plausible enough to pass as an expected feature. Since Windows 10 introduced Virtualization-Based Security, a vanilla install already carries the Hyper-V components, and hardware ships with Intel VT-x and VT-d enabled. The attacker does not have to install virtualization; it is already there.

## 2. Rolling back Secure Boot without breaking it

The only component the EFI Secure Boot chain verifies is `bootx64.efi`, signed with the Microsoft PCA root. It hands off to `bootmgr.efi`, and from there the Microsoft hive takes over. Because Secure Boot checks only that first binary and, unless the revocation database (`dbx`) has been updated, accepts older signed copies, an attacker can substitute an older `bootmgfw.efi` with known weaknesses and remain fully "Secure Boot compliant".

In my opinion the certificates need a monotonic counter so EFI can track the latest version and refuse all prior ones, with an EFI-policy override so older Windows installs still boot after an increment. Without something like that, "signed" does not mean "current".

A second rollback path: hibernate a machine whose security state has already been lowered, then resume into that state.

## 3. The Apple driver chain

On the machine examined, the entry point appears to be a signed `AppleSSD.sys` from 2008 (a Boot Camp driver), which chain-loads a set of further "Apple" drivers that filter or modify parts of the restore subsystem:

- `AppleSSD.sys` — signed, valid, and the exploitable entry point.
- `AppleKIS.sys` / `AppleKISInterface.dll`
- `AppleRSM.sys` / `AppleRSMInterface.dll`
- `AppleKmdfFilter.sys` — flagged as bad in the analysis.
- `AppleLowerFilter.sys` — flagged as bad in the analysis.

A years-old signed driver with a usable vector is exactly the rollback problem of Section 2, one layer up: the signature is still valid, so the driver model is not "broken", but the behavior is attacker-chosen.

## 4. Weaknesses identified

- **Secure Boot can be rolled back to any prior version** unless `dbx` is kept current.
- **WIM images are insufficiently signed.** Windows PE should announce "This is a customized version of Windows from &lt;signer&gt;" when the image is not Microsoft's. Hardware makers could expose an attestation key through EFI runtime services so the signer can be verified; anything other than Microsoft or the manufacturer should raise a clear warning.
- **Boot-security settings in the BCD are undocumented.** Several BCD properties affect boot security with no published meaning, so no one can define a secure baseline:
  - `allowedinmemorysettings` had the value `0x15000075`; the intent is undocumented.
  - `custom:21000026` and `custom:46000010`: undocumented BCD properties.
  - The difference between `bootmgr.efi` and `bootmgfw.efi` is not clearly documented.
  - `debugtype=Local` set at install is either a large attack surface or an indicator of compromise, especially alongside `hypervisordebugtype`, `hypervisordebugport` and `hypervisorbaudrate`.
  - `displaymessageoverride` can hold "Recovery" and looks abusable.
  - The roles of `boot.sdi` versus `winre.wim`, and whether `partition=C:` can be made ambiguous by assigning another volume letter first, both need clarification.
- **`boot.stl`** is an ASN.1-encoded trust list naming the certificates trusted under a Secure Boot configuration, and is part of what a rollback has to account for.

## 5. An aside on Surface

Surface devices appear to build their configuration and recovery UI directly on the same Microsoft technologies used later in the boot chain, such as the BCD. Where the device's own configuration ends and Windows' begins is unclear and needs more analysis.

## 6. Limitations

This is a hypothesis grounded in boot artifacts captured from a machine, not a built and demonstrated rootkit. The driver chain in Section 3 is described from what was present on that device; confirming it is an exploitable entry point, rather than a stale but inert driver, is the main open task. Several BCD findings are observations of undocumented values, which means the next step is documentation and controlled testing, not a stronger claim.

## References

- Microsoft Boot Configuration Data (BCD) and Secure Boot documentation. *(to add specific references)*
- [windows-bluepill](https://github.com/rickmark/windows-bluepill): the captured boot artifacts and notes.
