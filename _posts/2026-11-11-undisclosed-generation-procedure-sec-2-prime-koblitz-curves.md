---
title: "An Undisclosed Generation Procedure in the SEC 2 Prime Koblitz Curves"
date: "2026-11-11 12:00:00 +0000"
description: "The four SEC 2 prime-field Koblitz curves, secp256k1 among them, share regularities in their primes, coefficients and generators that the standard never states. A working draft reconstructing the generation procedure, testing attack paths, and marking what remains unexplained."
tags:
  - working draft
  - cryptography
render_with_liquid: false
---
*Working draft.* See [About 'WIP'](/blog/about-wip/).

The four prime-field Koblitz curves in SEC 2 (secp160k1, secp192k1, secp224k1, secp256k1) carry regularities in their primes, their coefficients b, and their generators that the standard never states. This draft reconstructs as much of the generation procedure as the published parameters allow, checks several attack paths against the result, and marks what remains unexplained. The reconstructed rule is a fact about how the curves were made. It is not, on its own, a statement about their security: the properties behind the mod 7 regularity and the shared generator seed are not yet understood, and that is exactly why no security claim is made in either direction.

## Background

A Koblitz curve over a prime field is a curve y² = x³ + b with a ≡ 0, defined over a field GF(p) where p ≡ 1 (mod 3). That congruence gives the curve complex multiplication by the ring of integers of Q(√−3), an efficiently computable endomorphism, which in turn enables the GLV scalar-multiplication speedup. SEC 2 recommends four such curves: secp160k1, secp192k1, secp224k1, and secp256k1. The last is the curve used by Bitcoin and many other systems.

SEC 2 describes the generation of these curves only as repeatedly selecting parameters that admit an efficiently computable endomorphism until a prime-order curve is found. It gives no seed and no derivation for the generator points, in contrast to the verifiably random curves in the same document, whose seeds are published (and, as later observed, encode the ASCII string "MinghuaQu").

Three regularities hold across all four prime Koblitz curves and are not stated in the standard:

- every prime is ≡ 1 (mod 7), not only the required ≡ 1 (mod 3)
- every b lies in {3, 5, 7}
- every generator is twice a point whose x-coordinate is built from one shared value

This draft treats the three as residues of a single undisclosed generation procedure, reconstructs the parts of that procedure the published parameters determine, and tests the result against known attack models. The prime skip in secp160k1 and the shared generator value have been noted before; the two prime-congruence rules, the b constraint, and the offset analysis below appear to be new.

## The shared generator seed

For each curve the half-generator was computed as H = ((n + 1) / 2) · G from the published parameters, so that 2H = G. Its x-coordinate is the value of interest.

| Curve | x(H) | Bits |
| --- | --- | --- |
| secp160k1 | 0x48ce563f89a0ed9414f5aa28ad0d96d6795f9c62 | 159 |
| secp192k1 | 0x554123b78ce563f89a0ed9414f5aa28ad0d96d6795f9c66 | 187 |
| secp224k1 | 0x3b78ce563f89a0ed9414f5aa28ad0d96d6795f9c63 | 166 |
| secp256k1 | 0x3b78ce563f89a0ed9414f5aa28ad0d96d6795f9c63 | 166 |

secp224k1 and secp256k1 have an identical 166-bit x(H), though they are defined over different fields. Aligning the four values shows one shared core with per-curve edges:

```
secp192k1   55412 3b78ce563f89a0ed9414f5aa28ad0d96d6795f9c6 6
secp224k1         3b78ce563f89a0ed9414f5aa28ad0d96d6795f9c6 3
secp256k1         3b78ce563f89a0ed9414f5aa28ad0d96d6795f9c6 3
secp160k1           48ce563f89a0ed9414f5aa28ad0d96d6795f9c6 2
```

The middle 152 bits (ce563f89a0ed9414f5aa28ad0d96d6795f9c6) are common to all four. secp192k1 carries the full secp224k1/secp256k1 value with a 19-bit prefix (0x554123b78) above it. secp160k1 has 0x48 where the others have 0x3b78, so its top bits were altered, not merely truncated. The low hex digit is 2, 6, 3, 3.

The value is not a reduction of a larger value mod any curve's p or n; reduction would scramble the shared low digits, which are intact. It is instead a truncation: a string of at least 187 bits exists (secp192k1 shows the most of it), and the shorter values are its low-order part. This confirms the paper's claim of one shared value behind all four generators, and locates it as an integer, not a field element. No ASCII decoding of the core at any bit alignment produces text, and about 140,000 obvious hash inputs across SHA-1, MD5, SHA-256 and RIPEMD-160 reproduce none of it, so its origin is not recovered here.

## The reconstructed selection rule

One rule reproduces every prime and every b across all four curves: among primes p = 2^k − 2^32 − c (c = 1, 3, 5, …) with p ≡ 1 (mod 3), take the first whose curve y² = x³ + b has prime order for some b in {3, 5, 7}, and use the smallest such b. The order of each candidate was found from the six sextic-twist possibilities via Cornacchia and confirmed against random points; the procedure reproduces every published group order n exactly.

| Curve | c used | Prime-order b (1–30) | b chosen | First workable? |
| --- | --- | --- | --- | --- |
| secp160k1 | 21389 | 7, 12, 15, 19 | 7 | 5th (4 skipped) |
| secp192k1 | 4553 | 3, 11, 14, 20, 24, 26 | 3 | 1st |
| secp224k1 | 6803 | 2, 5, 6, 15, 18 | 5 | 1st |
| secp256k1 | 977 | 7, 12, 20, 23, 26 | 7 | 1st |

The three larger curves use the first workable prime of their form. secp160k1 is the only curve that skips: with b widened to any value, four earlier primes (c = 3929, 16919, 18293, 20309) have a prime-order curve, but none for b in {3, 5, 7}, so under the {3, 5, 7} rule they are rejected and 21389 is the fifth candidate and the first that qualifies.

Two parts of the rule are explained. The prime p ≡ 1 (mod 3) is the documented endomorphism requirement; a preference for small b is ordinary. Two parts are not. The restriction to {3, 5, 7} excludes b = 2, which gives a prime-order curve at secp160k1's c = 18293 and at secp224k1's prime, and was passed over both times. And every prime is ≡ 1 (mod 7), treated separately below.

A generator convention also holds across all four curves and secp160k1 included: given x(H), the y-coordinate chosen is the even one of the two square roots. This matches the base-point convention NIST states for the binary Koblitz curves (minimal x, even y), and is the one piece of the generator rule that is documented elsewhere.

## The mod 7 regularity

Every prime being ≡ 1 (mod 7) is the regularity with the least explanation. Part of it is forced by the choice of b. A prime-order Koblitz curve needs b to be a non-square mod p; for p ≡ 3 (mod 4), quadratic reciprocity then restricts p to 1, 2 or 4 (mod 7) when b = 7. A scan of 55 prime-order b = 7 curves confirmed the restriction holds without exception.

So secp160k1 and secp256k1, both b = 7, each had about a 1 in 3 chance of landing on 1 (mod 7) rather than 1 in 6. secp192k1 (b = 3) and secp224k1 (b = 5) carry no such constraint and sit near 1 in 6. All four landing on 1 (mod 7) by chance has odds near 1 in 320. After removing the part forced by b = 7, the residual is the two unconstrained curves also landing there, about a 1 in 36 coincidence.

That residual is real but thin. It is too weak to assert as a deliberate rule and too structured to dismiss, so it is recorded here as an open regularity, not a finding. Notably the mod 7 rule never had to reject a prime: on all four curves the first workable prime already satisfied it. A rule that never filters anything, yet holds every time, is the kind of residue this draft is meant to surface rather than resolve.

## Attack paths checked

Because the mod 7 rule and the shared seed are undisclosed, it is natural to ask whether either exposes a weakness. Several concrete paths were tested. Each is reported as applies or does not apply, not as a verdict on the curves overall.

Extension-field (MOV/pairing) reduction requires the group order n to divide p^k − 1 for some feasible k, which makes the embedding degree k. This was checked for k = 7, for k = 1806 = 2·3·7·43 and every divisor, and for 2·3·43 and every divisor. None holds on any curve. There is also a short proof that no degree divisible by 7 or 43 can qualify: the embedding degree divides n − 1, and n − 1 has no factor of 7 or 43 on any of the four curves. The degree-7 case was examined in full: the group over GF(p⁷) contains the original order-n subgroup unchanged, with small cofactors (for example 3529 for secp160k1) that are ≡ 1 (mod 7) as the arithmetic forces. The mod 7 regularity therefore cannot act through an extension field.

Smoothness of p ± 1 was checked, since the primes were suspected of hidden factor structure. Beyond the shared 2·3·7 in p − 1 (that is, divisibility by 42), the remaining factorisations differ on every curve and are not smooth. p is public, so p ± 1 smoothness has no bearing on the curve's discrete log regardless.

The integer 1806 arises because the 152-bit shared core factors as 2·3·7·43·13217·147227·10701583·1003369105457·83266702588577, divisible by 1806. This is a property of the seed as an integer; it is tested as an attack only through the extension-field condition above, which it fails. Divisibility of an x-coordinate has no action in the curve group.

What these results establish is narrow: these specific paths do not apply to these curves. They do not establish that the curves are secure. The properties behind the mod 7 rule and the shared seed are not understood, and an unexamined property cannot be certified absent. The closed paths are reported precisely so that the open ones are not mistaken for settled.

## The binary control

SEC 2 also defines binary Koblitz curves (sect163k1, sect233k1, sect239k1, sect283k1, sect409k1, sect571k1), identical to the NIST curves K-163 through K-571. They share the Koblitz design idea but over a different complex-multiplication field, Q(√−7) rather than Q(√−3), and so serve as a control: same designers, same era, a parallel family.

Their half-generators were computed the same way, after verifying the binary doubling against 2·(G/2) = G on sect163k1 and sect233k1. The x(H) values share no common segment, between each other or with the prime family. There is no shared seed.

NIST states the base-point rule for these curves plainly: the base point has minimal |Gx| with Gy even. Minimal-x generation produces an independent value per curve, which explains the absence of any shared seed, and the even-y half of the rule matches the y-convention found on the prime curves.

The contrast is the substantive point. The binary curves follow a documented base-point rule and show exactly what it predicts. The prime curves do not: their generators share a 166-bit value that minimal-x cannot produce, and SEC 2 documents no rule for it. One family of Koblitz curves in the same standard is generated by a stated rule and the other by an unstated one. This locates the shared-seed anomaly specifically in the prime Koblitz family.

## Open questions

The reconstruction is partial by design, and several threads are live rather than closed.

The generator offset is the narrowest gap. The shared core and the even-y convention are pinned, but two per-curve edges are not explained: secp192k1's 19-bit prefix 0x554123b78 above the shared value, and secp160k1's top bits 0x48 where the others read 0x3b78. The low hex digit (2, 6, 3, 3) is not the first valid offset on any curve, so a simple count-up search is ruled out. What determines these edges is unknown.

The seed origin is unresolved. The 166-bit value is an integer, not a field element, and is not recovered as ASCII or as an obvious hash output. Whether it is a hash of some unpublished input, the low bits of a mathematical constant, or a chosen value with a property not yet identified, remains open. The question matters because a single integer standing above all four curves is the strongest sign of a procedure run once and reduced per curve.

The mod 7 regularity and the 1806 divisibility are patterns whose mechanism, if any, is not understood. They have been checked against the extension-field and smoothness models and act through neither. This does not mean they are meaningless; it means the model that would explain them has not been found. They are kept on the table as properties under investigation.

Nothing here should be read as a security claim in either direction. The curves are not shown weak, and they are not shown secure; several named attack paths are shown not to apply, which is a narrower statement. The value of the reconstruction is that it makes the undisclosed procedure explicit and testable, so that each residual property can be examined on its own terms rather than assumed benign.

This is a working draft. Verification code for every computation above is available on request, and the figures can be regenerated from the published SEC 2 and NIST parameters.
