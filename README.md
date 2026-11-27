# Misinformation Friction — phone app (CS 449/549, Group 6, PP2)

Plain HTML/CSS/JS (no framework, no build step). Runs in Android Chrome, served over HTTPS from GitHub Pages.

```
index.html   page skeleton (all text comes from STRINGS in app.js)
style.css    styles
app.js       STRINGS, screens, A/B/C share flows, vibration, event log, CSV export
posts.js     window.POST_SETS = {S1, S2, S3}  — real news stories, two headlines each
```

The ESP32 share card is **not** part of the app in this version.

## Run locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`. Vibration and wake lock only work on a real Android phone.

## Deploy (GitHub Pages)
1. Push these files to the `main` branch, repository root.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`.
3. Open `https://<user>.github.io/<repo>/` on the study phone in Chrome.

## Conditions
| | After tapping Share | Vibration |
|---|---|---|
| A — standard | Shared immediately (no confirm, no pause) | none |
| B — source notice + 3.5 Hz | Notice drops in from the top: "You haven't checked the source." + post preview, *View source* link, Cancel / Share anyway | pulsed at 3.5 Hz (default) |
| C — source notice + 5 Hz | Same notice as B | pulsed at 5 Hz (default) |

**If the participant already opened this post's source in this part (from the feed or from the notice), B and C share at once: no notice, no vibration.** The check is per post: opening the accurate version's source does not count for the misleading version. B and C use exactly the same notice and text; the vibration pulse rate is the only difference. `haptic()` in app.js returns immediately in A, so A can never vibrate. If vibration is switched off or unsupported, B and C do not vibrate (the setup screen warns, and each skipped vibration is logged).

### Vibration pulse rate (Hz)
A web page cannot change the motor's own frequency, but it can switch the motor on and off: "Hz" here means pulses per second, with a 50 % duty cycle — `on = off = round(1000 / (2 × Hz))` ms. 3.5 Hz → 143 ms on / 143 ms off; 5 Hz → 100 / 100.

Set on the setup screen (saved on the phone, frozen into each session when it starts):
- **B pulse rate** (default 3.5 Hz) and **C pulse rate** (default 5 Hz), 1–20 Hz in 0.5 steps.
- **Pulses when the notice opens** (default 1) and **pulses when shared** (default 2), 1–20, same for B and C. N pulses → pattern `[on, off, …, on]`.
- Test buttons play the B/C notice and share patterns with the current values.

## Content (`posts.js`)
Each **story** is a real news article (`url`) with two headlines: one accurate (`veracity: 'true'`) and one misleading. **Both versions appear in the same feed.** Currently 15 stories in 5 topics (Entertainment, Culture, General News, Science, Sports); each set has one story per topic, so **5 stories = 10 posts per part**. Three more stories will be added later (keep sets the same size).

- Post fields: `id` (`S1-<story>-T` / `-F`), `story`, `author`, `handle`, `text`, `veracity`, `topic`, `url`, `publisher`, `debrief`.
- Accounts are 6 fictional, neutral news accounts. Each posts both accurate and misleading headlines, and the two versions of a story come from different accounts.
- The setup screen warns if sets differ in size, a story lacks one of its versions, or a post has no url.

## Study flow
1. **Researcher setup** — participant number → plan preview, vibration on/off + support status + B/C pulse rate and pulse counts + test buttons, Start, exports, Clear data. An unfinished session (e.g. after a reload) can be resumed.
2. **Consent form** (Google Form, embedded) — every participant, right after Start. The screen shows the participant number. *I submitted the form — continue* needs two taps.
3. **Part intro** — neutral instruction (B and C have the same text).
4. **Feed** — 10 posts (seeded shuffle; the two versions of a story are never next to each other) in a timeline layout. *View source* opens the real article **in a new tab** (Android back button returns to the app); the time away is logged. The **repost icon** and **Share** both open the same flow (A: shared at once, B/C: notice). Reply / like / views icons are decorative. Shared posts lock; cancelled posts can be shared again. *Finish this feed* needs two taps.
5. **Questionnaire after the part** (Google Form, embedded) — after each of the 3 parts; the screen shows participant number and part number.
6. **Part end** — "Part X finished — please tell the researcher" → *Researcher: continue* (→ next part intro, or after part 3 → final questionnaire).
7. **Final questionnaire** (Google Form, embedded) — before the debrief, so the debrief cannot influence the answers.
8. **Debrief** — all misleading headlines, each with what the article actually says.
9. **End** — export buttons.

The form URLs are in `FORMS` at the top of app.js. The app cannot see what is typed into a Google Form, so the form answers live in Google Forms and are matched to the app's CSV by participant number (and part number). Each form screen has an *Open it in a new tab* link in case the embed does not load.

### Counterbalancing
```
ORDERS = [ABC, ACB, BAC, BCA, CAB, CBA]
orderIdx = (pid-1) % 6 ; rot = floor((pid-1)/6) % 3
set(cond) = [S1,S2,S3][(indexOf(cond in ABC) + rot) % 3]
```
Fully balanced every 18 participants. Post order in a block: mulberry32 seed `pid*1000 + block`.

## Data
Stored in `localStorage` per session (`mf_session_<id>`), saved on every event, so a reload loses nothing. Export files are named `friction_P<pid>_raw_<date>.csv` / `..._summary_...`. "Export all sessions" concatenates every stored session. CSVs are UTF-8 with BOM, RFC 4180 quoting.

### Raw CSV columns
`participant, session_id, seq, timestamp_iso, t_ms, block, condition, post_set, post_id, post_index, veracity, event, value_ms, detail, vib_enabled, vib_supported, vib_hz`

- `t_ms` — ms since session start (wall clock, survives reload).
- `post_index` — 1-based position of the post in this block's feed.
- `vib_hz` — pulse rate of the current part's condition (B/C); empty in A and outside a part.

| event | value_ms | detail |
|---|---|---|
| session_start | | order, rotation, plan, placeholder flag, hzB, hzC, pulse counts, user agent |
| session_resume | | phase at reload |
| block_start | | shuffled post order |
| post_visible | | first time ≥50 % visible |
| source_open | | `feed\|<url>` or `prompt\|<url>` (prompt = from the B/C notice) |
| source_close | time away from the app | `feed\|returned` / `prompt\|returned`; `\|no_return` if another link was tapped before the page was left |
| share_tap | | `share` \| `repost` — which feed button was tapped |
| prompt_shown | | B/C notice shown |
| prompt_skipped | | `source_viewed` — B/C: the source was already opened in this part, so the notice was skipped and the post shared at once |
| vibrate | | `kind|pattern|return value|<Hz>Hz` or `skipped:disabled` / `skipped:unsupported` (B and C) |
| share_complete | | `direct:<entry>` (A) \| `prompt:<entry>` \| `source_viewed:<entry>` (B/C) |
| cancel | | `prompt:<entry>` (B/C only) |
| block_end | block duration | shared post ids |
| form_shown | | `consent` \| `part` \| `final` (`\|resume` after a reload) |
| form_continue | time on the form screen | `<kind>\|loads=<n>` — n = times the form iframe loaded (1 = opened; more = moved to another page or submitted) |
| debrief_shown | | |
| session_end | session duration | |

### Summary CSV (one row per post per block)
`participant, block, condition, post_set, post_id, story, veracity, source_opens, source_opens_from_prompt, source_time_ms, shared, shared_via, share_attempts, repost_attempts, prompt_skipped, cancels, decision_time_ms, time_from_first_view_ms`

- `story` — the news story; both versions of a story share it.
- `source_opens_from_prompt` — source opened from the B/C notice.
- `shared_via` — `share` or `repost`: the button that started the share that went through.
- `repost_attempts` — how many of the `share_attempts` started from the repost icon.
- `prompt_skipped` — 1 if the notice was skipped because the source had already been viewed.
- `decision_time_ms` — last `share_tap` → its `share_complete` or `cancel`.
- `time_from_first_view_ms` — first `post_visible` → first `share_tap` (empty if never tapped).

## Before the study
- Add the 3 remaining stories to `posts.js` (one per set, keeping set sizes equal).
- Test on the study phone: no vibration in A, 3.5 Hz in B and 5 Hz in C, the notice, opening sources and coming back with the back button, CSV download.
