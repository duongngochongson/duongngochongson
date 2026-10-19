# Why Members Are Unhappy

_Concept project_

Discover Hear Them Out, a **scenario-based course** that trains front-desk staff at Cozy, a coworking business, in what a **root-cause analysis** showed they needed: handling a complaint call, then following up with a clear process so no complaint gets missed. Besides the course, other support tools help Cozy solve members’ problems and win back their satisfaction: signs and a first-day guide (to show members the space rules), a Wi-Fi checklist (to handle every outage the same way) and an updated issue log (to give every case a next step, an owner and a date).

This repository holds the code of Hear Them Out, the course this project led to.

[Try the course](https://hear-them-out.vercel.app/) · [View the slides](https://duongngochongson.vercel.app/work/why-members-are-unhappy/Why%20Members%20Are%20Unhappy%20Slides.pdf) · [The project page](https://duongngochongson.vercel.app/#portfolio/why-members-are-unhappy)

**Audience**

- Front-desk staff at Cozy, a coworking business
- 20 to 30 minutes for learning in quiet periods, on a computer or a phone
- Cozy’s members, for the signs and the first-day guide

**Responsibilities**

- Needs analysis
- Action mapping
- Branching scenarios
- Storyboarding
- Job aids
- Visual design
- Vibe-coded e-learning

**Tools**

- GitHub (code and version control)
- Web languages (JavaScript, JSX, HTML, CSS)
- Claude (Claude, Claude Code, Claude Design)
- Gemini (voice and practice call)

## Problem

Cozy’s members were growing less satisfied, and they gave the way Cozy handles complaints the lowest score of all.

They felt **unheard** and, at times, even **treated unfairly**. Many of their complaints were **never followed up on or resolved**. **Four problems** came up the most:

- Noise and phone calls in Focus, the silent zone
- The shared kitchen and fridge
- Wi-Fi outages
- Complaint handling

> “We’ll look into it.”
>
> A typical vague reply members heard whenever they called to complain

## Goal

Given this, Cozy’s board set a goal to raise member satisfaction, especially the complaint score.

Specifically, within two quarters, overall satisfaction should rise from 3.2/5 to **4.0/5**, and the complaint score from 2.7/5 to **3.8/5**. Each week, managers check that **9 in 10 complaints** have a dated next step.

- **Overall member satisfaction**: Now **3.2/5**; **3.5/5** after the first quarter; Target **4.0/5**. Measured by Cozy’s quarterly member survey, from 1 (very dissatisfied) to 5 (very satisfied).

## Finding the root causes

With the Behavior Engineering Model (BEM), I found three root causes:

- No follow-up process or call practice for complaints
- Space rules members could not see
- No set steps for Wi-Fi outages

**How I sorted the causes.** I sorted each cause into the BEM’s **six cells**. For each cause, I asked **Mager and Pipe’s question**: could people do it if they had to? If so, the fix is in the work around them. If not, **practice** helps.

- Environment: Information, Tools, Incentives
- Person: Knowledge, Capacity, Motives

### No follow-up process or call practice for complaints

_Information + tools + knowledge_

The log asked for **no follow-up date or owner**, and open cases passed between shifts **by word of mouth**. On calls, staff **explained the rules first**. Calming an upset member **takes practice**.

### Space rules members could not see

_Information_

Focus and Flex, the zone for calls, **looked the same**, and the rules **sat in the handbook**. Members could follow the rules, so they need to **see them where they work**.

### No set steps for Wi-Fi outages

_Information + tools_

Each shift handled an outage **in its own order**, and most **waited for the cause** before telling members. Staff could do each step, but outages are **rare and stressful**.

## Solution

I matched each root cause with a solution:

### A follow-up process and call practice for complaints

_For front-desk staff and managers_

**Hear Them Out** trains staff to **handle a complaint call**. Managers make **the follow-up date and the owner required** in the log, with a reminder and **a check at each shift change**.

- [The call with Sofia in Hear Them Out, at its first decision](https://duongngochongson.vercel.app/assets/projects/wmu-call.webp)
- [The log card, a job aid from the course](https://duongngochongson.vercel.app/assets/projects/wmu-log-card.webp)

### Space rules members can see

_For members_

**A sign, zone tape and kitchen labels**, and **Cozy in 60 seconds**, eight short screens that show a new member the same rules.

[The Focus sign, the zone bands and the kitchen labels](https://duongngochongson.vercel.app/assets/projects/wmu-signs.webp)

### Set steps for Wi-Fi outages

_For front-desk staff and operations_

A one-page checklist: tell members within **10 minutes**, send an update every **15 minutes** and give everyone **the same compensation**. The backup line also **switches on by itself**.

[The Wi-Fi Down card](https://duongngochongson.vercel.app/assets/projects/wmu-wifi-card.webp)

## Course: Hear Them Out

With action mapping, I chose five actions that resolve a complaint, and Hear Them Out practices all five in one call and its follow-up.

Sofia, a member, calls because another member took **a half-hour call next to her in Focus**, two weeks after she reported calls there. The call follows **HEARD**, a five-step way of handling complaints, with **one decision for each step**. Son, a guide, describes **her mood after each reply**, because on the phone the learner cannot see her face.

Following **Merrill’s first principles** and **Knowles’s andragogy**, the course starts with a call from the job and leaves the rules for later.

### Action map

[The action map of Hear Them Out, from the goal to the five actions.](https://duongngochongson.vercel.app/assets/projects/wmu-action-map.webp)

### Jane, the persona

Based on the shift interviews and the issue log.

- Three years at Cozy, and knows most members by name
- Studies in the quiet hour after lunch and is often interrupted
- Uses the front-desk computer or her phone

**So the course:**

- Each part takes 15 minutes or less, about 20 minutes in all
- Progress is saved after every step
- It works on a computer and on a phone

### HEARD, one decision for each step

- **Hear**: Let her tell it, and let her finish
- **Empathize**: Name the feeling and say her need back
- **Apologize**: Say what Cozy got wrong, and keep names private
- **Resolve**: Agree on one next step, with an owner and a day
- **Diagnose**: Keep the case open until she says it worked

_HEARD is a service recovery technique taught by the [Disney Institute](https://www.landscapemanagement.net/?p=72027)._

### Two parts of the course

- **Part 1, the call.** Five decisions, one for each step of HEARD
- If a decision went wrong:
  1. A week later, Sofia scores Cozy in the survey
  2. A debrief marks each decision, and the learner rewinds to the first one that went wrong
  - If the learner hangs up on Sofia twice, the call starts again.
- If all five went right: The learner moves on to **Part 2**.
  1. The learner logs the case in Cozy Desk from the call note
  2. The course moves ahead to the call back on the promised day
  3. Sofia scores Cozy **5/5**
- After the course, the learner can **practice more** if they want, in three ways: a new call, a private talk and a log entry to write

### Screens from the course

- [The call, at one of its five decisions](https://duongngochongson.vercel.app/assets/projects/wmu-call.webp)
- [Part 2, logging the case from the note](https://duongngochongson.vercel.app/assets/projects/wmu-log.webp)
- [The debrief after a call that went wrong](https://duongngochongson.vercel.app/assets/projects/wmu-debrief.webp)

## Storyboard & visual design

I wrote the lines and screens in a text-based storyboard first, then designed the look of the course and the Cozy brand.

I began with **a mood board** of coworking spaces, phone call screens and front-desk software, since the course happens on **a phone** and **a desk computer**. I then set the look in **a style guide**: a dark ground, light paper boxes, an amber lamp color and **faces with a word for each mood**. Next, I made **mockups of the 16 screens** and **a clickable prototype** with **five decisions, one for each step of HEARD**, and refined them after the first round.

[Storyboard: decision 1 of the call, with each option, Sofia’s reply and Son’s line.](https://duongngochongson.vercel.app/assets/projects/wmu-storyboard.webp)

- [Before: Sofia’s lines in dark bubbles.](https://duongngochongson.vercel.app/assets/projects/wmu-call-before.webp)
- [After: her lines on light paper.](https://duongngochongson.vercel.app/assets/projects/wmu-call.webp)

[Style guide: the colors, each with its value and role, and some of the icons.](https://duongngochongson.vercel.app/assets/projects/wmu-style-guide.webp)

## Development

I built Hear Them Out as a web app, so it runs in a browser on a computer or a phone.

React draws the screens, XState runs the course’s logic, Zod checks the content and Motion runs the animations. Sofia’s lines are **synthetic speech**, also shown on screen, and in a **practice call** after the course, an AI model plays Omar, a member. **Browser tests** run through the course on a desktop, a laptop and a phone, to make sure it works smoothly on each.

## Results & takeaways

I had put a lot of time and effort into this project, and it taught me many lessons.

- **Plan slow, build fast.** Planning every line and screen before building felt slow at first, but it saved a lot of time later, when I had to change things.
- **Plan for the unplanned.** However carefully I planned, small issues still came up that I only found after building the prototype, so I now leave buffer time to fix them.
- **Go beyond drag and drop.** Artificial intelligence is a great assistant. With it, I could build a voiced phone call and an open practice call, things that traditional drag-and-drop authoring tools make hard.

## Documents & credits

[Try the course](https://hear-them-out.vercel.app/) · [Slides (PDF)](https://duongngochongson.vercel.app/work/why-members-are-unhappy/Why%20Members%20Are%20Unhappy%20Slides.pdf) · [Case study](https://duongngochongson.vercel.app/work/why-members-are-unhappy/Case%20Study.dc.html) · [Storyboard](https://duongngochongson.vercel.app/work/why-members-are-unhappy/Storyboard.dc.html) · [Design document](https://duongngochongson.vercel.app/work/why-members-are-unhappy/Design%20Document.dc.html) · [Style guide](https://duongngochongson.vercel.app/work/why-members-are-unhappy/Style%20Guide.dc.html) · [Diagrams](https://duongngochongson.vercel.app/work/why-members-are-unhappy/Diagrams.html) · [Job aids](https://duongngochongson.vercel.app/work/why-members-are-unhappy/Job%20Aids.dc.html) · [First-day guide](https://duongngochongson.vercel.app/work/why-members-are-unhappy/Cozy%20in%2060%20Seconds.dc.html)

## Credits

Thank you to the people who made these open-source fonts, faces and libraries free to use.

- **Fonts**: [Archivo](https://github.com/Omnibus-Type/Archivo) by Omnibus-Type · OFL 1.1; [IBM Plex Sans and Mono](https://github.com/IBM/plex) by IBM · OFL 1.1
- **Faces**: [Open Peeps](https://www.openpeeps.com/) by Pablo Stanley · CC0; [DiceBear](https://www.dicebear.com/) by Florian Körner · MIT
- **Libraries**: [React](https://react.dev) by Meta · MIT; [Motion](https://motion.dev) by Motion B.V. · MIT; [XState](https://github.com/statelyai/xstate) by David Khourshid · MIT; [Zod](https://zod.dev) by Colin McDonnell · MIT

---

<sub>This README is written from the project page on my portfolio, https://duongngochongson.vercel.app/#portfolio/why-members-are-unhappy, and is updated when that page changes. To run, build and test the code, see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).</sub>
