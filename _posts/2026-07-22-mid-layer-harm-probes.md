---
title: "Mid-Layer Harm Probes: Detecting Harmful Intent Where the Concepts Live"
date: "2026-07-22 12:00:00 +0000"
description: "Output guardrails and fine-tuned refusals sit at the end of an LLM's stack, where jailbreaks can route around them. A working draft proposing harm detection from mid-layer activations: a side network fed by mapped neuron cohorts, with warming and cooling harm dimensions and a circuit breaker."
tags:
  - working draft
  - AI security
render_with_liquid: false
---
*Working draft.* See [About 'WIP'](/blog/about-wip/). Written up from my notes in [llm_research](https://github.com/rickmark/llm_research) (July 2026). Nothing here has been implemented or measured yet; every claim is a design hypothesis. A companion draft, [Constraint Pressure](/blog/constraint-pressure-grammar-constrained-decoding-prompt-injection/), reads a different internal signal, the pre-mask logits, for prompt injection.

## Abstract

Most harm detection for large language models works on text: a fine-tuned refusal at the end of training, or a second model that reads the prompt or the response. Both see tokens rather than the concepts the model is actually computing, and both are routinely jailbroken. We propose detecting harm in the middle layers instead, where a transformer represents concepts such as "self harm" as distinct from "death" in gothic art. Harm-related neurons are found after training by adversarial contrast, grouped into cohorts, and fed on every forward pass to a small side network. Each harm category becomes a dimension that warms while related activations flow in and cools uniformly after every token, so it tracks the topic as it drifts. When a dimension crosses a threshold, a circuit breaker stops generation or calls a slower, targeted check. We argue that efficient deployment needs hardware support, a trace port for activations in the spirit of ARM's Embedded Trace Macrocell, and we list the experiments that would test the idea.

## 1. Introduction

A word like "death" says nothing on its own about whether a conversation is about suicide, murder, a eulogy or the Maccabees. Its meaning is set by context, and a model resolves that context progressively. Early layers work on tokens and word pieces, later ones on words and grammar, and the middle layers carry something closer to concepts. That is why interpretability tools concentrate on the middle of the stack.

Today's defenses mostly do not. Supervised fine-tuning for refusals is applied after pre-training and lands on the parameters closest to the output. Guard models read text. In both cases the safety behavior is attached to the end of the computation, after the concept has already formed. We describe this as a whiplash effect: like a weight on the end of a rope, a late correction swings widely and inconsistently, because it has learned which tokens to refuse rather than the conceptual structure underneath them. A jailbreak only has to find a wording that reaches the harmful concept without tripping the learned token patterns.

Our proposal is to observe the concept directly.

Contributions:

1. An argument that harm detection belongs at the layers where concepts are represented, not at the output.
2. A method for locating harm-related neuron cohorts by adversarial contrast after training.
3. A side-network detector with per-category harm dimensions that warm and cool token by token, and a circuit breaker on top.
4. A hardware observation: efficient activation probing needs a trace path out of the accelerator that current NPUs and GPUs do not provide.

## 2. Related work

*This section is a starting point; citations are to verify before submission.*

**Guard models.** Classifiers such as Llama Guard and Prompt Guard read prompts or responses as text. They are easy to deploy and to update, but they share the attack surface of any text classifier, and they double the inference cost when run as a second pass.

**Probing and representation engineering.** Linear probes on hidden states, and representation engineering (Zou et al., 2023), show that concepts including honesty and harmfulness are linearly readable from intermediate activations. Our detector is a probe in this sense; the contributions here are the temporal warming and cooling, the per-category structure, and the deployment and hardware argument.

**Circuit breakers.** Zou et al. (2024) proposed rerouting harmful internal representations during training so that the model fails to complete harmful generations. That changes the weights. Our circuit breaker is an external monitor that leaves the model untouched and can be updated independently of it.

**Feature dictionaries.** Sparse autoencoders and browsers such as Neuronpedia map features in the middle layers of open models. They are the natural way to seed the cohort search in Section 4, instead of single neurons.

## 3. Why the middle layers

Three properties make the middle layers the right place to watch.

**Context is already resolved.** By the middle of the stack, "this playlist is the bomb!" and "how do I build a bomb" no longer share a representation, even though they share a token.

**The output layers are where the defenses are.** Refusal training and the logit-level effects of system prompts concentrate near the output, which is also where adversarial wording does its work. A monitor that reads earlier layers is not fighting on the same ground.

**The structure is stable for a given tokenizer.** We hypothesize that the arrangement of features in a trained model is driven far more by the tokenization scheme and corpus than by training randomness: retraining on the same corpus with the same tokenizer yields similar parameter structures, while changing the tokenizer changes them drastically. If that holds, a cohort map built for one checkpoint transfers to retrains and fine-tunes of the same family, and must be rebuilt when the tokenizer changes. This is a hypothesis to test (Section 7), not an assumption the design depends on.

## 4. Finding harm cohorts

Training does not tell us which parameters encode which concepts, so they have to be found afterwards.

**Instrumented passes.** During analysis we keep a second buffer the size of the activations and accumulate each neuron's activation into it as a heat map. After each generated token the whole map decays by a constant factor, so it never saturates and recent activity dominates.

**Adversarial contrast.** We run paired inputs through the instrumented model: harmful requests and near-miss benign ones that share their vocabulary ("how do I build a bomb" against "this playlist is the bomb!"). Neurons that light up for the harmful side and not the benign side are candidates.

**Cohorts, not neurons.** Harm is rarely carried by one unit. We group candidates into cohorts that activate together for a given category (self harm, weapons, targeted hate and so on) and store the cohort map in a side file next to the weights. The map, not the model, is what the detector loads.

## 5. The side-stack detector

At inference time the model runs normally. On each forward pass the activations of the mapped cohort neurons are copied to a side stack.

**Shape.** The side stack is a small feed-forward network. Its input dimension N is the set of measured neurons; a second dimension M captures how neurons associate into harm pairs and cohorts; its output dimension H has one entry per harm category.

**Warming and cooling.** Each harm dimension accumulates signal as related activations flow in. After every token all dimensions cool in unison. A conversation that touches a topic and moves on cools back down; one that dwells on it, or keeps returning to it, stays warm. This gives the detector memory across a long input or output without re-reading it.

**Circuit breaker.** When a dimension crosses its threshold, the breaker trips. Depending on the deployment it can stop generation early, or trigger a second, targeted inference step that asks whether the input or output meets that category's specific definition of harm. The expensive check runs only when the cheap one fires, so wide and varied inputs can be screened without a second prompt for every request.

**Independence.** The detector can be retrained, extended with new categories, or re-thresholded without touching the model, and the model can be fine-tuned without retraining the detector as long as the cohort map still holds.

## 6. Hardware: an activation trace port

In software, copying selected activations out of every layer on every token is expensive: it means extra memory traffic and synchronization on an accelerator built to keep data on-chip. Current NPU and GPU designs have no operation that forwards a chosen subset of activations to a side consumer in constant time.

We think this should be treated like a debug and trace feature. ARM's Embedded Trace Macrocell streams a processor's execution to an external sink without slowing it down. An accelerator equivalent would let the host register a set of neuron indices per layer and receive their activation magnitudes, the flow rate through each measured neuron, on a side channel as the model runs. The same port would serve interpretability work generally, not only safety.

## 7. Experiments

1. **Cohort discovery.** On an open-weight model, build harm cohorts for a few categories by adversarial contrast and compare them with features found by a sparse autoencoder on the same layers.
2. **Detection.** Compare the side-stack detector against a text guard model on standard harmful and benign sets, at matched false-positive rates.
3. **Jailbreaks.** Measure detection on known jailbreak families (role play, encodings, many-shot, translation) where text guards are known to fail. The central claim is that mid-layer detection degrades less.
4. **Temporal behavior.** Test long conversations that drift into and out of a harmful topic, and tune the cooling rate against early and late triggers.
5. **Transfer.** Test whether a cohort map survives fine-tuning and retraining with the same tokenizer, and confirm that it breaks with a different tokenizer (the hypothesis in Section 3).
6. **Cost.** Measure the overhead of software activation capture, to size what a hardware trace port would save.

## 8. Limitations

- **Requires model access.** The method needs the weights and the activations, so it applies to models you run, not to closed APIs.
- **Map maintenance.** Cohort maps must be rebuilt when the model family or tokenizer changes, and an attacker who knows the map could search for inputs that reach the concept through other neurons.
- **Category definitions.** The detector is only as good as the contrast sets used to build it, and harm categories are contested. The targeted second check exists to apply an explicit definition rather than leave the decision to the detector alone.
- **Hardware.** The trace port is a proposal; without it, deployment pays the software cost measured in experiment 6.

## References

- Zou, A. et al. Representation Engineering: A Top-Down Approach to AI Transparency. arXiv 2310.01405, 2023. *(to verify)*
- Zou, A. et al. Improving Alignment and Robustness with Circuit Breakers. arXiv 2406.04313, 2024. *(to verify)*
- Inan, H. et al. Llama Guard: LLM-based Input-Output Safeguard for Human-AI Conversations. 2023. *(to verify)*
- Neuronpedia, an open platform for interpretability research. *(to add)*
- ARM CoreSight Embedded Trace Macrocell architecture specification. *(to add)*
