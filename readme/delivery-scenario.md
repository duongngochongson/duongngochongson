# Not-Home Delivery Stop

_Concept project_

Discover Not-Home Delivery Stop, a **mobile module** where drivers practice the four actions an **action map** showed they need when nobody answers the door. With four job aids and two changes in operations, it helps drivers deliver more parcels on the first attempt, so customers get them when they expect, with no rise in missing parcels.

This repository holds the code of the module.

[Try the module](https://delivery-scenario.vercel.app/) · [See the action map](https://duongngochongson.vercel.app/work/not-home-delivery-stop/Diagrams.html#action-map) · [The project page](https://duongngochongson.vercel.app/#portfolio/delivery-scenario)

**Audience**

- City-route drivers at a parcel company
- They use the module on a phone, outdoors, between stops
- Goal: raise first-attempt success at not-home stops from 45% to 65% within three months

**Responsibilities**

- Action mapping
- Branching scenarios
- Job aids
- Visual design
- Vibe-coded e-learning
- LMS · SCORM

**Tools**

- Claude (analysis and planning)
- Claude Code (web app and SCORM package)
- Piper (voices for the phone call)
- Gemini (practice call and feedback)
- Google Workspace (notes, asset and license tracking)
- GitHub (code and automatic SCORM builds)

## Problem

At stops where nobody answers the door, too many parcels are not delivered on the first attempt.

At a parcel company, drivers deliver on city routes. When nobody answers the door, the stop is called a not-home stop, and the driver has to decide where the parcel goes: a safe place at the house, a neighbor or a pickup point.

The right choice is **easy to get wrong**, because it depends on three things: the handling code on the parcel’s label, the stop note with the customer’s instructions, and what the customer says when the driver calls. A parcel that goes back to the depot needs another trip, and a parcel left where the rules do not allow **can go missing** and lead to a claim. Each code allows different places:

Where each handling code lets a parcel go:

| Code | Safe place at the house | Neighbor | Pickup point |
|---|---|---|---|
| **STD** (Standard parcel) | ✓ With a stop note or the customer’s OK | ✓ Allowed | ✓ Allowed |
| **SIG** (Needs a signature) | ✗ Not allowed | ✓ A neighbor who signs, with the customer’s OK | ✓ Allowed |
| **AGE** (Age-restricted) | ✗ Not allowed | ✗ Not allowed | ✓ The customer shows photo ID |

## Goal

Within three months of rollout, first-attempt success at not-home stops should rise from 45% to **65%**. At the same time, the share of those stops that lead to a claim for a missing parcel should stay at **0.5% or less**.

- **First-attempt success at not-home stops**: Now **45%**; Target **65%** within three months. First-attempt success is the share of not-home stops where the parcel reaches an allowed place on the first visit and does not go back to the depot.

_This is a concept project, so the starting numbers are simulated and no results have been measured yet._

## Finding the root causes

After analyzing the not-home stop with action mapping, I found seven barriers that keep drivers from four key actions: five that training can remove and two that need changes in operations.

**Action mapping**, Cathy Moore’s method for planning training, starts from the business goal and lists what people need to do to reach it. For each action, it names the barriers that keep people from doing it, and asks whether training can remove each one or the work itself should change.

**How I sorted the barriers.** Cathy Moore sorts barriers into four types: environment, knowledge, skill and motivation. Training can help with knowledge and skill. A barrier in the environment, such as stop notes that are hard to find, needs a change in the work, and so does a motivation barrier that comes from the scorecard, such as skipping the call to protect the stop rate.

7 barriers: 5 for training, 2 for operations.

### Follow the steps in order

_Motivation + knowledge_

Drivers need to follow the six steps of a not-home stop in order, including the call, before choosing where the parcel goes. Some skip the call to protect their stop rate, a number on the scorecard that tracks their work, and some are unsure of the order.

### Choose an allowed option

_Knowledge + environment_

Drivers need to choose a place that the handling code and the customer’s instructions allow. They are unsure what SIG and AGE parcels allow, and stop notes are hard to find.

### Agree on an option by phone

_Skill_

Drivers need to call the customer and agree on an allowed option within two minutes. Some agree to requests the rules do not allow, and their calls drift away from the point.

### Leave the parcel in a safe place

_Skill + knowledge_

Drivers need to leave the parcel in a spot that meets four safe-place rules and take a photo that shows the house number. They misjudge whether a spot is hidden, and their photos miss the house number.

## Solution

I matched the seven barriers with a three-part solution: a short module and four job aids for drivers, and two changes in operations.

The module and the job aids take the five barriers that training can remove, and operations takes the other two. Based on the barriers, the solution has three parts:

### Not-Home Delivery Stop

_For drivers_

The module has seven slides, with one question per screen. Six of them practice the four actions, one opens the job aids, and a results screen shows the score and the slides to try again.

[A slide of the module, with its parts numbered](https://duongngochongson.vercel.app/assets/projects/ds-screen.webp)

### Four job aids

_For drivers_

The Sequence, Handling codes, Safe place and Call moves cards hold the steps, what each code allows, the safe-place rules and the call moves. Drivers open them on slide 2 and can open them again from a Job aids button on slides 3 to 7.

[The Sequence card, a job aid](https://duongngochongson.vercel.app/assets/projects/ds-job-aid.webp)

### Two changes in operations

_For operations_

The screen drivers see when they arrive at a stop shows the handling code and the stop notes. The scorecard counts handovers to a neighbor or a pickup point as first-attempt successes, so calling the customer does not count against a driver.

## Module: Not-Home Delivery Stop

The module practices the four high-priority actions from the action map in seven short slides on a phone.

Slide 2 opens the job aids, and each of the other six slides practices one or two of the four actions, with the job aid that holds what drivers need:

- Follow the steps in order: slide 1, with the Sequence card
- Choose an allowed option: slides 3 and 7, with the Handling codes card
- Agree on an option by phone: slides 4 and 5, with the Call moves card
- Leave the parcel in a safe place: slides 6 and 7, with the Safe place card

The last slide is a **branching scenario** with two stops, in which each choice changes what happens next. It checks the expected outcome: the driver chooses an allowed option, carries it out and completes the proof of delivery without breaking a rule. A driver passes with **80/100** and no broken rule on that slide, and Try again reopens the slides that lost points.

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

The style guide has three principles. **Readable on the street**: text is at least 16px, body text reaches 7:1 contrast, and every control is at least 44 × 44px. **One thing per screen**: each screen asks one question and has one main button. **Meaning never by color alone**: every state shows an icon and a word as well as a color.

Each slide has three zones: a top bar with the progress and the job aids, a task zone with one question, and an action bar pinned to the bottom.

- [Screen anatomy: the three zones of a slide, on a phone 360px wide.](https://duongngochongson.vercel.app/work/not-home-delivery-stop/style-guide/screen-anatomy.webp)
- [Branching map: the two stops on slide 7 and where each choice leads.](https://duongngochongson.vercel.app/assets/projects/ds-branching.webp)

## Development

I built the module as a web app that also runs in a learning management system (LMS).

React draws the screens, XState runs the logic of each slide, and Zod checks the content files, where the slides, the job aids and the action map are written.

Each change to the main branch on GitHub builds a new **SCORM 1.2 package** automatically. SCORM is a standard format that lets an LMS run the module and save each driver’s progress and best score.

The voices on slide 4 are synthetic speech, with captions timed to the audio. On slide 5, an artificial intelligence model plays Mr. Hayes, a customer, and a second model checks the call against the three call moves. The slide has no points, because a model’s feedback can vary, and if the service fails, it switches to a self-check.

## Results and takeaways

The module has not met real drivers yet, so here is what I learned from designing and building it.

- I liked how the action map kept the module small: four actions, seven short slides, and two barriers handed to operations.
- I built a SCORM package for the first time and saw how an LMS saves each learner’s progress and score.
- I put the handling codes on a card once I saw how much drivers would otherwise have to remember.

## Documents and credits

[Try the module](https://delivery-scenario.vercel.app/) · [Diagrams](https://duongngochongson.vercel.app/work/not-home-delivery-stop/Diagrams.html) · [Style guide](https://duongngochongson.vercel.app/work/not-home-delivery-stop/Style%20Guide.html)

[All projects](https://duongngochongson.vercel.app/#portfolio)

## Credits

Thank you to the people who made these open-source fonts, icons, voices and libraries free to use.

- **Fonts**: [Barlow Semi Condensed](https://github.com/jpt/barlow) by Jeremy Tribby · OFL 1.1; [Atkinson Hyperlegible Next](https://github.com/googlefonts/atkinson-hyperlegible-next) by Braille Institute of America · OFL 1.1
- **Icons**: [Lucide](https://lucide.dev) by the Lucide contributors · ISC
- **Voices**: [Piper voice en_US-libritts_r-medium](https://huggingface.co/rhasspy/piper-voices) by the Piper project · CC BY 4.0
- **Libraries**: [React](https://react.dev) by Meta · MIT; [XState](https://github.com/statelyai/xstate) by David Khourshid · MIT; [Zod](https://zod.dev) by Colin McDonnell · MIT

Speech generated with a Piper voice trained on LibriTTS-R: Y. Koizumi et al., “LibriTTS-R: A Restored Multi-Speaker Text-to-Speech Corpus”, Interspeech 2023 ([openslr.org/141](https://www.openslr.org/141/)), which restores LibriTTS (H. Zen et al., 2019), built from public-domain LibriVox recordings. Licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The sentences were synthesized, then trimmed, leveled and encoded to MP3.

---

<sub>This README is written from the project page on my portfolio, https://duongngochongson.vercel.app/#portfolio/delivery-scenario, and is updated when that page changes. To run, build and test the code, see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).</sub>
