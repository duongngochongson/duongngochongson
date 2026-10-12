# Not-Home Delivery Stop

This project started from a problem at a parcel company: at stops where nobody answers the door, fewer than half end with the parcel delivered on the first attempt. I mapped what drivers need to do at those stops and what keeps them from doing it, and chose a fix for each barrier. One of the fixes is Not-Home Delivery Stop, a short online course, or module, of seven slides that I designed and built for drivers. The parcel company and its numbers are fictional and were created for this portfolio.

This repository holds the code of the module.

[Try the module](https://delivery-scenario.vercel.app/) · [See the action map](https://duongngochongson.vercel.app/work/not-home-delivery-stop/Diagrams.html#action-map) · [The project page](https://duongngochongson.vercel.app/#portfolio/delivery-scenario)

## The problem

At stops where nobody answers the door, 45% end with the parcel delivered on the first attempt.

When nobody answers, the driver has to decide where the parcel goes. The choice depends on the handling code on the parcel’s label, the stop note with the customer’s delivery instructions, and what the customer says when the driver calls.

Where each handling code lets a parcel go:

| Code | Safe place at the house | Neighbor | Pickup point |
|---|---|---|---|
| **STD** (Standard parcel) | ✓ With a stop note or the customer’s OK | ✓ Allowed | ✓ Allowed |
| **SIG** (Needs a signature) | ✗ Not allowed | ✓ A neighbor who signs, with the customer’s OK | ✓ Allowed |
| **AGE** (Age-restricted) | ✗ Not allowed | ✗ Not allowed | ✓ The customer shows photo ID |

These stops are called not-home stops. A parcel that goes back to the depot needs another delivery trip, and a parcel left where the rules do not allow can go missing and lead to a claim from the customer.

## The goal

Within three months of rollout, first-attempt success at not-home stops should rise from 45% to 65%.

At the same time, the share of those stops that lead to a claim for a missing parcel should stay at **0.5%** or less. Inside the module, a driver passes with **80/100** if no stop on the last slide ends with a broken rule.

- **First-attempt success at not-home stops**: Now **45%**, target **65%** within three months

<!-- -->

- **0.5% or less**: not-home stops that lead to a claim for a missing parcel
- **80/100**: the score to pass the module, with no rule broken on the last slide

_The parcel company is fictional, so these numbers are targets, not measured results._

## Finding the causes

The action map found four actions and seven barriers. Training can remove five of the barriers, and two need changes in operations.

I used action mapping, Cathy Moore’s method for planning training. An action map starts from the business goal and lists what people need to do to reach it. For each action, it names the barriers that keep people from doing it, and asks whether training can remove each one or the way the work is set up should change.

7 barriers: 5 for training, 2 for operations.

### Follow the steps in order

_Motivation + knowledge_

**What gets in the way.** Drivers need to follow the six steps of a not-home stop in order, including the call, before choosing where the parcel goes. Some skip the call to protect their stop rate, a number on the scorecard that tracks their work, and some are unsure of the order.

**The fix.** Slide 1 practices the order, and a job aid, the Sequence card, lists the steps. The scorecard also changes to count handovers to a neighbor or a pickup point as successes.

### Choose an allowed option

_Knowledge + environment_

**What gets in the way.** Drivers need to choose a place that the handling code and the customer’s instructions allow. They are unsure what SIG and AGE parcels allow, and stop notes are hard to find.

**The fix.** Slides 3 and 7 practice the rules, and the Handling codes card says what each code allows. The screen drivers see when they arrive at a stop also changes to show the code and the stop notes.

### Agree on an option by phone

_Skill_

**What gets in the way.** Drivers need to call the customer and agree on an allowed option within two minutes. Some agree to requests the rules do not allow, and their calls drift away from the point.

**The fix.** Slides 4 and 5 are practice calls, and the Call moves card lists the three things to do on a call: say who you are and what is happening, explain the allowed options, and confirm the plan and the proof of delivery.

### Leave the parcel in a safe place

_Skill + knowledge_

**What gets in the way.** Drivers need to leave the parcel in a spot that meets four safe-place rules and take a photo that shows the house number. They misjudge whether a spot is hidden, and their photos miss the house number.

**The fix.** Slide 6 and the first stop on slide 7 ask the driver to find the safe place, and the Safe place card lists the rules: hidden from the street, protected from rain, inside the property, and doors and paths clear.

Read more: [Full action map](https://duongngochongson.vercel.app/work/not-home-delivery-stop/Diagrams.html#action-map)

## The fixes

The module and four job aids take the five training barriers, and operations takes the other two.

Each fix goes to the people who can act on it: drivers practice in the module and keep the job aids at hand, and operations changes two things in the work itself.

### The module

_For drivers_

The module has seven slides, with one question per screen. Six of them practice the four actions, one opens the job aids, and a results screen shows the score and the slides to try again.

### Four job aids

_For drivers_

The Sequence, Handling codes, Safe place and Call moves cards hold the steps, what each code allows, the safe-place rules and the call moves. Drivers open them on slide 2 and can open them again from a Job aids button on slides 3 to 7.

### Two changes in operations

_For operations_

The screen drivers see when they arrive at a stop shows the handling code and the stop notes. The scorecard counts handovers to a neighbor or a pickup point as first-attempt successes, so calling the customer does not count against a driver.

## The module: Not-Home Delivery Stop

Seven short slides practice the four actions, one question at a time, on a phone between stops.

Drivers use the module outdoors, on a phone, between stops. So each screen asks one question and has one main button, the text is large with strong contrast, and every status, such as right or wrong, shows an icon and a word as well as a color.

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

- On slides 1 and 3, an item can be dragged, moved with buttons, tapped into place or moved with the keyboard. After the check, each item in the wrong place says where it belongs and what goes wrong there.
- Slide 4 is a call with Ms. Rivera, whose parcel needs a signature. It has recorded voices and captions, the sound plays when the driver presses Play, and two of the lines end the call early.
- On slide 5, the driver types the call to Mr. Hayes, a customer played by an AI, and a second AI checks the call against the three call moves. If the AI does not work, the slide switches to a self-check.
- Slide 7 is a branching scenario with two stops, in which each choice changes what happens next. The results screen then explains the rule behind each choice, and Try again reopens the slides that lost points.
- The module also comes as a SCORM 1.2 package, a standard format that lets a learning management system (LMS), the software companies use for staff training, run the module and save each driver’s progress and best score.

<!-- -->

- **Why one question per screen**: Drivers read on a phone, outdoors, between stops, so each screen holds one thing to decide.
- **Why four ways to move an item**: Some drivers cannot drag, so buttons, taps and the keyboard do the same job.
- **Why slide 5 has no points**: AI scoring can vary, so the typed call is practice and the scored slides use fixed answers.

Read more: [Full branching map](https://duongngochongson.vercel.app/work/not-home-delivery-stop/Diagrams.html#branching)

## How it was built

I built the module as a web app that also runs in an LMS.

React draws the screens, XState runs the logic of each slide, and Zod checks the content files, where the slides, the job aids and the action map are written. The voices on slide 4 are synthetic speech, with captions timed to the audio. The module is hosted on Vercel and is also built as a SCORM package.

Read more: [Full style guide](https://duongngochongson.vercel.app/work/not-home-delivery-stop/Style%20Guide.html)

## Credits

Thank you to the people who made these open-source fonts, icons, voices and libraries free to use.

- **Fonts**: [Barlow Semi Condensed](https://github.com/jpt/barlow) by Jeremy Tribby · OFL 1.1; [Atkinson Hyperlegible Next](https://github.com/googlefonts/atkinson-hyperlegible-next) by Braille Institute of America · OFL 1.1
- **Icons**: [Lucide](https://lucide.dev) by the Lucide contributors · ISC
- **Voices**: [Piper voice en_US-libritts_r-medium](https://huggingface.co/rhasspy/piper-voices) by the Piper project · CC BY 4.0
- **Libraries**: [React](https://react.dev) by Meta · MIT; [XState](https://github.com/statelyai/xstate) by Stately · MIT; [Zod](https://zod.dev) by Colin McDonnell · MIT

Speech generated with a Piper voice trained on LibriTTS-R: Y. Koizumi et al., “LibriTTS-R: A Restored Multi-Speaker Text-to-Speech Corpus”, Interspeech 2023 ([openslr.org/141](https://www.openslr.org/141/)), which restores LibriTTS (H. Zen et al., 2019), built from public-domain LibriVox recordings. Licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The sentences were synthesized, then trimmed, leveled and encoded to MP3.

---

<sub>This README is written from the project page on my portfolio, https://duongngochongson.vercel.app/#portfolio/delivery-scenario, and is updated when that page changes. To run, build and test the code, see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).</sub>
