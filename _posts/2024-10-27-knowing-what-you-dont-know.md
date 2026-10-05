---
title: "Knowing what you don’t know…"
date: "2024-10-27 04:30:21 +0000"
description: "Log Rotate, NTP, and how to cover your tracks as an attacker… It’s not really common knowledge but basically anyone on your network can wipe your logs (security and forensic in many cases). Almost every modern computer does two things… it uses NTP to get the current date and…"
render_with_liquid: false
---
Log Rotate, NTP, and how to cover your tracks as an attacker…

It’s not really common knowledge but basically anyone on your network can wipe your logs (security and forensic in many cases).

Almost every modern computer does two things… it uses NTP to get the current date and time, and it rotates log files to prevent a continuous growth of log files on disk that consume all available space. Most of the time this is handled by or called “log rotating” - it often compresses old logs, and deletes older still logs. These two facets can be combined to cover one’s tracks like so…

Imagine I’ve accessed a machine via SSH for a known password for a user, but I do not have root access so my connection would be logged by sshd. Now this is a tell tale sign that compromise has occurred, and therefore puts an attacker at risk. Also imagine that an EoP isn’t desirable to delete said logs.

The simple answer is if you exist in a point of privilege (same network segment where APR or ARP poison routing, live on the router or control the DNS server) it becomes possible to spoof NTP. This is because NTP is a fundamentally insecure protocol (yes there are more secure derivations but these are not well adopted). Now to combine these two details…

If I act as the NTP server, and give an absurdly past or in some cases future time, wait for the victim to query for the time, and then perform my attack, I can leverage logrotated to clean up the logs for me.

This is because the logs would be too old to retain and therefore logrotate would do its job and destroy the evidence. This is even useful as a method of persistence because a change to log rotates config to delete files over 10 years would go unnoticed, since an admin wouldn’t worry of such occurrences.

Now, some implementations of NTP are smart enough to forgo a time shift that is wildly different from the RTC (real time clock). This only works on platforms with a battery and therefore doesn’t work well in embedded systems or Raspberry Pis. Also many times all that is required is either a CMOS reset or the leveraging of any defect that causes a checksum failure of the CMOS triggering such a reset, clearing the clock, which…. then will happily use the provided NTP value!

There are some solutions though! Using a realtime SEIM or log shipping can prevent this by stamping the logs at time of receive, not the time of the machine of origin. Now don’t overly trust this because half the attacks (DNS/Router/APR) are just as capable of denial of service of your log system. In addition not all log shipping is realtime. If it’s scheduled such as nightly it may actually increase confidence in your logs but amplify the issue (they are in two places so must be accurate right??!?)

So, Rick, everything is broken… now what?

Well there’s a solution. By ensuring that logs are using a monotonic increasing counter in addition to the time of the event, we can ensure such “drop outs” are discovered. Additionally by making this counter strengthened by systems such as anti rollback, TEE / signature from enclaves such as the trust zone, TPM or Secure Enclave.

And further further…. a concept like a ZKRollup (zero knowledge rollup) can be used to effectively turn SEIM / logging events into a Merkle tree of hashes, (go ahead and roll your eyes… but yes - you can even place these ZKRollups onto the Ethereum blockchain via a smart contract)

So, know the limits of your logs, know that lack of evidence is not proof of a negative. Most good forensics isn’t finding a smoking gun in the log files but instead correlating log files from multiple systems looking for the signal from the missing or mismatched data.
