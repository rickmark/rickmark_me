---
title: "WIP: How did PKI become a joke?"
date: "2024-11-30 09:48:06 +0000"
description: "tl;dr If your system asks you to both upload a certificate and a private key, or it generates a CSR (certificate signing request) and also gives you the private key, you're doing PKI wrong... Also don't laugh - but this commentary is directly opposed to goals of US national…"
render_with_liquid: false
---
### tl;dr

If your system asks you to both upload a certificate and a private key, or it generates a CSR (certificate signing request) and also gives you the private key, you're doing PKI wrong...

Also don't laugh - but this commentary is directly opposed to goals of US national security, but I've lived through that being used inappropriately. - signed, Mark

# Terms

- PKI - Public Key Cryptography
- CSR - Certificate Signing Request
- Private Key - The key material that matches the public key in a given CSR or Certificate
- CA - Certification Authority - a trusted issuer of certificates
- Public Key Algorithm - the particular mathematical basis for PKI, in practice either RSA (very common) or ECC (elliptical curve, less supported but better). Finally ECDSA or DSA - signature only - not common in TLS.
- PEM - Privacy Enhanced Mail - A form of encoding a private key or certificate in base64 to prevent non-printing or non-copy paste characters for reasons of portability
- BER / DER - Basic Encoding Rules  / Distinguished Encoding Rules - The binary version in ASN.1 for a certificate or private key. Follows rules such as PKCS but often encoded via PEM for ease.
- "Self Signed" - A certificate that is in its own right a CA (Overly simplistic as CA's also require the extended attribute to become issuers). These are very common in appliances such as the Synology which issues it's own certificate until a replacement is made.

# The Beef...

Any system that requires you to both upload the private key material, as well as the certificate is doing PKI wrong. This is because in a PKI system, the private key material is truly private to the system that will use it. If you generate this material on your laptop then upload it, well, your laptop and any virus or MDM also saw that key. Moreover, most truly secure systems such as the TPM or an HSM do not export this material. This means that if you upload this key, it's not likely to be hardware backed.

## The Culprits

- Synology - Synology allows you to upload a key as well as the certificate, but when you go to use the advanced option of "Generate CSR", you're placed into the funny scenario of having it be "almost right". The resulting CSR includes the private key, making the CSR process as pointless as could be. 2/10 stars. Got CSR, failed by providing key.
- Ubiquity - uhgh - BUT LET ME TELL YOU WHY! - (don't get it twisted, I still run their equipment because at the price point it's the best - but if I had Cisco money...)
  - EVERY device they sell ought have a full TPM or similar concept. Majority of their network stack depends on shared authentication keys. If I had a magic wand
  - They blew uBoot - and still won't disclose their GPL required source.
    - They permit a RSA exponent of `0` in some devices, and anything raised to zero is... This led to a huge amount of boot time persistent malware that ends up being RMAs that don't get diagnosed.
    - You cannot generate a CSR even from the top of the line Enterprise Fortress Gateway
    - If I were them, I'd permit RADIUS and Unifi <-> Unifi devices to use 802.2x with PKI (TLS/TTLS etc) or IPv6 / IPSec based transits. Instead yo get a cheep in-the-clear bearer approach.
      - They own the hardware, they can surely embed a Ubiquity ICA (Intermediate CA) cert into PROM (program once ROM) in every device that proves authentic Ubiquity devices.
- IoT / Anything with Poor Algorithm Support - These are usually devices that support "TLS" but haven't been updated in a dog's age. (anyone know how long that phrase means?). These devices do not support upload of a Root CA to permit DPI (deep packet inspection) nor do they support modern key lengths or algorithms. Almost any system gives you a dropdown of RSA lengths from `1024`/`2048`/`4096` - but the truth is it could be a dropdown with an input permitting longer key lengths to provide longevity. Frequently worse yet, these systems are using `nginx` and `openssl` to do the work, so they are artificially restricting the choices that could produce better security.

## The Heros

- Yubikeys and YubiHSMs provide the ability to provide key attestation. This means there's a cryptographic way for
- LetsEncrypt - Let's Encrypt will never accept nor generate a private key. This is the definition of doing PKI right. It receives a CSR, and then upon domain validation issues a (relatively short lived for good reason) certificate.

## The Anti-Heros

- Apple - For a company whose brand is security and privacy to get this SO CLOSE and yet fail is heartbreaking. The SEP permits hardware backed keys, but ONLY if they are `scep256k1` (which I'll admit is a great curve and choice!). There's no good reason that RSA nor other curves are supported, nor better support for key attestation. (in fact they do such key attestation for a number of other functions such as SIM move as well as iCloud login - find this under

# Recommendations

## Internal Use Only Certificates

The scheme to extend a certificate is pretty common. All that needs be done is an issuance of a new OID (Object Identifier) and my proposal is for two new OIDs

- Internal Use Only - A boolean in certificates meaning that they are to be issued and trusted only by origination. This allows for certificates that are clearly distinguished to be trusted by one org vs the world. This bisects the problem of certificates being ambiguous between public internet trust and internal trust. Each IUOU cert should also include a provable "realm" such as the DNS name of the org for which it is applicable.
- Realm - A way to indicate a sphere of control of IUOU. This permits one orgs IUOU to be segmented from another organizations IUOU.
- rDNS Purpose - Instead of requiring a company to register an OUI, we can use reverse DNS names to indicate intended usage. This may be `com.splunk.indexer.forward` to indicate the HTTPS endpoint is for forwarding data. This is backward compatible and can be restricted by a SNI (TLS server name indication) like restriction from a certificate to its use in context.

## Key Generation Indicators

- Inclusion of OUIs for hardware backed, key-never, etc.
- Unwrapping - A new EKU. Unwrapping certificates are used to indicate that the TLS connection is to a dutiful Deep Packet Inspection (DPI) device. These certificates are valid certificates issued to a DPI root CA, but include additional details such as the true certificate. This assists with schemes such as CT (Certificate Transparency) as well as user consent ("The connection is monitored by 'Some Company Inc'"). This also allows for certificate pinning and DPI to coexist by permitting CT and pinning to occur against the original certificate and chain.
