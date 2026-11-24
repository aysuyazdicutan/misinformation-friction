# Misinformation Friction — phone app (CS 449/549, Group 6, PP2)

Plain HTML/CSS/JS (no framework, no build step). Runs in Android Chrome, served over HTTPS from GitHub Pages.

```
index.html   page skeleton (all text comes from STRINGS in app.js)
style.css    styles
app.js       STRINGS, screens, A/B/C share flows, vibration, event log, CSV export
posts.js     window.POST_SETS = {S1, S2, S3}  — PLACEHOLDER content for now
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
| B — source question + 3.5 Hz | Question screen: "Did you check the source?" + Inspect source, Cancel / Share | pulsed at 3.5 Hz (default) |
| C — source question + 5 Hz | Same question screen as B | pulsed at 5 Hz (default) |

**If the participant already opened the post's source in this part (from the feed or from the question screen), B and C skip the question and share at once, with no vibration.** B and C use exactly the same screen and text; the vibration pulse rate is the only difference. `haptic()` in app.js returns immediately in A, so A can never vibrate. If vibration is switched off or unsupported, B and C do not vibrate (the setup screen warns, and each skipped vibration is logged).

### Vibration pulse rate (Hz)
A web page cannot change the motor's own frequency, but it can switch the motor on and off: "Hz" here means pulses per second, with a 50 % duty cycle — `on = off = round(1000 / (2 × Hz))` ms. 3.5 Hz → 143 ms on / 143 ms off; 5 Hz → 100 / 100.

Set on the setup screen (saved on the phone, frozen into each session when it starts):
- **B pulse rate** (default 3.5 Hz) and **C pulse rate** (default 5 Hz), 1–20 Hz in 0.5 steps.
- **Pulses when the question opens** (default 1) and **pulses when shared** (default 2), 1–20, same for B and C. N pulses → pattern `[on, off, …, on]`.
- Test buttons play the B/C question and share patterns with the current values.

## Study flow
1. **Researcher setup** — participant number → plan preview, vibration on/off + support status + B/C pulse rate and pulse counts + test buttons, Start, exports, Clear data. An unfinished session (e.g. after a reload) can be resumed.
2. **Part intro** — neutral instruction (B and C have the same text).
3. **Feed** — 8 posts (seeded shuffle) in a timeline layout. *View source* is a link; the **repost icon** and **Share** both open the same flow (A: shared at once, B/C: question). Reply / like / views icons are decorative. Shared posts lock; cancelled posts can be shared again. *Finish this feed* needs two taps.
4. **Part end** — "Part X finished — please tell the researcher" → *Researcher: continue*.
5. **Debrief** — all misleading posts with corrections.
6. **End** — export buttons.

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
| source_open | | `feed` \| `prompt` |
| source_close | time open | `feed` \| `prompt` |
| share_tap | | `share` \| `repost` — which feed button was tapped |
| prompt_shown | | (B and C) |
| prompt_skipped | | `source_viewed` — B/C: the source was already opened in this part, so the question was skipped and the post shared at once |
| vibrate | | `kind|pattern|return value|<Hz>Hz` or `skipped:disabled` / `skipped:unsupported` (B and C) |
| share_complete | | `direct:<entry>` (A) \| `prompt:<entry>` \| `source_viewed:<entry>` (B/C) |
| cancel | | `prompt:<entry>` (B/C only) |
| block_end | block duration | shared post ids |
| debrief_shown | | |
| session_end | session duration | |

### Summary CSV (one row per post per block)
`participant, block, condition, post_set, post_id, veracity, source_opens, source_opens_from_prompt, source_time_ms, shared, shared_via, share_attempts, repost_attempts, prompt_skipped, cancels, decision_time_ms, time_from_first_view_ms`

- `source_opens_from_prompt` — source opened from the question screen (B/C).
- `shared_via` — `share` or `repost`: the button that started the share that went through.
- `repost_attempts` — how many of the `share_attempts` started from the repost icon.
- `prompt_skipped` — 1 if the question was skipped because the source had already been viewed.
- `decision_time_ms` — last `share_tap` → its `share_complete` or `cancel`.
- `time_from_first_view_ms` — first `post_visible` → first `share_tap` (empty if never tapped).

## Before the study
- Replace `posts.js` with real content and set `POSTS_ARE_PLACEHOLDER = false` (the setup screen warns until then).
- Test on the study phone: no vibration in A and B, 1 + 2 pulses in C, CSV download.
