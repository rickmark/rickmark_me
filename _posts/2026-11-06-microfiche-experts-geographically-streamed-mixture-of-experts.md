---
title: "Microfiche Experts: Geographically Streamed Mixture-of-Experts for Region-Adaptive Autonomous Driving"
date: "2026-11-06 12:00:00 +0000"
description: "A design paper for a driving model whose middle layers are a sliding, density-warped grid of regional experts, with hard-switching legal rule layers and constraint pressure as one signal for drift detection, temporary deltas and an emergency expert."
tags:
  - working draft
  - autonomous driving
render_with_liquid: false
---
*Working draft (v0.1).* See [About 'WIP'](/blog/about-wip/). The draft is timestamped in a [public gist](https://gist.github.com/rickmark/1ecf3a17c79ad454790b85c82e252fd2). Constraint pressure, the signal it builds on, is introduced in the companion paper, [Constraint Pressure: What Grammar-Constrained Decoding Hides About Prompt Injection](/blog/constraint-pressure-grammar-constrained-decoding-prompt-injection/).

## Abstract

We propose Microfiche Experts, an architecture in which the middle layers of a driving model are a spatial grid of expert modules that slides with the vehicle's position. Perception and general driving skill stay fixed, while a density-warped 16×16 window of regional experts, plus a one-tile fading border ring, crossfades as the vehicle moves, much like a microfiche reader moving a lens across a sheet.

Non-negotiable legal rules sit in separate, hard-switching constraint layers above and below the blended band, so they are never averaged away. We reuse constraint pressure, the strain between a model's learned expectations and observed behaviour, as a single signal for three jobs: per-tile drift hotspots that target retraining, a trigger for tile-scoped expiring weight deltas, and an entry condition for a simulation-trained emergency expert with hysteresis and quiescence-based handback.

This is a design paper. We describe the architecture, estimate its compute and memory budget, relate it to prior work on geo-conditioned driving and out-of-distribution fallback, and list the experiments needed to validate it.

## 1. Introduction

A driving policy trained in one place behaves like a tourist everywhere else. Rules change at borders (right turn on red, school-bus stopping distances, left-hand traffic), and unwritten norms change continuously (merge gaps, following distance, how assertively drivers claim right of way). A car that is legal but out of step with local norms is unpredictable to the humans around it, and unpredictability is itself a safety risk.

Collision avoidance outranks the traffic code in practically every jurisdiction. That gives a principled basis for blending toward local driving style: matching local norms is a safety measure, not a loophole. It does not license blending the bright-line rules, which must switch hard at legal boundaries.

Current approaches either train one global policy, condition a single network on a location embedding, or retrain per city. None treat geography as a streamed, bounded memory of interchangeable modules. We argue that doing so gives verifiable behaviour, cheap regional updates and a natural detector for when the world has changed.

Our contributions are:

1. A sliding geographic expert window. A density-warped grid of middle-layer experts, of which a 16×16 core plus a one-tile border ring is resident at any time, with normalized crossfades so transitions are seamless.
2. Separated rule layers. Hard-switching legal constraint layers above and below the soft expert band, so law is never averaged with style.
3. Constraint pressure as a unifying signal. One signal drives per-tile drift detection, selective retraining and emergency-mode entry.
4. Tile-scoped expiring deltas. Small signed adapters for temporary conditions such as roadworks, bounded by the stable layers.
5. A pressure-triggered emergency expert. Trained in simulation, entered with hysteresis and exited on quiescence.
6. A compute and memory budget showing the window fits current automotive hardware.

## 2. Related work

Geography-aware driving is established; streaming geography as swappable modules is not. The table maps prior work to the parts of this design it anticipates.

| Work | What it does | Overlap with this design | Difference |
| --- | --- | --- | --- |
| AnyD: Learning to Drive Anywhere (Zhu et al., CoRL 2023) | One imitation model with geo-location-based channel attention and a contrastive objective | Location-conditioned policy; learns similarity between regions | Single learned embedding, all weights resident; no spatial window, streaming or tiles |
| Dynamically Local-Enhancement planner (2025) | Global base policy plus a module extracting region-specific features from local data; discusses location-selected regional expert policies | Regional experts selected by position | Hard selection by region; no density-warped grid, crossfade ring or drift hotspots |
| LLaDA (2024) | Uses an LLM over the local driver handbook to adapt motion plans to local rules | Explicit per-jurisdiction rule layer | Rules from text at plan time; no learned style band |
| NOMAD city transfer (2026) | Adapts a policy to a new city via self-play on the target map, without local demonstrations | Regional adaptation without crash data | Whole-policy adaptation per city |
| MoDE (AAAI 2022), GEMINUS (2025) | Mixture-of-experts gated by domain or scene type (weather, scenario) | Experts in the driving stack | Gating by scene content, not by position on a map |
| Uncertainty-gated fallback patents, e.g. US 11,487,296 | Out-of-distribution or uncertainty thresholds trigger a deterministic fallback or emergency planner | Emergency mode on detected novelty | Trigger is ensemble or uncertainty variance, not constraint pressure |
| SODA-MPC (2024) | Conformalized ensemble flags OOD predictions and switches to reachable-set control | OOD-triggered safe controller | Prediction-level monitor; no geographic structure |
| Minimal risk condition recovery, e.g. US 12,134,405 | Clears a minimal risk condition to resume normal driving, optionally via remote assistance | Handback after emergency | No quiescence-plus-hysteresis criterion tied to the same signal |

We found no prior work combining a density-warped, streamed grid of experts with a crossfading border ring, per-tile drift detection from constraint pressure, or tile-scoped expiring deltas. This search covered academic literature and a sample of patents; a full patent search is still required (Section 9).

The constraint-pressure signal itself is introduced in the author's companion paper on pre-mask logits as a prompt-injection signal; this paper applies it to a continuous-control setting.

## 3. Architecture

The model is a fixed stack with one swappable band in the middle. Volatility rises toward the middle of the stack and falls again toward the actuators, so the least predictable components are bracketed by the most stable ones.

1. Sensor encoders (fixed). Camera, lidar and radar backbones produce a scene representation. They are deterministic with respect to sensor input and do not vary by region.
2. General driving skill (fixed). Shared knowledge of vehicle dynamics, lane keeping, object interaction and basic right of way. This is the skill a competent driver carries everywhere.
3. Upper rule layer (hard-switching). Jurisdictional constraints keyed by the legal region the vehicle is in, switched discretely at boundaries.
4. Geographic expert band (soft, streamed). The microfiche window of Section 4. Encodes local norms: gap acceptance, assertiveness, speed relative to limits, local road idioms.
5. Lower rule layer (hard-switching). A second constraint layer that filters intents before they become trajectories, so a blended style can never emit a forbidden manoeuvre.
6. Intent-to-operation layers (fixed). Convert intents into trajectories and actuator commands.

The rule layers can be overridden only by an imminent-collision condition, reflecting the legal priority of avoiding harm. They also bound how far the expert band, and any delta applied to it (Section 6), can move behaviour.

## 4. The microfiche window

At any moment the vehicle holds an 18×18 block of experts in memory: a 16×16 core plus a one-tile border ring. The lens stays centred on the vehicle; as it moves, ring tiles on the leading edge ramp up from zero weight while trailing-edge tiles ramp down. When a trailing column reaches zero, the window indices shift by one and a new ring column is loaded at zero weight. Because the shift happens only at zero weight, it has no effect on the output, the same principle as double-buffering in graphics.

### 4.1 Density-warped grid

Tiles are not uniform squares. The grid is warped in proportion to traffic density, like a cartogram: a downtown core may use tiles a couple of hundred metres across, while a rural interstate uses tiles tens of kilometres long. Each expert therefore sees roughly the same amount of training data, which balances training and gives dense areas the resolution their complexity needs. Downtown regimes may warrant their own sub-network with finer subdivision.

### 4.2 Blending

Only a small neighbourhood near the vehicle carries meaningful weight. For vehicle position p, expert i at tile centre c_i receives a fade weight f_i, and outputs are mixed with normalized weights so total layer magnitude stays constant through a transition:

```
w_i(p) = f_i(p) / Σ_j f_j(p)
h      = Σ_i w_i(p) · E_i(x)
```

Without normalization, the band's output strength would wobble mid-transition. For diagonal motion two edges and a corner fade at once; separable fades handle this cleanly, with the weight of a tile the product of its horizontal and vertical fades:

```
f_i(p) = f^x_i(p_x) · f^y_i(p_y)
```

Because the active set is a small, enumerable neighbourhood, each blend can be verified as a finite combination of known experts rather than an arbitrary continuum.

### 4.3 Prefetch

The ring doubles as a prefetch signal. Its tiles are exactly the experts the vehicle will need next, so they can be loaded from storage, verified and placed in memory before they receive any weight. Route planning extends the horizon further, so the window can be warmed along the planned path.

## 5. Drift detection with constraint pressure

Where the model keeps straining against what it observes, the world has changed, and only that tile needs retraining. We define constraint pressure for a tile as the sustained divergence between the expert band's predicted behaviour (of the ego vehicle and of surrounding agents) and the behaviour actually observed there, aggregated across fleet traversals.

Mapping pressure per tile yields a hotspot map. A new stadium, a re-striped intersection or a suburb filling in shows up as a localised rise. Retraining only hot tiles is far cheaper than retraining the model, and the same map gives a continuous fitness score for every area of operation.

### 5.1 Separating temporary from permanent change

Roadworks, festivals and closures raise pressure just like permanent change. The perception stack already detects cones, barriers, lane closures and signage, so pressure observed alongside those cues is tagged temporary and excluded from the retraining signal. Residual pressure that persists over a minimum window is treated as permanent drift.

### 5.2 Guarding against bad local norms

Pressure measures disagreement, not correctness. If running red lights becomes normal in an area, a naive retrain would learn it. The hard rule layers prevent such behaviour from reaching actuators, and a review gate before promoting a retrained tile is recommended for deployment, though the initial system can simply log hotspots for analysis.

## 6. Temporary pressure deltas

Temporary conditions are shipped as small adapters, not new weights. A delta is a low-rank adapter in the style of LoRA, scoped to a named set of tiles and carrying an expiry, for example a lane closure on a specific highway segment until a given date. On expiry the vehicle discards it and falls back to the base experts; the base weights are never modified.

Deltas are cheap to distribute: a low-rank adapter for a handful of 10-million-parameter experts is on the order of hundreds of kilobytes to a few megabytes, small enough for routine over-the-air delivery.

### 6.1 Security

An over-the-air artefact that changes how a car drives is an attractive attack target. Each delta must be:

- Signed, with keys held in hardware-backed storage and verified on the vehicle.
- Scope-limited, applying only to the tiles it names, so a compromised delta cannot affect the whole map.
- Envelope-bounded, with its effect on behaviour capped by the stable rule and skill layers, which reject outputs outside a fixed safety envelope regardless of what the delta requests.
- Time-limited, so a stale or forgotten delta cannot persist.

The stable layers act as a local check that does not depend on trusting the server's signature alone.

## 7. Emergency mode

When constraint pressure spikes and no regional expert fits the scene, control passes to an emergency expert trained entirely in simulation. Rare, dangerous events such as a wrong-way vehicle in the ego lane are exactly the cases real-world data cannot safely supply, and collecting them usually means someone was hurt. Simulation lets the emergency expert experience millions of such events at no human cost.

### 7.1 Bounded action set

The emergency expert knows only the physics that was simulated, so its outputs are restricted to a small set of manoeuvres whose dynamics are well characterised: maximum braking, a controlled evasive swerve, and selecting the least-harmful collision when none is avoidable. This narrows the sim-to-real gap to the parts of the model that matter.

### 7.2 Entry and exit with hysteresis

A false trigger on a busy motorway can cause the crash it is meant to prevent, so mode switching uses two thresholds. With pressure P(t), the system enters emergency mode when pressure exceeds a high threshold and leaves only after it stays below a lower one for a dwell time τ, with the vehicle at rest:

```
enter if  P(t) > θ_high
exit  if  P(s) < θ_low  for all s ∈ [t − τ, t]  and  v(t) = 0
```

where θ_low is strictly below θ_high. Quiescence, a full stop with pressure low for several seconds, is the handback signal. Whether handback should also require remote confirmation in some cases is left open.

## 8. Compute and memory budget

The window fits current automotive hardware; the binding constraint is memory capacity and update bandwidth, not compute. All figures below are illustrative estimates, not measurements.

| Component | Parameters (approx.) | Resident memory | Per-frame compute |
| --- | --- | --- | --- |
| Sensor encoders (fixed) | 1–2 B | 1–2 GB at 8-bit | Dominant; runs at 10–30 Hz regardless of region |
| General driving skill (fixed) | ~1 B | ~1 GB | Constant |
| Expert window, 18×18 × ~10 M each | ~3.2 B | ~3.2 GB at 8-bit | Only active neighbourhood counts |
| Active experts, ~3×3 patch | < 100 M | (within window) | Small next to perception |

Compute scales with the number of experts carrying meaningful weight, not with grid size. Streaming cost is modest: with ~200 m downtown tiles at city speeds, a new 18-expert edge is needed roughly every 15 seconds, about 12 MB/s from local storage, well within SSD bandwidth. Highway tiles are far larger, so their streaming rate is much lower.

## 9. Limitations, risks and future work

Nothing here has been implemented or measured yet; every claim is a design hypothesis. The main open problems are:

- Grid maintenance. As traffic density changes, the warped grid may need redrawing, which moves expert boundaries. Whether to re-warp on a schedule or split tiles in place (quadtree-style) is unresolved.
- Pressure calibration. Thresholds for drift, deltas and emergency entry must be set per tile type; a downtown tile has naturally higher variance than a highway tile.
- Sim-to-real gap. The emergency expert is only as good as its simulator. Its action set is deliberately small to limit this risk.
- Learning bad norms. Drift-driven retraining can absorb unsafe local behaviour; rule layers and review gates mitigate but do not eliminate this.
- Positioning failure. GPS loss or spoofing could load the wrong experts. The window should degrade to the general skill layer when localisation confidence drops, and cross-check position against map-matched perception.
- Novelty. Our prior-art search was not exhaustive. A formal patent search, particularly of major autonomous-vehicle developers, is needed before claiming novelty.

Proposed experiments:

1. Train a windowed model in a simulator with synthetic regional styles (e.g. CARLA with varied agent policies) and compare against a single global policy and a geo-embedding baseline such as AnyD.
2. Measure output discontinuity at tile crossings with and without the fading ring and normalization.
3. Inject synthetic drift into a tile and measure detection latency and false-positive rate, with and without the roadworks pre-signal.
4. Evaluate emergency-mode trigger precision and recall on rare-event scenarios, and the rate of unnecessary hard braking.

## 10. Conclusion

Treating geography as a streamed, bounded window of experts turns regional adaptation into a memory-management problem with verifiable transitions. Separating hard legal rules from soft local style keeps the law intact while letting the vehicle drive like a local. A single signal, constraint pressure, then serves as drift detector, update trigger and emergency switch. The design fits current hardware on paper; the experiments in Section 9 are the next step.

## References

1. Zhu, R., Huang, P., Ohn-Bar, E., Saligrama, V. Learning to Drive Anywhere. CoRL 2023.
2. Dynamically Local-Enhancement Planner for Large-Scale Autonomous Driving. arXiv:2502.21134, 2025.
3. Driving Everywhere with Large Language Model Policy Adaptation (LLaDA). arXiv:2402.05932, 2024.
4. Learning to Drive in New Cities Without Human Demonstrations. arXiv:2602.15891, 2026.
5. Learning Mixture of Domain-Specific Experts via Disentangled Factors for Autonomous Driving. AAAI 2022.
6. GEMINUS: Dual-aware Global and Scene-Adaptive Mixture-of-Experts for End-to-End Autonomous Driving. arXiv:2507.14456, 2025.
7. Safe, Out-of-Distribution-Adaptive MPC with Conformalized Neural Network Ensembles (SODA-MPC). arXiv:2406.02436, 2024.
8. Method and system for deterministic trajectory selection based on uncertainty estimation for an autonomous agent. US Patent 11,487,296.
9. Responding to unsupported or degraded conditions for autonomous vehicles. US Patent 12,134,405.
10. Hu, E. et al. LoRA: Low-Rank Adaptation of Large Language Models. ICLR 2022.
11. Author's companion paper on constraint pressure (pre-mask logits as a prompt-injection signal). Draft, 2026.
