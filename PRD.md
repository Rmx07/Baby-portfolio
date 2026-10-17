PRODUCT REQUIREMENTS DOCUMENT (PRD)

Pip — The Skull Baby

Hackathon: Baby's First Website — Meet the Baby
Selected Track: Track 1 — Pip, The Skull Baby
Document Status: Product Requirements Specification
Project Status: Planned
Primary Objective: Build a polished, creative, interactive, and responsive character portfolio that satisfies the official hackathon requirements and aims to implement all applicable advanced features and optional side quests.

---

1. Product Vision

Create an immersive portfolio website that introduces Pip, a gentle skull baby and Junior Dream Engineer at Midnight Nursery.

The website should feel like entering Pip's personal dream world rather than viewing a conventional portfolio. It must communicate Pip's personality, showcase Pip's creative projects, and tell Pip's origin story through an engaging visual and interactive experience.

The product should combine character-driven storytelling, playful interactions, a distinctive visual identity, and reliable responsive behavior.

The primary goal is to deliver a memorable and complete website that performs strongly against the hackathon's judging criteria.

2. Problem Statement

Build a creative, cute, and immersive portfolio website for a character that clearly communicates:

1. Who the character is: appearance, personality, quirks, and voice.
2. What the character does: at least three showcase projects.
3. The character's story: an origin story presented through an interactive scrolling experience or scenes.

The website must also satisfy the official requirements for responsive design, interactivity, and a hidden Easter egg.

3. Target Audience

The primary audience consists of:

- Hackathon judges evaluating the submission.
- Visitors discovering Pip's character and creative work.
- Users exploring an interactive character portfolio.
- Visitors using desktop computers, tablets, and mobile phones.

The experience should be understandable without prior knowledge of Pip.

4. Character Requirements

4.1 Identity

- Name: Pip
- Character Type: Skull Baby
- Role: Junior Dream Engineer at Midnight Nursery
- Personality: Gentle, sleepy, friendly, imaginative, and comforting.

Pip creates dreams, lullabies, nightlights, and bedtime stories.

4.2 Appearance

Pip's appearance must remain consistent with the official character description:

- Rounded skull-shaped face.
- Soft, oversized eye sockets.
- Warm amber pinprick eyes.
- Tiny, slightly crooked smile.
- Bedtime nightcap decorated with stars.
- Pink bow.

The character must always feel cute, cozy, and friendly—not scary, gory, or disturbing.

4.3 Personality and Voice

The website's writing, character reactions, and interactions should consistently express Pip's gentle and imaginative personality.

Pip may have playful quirks associated with sleepiness, dream creation, bedtime stories, and dream delivery, provided these remain consistent with the official character identity.

4.4 Official Assets

Use the official character assets provided in the hackathon brief where appropriate:

- Avatar: https://hax.baby/baby/assets/pip_avatar_cloud.png
- Lullaby box: https://hax.baby/baby/assets/pip_lullaby_box.png
- Dream lantern: https://hax.baby/baby/assets/pip_dream_lantern.png
- Asset pack: https://hax.baby/baby/assets/track1-pip-asset-pack.zip

The supplied assets should be inspected before creating replacement character illustrations. Supporting artwork must preserve the same visual identity.

---

5. Core Product Requirements

5.1 Character Introduction

The website must introduce Pip clearly and establish the character's identity immediately.

It must communicate:

- Pip's name and role.
- Pip's personality.
- Pip's dream-workshop world.
- A concise, engaging character introduction.

The introduction should invite visitors to explore the rest of the website.

5.2 Portfolio Showcase

The website must present at least three distinct creative projects.

Each project must include a title and a meaningful description explaining its purpose and connection to Pip's work.

Proposed project concepts:

1. Lullaby Lab: A creative collection of soothing lullabies and bedtime melodies.
2. Nightlight Collection: A collection of imaginary nightlights designed to make bedtime comforting.
3. Dream Delivery Routes: A fictional system for organizing and delivering dreams.

Additional projects may be included, but the minimum three-project requirement must remain satisfied.

These projects represent Pip's fictional portfolio and should not be presented as real commercial services.

5.3 Origin Story

The website must tell Pip's origin story through an engaging scrolling experience or a sequence of scenes.

The story should explain Pip's beginnings, connection to Midnight Nursery, and development into a Junior Dream Engineer.

Requirements:

- A clear beginning, progression, and conclusion.
- A strong connection to Pip's personality and work.
- Visually engaging story presentation.
- Each story scene must contain fewer than 150 words.
- The story must remain readable and accessible on mobile.

5.4 Interactive Experience

The website must contain at least one working interactive moment.

The interaction must produce a meaningful response to user input rather than serving as a purely decorative element.

The planned Tier 1, Tier 2, and Tier 3 interactions are specified in Sections 6–8.

5.5 Hidden Easter Egg

The website must include at least one hidden Easter egg.

It should be discoverable through an intentional user action or interaction and produce a visible or otherwise meaningful result.

The Easter egg must be functional, testable, and consistent with Pip's playful identity.

5.6 Responsive Experience

The website must adapt to desktop and mobile screen sizes.

Requirements:

- Readable text and clear content hierarchy.
- Usable navigation and interactive controls.
- Properly scaled images and illustrations.
- Project showcases that adapt to smaller screens.
- No unintended horizontal overflow.
- No essential interaction that depends exclusively on hover.
- Usable layouts in portrait orientation.

---

6. Tier 1 — Required Foundation

Tier 1 defines the baseline product experience.

The following requirements must be implemented and tested:

- Character introduction.
- Consistent character appearance and personality.
- At least three portfolio projects.
- Origin story presented through scrolling or scenes.
- Cursor eye tracking or hover reactions.
- Day/night toggle.
- Responsive mobile layout.
- At least one working interactive moment.
- Hidden Easter egg.
- Clear navigation and consistent visual identity.

6.1 Character Reactions

Implement cursor eye tracking or hover-based reactions, as specified in the brief.

Reactions must feel natural, preserve the character's appearance, and avoid interfering with navigation.

Touch-device users must still be able to use the website without relying on hover.

6.2 Day/Night Toggle

Provide a functioning control that switches between appropriate day and night appearances.

The change should be visually coherent across relevant backgrounds, text, and decorative elements.

The toggle must work on desktop and mobile and clearly communicate its state.

6.3 Tier 1 Acceptance Criteria

Tier 1 is complete only when:

- All required content is present.
- At least three projects are displayed.
- The origin story meets the scene word limit.
- Character reactions work.
- The day/night toggle works.
- The Easter egg can be triggered.
- The website remains usable on desktop and mobile.

---

7. Tier 2 — Advanced Interactive Features

After the Tier 1 foundation is complete, attempt all applicable Tier 2 features listed in the official brief.

7.1 Web Audio API Lullaby or Music Box

Create an interactive lullaby or music-box experience.

Requirements:

- Audio starts through an appropriate user action.
- Playback can be controlled.
- Audio can be stopped or muted where applicable.
- Playback errors are handled gracefully.
- Audio does not interfere with essential website functionality.

7.2 Flashlight Cursor Effect

Create a flashlight-style visual effect that responds to pointer movement.

The effect must enhance the experience without obscuring text or blocking controls. It should degrade gracefully on touch devices.

7.3 Animated Dream-Delivery Route

Create an animated SVG route representing Pip delivering dreams.

The animation should progress with scrolling or another meaningful interaction and support the character's storytelling.

It must remain responsive and visually understandable.

7.4 Interactive Flipbook

Create a flipbook with interactive page navigation.

The flipbook should reveal a short story or related content, with controls that remain usable on mobile.

7.5 Mini-Game

Create a small, functional mini-game connected to Pip's dream world.

The objective and controls must be understandable, and the game must not obstruct access to the core portfolio.

7.6 Tier 2 Acceptance Criteria

Each attempted feature must have functioning interactions, usable controls, and appropriate responsive behavior. Existing Tier 1 features must continue working after the additions.

---

8. Tier 3 — Advanced Product Features

The project aims to reach Tier 3 by attempting every applicable advanced option in the official brief.

8.1 Three.js 3D Character

Attempt a 3D representation of Pip using Three.js.

The character should preserve Pip's recognizable appearance. The experience must load reliably, remain usable on mobile, and provide a graceful fallback if 3D rendering is unavailable.

8.2 Live Guestbook

Attempt a guestbook that allows visitors to submit messages.

Requirements:

- Clear message submission interface.
- Input validation.
- Safe handling of user-generated content.
- Appropriate persistence if a backend is available.
- Honest communication when saving is unavailable.
- No claim of permanent storage unless it is supported.

8.3 Visitor Memory

Attempt a visitor-memory experience that creates a sense of continuity for returning visitors.

Collect and store only the minimum information necessary. Avoid sensitive personal information, and communicate limitations honestly.

8.4 Character AI Chat

Attempt a character chatbot that responds in Pip's personality and voice.

Requirements:

- Responses consistent with Pip's character.
- Clear and usable chat interface.
- Graceful handling of unavailable services and errors.
- Secure handling of API credentials.
- No API keys exposed in publicly accessible frontend code.
- No misleading claims that a static scripted interaction is a live AI service.

8.5 Lighthouse Performance

Aim for a Lighthouse performance score of 90 or higher.

The score must be measured through an actual audit. Performance work should consider image optimization, asset loading, JavaScript usage, and expensive animations.

8.6 Tier 3 Acceptance Criteria

A Tier 3 feature is considered complete only when its intended behavior has been implemented and tested. The website must remain usable, and core features must continue working.

---

9. Optional Side Quests

All applicable optional side quests listed in the supplied brief must be attempted after the core experience is stable.

The point values below are based on the supplied brief and must be verified against the official rules before submission.

9.1 Live Guestbook — +2 Points

Attempt the guestbook side quest. If the same implementation satisfies the Tier 3 guestbook requirement, use that implementation rather than creating unnecessary duplicates.

9.2 Sparkle Cursor Trail — +2 Points

Attempt a sparkle trail that follows pointer movement.

It must not block clicks, overwhelm the design, or create excessive rendering work.

9.3 Hit Counter — +1 Point

Attempt a functioning hit counter. If a shared or persistent count is required, use an appropriate mechanism and do not misrepresent a local-only counter as a global count.

9.4 Click Sounds with Mute Toggle — +3 Points

Attempt click sounds for appropriate interactions.

Provide a clear mute toggle, avoid disruptive audio, and ensure all controls remain functional when sound is disabled.

9.5 Responsive Chaos Mode — +5 Points

Attempt the responsive chaos mode described in the official brief.

Its exact behavior and eligibility must be checked against the official rules. The mode must remain usable, reversible where appropriate, and must not permanently damage the layout or prevent access to required content.

9.6 Side Quest Acceptance Criteria

Each implemented side quest must work as intended, remain usable on supported screen sizes, and comply with the official rules.

No optional feature should be marked complete solely because its visual representation exists.

---

10. Visual Design Requirements

10.1 Art Direction

The website should express a cozy, dreamy, playful, and whimsical world built around Pip.

It should feel intentionally designed for the character rather than like a generic portfolio template.

10.2 Color and Typography

Use a cohesive palette inspired by the official assets. Suitable design directions include warm cream, soft pink, muted berry, deep brown, night-sky tones, and amber accents.

Typography should be expressive but readable. Decorative fonts may be used selectively, while body text must remain comfortable to read.

10.3 Layout and Composition

- Establish a clear visual hierarchy.
- Use consistent spacing and alignment.
- Give the character and projects sufficient prominence.
- Keep navigation understandable.
- Avoid overcrowding the page.
- Make the story easy to follow.
- Ensure all essential content remains accessible on mobile.

10.4 Motion and Visual Effects

Animations should support the character, story, and interactions.

Avoid unnecessary motion, obstructive effects, excessive visual clutter, and effects that compromise readability or usability.

Respect reduced-motion preferences where practical.

---

11. Accessibility and Usability Requirements

The website should follow reasonable accessibility practices.

- Readable text and sufficient contrast.
- Meaningful alternative text for important images.
- Accessible labels for controls.
- Keyboard access for interactive elements where practical.
- Visible focus indicators.
- Audio controls and a mute option where audio is present.
- No reliance on color alone to communicate state.
- Reduced-motion support where practical.
- Functional controls on mobile and touch devices.

Accessibility must be considered throughout the experience rather than only during final polish.

---

12. Security and Privacy Requirements

The website and its interactive features must protect visitor information and project credentials.

- Do not expose API keys, passwords, tokens, or private credentials.
- Do not collect unnecessary personal information.
- Validate user-generated content.
- Render visitor messages safely.
- Use secure backend handling for external services when required.
- Do not claim that visitor information is saved permanently unless the implementation supports it.
- Ensure that optional features failing does not break the core website.

These requirements apply especially to the AI chatbot, guestbook, and visitor-memory features.

---

13. Product Acceptance and Quality Criteria

The website must be evaluated against the following outcomes.

Core Acceptance

- Pip is introduced clearly and consistently.
- At least three distinct projects are showcased.
- The origin story is complete and follows the scene word limit.
- Required interactive moments work.
- Cursor reactions and the day/night toggle work.
- The hidden Easter egg is functional.
- Desktop and mobile layouts are usable.

Advanced Acceptance

- Applicable Tier 2 features have been attempted.
- Applicable Tier 3 features have been attempted.
- Optional side quests have been attempted.
- Completed features have been tested.
- Errors and unavailable services are handled gracefully.
- Existing features remain functional after upgrades.
- Performance has been measured.

Final Quality

- The visual identity is consistent.
- The experience feels creative and memorable.
- Navigation and interactions work.
- No major layout defects remain.
- Accessibility and security have been reviewed.
- The website demonstrates the real behavior of its features.

---

14. Scope Priorities

The order of priority is:

1. Satisfy all mandatory requirements in the official problem statement.
2. Complete and stabilize Tier 1.
3. Attempt all applicable Tier 2 features.
4. Attempt all applicable Tier 3 features.
5. Attempt all applicable optional side quests.
6. Test and polish the complete experience.

If time or technical constraints prevent a feature from being completed, preserve the working core website and record the feature's status honestly.

No unrelated feature should be introduced merely to increase complexity.

---

15. Official Rules Verification

Before final submission, verify the official rules for:

- Submission deadline and time zone.
- Repository visibility and required links.
- Whether a demo video is required.
- Video duration, format, and submission method.
- Exact optional side quest requirements and point values.
- Any restrictions concerning tools, AI-generated content, or implementation methods.

The official problem statement and rules take precedence if they differ from this document.

---

16. Definition of Product Success

The product is ready for submission when it satisfies the mandatory hackathon requirements, presents Pip through a coherent and memorable character experience, and has attempted every applicable advanced feature and optional side quest.

The final experience should be polished, functional, responsive, and reliable.

The project should maximize the official judging criteria through strong functionality, playful creativity, meaningful surprises, and clean execution.

Product Principle: Complete the required experience first, then extend it as far as possible without sacrificing quality or reliability.