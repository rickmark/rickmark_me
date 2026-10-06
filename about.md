---
layout: page
title: About
permalink: /about/
description: Rick Mark-Penwell is a security, privacy and AI engineer and hardware security researcher, formerly of Meta, Coinbase, Dropbox and Microsoft, known for research into Apple's T2 chip.
about_hero: true
image: /assets/images/rick-mark.jpg
redirect_from:
  - /blog/about/
---

## Career

I've spent more than fifteen years in security engineering, most recently using AI where it genuinely helps.

- **Meta**, Privacy Engineer. I was key to PrivacyBrain, an LLM derived from Llama that evaluated privacy incidents,
  reviews, and FTC commitments across hundreds of millions of records, and Project Terminus, which linked incidents to
  their root causes and replaced months of manual investigation with consistent automation. I also wrote an
  LLVM-bitcode scanner (PSAPI) for sensitive iOS and macOS APIs and contributed to the design of Llama 4.
- **Coinbase**, Security Architect.
- **Dropbox**, Senior Security Engineer. I worked on corporate authentication, key management and Windows security in
  the datacenters, and open-sourced efivalidate for checking Mac firmware.
- **Uber Advanced Technologies Group**, Senior Security Engineer.
- **Jet.com**, Senior Software Security Engineer. I was the company's first security engineer, securing what was then
  the largest e-commerce site on Azure.
- **Bloomberg**, Senior Web Application Developer, on Bloomberg's legal research platform.
- **Microsoft**, Software Engineer, and then Azure Security SDE II. I did threat modeling and penetration testing for
  Azure, automated security health reporting across more than 150 teams, and worked on the Windows Data Classification
  Toolkit. I hold a patent on [detecting and preventing phishing attacks](https://patents.google.com/patent/US20160006760A1).

I also founded [Hot Mess](https://hotmess.social) and [AudienceKit](https://audiencekit.com), products that apply social science to in-person community, and I build [Garage](https://garagerag.app) (more on the [Products]({{ '/products/' | relative_url }}) page).

## Apple security research

I'm best known for research into Apple's **T2 security chip** as part of Team t8012:

- I built an early T2 integrity verification tool in 2017.
- In October 2019 I proposed that the checkm8 bootrom exploit reached the T2, and extended ipwndfu for it.
- In 2020 I performed the team's first successful SecureROM dump.
- I helped bring the exploit into the checkra1n jailbreak.
- I adapted libimobiledevice to talk to the T2, and reverse engineered the USB Target Disk Mode protocol.

When the research went public in October 2020, I explained to the press, including Forbes and The Register, why the
flaw can't be patched in shipping Macs. The team's own account is
[On bridgeOS / T2 Research](https://blog.t8012.dev/on-bridgeos-t2-research/), and my notes from the time are in
[checkra1n and the T2]({{ '/blog/checkra1n-and-the-t2/' | relative_url }}) and
[Using the T2 for Detection and Forensics]({{ '/blog/using-the-t2-for-detection-and-forensics/' | relative_url }}).

I'm part of [Hack Different](https://github.com/hack-different), an open-source community around Apple platforms. There
I maintain [apple-knowledge](https://github.com/hack-different/apple-knowledge), a machine-readable collection of
reverse-engineered Apple hardware and software facts, and my most widely used project, with over 1,400 stars on GitHub.
I also contribute to The Apple Wiki.

## Research and open source

Most of my work is on [GitHub](https://github.com/rickmark). Beyond the T2, it falls into a few areas.

### Firmware and boot security

- [mojo_thor](https://github.com/rickmark/mojo_thor) (2017) is research into malware that infects the EFI and SMC firmware of MacBooks.
- [peiutil](https://github.com/rickmark/peiutil) (2017) converts UEFI PEI images (TE and VZ files) to PE, so they can be disassembled.
- [apple_ssv](https://github.com/rickmark/apple_ssv) (2020) explores macOS Signed System Volumes.
- [windows-bluepill](https://github.com/rickmark/windows-bluepill) (2022) looks at breaking a system's security without breaking Secure Boot.

### Ports, cables, and radios

- [badusb](https://github.com/rickmark/badusb) (2019) detects and exploits time-of-check/time-of-use gaps in USB mass storage.
- [lightning_strike](https://github.com/rickmark/lightning_strike) (2019) and [lightning_dfu](https://github.com/rickmark/lightning_dfu) (2021) study the security of the Lightning connector.
- [apple_utdm](https://github.com/rickmark/apple_utdm) (2020) is a Linux kernel driver for Apple's USB Target Disk Mode.
- [apple-malicious-baseband](https://github.com/rickmark/apple-malicious-baseband) (2022) documents a malicious cellular baseband image that carried Apple's signature.

### Libraries for Apple formats and services

- [libapfs](https://github.com/rickmark/libapfs) for the Apple File System
- [pyxar](https://github.com/rickmark/pyxar) for XAR archives
- [libiupdate](https://github.com/rickmark/libiupdate) for Apple software updates
- [libicloud](https://github.com/rickmark/libicloud) for iCloud
- [apple_net_recovery](https://github.com/rickmark/apple_net_recovery) for Internet Recovery
- [libidevice](https://github.com/rickmark/libidevice) and [libxpc](https://github.com/rickmark/libxpc), Rust reimaginings of libimobiledevice and XPC

### Tools that protect people

- [isafety](https://github.com/rickmark/isafety) (2020) examines iPhones and iPads for security and safety threats.
- [chainfix](https://github.com/rickmark/chainfix) (2024) checks and repairs Keychain and iCloud Keychain.

### In the organizations I run

I also own the [Hack Different](https://github.com/hack-different) and [Team t8012](https://github.com/t8012)
organizations on GitHub. Besides apple-knowledge, their projects include:

- [webmuxd](https://github.com/hack-different/webmuxd) and [go-webmuxd](https://github.com/hack-different/go-webmuxd),
  a proof of concept of an attack where a browser may be able to access iPhone sync data
- [demuxusb](https://github.com/hack-different/demuxusb), a tool to decode iDevice USB capture sessions
- [smcutil](https://github.com/hack-different/smcutil), a decoder for Apple's SMC payloads (T1 and prior)
- [efivalidate](https://github.com/hack-different/efivalidate) for validating the firmware of Macs up to the T1
- [libapplefw](https://github.com/hack-different/libapplefw), generic utilities for Apple firmware images
- [go-aapl-integrity](https://github.com/hack-different/go-aapl-integrity) and [cnklverify](https://github.com/t8012/cnklverify) for Apple's integrity formats (img4, chunklists, trust caches)
- [secure_emu](https://github.com/hack-different/secure_emu), which runs portions of SecureROM under the Unicorn emulator
- [mootool](https://github.com/hack-different/mootool), generic parsing of Apple security state information including
  LocalPolicy, FDR, signed APTickets, and more
- [yolo_dsc](https://github.com/hack-different/yolo_dsc) for extracting the dyld shared cache
- [symbol-server](https://github.com/hack-different/symbol-server) for annotating Apple symbols
- [xnudex](https://github.com/hack-different/xnudex) for indexing XNU OS images
- [kext-kmem](https://github.com/hack-different/kext-kmem), a kernel extension for reading and writing kernel memory, replacing /dev/kmem
- [homebrew-jailbreak](https://github.com/hack-different/homebrew-jailbreak), a Homebrew tap of research tools
- [newosxbook-tools](https://github.com/hack-different/newosxbook-tools), which packages Jonathan Levin's tools for it
- [libibackup](https://github.com/hack-different/libibackup) for iOS backups
- [apple-diagnostics-format](https://github.com/hack-different/apple-diagnostics-format) for Apple's wireless diagnostics files
- [apple-baseband](https://github.com/hack-different/apple-baseband) for the modem baseband
- [uarp](https://github.com/hack-different/uarp) for Apple's accessory firmware update protocol
- From the T2 work:
  - [pongo-flash](https://github.com/t8012/pongo-flash), a flash storage driver for checkra1n's pongoOS
  - [RemoteServiceDiscovery](https://github.com/t8012/RemoteServiceDiscovery), a reverse-engineered rewrite of Apple's framework of that name

### Products

Screenshots and more detail for each are on the [Products]({{ '/products/' | relative_url }}) page.

- [Garage](https://garagerag.app) makes your own documents, code, and messages searchable by your AI assistant over MCP.
  The database, the index and, by default, the models all run on your Mac. It's open source on
  [GitHub](https://github.com/lwm-luminx/garage-rag), and also runs from the command line on Linux and as a
  [Python package](https://pypi.org/project/garage-rag/).
- [AudienceKit](https://audiencekit.com) generalizes Hot Mess into a platform that gives any community its own app,
  with its own name, domain and look. It has a GraphQL API ([developer docs](https://developer.audiencekit.com)), an
  [admin console](https://github.com/audience-kit/audience_kit_admin), and
  [Swift](https://github.com/audience-kit/audience-kit-sdk-swift) and
  [Ruby](https://github.com/audience-kit/audience-kit-sdk-ruby) SDKs.
- [Hot Mess](https://hotmess.social), my 2015 app that indexed subcultures by their people, places, and events, is now
  a guide to queer nightlife built on AudienceKit, with [iOS](https://github.com/audience-kit/hot_mess_ios),
  [Android](https://github.com/audience-kit/hot_mess_android) and [web](https://hotmess.social/app/) apps.
- [LuminX](https://luminx.media) is Love Wins Media's creative studio, from custom AI to cinema-class production,
  photography, 3D scanning and printing, live events and drone imaging. Its software, including Garage, the Hot Mess
  website and hedonism_bot, lives in the [lwm-luminx](https://github.com/lwm-luminx) GitHub organization.
- [hedonism_bot](https://github.com/lwm-luminx/hedonism_bot) lets photographers upload photos. It uses Postgres,
  pgvector and embeddings to find and group faces without naming anyone, so people can find and download the photos
  they appear in.
- [meshtastic-map-manager](https://github.com/rickmark/meshtastic-map-manager) manages Meshtastic map data.

## Contributions to other projects

I've had pull requests merged in more than 25 projects outside my own. Among them:

- **Apple platform tooling:** Mach-O fileset support and new segment types in Homebrew's [ruby-macho](https://github.com/Homebrew/ruby-macho) (five merged PRs), T2 support in [usbmuxd](https://github.com/libimobiledevice/usbmuxd/pull/141), Linux fixes to [ipwndfu](https://github.com/h0m3us3r/ipwndfu/pull/1), build work on checkra1n's [PongoOS](https://github.com/checkra1n/PongoOS/pull/14), pkg-config support in [ldid](https://github.com/sbingner/ldid/pull/3), the convert verb in [dmglib](https://github.com/0xbf00/dmglib/pull/2), and firmware sources in Acidanthera's [MacInfoPkg](https://github.com/acidanthera/MacInfoPkg/pull/16).
- **Reverse engineering:** universal macOS builds of the [Capstone](https://github.com/capstone-engine/capstone/pull/2221) disassembler, a fix to Vector 35's [Objective-C workflow](https://github.com/Vector35/workflow_objc/pull/57) for Binary Ninja, and an easier install for [MEAnalyzer](https://github.com/platomav/MEAnalyzer/pull/7), Intel's Management Engine analyzer.
- **Security:** `OpenSSL::BN#abs` in Ruby's [openssl](https://github.com/ruby/openssl/pull/430) library, removing unsafe OpenSSL patches from [money-tree](https://github.com/GemHQ/money-tree/pull/43), and a stricter content security policy for Dropbox's [merou](https://github.com/dropbox/merou) permissions system.
- **Data and infrastructure:** the build and validation tests for [AppleDB](https://github.com/littlebyteorg/appledb) (four merged PRs), universal macOS build instructions for [Zstandard](https://github.com/facebook/zstd/pull/3568), fixes to [Homebrew](https://github.com/Homebrew/brew/pull/12822), [overcommit](https://github.com/sds/overcommit/pull/777) and [keccak.rb](https://github.com/q9f/keccak.rb/pull/39), and [Meshtastic](https://github.com/meshtastic/firmware/pull/5699) firmware dev containers.
- **SDR and ham radio:** ported bladeRF and [libbladeRF](https://github.com/Nuand/libbladeRF), `android-sdr-kit`, and [SDR++](https://www.sdrpp.org) to Android ([#1063](https://github.com/Nuand/bladeRF/pull/1063)).

## Outside of work

Away from the keyboard, I make documentary film and photography centered on the LGBT community.

## Work with me

I'm available for AI security, privacy engineering, and security research roles, remote or hybrid. Get in touch on
[LinkedIn](https://linkedin.com/in/penwellr). If my open-source work is useful to you, you can support it on
[Patreon](https://www.patreon.com/rickmark).

## Elsewhere

[GitHub](https://github.com/rickmark) · [LinkedIn](https://linkedin.com/in/penwellr) · [Patreon](https://www.patreon.com/rickmark)
