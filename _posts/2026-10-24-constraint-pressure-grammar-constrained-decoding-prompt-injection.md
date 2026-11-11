---
title: "Constraint Pressure: What Grammar-Constrained Decoding Hides About Prompt Injection"
date: "2026-10-24 12:00:00 +0000"
description: "Grammar-constrained decoding keeps an LLM classifier's output well-formed by discarding the model's own next-token distribution. A working draft arguing that the discarded mass, constraint pressure, is a prompt-injection signal, with falsifiable hypotheses and a pilot design."
tags:
  - working draft
  - AI security
render_with_liquid: false
---
*Working draft (v2).* See [About 'WIP'](/blog/about-wip/). The draft is timestamped in a [public gist](https://gist.github.com/rickmark/40b5c20aa884ebce3c658c55706f72c8) with its SHA-256, `4cb97b728f9e5be51443362c2d2ffef88b1f9c15fa96bd6697c38782cb45d89f`. Its companion paper applies the same signal to driving: [Microfiche Experts](/blog/microfiche-experts-geographically-streamed-mixture-of-experts/).

## Abstract

Grammar-constrained decoding guarantees that an LLM classifier emits valid structured output, but it does so by discarding information: at every forced position, the model's own next-token distribution is replaced by a masked one. We show that this discarded distribution is a useful security signal. We define *constraint pressure*, the divergence between the raw and grammar-masked distributions summed over the output, and argue that it measures how hard the decoder is overriding what the model wanted to say. For a clean input and a well-exemplified format, pressure is near zero. For an input that successfully redirects the model, such as a prompt injection, the model wants to obey the injected instruction or break into prose, and the grammar hides this while pressure records it. The familiar practice of scoring a classifier by the log-probability of its decision token is the special case of pressure at one position, and two further quantities fall out of it: coverage, the mass on the canonical answers, and variant mass, the mass on near-miss forms. Because hidden exemplars share a context with attacker text and so are not truly secret, we add per-request randomization of the output format so that a replayed, stale format raises pressure. We state falsifiable hypotheses and a pilot design on live venue-chat moderation run in shadow mode on local hardware, with Prompt Guard 2, entropy and normalized score as baselines.

## 1. Introduction

Structured output is now standard for LLM classifiers: a grammar or JSON schema masks the logits so that only valid tokens can be sampled. The guarantee is syntactic. It says nothing about whether the model was trying to produce that structure, and the mask erases the evidence either way.

This matters most when the classifier reads untrusted text. A prompt injection that succeeds changes what the model wants to emit next. With unconstrained decoding that shows up as a broken or hijacked output. With constrained decoding the output stays well-formed and the hijack is invisible to anything downstream.

Our observation is that the evidence is still there, one step earlier. At each forced position the raw distribution says what the model would have emitted without the mask. If the raw and masked distributions agree, the grammar is doing nothing. If they disagree, the grammar is overriding the model, and the size of that override is measurable.

Contributions:

1. We define constraint pressure as the sum over output positions of the divergence between raw and masked distributions, and give a per-position decomposition.
2. We show that scoring a classifier by the log-probability of its decision token is pressure at one position, and derive coverage and variant mass from the same quantity.
3. We analyze the shared-context problem for hidden exemplars and propose per-request format randomization so that stale or leaked formats are detectable.
4. We state falsifiable hypotheses and a pilot that can refute them, in a live venue-chat moderation deployment running entirely on local hardware.

## 2. Related work

**Constrained decoding and distortion.** Grammar masking is known to distort the model's distribution relative to the grammar-conditioned one, and work on grammar-aligned decoding (approximate citation, 2024; to verify) treats that distortion as an error to correct. We treat the same quantity as a signal: when the model and the grammar disagree, something in the input is pulling the model off task.

**Logprob-scored classifiers.** Reading a decision token's probability instead of sampled text is established practice; ShieldGemma uses a Yes/No form. The decision-first JSON form used here derives from the author's internal decision-model work at Meta (the Jev line), which is public only through later evaluations. [From Detection to Decision](https://arxiv.org/abs/2610.20907) evaluates Jev beside Prompt Guard 2 and an LLM judge on 47,611 examples and frames the operational problem as allow, block or defer; we adopt that framing. [Confidently Wrong](https://arxiv.org/pdf/2606.22659) shows that when released detectors miss an attack, they miss with near-certainty, which motivates signals beyond the score itself.

**Canary-style detection.** Known-answer detection and [DataSentinel](https://arxiv.org/abs/2504.11358) turn a detection model's own susceptibility into a defense by checking whether a secret-key task survives contaminated input. [How Not to Detect Prompt Injections with an LLM](https://arxiv.org/html/2507.05630v3) shows the key is not truly hidden, because instruction and data share a single prompt. Our hidden exemplars have the same weakness; Section 5 addresses it with per-request randomization rather than a fixed secret.

**Perturbation-based detection.** [UniGuardian](https://arxiv.org/pdf/2502.13141) measures how structured prompt perturbations shift the output distribution and is training-free. It perturbs the input to find trigger text. Our pressure measure needs no perturbation; the optional dose-response diagnostic perturbs the prior and tests whether the decision stays pinned.

**Uncertainty signals.** [ProbeLogits](https://arxiv.org/html/2604.11943) exposes logit entropy for deferral and out-of-distribution detection beside grammar masking. Entropy is our main baseline: pressure must add information beyond it to be worth reporting.

**Robustness of detectors.** [When Benchmarks Lie](https://arxiv.org/html/2602.14161v1) shows injection classifiers degrade under real distribution shift, which argues for signals that do not rely on the classifier's semantic judgment alone.

## 3. Setting

**Classifier.** A local model receives a system prompt holding a policy, a JSON schema and hidden few-shot exemplars, followed by one untrusted chat message wrapped as data. It is grammar-constrained to emit `{"decision": true|false, "rationale": "..."}`. The decision comes first so the score is fixed before any justification is generated, and the whole completion parses as JSON.

**Decoding.** At each step the engine computes raw logits, the grammar masks the invalid tokens, and a sampler picks from the masked distribution. We use an embedded llama.cpp binding so that the raw logits are read before the mask is applied. A server that reports only post-mask probabilities cannot compute anything in Section 4; all invalid tokens show as zero and every position looks fully confident.

**Locating the decision.** The decision token is found by aligning decoded text, choosing the first `true` or `false` that directly follows the decision key, never by a fixed index. A startup self-test confirms both values tokenize as single tokens.

**Deployment.** The pilot is a venue-chat moderation agent on Gemma 4 with a ShieldGemma pre-pass, running on local hardware in shadow mode: proposed actions are displayed and logged, never executed. Reviewers label each proposal in an observer view.

## 4. Constraint pressure

**Definition.** At output position t let P\_t be the model's raw next-token distribution and A\_t the set of tokens the grammar allows. The masked distribution Q\_t is P\_t renormalized over A\_t. Position pressure is the KL divergence from Q\_t to P\_t, which simplifies to the negative log of the allowed mass:

```
π_t = KL(Q_t ‖ P_t) = −log Σ_{v ∈ A_t} P_t(v)
```

Total pressure is the sum over positions. We also report it split into structural positions (braces, keys, quotes, colons), the decision position, and the rationale.

```
Π = Σ_t π_t = Π_struct + π_dec + Π_rat
```

**Reading it.** Pressure is zero when the model already wanted every token the grammar forced. It is large when the raw mass sits on tokens the grammar forbids. At structural positions those forbidden tokens are typically prose, an instruction-following reply, or a refusal, which is what a successful injection produces. Logging the top forbidden tokens at the highest-pressure positions gives a readable account of what the model wanted to say instead.

**Decision position.** At the decision position the allowed set is the two canonical values, so coverage, variant mass and the normalized score are all functions of P\_dec:

```
coverage = P_dec(true) + P_dec(false)
π_dec    = −log coverage
p        = P_dec(true) / coverage
```

Variant mass is the raw probability on near-miss forms of the canonical values (case variants, leading-space tokens, quoted forms). It is part of the forbidden mass at that position, but we track it separately because it has a different cause: an input that is pulling the model toward a nearby but wrong spelling of the format, rather than away from the format altogether.

**Why not entropy.** Entropy measures spread over all tokens and rises whenever the model is unsure. Pressure measures mass on forbidden tokens only. A clean but hard message can have high entropy and low pressure; an injected message can have a confident, low-entropy raw distribution concentrated on a forbidden token, giving low entropy and high pressure. Section 7 tests whether this distinction holds empirically.

**Decision policy.** The semantic score p drives the policy decision. Pressure, coverage and variant mass drive a separate route-to-review decision, so that a confident-looking but high-pressure output is deferred rather than trusted.

## 5. Threat model and randomized format canaries

**Attacker.** A chat participant who controls message text only. They cannot see the system prompt, exemplars or logits, but can observe public behavior and repeat attempts within a query budget. Host, weights and logs are out of scope. Tool gating in code and human approval of punitive actions remain the primary controls; the signals here add detection.

**Tiers.** (1) Naive: plain-language instructions. (2) Format-guessing: JSON- or template-like text from general knowledge. (3) Format-aware: partial knowledge of the real schema, from leakage or a prior session. (4) Adaptive: tunes inputs against observed outcomes.

**The shared-context problem.** Hidden exemplars sit in the same context as the attacker's text, so, as with known-answer detection, nothing stops an attacker from influencing the model's view of the format. A tier-3 attacker who matches the format exactly produces no pressure. A fixed format therefore degrades toward a known secret.

**Randomization.** Each request draws a fresh variant of the hidden format that only the classifier sees: the decision key name from a pool, the order of non-scored fields, exemplar wording and order, and a short nonce field placed after the decision. The boolean values stay fixed, so single-token scoring is unaffected and the scanner aligns on the current request's key.

**Effect.** Legitimate input has no reason to favor any variant, so forbidden mass on an inactive variant, especially one used in a recent request, is evidence of replay. Randomization also turns exact format matching into a guessing game: with k independently drawn dimensions, a tier-3 attacker's chance of zero pressure on a given request falls with the pool sizes, and a tier-4 attacker must spend queries to learn each dimension while every miss raises pressure. We state this as a cost increase, not a guarantee, and quantify it in Section 7.

**Dose-response diagnostic (optional).** For borderline messages, re-score with the prior pushed by a known amount, for example an exemplar balance of 50/50, 65/35 and 80/20. A clean message's score moves with a learned baseline slope; a message whose score stays pinned is being dominated by its own content. This costs K inferences and is reserved for messages already flagged by pressure or coverage.

## 6. Hypotheses

Each is stated so the pilot can refute it.

- **H1 (separation).** At a benign false-positive rate of 1%, total pressure detects more tier-2 and tier-3 attacks than the normalized score alone. Refuted if the gain is within confidence bounds of zero.
- **H2 (beyond entropy).** Pressure adds detection beyond raw-logit entropy at the decision position; a detector using both beats entropy alone. Refuted if adding pressure does not improve AUROC on format-aware attacks.
- **H3 (confident misses).** Among attacks the normalized score misses with p beyond 0.9, a majority show pressure above the benign 99th percentile. Refuted if fewer than half do.
- **H4 (hard negatives).** Benign messages containing pasted code or JSON do not raise pressure above the benign 99th percentile more often than other benign messages. Refuted if they do; that would mean pressure is a JSON detector, not an injection signal.
- **H5 (randomization).** With per-request format variants, tier-3 attacks built from a leaked fixed format show higher pressure than the same attacks against the fixed format. Refuted if pressure is unchanged.
- **H6 (cost).** Randomization reduces classification quality on the benign set by less than one point of AUROC. Refuted if the cost is larger; the canary would then not be free.

If H1 and H4 both fail the central claim is dead and the paper should not be submitted. If H2 fails, pressure is a restatement of entropy and the contribution reduces to the randomization result.

## 7. Experiments

**Pilot first.** A few hundred messages, one policy (format escaping), one model and quantization. Its only job is to test H1 and H4. If pressure does not separate format-aware attacks from pasted JSON, stop.

**Data.**

| Set | Source | Size (pilot) | Purpose |
| --- | --- | --- | --- |
| Benign | Synthetic or scrubbed venue chat | 300 | Baseline and thresholds |
| Hard negatives | Benign messages with pasted code, JSON, templates, mentions of the bot | 100 | H4 |
| Tier 1 | Plain-language instructions to the bot | 50 | Sanity |
| Tier 2 | JSON- or template-like injections from public benchmarks and hand-written | 100 | H1 |
| Tier 3 | Injections built from a deliberately leaked partial schema | 100 | H1, H3, H5 |

The full study adds tier 4 (adaptive, within a fixed query budget), all four policies, a second model family, and public benchmarks for comparability.

**Baselines.** Normalized score alone; raw-logit entropy at the decision position; Prompt Guard 2 (86M) as an external detector. Pressure is reported alone and combined with the score.

**Metrics.** Detection rate per tier at 1% and 5% benign false-positive rate; AUROC with bootstrap confidence intervals; the share of confident misses caught (H3); hard-negative flag rate versus benign (H4); benign AUROC with and without randomization (H6).

**Analysis.** Per-position pressure profiles, to show whether the signal lives at structural positions, the decision, or the rationale. Top forbidden tokens at peak-pressure positions, to show what the model wanted to say. Pre-mask versus post-mask ablation, to show the signal is destroyed by the mask.

**Human labels.** Shadow-mode reviewers mark each proposed action as right, wrong, wrong tool, too harsh or too soft. These calibrate thresholds and seed future fine-tuning; they are not the primary evidence for H1 to H6.

## 8. Limitations and ethics

**Needs raw logits.** The method applies only where pre-mask logits are available: open-weight models on an engine you control. It cannot be used on closed APIs that return post-mask probabilities or none at all.

**Exact-format attackers.** An attacker who reproduces the current request's format exactly produces no pressure. Randomization raises the cost but does not remove the case; combined with tool gating and human approval of punitive actions it is a detection layer, not a barrier.

**Model and prompt dependence.** Pressure depends on how strongly the exemplars make the model want the format. A weak prompt gives high baseline pressure and poor separation; thresholds must be set per prompt and per model, and the pilot uses one of each.

**Possible confound.** Pressure could be a detector of unusual text rather than of injection. H4 is designed to catch that, and the hard-negative set must be built before the pilot, not after.

**Prior work claim.** The decision-first scoring derives from the author's internal work at Meta. Technical detail is limited to what is already public, and the author's disclosure obligations should be checked before submission.

**Ethics.** All evaluation data is synthetic or scrubbed; real patrons did not consent to experiments. The live system discloses that an AI moderates the room and names the model actually running it. Shadow mode means no one is acted on during the study.

## References

- [From Detection to Decision: Calibration and Deferral for Prompt-Injection Detection](https://arxiv.org/abs/2610.20907), arXiv 2610.20907.
- [Confidently Wrong: Severity-Aware Calibration of Prompt-Injection Detectors under Attack Shift](https://arxiv.org/pdf/2606.22659), arXiv 2606.22659.
- [DataSentinel: A Game-Theoretic Detection of Prompt Injection Attacks](https://arxiv.org/abs/2504.11358), arXiv 2504.11358.
- [How Not to Detect Prompt Injections with an LLM](https://arxiv.org/html/2507.05630v3), arXiv 2507.05630.
- [UniGuardian: A Unified Defense for Detecting Prompt Injection, Backdoor Attacks and Adversarial Attacks in Large Language Models](https://arxiv.org/pdf/2502.13141), arXiv 2502.13141.
- [ProbeLogits: Kernel-Level LLM Inference Primitives for AI-Native Operating Systems](https://arxiv.org/html/2604.11943), arXiv 2604.11943.
- [When Benchmarks Lie: Evaluating Malicious Prompt Classifiers Under True Distribution Shift](https://arxiv.org/html/2602.14161v1), arXiv 2602.14161.
- Grammar-aligned decoding (2024) — approximate; locate and verify before submission.
- ShieldGemma and Llama Prompt Guard 2 model cards — to add.
- Known-answer detection (Liu et al., formalizing and benchmarking prompt injection) — to add from the DataSentinel references.

Supersedes the earlier draft "Off-Format Probability Mass as a Prompt-Injection Canary in Logprob-Scored LLM Classifiers".
