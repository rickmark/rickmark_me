---
title: "Trust Assumptions in Apple M-Series Secure Boot: Nonces, UID Fusing and the Factory Path"
date: "2026-07-23 12:00:00 +0000"
description: "A working-draft threat model for Apple silicon Macs. It asks what happens to the SEP's random number generator, UID, anti-replay state and long-term key protection if non-consumer factory or datacenter images can run, and documents a validly signed DataCenter-domain ticket whose boot nonce is DEADBEEF."
tags:
  - working draft
  - Apple security
render_with_liquid: false
---
*Working draft.* See [About 'WIP'](/blog/about-wip/). Written up from my notes in [security_research](https://github.com/rickmark/security_research) (July 2026), which also hold the screenshots and the ticket file referred to below. It follows on from [The Security Weakness of the M1](/blog/the-security-weakness-of-the-m1/) (2022). The SEP firmware on Apple silicon Macs is encrypted and no plaintext version exists, so parts of this analysis are inferred from earlier iPhone and iPad SEP versions. Statements about internal behavior are hypotheses unless they are marked as observations.

## Abstract

The security model of an Apple silicon Mac rests on an assumption that is rarely stated: the hardware only ever boots consumer or public developer images. Anti-replay nonces, the Secure Enclave's random number generator, the uniqueness of the fused UID and the protection of long-term keys all hold only if no other kind of image runs on the device. Non-consumer images do exist, for the factory, for repair and service, and for Apple's own datacenters, and they include the SEP firmware that first generates the UID. We work through what each assumption depends on: a deterministic random bit generator whose state could be reset, a fusing process that must end in a final lock fuse, a key derivation that mixes hardware measurements with a null LocalPolicy before user secrets, and boot tickets that do not say whether they are for tethered or untethered use. We document one observation, a ticket signed under a DataCenter-domain manifest key with a boot nonce of `DEADBEEF` followed by zeros, and set out what it would take to confirm or rule out each concern.

## 1. The assumption

Apple's platform security documentation describes a chain in which every boot stage is personalized to a device and bound to a fresh nonce, so that an old, signed component cannot be replayed. The only known ways to boot something other than a consumer image are Apple's internal paths: AppleInternal builds, the service tooling used by Apple Stores and authorized repair (GSX), and factory and datacenter signing services.

The assumption is reasonable for an attacker who has none of those. It is not a property of the hardware. Each mechanism below is sound only while no factory-class image runs, and the rest of this draft asks what follows if one does, whether through an insider, a compromised service account, or a device that passes through the repair channel.

## 2. A deterministic generator in FIPS mode

FIPS validation calls for a deterministic random bit generator (DRBG) so that its function can be tested against known inputs. Determinism is safe only if the inputs can never be controlled.

A plausible design that would meet those requirements, and that we use as a model rather than a claim about Apple's implementation, is:

```
# At the factory
NONCE = 0
UID   = <random, fused>

# On each request
NONCE = ENCRYPT_UID(SHA256(NONCE))
RETURN  SHA256("xART" | NONCE)
```

The output is bound to the hardware, deterministic, and never exposes the internal state. With the state held in the SEP's tamper-resistant storage, a user cannot influence it.

The weakness is the first line. If a factory image can run on a shipped device, and those images include the SEP firmware that generates the UID, then it can presumably also reset the state to its initial value. Resetting it would roll back the anti-replay (xART) state and replay the generator's entire output sequence. Everything derived from it would repeat: key-encryption keys, volume keys, identity keys, and any keys the SEP generates for applications.

## 3. UID fusing and fixation

Apple states that each chip's UID is generated randomly on the chip and fused in. The details of fusing decide how strong that guarantee is.

Fuses move in one direction, from 0 to 1. If 256 bits are fused and nothing seals the field afterwards, the process can be run again: further bits can be set until every bit is 1. That gives three failure modes:

- **No final lock fuse.** Bits can be added later, so the UID can be driven toward a value the attacker chooses, up to all ones, which amounts to a known "clear key".
- **Non-atomic fusing.** If the sequence can be interrupted or observed, a partial pre-image of the UID becomes possible.
- **Key-space reduction.** Setting the high N bits in advance shrinks the effective key space without any visible change, as has been seen with other selector fields such as Cryptex selectors.

Even if fusing is atomic and sealed, the UID can never be rotated. A refurbished device keeps the UID it shipped with, along with anything that was ever derived from it.

## 4. What survives a wipe

The SEP's storage is likely split into effaceable and non-effaceable regions. A wipe must destroy disk keys, but if the signing hierarchy behind LocalPolicy, xART and the boot nonces were destroyed, the device could not boot to recovery. Our expected split is:

| Persists a wipe | Effaced on wipe |
| --- | --- |
| Factory seal | Volume encryption key (VEK) |
| Key-encryption key (KEK) | Keys protecting iCloud Keychain |
| APNonce and SEPNonce state | |
| Owner and user identity keys (OIK, UIK) | |

Anything in the left column outlives the owner, which matters for the fixation argument in the next section.

## 5. Fixing the long-term key before the user arrives

The long-term SEP key-protection key is derived by mixing hardware measurements with the measured boot state and, later, with the UID and the user's password. Our reading of the derivation diagram (screenshots in the repository) is that the hardware-only material is combined first, and the user's secret enters too late to change it.

The mutable input is the LocalPolicy. Since the `lpolrestore` step was introduced, a LocalPolicy is often supplied during the boot flow, and a "null" policy is accepted. Decoded, the one observed looks like this:

```
SEQUENCE
  IA5STRING     :IM4P
  IA5STRING     :lpol
  IA5STRING     :1.0
  OCTET STRING  :00
```

It validates because it contains nothing that conflicts, but it is not the same as having no policy. Mixing hardware measurements with this fixed value gives a pre-image path to the long-term key: it derives to the same value however many times the device is restored. A change to idevicerestore ([libimobiledevice/idevicerestore#459](https://github.com/libimobiledevice/idevicerestore/pull/459)) tried to address this.

The practical consequence is that a user is protected only by a password that is fully random, set at first boot and never reused. Anything weaker, combined with a fixable hardware-side value and a generator whose state can be reset, leaves the derivation within reach.

## 6. Observations from one device

**Two recovery hashes, one link.** In the iSCPreboot volume, the one-true-recovery (`SystemRecovery`) folder contains subdirectories named by the SHA-384 of values derived through Basic Attestation (BAA). On the device examined, one such directory is a symbolic link to the other, and inside each the SHA-384 of `apticket.der` matches the folder name. For both to be valid for the same result, the measurements above the derivation must be valid in both cases. The likeliest explanation is that one name is a plain hash and the other includes something extra, such as the LocalPolicy above.

**A DEADBEEF ticket.** The repository includes `deadbeef_apticket.der`, an IM4M manifest for chip T6041 (security domain 1) that chains to the Apple Secure Boot Root CA under a manifest key named `T6041-SDOM1-TssLive-ManifestKey-RevA-DataCenter`. Its boot nonce hash (`BNCH`) is `DEADBEEF` followed by zeros, and its SEP nonce (`snon`) is `DEADBEEF` followed by zeros as well. A boot nonce should be the hash of a fresh random value; a recognizable constant means either the nonce was chosen or the ticket was issued without one. The simplest reading is a deliberately invalid future-version ticket used to make the system "kick back" to a prior version whose ticket includes the restore ramdisk, so that validation does not go through its complete flow.

**No tethered or untethered marker.** Nothing in an APTicket says whether it is meant for bringing up recovery over USB or for booting from disk. If a ticket that includes the restore ramdisk (`rdsk`), or a factory boot ticket, is persisted to disk, a non-secure bring-up can happen untethered. The boot progress register protects keys after the fact, but it does not separate the two kinds of ticket.

**Factory and delegation certificates.** The same device carries a `uCRT` certificate issued by `FDRDC-UCRT-SUBCA` under the SEP Root CA. Normally a uCRT is tied to the device's iCloud account; this one appears to be a factory-mode user certificate. It travels with `sdcrt.der`, which looks like a SEP delegation certificate: it lets the local BAA identity authorize and load `sep-patches.im4`, and it is requested out of band. Taken together, trust for SEP patching moves from one of Apple's central CAs to a tree rooted in the device's own attestation identity.

## 7. Open questions and how to test them

1. **DRBG reset.** Can any non-consumer SEP image reset the generator's state on a shipped device? This could be tested on research-fused hardware by comparing generator output before and after a factory restore.
2. **Fuse sealing.** Is there a final lock fuse after UID generation? Fuse maps for earlier chips may answer this for the same SEP family.
3. **LocalPolicy mixing.** Does the long-term key derive to the same value after repeated restores with a null LocalPolicy? Restoring twice and comparing a value derived from the key would test this without revealing the key itself.
4. **Ticket provenance.** Under what conditions does a DataCenter-domain manifest key sign for a consumer device, and why with a constant nonce? This needs more samples, from other devices and from known-clean machines.
5. **Delegation scope.** What can a `sdcrt` delegation authorize, and can it be issued to a device after sale?

## 8. Limitations

This is a single-device study built on observation and inference. The SEP firmware cannot be read in plaintext, so the generator model in Section 2 is a design that would satisfy FIPS, not a recovered implementation. The DEADBEEF ticket proves only that such a ticket was signed; it does not show who requested it or what it was used for. The aim of this draft is to state the assumptions precisely enough that each can be confirmed or ruled out.

## References

- Apple Platform Security Guide (Secure Enclave, boot process, LocalPolicy). *(to add specific sections)*
- [libimobiledevice/idevicerestore#459](https://github.com/libimobiledevice/idevicerestore/pull/459).
- NIST SP 800-90A, Recommendation for Random Number Generation Using Deterministic Random Bit Generators. *(to verify revision)*
- [security_research](https://github.com/rickmark/security_research): notes, screenshots and `deadbeef_apticket.der`.
