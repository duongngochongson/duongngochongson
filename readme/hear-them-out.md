# Why Members Are Unhappy

_Concept project_

Discover Hear Them Out, a **scenario-based course** that trains front-desk staff at Cozy, a coworking business, in what a **root-cause analysis** showed they needed: handling a complaint call and following it through. With signs, a Wi-Fi checklist and a better issue log, it helps Cozy solve members’ problems effectively and win back their satisfaction.

This repository holds the code of Hear Them Out, the course this project led to.

[Try the course](https://hear-them-out.vercel.app/) · [Read the case study](https://duongngochongson.vercel.app/work/why-members-are-unhappy/Case%20Study.dc.html) · [The project page](https://duongngochongson.vercel.app/#portfolio/why-members-are-unhappy)

**Audience**

- Front-desk staff at Cozy, a coworking business
- They have 20 to 30 minutes for learning in quiet periods of a shift, on a computer or a phone
- Goal: raise member satisfaction from 3.2/5 to 4.0/5 within two quarters

**Responsibilities**

- Needs analysis
- Action mapping
- Branching scenarios
- Storyboarding
- Job aids
- Visual design
- Vibe-coded e-learning

**Tools**

- Claude (analysis, design document and storyboard)
- Claude Design (brand, mockups and prototype)
- Claude Code (web app development)
- Gemini (Sofia’s voice and the practice call)
- Google Workspace (notes, asset and license tracking)
- Vercel (hosting)

## Problem

Cozy’s members were growing less satisfied, and they gave the way Cozy handles complaints the lowest score of all.

Cozy is a coworking business with three spaces, where freelancers, remote workers and small teams rent desks and rooms on monthly plans. Front-desk staff welcome members and handle their complaints. Cozy’s quarterly member survey, with scores from 1 to 5, showed satisfaction falling over one year.

The gap was in what happened after members raised a problem: **many complaints had no written next step**, and some members waited weeks for a reply. Members named three problems in their survey comments, and the issue log, where staff record complaints, showed a fourth. Left unsolved, these four problems **pulled satisfaction down**:

- Noise and phone calls in Focus, the silent zone
- The shared kitchen and fridge
- Wi-Fi outages
- Complaint handling

> “We’ll look into it.”
>
> How complaint calls often ended, with no option for the member and no date

## Goal

Within two quarters, overall member satisfaction should rise from 3.2/5 to **4.0/5**, and the score for how Cozy handles complaints from 2.7/5 to **3.8/5**. Because the survey runs once a quarter, I added a measure that managers can check each week in the issue log: **9 in 10 complaints** have a next step with a follow-up date, and the member hears back by that date.

- **Overall member satisfaction**: Now **3.2/5**; **3.5/5** after the first quarter; Target **4.0/5**. Measured by Cozy’s quarterly member survey, where members score from 1 (very dissatisfied) to 5 (very satisfied).

_This is a concept project, so the starting numbers are simulated and no results have been measured yet._

## Finding the root causes

After analyzing the four problems with the Behavior Engineering Model, I found three root causes: no follow-up process or call practice for complaints, space rules that members could not see, and no set steps for Wi-Fi outages.

The evidence came from survey comments, the issue log, the outage log, interviews with staff on each shift and a visit to one of the spaces, all simulated from public research.

**How I sorted the causes.** I used the **Six Boxes**, Carl Binder’s version of Thomas Gilbert’s Behavior Engineering Model. It lists six things that shape what people do at work, three in the environment and three in the person. I checked the environment first, because changing it usually costs less than training. For each cause, I also asked Robert Mager and Peter Pipe’s question: could people do the task if they had to? If they could, a course would not solve it.

- Environment: Information, Tools, Incentives
- Person: Knowledge, Capacity, Motives

### Complaint handling

_Environment + knowledge_

The issue log asked for no follow-up date and no owner, the person responsible for the case, and open cases passed between shifts by word of mouth. Asked what they would say to an upset member, staff explained the rules first, apologized in general terms and said they would look into it. Staff could write a date if the log asked for one, but calming an upset member and agreeing on a solution take practice.

### Noise and the kitchen

_Information_

Members were unsure which zone they were in, what its rules were and when the fridge was cleared. Focus and Flex, the zone for desk work, calls and meetings, looked the same, and the rules sat in the handbook that members get when they join. Members could follow the rules if they had to, so they need to see them where they work.

### Wi-Fi outages

_Information + tools_

Each shift handled an outage in its own order, most waited to learn the cause before telling members, and each shift decided compensation on its own. Staff also switched to the backup line by hand. Staff could do each step, but outages are rare and stressful, so steps got done in the wrong order.

## Solution

I matched each root cause with a solution: Hear Them Out and changes to the issue log for complaints, signs and a short guide for the space rules, and a checklist for Wi-Fi outages.

The complaint cause needed a change to the log and practice for staff, which a course can give. The other two causes needed information and tools, which work sooner and **cost less than a course**. Based on the root causes, the solution has three parts:

### Hear Them Out and log changes

_For front-desk staff and managers_

**Hear Them Out**, a branching scenario, teaches front-desk staff to handle a complaint call and to follow the case through in the log. Cozy’s managers make the follow-up date and the owner required in the log, add a reminder on that date and a check of open cases at each shift change, and confirm which options staff may offer.

[The log card, a job aid from the course](https://duongngochongson.vercel.app/assets/projects/wmu-log-card.webp)

### Signs and Cozy in 60 seconds

_For members_

A sign marks where Focus starts, colored tape marks the edges of each zone, and labels show how to use the fridge and the shelves. Cozy in 60 seconds is a guide of eight short screens in the Cozy app, which shows a new member the zones, where to take a call and how the kitchen works.

[The Focus sign, the zone bands and the kitchen labels](https://duongngochongson.vercel.app/assets/projects/wmu-signs.webp)

### Wi-Fi Down card

_For front-desk staff and operations_

The Wi-Fi Down card is a one-page checklist that staff follow step by step during an outage. It tells them to inform members within **10 minutes**, send an update every **15 minutes** and give everyone the same compensation. The head of operations makes the switch to the backup line automatic.

[The Wi-Fi Down card](https://duongngochongson.vercel.app/assets/projects/wmu-wifi-card.webp)

## Course: Hear Them Out

With action mapping, I chose five high-priority actions that resolve a complaint and keep it from coming back, and Hear Them Out practices all five in one call and its follow-up.

Each action gets a practice in the course and the minimum information it needs, which goes into three job aids: the HEARD card, the Options card and the log card. The five actions are:

- Hear and empathize: let the member finish, and show you understand how they feel and what they need.
- Apologize: say sorry for what Cozy got wrong, and keep names private.
- Resolve: agree on one next step with a follow-up date.
- Log and hand over: log the case with an owner and a day for each promise, and pass open cases to the next shift.
- Follow up: call the member back on that date, and close the case when they say it worked.

The call follows **HEARD**, a five-step way of handling complaints taught by the Disney Institute, with one decision for each step, and Part 2 practices logging the case and calling the member back. Sofia, a member, calls because another member took a half-hour phone call next to her in Focus, two weeks after she first reported calls there. Son, a guide character, describes her mood after each reply, because on the phone the learner cannot see her face.

The course starts with the call and leaves the rules for later, following **Merrill’s first principles of instruction**: learning starts from a real problem. The expected outcome is that the learner can **handle the call with HEARD, keep a note of it and log the case** in Cozy Desk from that note.

### Action map

[Action map: the goal, the five actions, and the practice and minimum information for each.](https://duongngochongson.vercel.app/assets/projects/wmu-action-map.webp)

### Jane, the persona

A made-up but typical learner, based on the shift interviews and the issue log.

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

### Two parts of the course

- **Part 1, the call.** Five decisions, one for each step of HEARD
- If a decision went wrong:
  1. A week later, Sofia scores Cozy in the member survey
  2. A debrief marks each decision, and the learner rewinds to the first one that went wrong, keeping the right choices
  - If the learner hangs up on Sofia twice during the call, she scores Cozy 1/5, there is no debrief, and the call starts again.
- If all five went right:
  1. **Part 2.** The learner logs the case from the note in Cozy Desk, a practice copy of the front-desk software
  2. The course moves ahead: the case is handed over at shift change, the learner talks to the other member and calls Sofia back on the promised day
  3. Sofia scores Cozy **5/5**
- **Practice.** A new call, a private talk with the other member and a log entry to write

### Screens from the course

- [The call, at one of its five decisions](https://duongngochongson.vercel.app/assets/projects/wmu-call.webp)
- [Part 2, logging the case from the note](https://duongngochongson.vercel.app/assets/projects/wmu-log.webp)
- [The debrief after a call that went wrong](https://duongngochongson.vercel.app/assets/projects/wmu-debrief.webp)

## Storyboard and visual design

I wrote the lines and screens in a text-based storyboard first, then designed the look of the course and the Cozy brand.

The **text-based storyboard** holds the call with its five decisions, each reply and ending, the debrief, Part 2 and the practices.

Before building, I made **mockups of the 16 screens** at computer and phone sizes and a clickable prototype of the main path, with the Cozy logo and icons. Between the mockups and the build, I cut the call from eight decisions to five, so that each decision practices one step of HEARD.

The course looks like **a desk at night**: each screen has the same dark ground, and text sits on light boxes, like paper under a lamp. Son’s lines sit in dark, dashed boxes, so his guidance looks different from what members say. Every result shows an icon and a word as well as a color, and every button is at least 44px.

[Storyboard: decision 1 of the call, with each option, Sofia’s reply and Son’s line.](https://duongngochongson.vercel.app/assets/projects/wmu-storyboard.webp)

- [Before: the call as first designed, with eight decisions and Sofia’s lines in dark bubbles.](https://duongngochongson.vercel.app/assets/projects/wmu-call-before.webp)
- [After: five decisions, one for each step of HEARD, and her lines on light paper.](https://duongngochongson.vercel.app/assets/projects/wmu-call.webp)

[Style guide: the colors of the dark ground and the paper, each with its contrast.](https://duongngochongson.vercel.app/assets/projects/wmu-style-guide.webp)

## Development

I built Hear Them Out as a web app, so it runs in a browser on a computer or a phone.

React draws the screens, XState runs the course’s logic, Zod checks the content and Motion runs the animations.

Sofia’s lines are synthetic speech, and every line is also on screen. After the course, **three practice activities** are waiting. In the practice call, an artificial intelligence model plays Omar, a member. The call, and a log entry the learner writes in another practice, get feedback on each point, without a score. If the service cannot be reached, the practice shows an example instead.

Progress is saved in the browser after each step, so a learner who is interrupted on a shift can come back to the same place.

## Results and takeaways

The course has not met real learners yet, so here is what I learned from designing and building it.

- I learned to look at the workplace before planning a course. Signs and a checklist solved two of the three causes, so the course could focus on the call.
- I wrote every line in the storyboard before I built anything. It felt slow at first, and it saved me a lot of time when I changed things late.
- I found that a wrong choice teaches more when the learner sees what it caused before anyone explains it.

## Documents and credits

[Try the course](https://hear-them-out.vercel.app/) · [Case study](https://duongngochongson.vercel.app/work/why-members-are-unhappy/Case%20Study.dc.html) · [Storyboard](https://duongngochongson.vercel.app/work/why-members-are-unhappy/Storyboard.dc.html) · [Design document](https://duongngochongson.vercel.app/work/why-members-are-unhappy/Design%20Document.dc.html) · [Style guide](https://duongngochongson.vercel.app/work/why-members-are-unhappy/Style%20Guide.dc.html) · [Diagrams](https://duongngochongson.vercel.app/work/why-members-are-unhappy/Diagrams.html) · [Job aids](https://duongngochongson.vercel.app/work/why-members-are-unhappy/Job%20Aids.dc.html) · [First-day guide](https://duongngochongson.vercel.app/work/why-members-are-unhappy/Cozy%20in%2060%20Seconds.dc.html)

[All projects](https://duongngochongson.vercel.app/#portfolio)

## Credits

Thank you to the people who made these open-source fonts, faces and libraries free to use.

- **Fonts**: [Archivo](https://github.com/Omnibus-Type/Archivo) by Omnibus-Type · OFL 1.1; [IBM Plex Sans and Mono](https://github.com/IBM/plex) by IBM · OFL 1.1
- **Faces**: [Open Peeps](https://www.openpeeps.com/) by Pablo Stanley · CC0; [DiceBear](https://www.dicebear.com/) by Florian Körner · MIT
- **Libraries**: [React](https://react.dev) by Meta · MIT; [Motion](https://motion.dev) by Motion B.V. · MIT; [XState](https://github.com/statelyai/xstate) by David Khourshid · MIT; [Zod](https://zod.dev) by Colin McDonnell · MIT

---

<sub>This README is written from the project page on my portfolio, https://duongngochongson.vercel.app/#portfolio/why-members-are-unhappy, and is updated when that page changes. To run, build and test the code, see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).</sub>
