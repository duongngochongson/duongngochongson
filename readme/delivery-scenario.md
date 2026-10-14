# Not-Home Delivery Stop

_Concept project_

Discover Not-Home Delivery Stop, a **mobile module** where drivers practice the four actions an **action map** showed they need when nobody answers the door. With four job aids and two changes in operations, it helps drivers deliver more parcels on the first attempt, so customers get them when they expect, with no rise in missing parcels.

This repository holds the code of the module.

[Try the module](https://delivery-scenario.vercel.app/) · [See the action map](https://duongngochongson.vercel.app/work/not-home-delivery-stop/Diagrams.html#action-map) · [The project page](https://duongngochongson.vercel.app/#portfolio/delivery-scenario)

**Audience**

- City-route drivers at a parcel company
- They use the module on a phone, outdoors, between stops

**Responsibilities**

- Action mapping
- Branching scenarios
- Job aids
- Visual design
- Vibe-coded e-learning
- LMS · SCORM

**Tools**

- Claude (analysis and planning)
- Claude Code (web app and SCORM)
- Piper (voices)
- Gemini (practice call)
- Google Workspace (tracking)
- GitHub (code and SCORM builds)

## Problem

At stops where nobody answers the door, too many parcels are not delivered on the first attempt.

When nobody answers the door, the driver decides where the parcel goes: a safe place, a neighbor or a pickup point. The choice depends on the handling code, the stop note and the customer’s answer on the phone, so it is **easy to get wrong**, and a wrong one means another trip or a **missing parcel**.

Where each handling code lets a parcel go:

| Code | Safe place at the house | Neighbor | Pickup point |
|---|---|---|---|
| **STD** (Standard parcel) | ✓ With a stop note or the customer’s OK | ✓ Allowed | ✓ Allowed |
| **SIG** (Needs a signature) | ✗ Not allowed | ✓ A neighbor who signs, with the customer’s OK | ✓ Allowed |
| **AGE** (Age-restricted) | ✗ Not allowed | ✗ Not allowed | ✓ The customer shows photo ID |

## Goal

Within three months, first-attempt success at not-home stops should rise from 45% to **65%**, while claims for missing parcels stay at **0.5% or less** of those stops.

- **First-attempt success at not-home stops**: Now **45%**; Target **65%** within three months. The share of not-home stops where the parcel reaches an allowed place on the first visit.

## Finding the root causes

Action mapping found seven barriers behind four key actions: five for training and two for operations.

**How I sorted the barriers.** Cathy Moore sorts barriers into environment, knowledge, skill and motivation. Training helps with knowledge and skill. Stop notes that are hard to find, or a scorecard that rewards skipping the call, need a change in the work.

7 barriers: 5 for training, 2 for operations.

### Follow the steps in order

_Motivation + knowledge_

Some drivers skip the call to protect their stop rate on the scorecard, and some are unsure of the order of the six steps.

### Choose an allowed option

_Knowledge + environment_

Drivers are unsure what SIG and AGE parcels allow, and stop notes are hard to find.

### Agree on an option by phone

_Skill_

Some drivers agree to requests the rules do not allow, and their calls drift from the point.

### Leave the parcel in a safe place

_Skill + knowledge_

Drivers misjudge whether a spot is hidden, and their photos miss the house number.

## Solution

The solution has three parts: a short module, four job aids and two changes in operations.

### Not-Home Delivery Stop

_For drivers_

Seven slides on a phone, with one question per screen. Six practice the four actions, and one opens the job aids.

[A slide of the module, with its parts numbered](https://duongngochongson.vercel.app/assets/projects/ds-screen.webp)

### Four job aids

_For drivers_

The Sequence, Handling codes, Safe place and Call moves cards. Drivers open them on slide 2, and again from any later slide.

[The Sequence card, a job aid](https://duongngochongson.vercel.app/assets/projects/ds-job-aid.webp)

### Two changes in operations

_For operations_

The arrival screen shows the handling code and the stop notes, and the scorecard counts a neighbor or a pickup point as a first-attempt success.

## Module: Not-Home Delivery Stop

The module practices the four high-priority actions from the action map in seven short slides on a phone.

Slide 7 is a **branching scenario** with two stops that checks the expected outcome. A driver passes with **80/100** and no broken rule there.

### Seven slides

| # | Slide | Type | Points |
|---|---|---|---|
| 1 | **Put the steps in order** | Ordering | 10 points |
| 2 | **Open the job aids** | Cards | no points |
| 3 | **Sort the parcels** | Sorting | 20 points |
| 4 | **Take the call** | Call with voices | 20 points |
| 5 | **Write the call** | Typed call | no points |
| 6 | **Find the safe place** | Picture | 10 points |
| 7 | **Handle two stops** | Branching scenario | 40 points |
|  | **Results** | 80/100 to pass |  |

### Screens from the module

- [Slide 1, putting the steps in order](https://duongngochongson.vercel.app/assets/projects/ds-sequence.webp)
- [Slide 4, the phone call with captions](https://duongngochongson.vercel.app/assets/projects/ds-call.webp)
- [Slide 6, finding the safe place](https://duongngochongson.vercel.app/assets/projects/ds-safe-place.webp)

## Visual design

I set the look of the module in a style guide built around one place: a phone, outdoors, between stops.

Three principles guide it: **readable on the street** (text of 16px or more, 7:1 contrast for body text, 44px controls), **one thing per screen**, and **meaning never by color alone**.

- [Screen anatomy: the three zones of a slide, on a phone 360px wide.](https://duongngochongson.vercel.app/work/not-home-delivery-stop/style-guide/screen-anatomy.webp)
- [Branching map: the two stops on slide 7 and where each choice leads.](https://duongngochongson.vercel.app/assets/projects/ds-branching.webp)

## Development

I built the module as a web app that also runs in a learning management system (LMS).

React draws the screens, XState runs each slide’s logic, and Zod checks the content files.

Each change on GitHub builds a new **SCORM 1.2 package**, so an LMS can run the module and save each driver’s progress and best score.

Slide 4 has synthetic voices with captions, and on slide 5 an AI model plays a customer in a typed call.

## Documents & credits

[Try the module](https://delivery-scenario.vercel.app/) · [Diagrams](https://duongngochongson.vercel.app/work/not-home-delivery-stop/Diagrams.html) · [Style guide](https://duongngochongson.vercel.app/work/not-home-delivery-stop/Style%20Guide.html)

## Credits

Thank you to the people who made these open-source fonts, icons, voices and libraries free to use.

- **Fonts**: [Barlow Semi Condensed](https://github.com/jpt/barlow) by Jeremy Tribby · OFL 1.1; [Atkinson Hyperlegible Next](https://github.com/googlefonts/atkinson-hyperlegible-next) by Braille Institute of America · OFL 1.1
- **Icons**: [Lucide](https://lucide.dev) by the Lucide contributors · ISC
- **Voices**: [Piper voice en_US-libritts_r-medium](https://huggingface.co/rhasspy/piper-voices) by the Piper project · CC BY 4.0
- **Libraries**: [React](https://react.dev) by Meta · MIT; [XState](https://github.com/statelyai/xstate) by David Khourshid · MIT; [Zod](https://zod.dev) by Colin McDonnell · MIT

Speech generated with a Piper voice trained on LibriTTS-R: Y. Koizumi et al., “LibriTTS-R: A Restored Multi-Speaker Text-to-Speech Corpus”, Interspeech 2023 ([openslr.org/141](https://www.openslr.org/141/)), which restores LibriTTS (H. Zen et al., 2019), built from public-domain LibriVox recordings. Licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The sentences were synthesized, then trimmed, leveled and encoded to MP3.

[All projects](https://duongngochongson.vercel.app/#portfolio)

---

<sub>This README is written from the project page on my portfolio, https://duongngochongson.vercel.app/#portfolio/delivery-scenario, and is updated when that page changes. To run, build and test the code, see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).</sub>
