---
layout: default
title: About
permalink: /about/
description: Rick Mark-Penwell is a security, privacy and AI engineer and hardware security researcher, formerly of Meta, Coinbase, Dropbox and Microsoft, known for research into Apple's T2 chip.
about_hero: true
about_products: true
wide: true
image: /assets/images/rick-mark.jpg
redirect_from:
  - /blog/about/
---
<section class="about-section" id="career">
  <div class="about-head">
    <h2 class="section-title">Career</h2>
    <p class="lead">I've spent more than fifteen years in security engineering, most recently using AI where it genuinely helps.</p>
  </div>
  <ol class="timeline">
    <li>
      <h3>Meta <span>Privacy Engineer</span></h3>
      <p>I was key to PrivacyBrain, an LLM derived from Llama that evaluated privacy incidents, reviews, and FTC commitments across hundreds of millions of records, and Project Terminus, which linked incidents to their root causes and replaced months of manual investigation with consistent automation. I also wrote an LLVM-bitcode scanner (PSAPI) for sensitive iOS and macOS APIs and contributed to the design of Llama 4.</p>
    </li>
    <li><h3>Coinbase <span>Security Architect</span></h3></li>
    <li>
      <h3>Dropbox <span>Senior Security Engineer</span></h3>
      <p>I worked on corporate authentication, key management and Windows security in the datacenters, and open-sourced efivalidate for checking Mac firmware.</p>
    </li>
    <li><h3>Uber Advanced Technologies Group <span>Senior Security Engineer</span></h3></li>
    <li>
      <h3>Jet.com <span>Senior Software Security Engineer</span></h3>
      <p>I was the company's first security engineer, securing what was then the largest e-commerce site on Azure.</p>
    </li>
    <li>
      <h3>Bloomberg <span>Senior Web Application Developer</span></h3>
      <p>On Bloomberg's legal research platform.</p>
    </li>
    <li>
      <h3>Microsoft <span>Software Engineer, then Azure Security SDE II</span></h3>
      <p>I did threat modeling and penetration testing for Azure, automated security health reporting across more than 150 teams, and worked on the Windows Data Classification Toolkit. I hold a patent on <a href="https://patents.google.com/patent/US20160006760A1" rel="noopener">detecting and preventing phishing attacks</a>.</p>
    </li>
  </ol>
  <p class="about-note">I also founded <a href="https://hotmess.social" rel="noopener">Hot Mess</a> and <a href="https://audiencekit.com" rel="noopener">AudienceKit</a>, products that apply social science to in-person community, and I build <a href="https://garagerag.app" rel="noopener">Garage</a>. They're <a href="#products">below</a>, with more on the <a href="{{ '/products/' | relative_url }}">Products</a> page.</p>
</section>

<section class="about-section" id="apple-research">
  <div class="about-head">
    <h2 class="section-title">Apple security research</h2>
    <p class="lead">I'm best known for research into Apple's <strong>T2 security chip</strong> as part of Team t8012.</p>
  </div>
  <div class="feature-panel">
    <ul class="milestones">
      <li><span>2017</span>Built an early T2 integrity verification tool.</li>
      <li><span>Oct 2019</span>Proposed that the checkm8 bootrom exploit reached the T2, and extended ipwndfu for it.</li>
      <li><span>2020</span>Performed the team's first successful SecureROM dump.</li>
      <li><span>2020</span>Helped bring the exploit into the checkra1n jailbreak.</li>
      <li><span>2020</span>Adapted libimobiledevice to talk to the T2, and reverse engineered the USB Target Disk Mode protocol.</li>
    </ul>
    <div class="feature-panel-aside">
      <p>When the research went public in October 2020, I explained to the press, including Forbes and The Register, why the flaw can't be patched in shipping Macs.</p>
      <ul class="aside-links">
        <li><a href="https://blog.t8012.dev/on-bridgeos-t2-research/" rel="noopener">The team's account: On bridgeOS / T2 Research ↗</a></li>
        <li><a href="{{ '/blog/checkra1n-and-the-t2/' | relative_url }}">checkra1n and the T2 →</a></li>
        <li><a href="{{ '/blog/using-the-t2-for-detection-and-forensics/' | relative_url }}">Using the T2 for Detection and Forensics →</a></li>
      </ul>
    </div>
  </div>
  <p class="about-note">I'm part of <a href="https://github.com/hack-different" rel="noopener">Hack Different</a>, an open-source community around Apple platforms. There I maintain <a href="https://github.com/hack-different/apple-knowledge" rel="noopener">apple-knowledge</a>, a machine-readable collection of reverse-engineered Apple hardware and software facts, and my most widely used project, with over 1,400 stars on GitHub. I also contribute to The Apple Wiki.</p>
</section>

<section class="about-section" id="research">
  <div class="about-head">
    <h2 class="section-title">Research and open source</h2>
    <p class="lead">Most of my work is on <a href="https://github.com/rickmark" rel="noopener">GitHub</a>. Beyond the T2, it falls into a few areas.</p>
  </div>
  <div class="card-grid card-grid-2">
    <div class="card card-accent">
      <h3>Firmware and boot security</h3>
      <ul class="project-list">
        <li><a href="https://github.com/rickmark/mojo_thor" rel="noopener">mojo_thor</a> <small>2017</small> research into malware that infects the EFI and SMC firmware of MacBooks</li>
        <li><a href="https://github.com/rickmark/peiutil" rel="noopener">peiutil</a> <small>2017</small> converts UEFI PEI images (TE and VZ files) to PE, so they can be disassembled</li>
        <li><a href="https://github.com/rickmark/apple_ssv" rel="noopener">apple_ssv</a> <small>2020</small> explores macOS Signed System Volumes</li>
        <li><a href="https://github.com/rickmark/windows-bluepill" rel="noopener">windows-bluepill</a> <small>2022</small> looks at breaking a system's security without breaking Secure Boot</li>
      </ul>
    </div>
    <div class="card card-signal">
      <h3>Ports, cables, and radios</h3>
      <ul class="project-list">
        <li><a href="https://github.com/rickmark/badusb" rel="noopener">badusb</a> <small>2019</small> detects and exploits time-of-check/time-of-use gaps in USB mass storage</li>
        <li><a href="https://github.com/rickmark/lightning_strike" rel="noopener">lightning_strike</a> <small>2019</small> and <a href="https://github.com/rickmark/lightning_dfu" rel="noopener">lightning_dfu</a> <small>2021</small> study the security of the Lightning connector</li>
        <li><a href="https://github.com/rickmark/apple_utdm" rel="noopener">apple_utdm</a> <small>2020</small> a Linux kernel driver for Apple's USB Target Disk Mode</li>
        <li><a href="https://github.com/rickmark/apple-malicious-baseband" rel="noopener">apple-malicious-baseband</a> <small>2022</small> documents a malicious cellular baseband image that carried Apple's signature</li>
      </ul>
    </div>
    <div class="card card-ink">
      <h3>Libraries for Apple formats and services</h3>
      <ul class="project-list">
        <li><a href="https://github.com/rickmark/libapfs" rel="noopener">libapfs</a> for the Apple File System</li>
        <li><a href="https://github.com/rickmark/pyxar" rel="noopener">pyxar</a> for XAR archives</li>
        <li><a href="https://github.com/rickmark/libiupdate" rel="noopener">libiupdate</a> for Apple software updates</li>
        <li><a href="https://github.com/rickmark/libicloud" rel="noopener">libicloud</a> for iCloud</li>
        <li><a href="https://github.com/rickmark/apple_net_recovery" rel="noopener">apple_net_recovery</a> for Internet Recovery</li>
        <li><a href="https://github.com/rickmark/libidevice" rel="noopener">libidevice</a> and <a href="https://github.com/rickmark/libxpc" rel="noopener">libxpc</a>, Rust reimaginings of libimobiledevice and XPC</li>
      </ul>
    </div>
    <div class="card card-accent">
      <h3>Tools that protect people</h3>
      <ul class="project-list">
        <li><a href="https://github.com/rickmark/isafety" rel="noopener">isafety</a> <small>2020</small> examines iPhones and iPads for security and safety threats</li>
        <li><a href="https://github.com/rickmark/chainfix" rel="noopener">chainfix</a> <small>2024</small> checks and repairs Keychain and iCloud Keychain</li>
        <li><a href="{{ '/products/' | relative_url }}#lumiere">Lumière Archive</a> (<a href="https://github.com/lwm-luminx/hedonism_bot" rel="noopener">hedonism_bot</a>) gives every photographer their own gallery at <a href="https://lumiere.host" rel="noopener">lumiere.host</a> or on their own domain, a living portfolio that uses Postgres, pgvector and embeddings to group faces without naming anyone, so people can find the photos they appear in and order prints</li>
        <li><a href="https://github.com/rickmark/meshtastic-map-manager" rel="noopener">meshtastic-map-manager</a> manages Meshtastic map data</li>
      </ul>
    </div>
  </div>

  <div class="org-panel">
    <h3>In the organizations I run</h3>
    <p>I also own the <a href="https://github.com/hack-different" rel="noopener">Hack Different</a> and <a href="https://github.com/t8012" rel="noopener">Team t8012</a> organizations on GitHub. Besides apple-knowledge, their projects include:</p>
    <ul class="project-columns">
      <li><a href="https://github.com/hack-different/webmuxd" rel="noopener">webmuxd</a> and <a href="https://github.com/hack-different/go-webmuxd" rel="noopener">go-webmuxd</a>, a proof of concept of an attack where a browser may be able to access iPhone sync data</li>
      <li><a href="https://github.com/hack-different/demuxusb" rel="noopener">demuxusb</a>, a tool to decode iDevice USB capture sessions</li>
      <li><a href="https://github.com/hack-different/smcutil" rel="noopener">smcutil</a>, a decoder for Apple's SMC payloads (T1 and prior)</li>
      <li><a href="https://github.com/hack-different/efivalidate" rel="noopener">efivalidate</a> for validating the firmware of Macs up to the T1</li>
      <li><a href="https://github.com/hack-different/libapplefw" rel="noopener">libapplefw</a>, generic utilities for Apple firmware images</li>
      <li><a href="https://github.com/hack-different/go-aapl-integrity" rel="noopener">go-aapl-integrity</a> and <a href="https://github.com/t8012/cnklverify" rel="noopener">cnklverify</a> for Apple's integrity formats (img4, chunklists, trust caches)</li>
      <li><a href="https://github.com/hack-different/secure_emu" rel="noopener">secure_emu</a>, which runs portions of SecureROM under the Unicorn emulator</li>
      <li><a href="https://github.com/hack-different/mootool" rel="noopener">mootool</a>, generic parsing of Apple security state information including LocalPolicy, FDR, signed APTickets, and more</li>
      <li><a href="https://github.com/hack-different/yolo_dsc" rel="noopener">yolo_dsc</a> for extracting the dyld shared cache</li>
      <li><a href="https://github.com/hack-different/symbol-server" rel="noopener">symbol-server</a> for annotating Apple symbols</li>
      <li><a href="https://github.com/hack-different/xnudex" rel="noopener">xnudex</a> for indexing XNU OS images</li>
      <li><a href="https://github.com/hack-different/kext-kmem" rel="noopener">kext-kmem</a>, a kernel extension for reading and writing kernel memory, replacing /dev/kmem</li>
      <li><a href="https://github.com/hack-different/homebrew-jailbreak" rel="noopener">homebrew-jailbreak</a>, a Homebrew tap of research tools</li>
      <li><a href="https://github.com/hack-different/newosxbook-tools" rel="noopener">newosxbook-tools</a>, which packages Jonathan Levin's tools for it</li>
      <li><a href="https://github.com/hack-different/libibackup" rel="noopener">libibackup</a> for iOS backups</li>
      <li><a href="https://github.com/hack-different/apple-diagnostics-format" rel="noopener">apple-diagnostics-format</a> for Apple's wireless diagnostics files</li>
      <li><a href="https://github.com/hack-different/apple-baseband" rel="noopener">apple-baseband</a> for the modem baseband</li>
      <li><a href="https://github.com/hack-different/uarp" rel="noopener">uarp</a> for Apple's accessory firmware update protocol</li>
      <li><a href="https://github.com/t8012/pongo-flash" rel="noopener">pongo-flash</a>, from the T2 work, a flash storage driver for checkra1n's pongoOS</li>
      <li><a href="https://github.com/t8012/RemoteServiceDiscovery" rel="noopener">RemoteServiceDiscovery</a>, from the T2 work, a reverse-engineered rewrite of Apple's framework of that name</li>
    </ul>
  </div>
</section>

<section class="about-section" id="contributions">
  <div class="about-head">
    <h2 class="section-title">Contributions to other projects</h2>
    <p class="lead">I've had pull requests merged in more than 25 projects outside my own. Among them:</p>
  </div>
  <div class="card-grid card-grid-3">
    <div class="card card-signal">
      <h3>Apple platform tooling</h3>
      <p>Mach-O fileset support and new segment types in Homebrew's <a href="https://github.com/Homebrew/ruby-macho" rel="noopener">ruby-macho</a> (five merged PRs), T2 support in <a href="https://github.com/libimobiledevice/usbmuxd/pull/141" rel="noopener">usbmuxd</a>, Linux fixes to <a href="https://github.com/h0m3us3r/ipwndfu/pull/1" rel="noopener">ipwndfu</a>, build work on checkra1n's <a href="https://github.com/checkra1n/PongoOS/pull/14" rel="noopener">PongoOS</a>, pkg-config support in <a href="https://github.com/sbingner/ldid/pull/3" rel="noopener">ldid</a>, the convert verb in <a href="https://github.com/0xbf00/dmglib/pull/2" rel="noopener">dmglib</a>, and firmware sources in Acidanthera's <a href="https://github.com/acidanthera/MacInfoPkg/pull/16" rel="noopener">MacInfoPkg</a>.</p>
    </div>
    <div class="card card-accent">
      <h3>Reverse engineering</h3>
      <p>Universal macOS builds of the <a href="https://github.com/capstone-engine/capstone/pull/2221" rel="noopener">Capstone</a> disassembler, a fix to Vector 35's <a href="https://github.com/Vector35/workflow_objc/pull/57" rel="noopener">Objective-C workflow</a> for Binary Ninja, and an easier install for <a href="https://github.com/platomav/MEAnalyzer/pull/7" rel="noopener">MEAnalyzer</a>, Intel's Management Engine analyzer.</p>
    </div>
    <div class="card card-ink">
      <h3>Security</h3>
      <p><code>OpenSSL::BN#abs</code> in Ruby's <a href="https://github.com/ruby/openssl/pull/430" rel="noopener">openssl</a> library, removing unsafe OpenSSL patches from <a href="https://github.com/GemHQ/money-tree/pull/43" rel="noopener">money-tree</a>, and a stricter content security policy for Dropbox's <a href="https://github.com/dropbox/merou" rel="noopener">merou</a> permissions system.</p>
    </div>
    <div class="card card-signal">
      <h3>Data and infrastructure</h3>
      <p>The build and validation tests for <a href="https://github.com/littlebyteorg/appledb" rel="noopener">AppleDB</a> (four merged PRs), universal macOS build instructions for <a href="https://github.com/facebook/zstd/pull/3568" rel="noopener">Zstandard</a>, fixes to <a href="https://github.com/Homebrew/brew/pull/12822" rel="noopener">Homebrew</a>, <a href="https://github.com/sds/overcommit/pull/777" rel="noopener">overcommit</a> and <a href="https://github.com/q9f/keccak.rb/pull/39" rel="noopener">keccak.rb</a>, and <a href="https://github.com/meshtastic/firmware/pull/5699" rel="noopener">Meshtastic</a> firmware dev containers.</p>
    </div>
    <div class="card card-accent">
      <h3>SDR and ham radio</h3>
      <p>Ported bladeRF and <a href="https://github.com/Nuand/libbladeRF" rel="noopener">libbladeRF</a>, <code>android-sdr-kit</code>, and <a href="https://www.sdrpp.org" rel="noopener">SDR++</a> to Android (<a href="https://github.com/Nuand/bladeRF/pull/1063" rel="noopener">#1063</a>).</p>
    </div>
  </div>
</section>

<section class="about-section" id="contact">
  <div class="card-grid card-grid-3 closing-grid">
    <div class="card card-callout">
      <h3>Work with me</h3>
      <p>I'm available for AI security, privacy engineering, and security research roles, remote or hybrid.</p>
      <a class="button" href="https://linkedin.com/in/penwellr" rel="noopener">Get in touch on LinkedIn</a>
    </div>
    <div class="card card-signal">
      <h3>Support the work</h3>
      <p>If my open-source work is useful to you, you can support it on Patreon, or follow along on GitHub.</p>
      <p class="card-links"><a href="https://www.patreon.com/rickmark" rel="noopener">Patreon ↗</a> <a href="https://github.com/rickmark" rel="noopener">GitHub ↗</a></p>
    </div>
    <div class="card card-ink">
      <h3>Outside of work</h3>
      <p>Away from the keyboard, I make documentary film and photography centered on the LGBT community.</p>
    </div>
  </div>
</section>
