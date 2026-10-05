---
title: "On Warren’s Plan to Break Up Facebook"
date: "2021-12-13 00:00:22 +0000"
description: "The Difficulty with Ubiquious Services The reason that the utility of Facebook is what it is, is primarily its de-facto status as the ubiquitous system of record. Before Facebook conversations in real life were a binary search tree of what system’s you shared in common (IRC, AIM, ICQ, LinkedIn…"
render_with_liquid: false
---
# The Difficulty with Ubiquious Services

The reason that the utility of Facebook is what it is, is primarily its de-facto status as the ubiquitous system of record.  Before Facebook conversations in real life were a binary search tree of what system’s you shared in common (IRC, AIM, ICQ, LinkedIn, Friendster, MySpace…).  Facebook years ago started to bring “common carrier” interoperability to the world via social login and the Graph API.  Combine that with the several orders of magnitude increase in complexity of SIP, Voice / Video, Data Taxonomy, and Data Interchange over the Bell System, and the AT&T breakup (which one should note has resulted in almost all of the baby bell’s re-merging by 2021) is not an appropriate template.

# Proposed Solutions

## User Data Sovereignty

From the perspective of content / social networks like Facebook, they see themselves as “owning” the content and data posted to them.  As a potent example of this: a politician who creates a “public page” on the Facebook platform posts their upcoming event schedule.  While anyone on the internet can go to this page from a Google search result, Facebook requires App developers to have a business entity and get approval from the platform in the form of “[Public](https://developers.facebook.com/docs/features-reference/page-public-content-access/) [Page Content Access](https://developers.facebook.com/docs/features-reference/page-public-content-access/)” to be able to read the same data in a machine form.  The public page wants this data to be discovered, but Facebook forces a set of consumers into a relationship with Facebook via the developer programs where they can then exert undue influence and control of data that should be owned by the page owner.

**Resolution:**

- Apps on the internet should at the least be able to view public content at with the same ease as a user in a browser.
- Facebook has used “protecting user privacy” to push out other consumers of their data.  At this stage it is clear that this is increasing Facebook influence, and is decided in an arbitrary way.  We need a better solution to protecting against data harvesting other than having Facebook be the keeper of this walled garden.

## Classifying Facebook Graph / Messenger / Portal (Video Chat) as a “Utility”

We have existing common carrier definitions of “utility”.  We need to update this to better support the year 2021.  By forcing companies that provide solutions like this to have carrier peering agreements (this is handled by the back end system used by such systems known as “XMPP” or “Jabber”) as well as requiring documentation of the protocols so that one can use a client other then the one provided by the service (for instance bringing Facebook messenger to other operating systems which lack corporate support like Linux) we can increase competition.  A classical example of this was a messaging app from 15-20 years ago named “[Trillian](https://en.wikipedia.org/wiki/Trillian_(software))”.

**Resolution:**

- Forced documentation of protocols, similar to the requirements placed on Microsoft after the IE4 anti-trust case(<https://docs.microsoft.com/en-us/openspecs/protocols/ms-protocolslp/9a3ae8a2-02e5-4d05-874a-b3551405d8f9>)
- “Fair Use” rules regarding interoperability

## Forced Discoverability of Other Platforms (Meta-contacts)

Platforms that provide social context need a simple method whereby users are able to link their presence across platforms.  As a user I should be able to see that a contact and myself both have FaceTime and could use this instead if we prefer.  This prevents the lock in to ecosystem.  We built a scheme for this a long time ago in the form of URLs and URIs.  By simply having my Facebook profile have a URI of facebook.com:profile:penwellr and it linking to linkedin.com:profile:penwellr we could discover across platforms.  This type of linkage should be forced to be supported by these systems but of corse their disclosure should be in the control of a user in the form of privacy options.

**Resolution:**

- Create a standard for cross-platform linkage allowing transitions to other platforms where users decide they wish too

## Examination of “incentive models”

Reddit is a much better design of engagement for social media.  The content is shown as a result of “up” and “down”voting rather than algorithms designed for engagement.  On top of this moderation is provided as a teem of volunteers that are experts in their particular sub-reddit.  This makes the ecosystem police themselves.  Facebook’s hiring an army of content moderators with little impact should show that you cannot police a system where you profit from it being lawless.  Furthermore, Facebook’s unique position of being able to access all data sets and then deciding what and how to publish should be examined as well.  Qualified academics should be able to work with raw data sets to produce the kind of evidence about platform and sociological behavior.
**Resolution:**

- Thoughtfully consider where the profit model takes away from “social good”
- Break up the monopoly of expertise that exists in house on data analysis

## Identity Verification / KYC requirements

Many of the worst abuses of social media come in the form of COPPA violations as well as bot/non-human actors manipulating human interaction.  Our banks require KYC (know your customer) requirements so that financial crimes can be tracked and prosecuted.  Identity verification documents are not a high bar of proof of a human accountable for a particular account / content.

**Resolution:**

- Require documentation for any account / profile publishing “public” or “discoverable” information (outside of accepted “friends”)

## Transparency Reports Should Be Prepared with Outside Experts

We trust the “transparency reports” from tech companies which are prepared by in house data scientists which often hold stock in their company.  We should build better, academic style, peer-reviewed methods for gathering and verifying key metrics about platform abuse.

**Resolution:**

- Require data interchange with accredited higher learning institutions
