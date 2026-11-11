---
title: "A pcapng Encapsulation for Hardware Buses, Starting with SPI"
date: "2022-01-21 12:00:00 +0000"
description: "pcapng already carries USB and other interfaces; embedded hardware buses have no standard encapsulation. A working proposal for a SPI link type, plus two general-purpose block types for link topology and link-state changes that would also serve Ethernet and other interfaces."
tags:
  - working draft
  - standards proposal
render_with_liquid: false
---
*Working draft and standards proposal.* See [About 'WIP'](/blog/about-wip/). From [pcapng_linktype_hardware](https://github.com/rickmark/pcapng_linktype_hardware) (January 2022). This is a design proposal for discussion, not a ratified format.

## Motivation

pcapng was meant as a generic container: an interface, and the binary data crossing it. That generality is why it grew beyond network frames to carry USB. The same reasoning extends to the hardware buses that embedded work lives on, which today have no standard capture encapsulation. The first and most useful target is SPI, and on top of SPI the JEDEC flash command set, since SPI itself carries none of the descriptors a reader would need to interpret a transfer. Standardizing this would let existing pcapng tooling read a flash-bus capture the way it already reads a USB capture.

Working this through surfaced two gaps that are not SPI-specific but general holes in pcapng, so the proposal is in two parts: a SPI link type, and two new block types that would serve any interface.

## 1. Modeling SPI interfaces

SPI is a master-to-slave bus where the master selects a target with a chip-select line. There are three ways to map that onto pcapng interfaces, each with a tradeoff:

- **One interface per master**, with the slave identified by an integer per transfer. Simple, but the per-pair relationships are implicit.
- **One interface per master/slave pair.** This lets pairwise data live in the interface record, but loses how the links inter-relate on the same master.
- **One interface per master, embedding the N slave details in the interface record.** This keeps the relationships visible while still treating the master as the capture point.

The third option is the most expressive, and it pairs naturally with the topology block below. The working assumption is that master/slave relationships are fixed for the span of a single transfer.

## 2. A general block: `BLOCK_LINK_TOPOLOGY`

A new block type would describe the shape of a link rather than enrich an identifier. It would record whether the link is 1:1, 1:many or many:many; whether it is up or down; whether it supports resets or state changes; whether it is full or half duplex, and whether that can change; and whether it can change speed or encoding. It would also open a LINKTYPE-specific option namespace, which for SPI is where the JEDEC "next layer protocol" details belong, since those are specific to a master/slave link.

This is deliberately not SPI-only. For `LINKTYPE_ETHERNET` the same block could signal spanning-tree (STP/RSTP) state, an ARP table, or a switch port change on the device recording the capture. It differs from a Name Resolution Block: rather than mapping an identifier to a friendly name, it states which identifiers are correlated to an interface.

## 3. A general block: `BLOCK_LINK_CHANGE`

SPI has a RESET line, and can transition between SPI, Dual-SPI and Quad-SPI. These are real events but awkward to represent as frames: a RESET is closer to a side channel than to an octet stream, and has no natural byte payload. pcapng has no general way to express such link-level events, which is a gap in the format itself, not just for SPI.

The proposal is a `BLOCK_LINK_CHANGE` block for sideband events, resets, speed changes, encoding changes, carrying a `link_id` that correlates to a `BLOCK_LINK_TOPOLOGY` block so that changes can be reported for links other than the primary one. To spare readers from maintaining a state machine, the SPI format would also plumb the current mode (SPI/Dual/Quad) into every Enhanced Packet Block.

## 4. Transfer frames

Each SPI transfer frame should carry: direction and target; the mode (SPI, Dual-SPI, Quad-SPI); timing; clock rate, as an average with skew; the raw data; and a monotonically increasing reset count, so a stream of transfers can be correlated across resets.

## Open questions

- Whether the one-interface-per-master-with-embedded-slaves model holds up for buses with dynamic chip-select arrangements.
- The exact option layout for the JEDEC next-layer protocol inside the topology block's namespace.
- Whether `BLOCK_LINK_CHANGE` should be adopted for Ethernet and other existing link types as part of the same proposal, or separately.
- Alignment with the IANA/tcpdump process for allocating a new LINKTYPE value.

## References

- pcapng specification (Enhanced Packet Block, Interface Description Block, Name Resolution Block). *(to add)*
- JEDEC SPI flash command set (SFDP). *(to add)*
- [pcapng_linktype_hardware](https://github.com/rickmark/pcapng_linktype_hardware): the proposal text.
