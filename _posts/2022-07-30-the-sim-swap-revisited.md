---
title: "The SIM Swap Revisited"
date: "2022-07-30 00:56:34 +0000"
description: "Terms IMSI - The identifier for a particular line of service on the cellular network. Fixed for the lifetime of the line (pending some unknown rotation scheme) IMEI - A unique device on the GSM network. iPhones contain two IMEIs so that they can participate in Dual SIM (today DSS…"
render_with_liquid: false
---
## Terms

**IMSI** - The identifier for a particular line of service on the cellular network.  Fixed for the lifetime of the line (pending some unknown rotation scheme)

**IMEI** - A unique device on the GSM network.  iPhones contain two IMEIs so that they can participate in Dual SIM (today DSS - Dual SIM Standby) because should both SIMs be from the same carrier the base station needs to be able to identify both lines separately in the core network.

**MEID** - An older identifier from the CDMA specification (which did not use SIMs and instead kept this ID as the device identifier) - Modern MEIDs are the first IMEI without the check digit

**EID** - An identifier for the eSIM to allow it to be identified in the eSIM provisioning process.  This identifier is used to allow a new eSIM profile (with a generated ICCID) to be sent to the device where it then works as a normal SIM application.  The iPhone eSIM can contain 10 such profiles.

**ICCID** - The identifier of the SIM itself

**Ki** - The key in the SIM used to prove the SIM card is held by the mobile device requesting cellular service

**AP** - Application processor.  The ARM core which the Android or iOS kernel runs

**Modem** - The ASIC that is tasked with driving the cellular radio

**Baseband** - A general purpose processing element that manages the SIM/Modem and radios.  Connected to the AP to provide access to the cellular network

**APN** - Access point name. A particular data service on the cellular network

## Cellular Registration - An Overview

When a phone is powered on, brought out of airplane mode or a SIM is inserted, the device then attempts to register with the cellular network.  Roughly, the phone provides it’s IMEI, IMSI to the cellular network and uses the ability to perform a HMAC using the Ki value to prove it’s IMSI to the network.  If these operations succeed, the MS (mobile station) is allowed to use cellular resources as the subscriber.  This process generally operates entirely in the baseband as it is a real-time operating system designed for this purpose.

## Malware in the Baseband

The baseband is generally opaque to both the mobile operator as well as the mobile operating system and it’s AP.  Majority of the information presented to the user about a phone and its service are queries passed to the baseband (using rather antiquated AT\* modem commands).  The baseband when operating normally uses the SIM or eSIM to get the IMSI and to HMAC Ki to perform the registration.  If an attacker has code execution on the baseband, it does not have to do this.  A malicious baseband can:

- Use some other IMSI and Ki for registration not from the SIM or eSIM
- Can filter or modify voice, SMS and data traffic
- Can directly perform network service requests, such as enabling call forwarding without interaction
- Can perform a Ki HMAC and pass the resulting value to the attacker allowing them to impersonate the subscriber on the network.  This value can be either passed via cellular data or another radio (wifi for instance)
- Since the baseband manages IMEI, two colluding devices can “swap IMEIs” so that the cellular provider sees no change to the device being used

## Ways to Attack the Baseband

- Modify the separate non-volatile storage where the baseband code and data are stored
- Take advantage of errors in baseband code parsing network data such as signaling data, SMS, eSIM/SIM provisioning or other traffic types
- From the AP interface
- From other baseband managed radios (bluetooth / wifi)

## Ways to Improve

- Baseband fuzzing
- Baseband secure boot verification
- Identify and verify mutable storage of the baseband
- Implement SDR based attack detection
- IMEI public keys to provide strong device identity (instead of solely relying on the SIM as a proof of identity)
- Allowing the AP to verify the integrity of the baseband, and pull it through a hard reset
