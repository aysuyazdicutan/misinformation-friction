/*
 * posts.js — post sets for the study.
 *
 * ⚠️ PLACEHOLDER CONTENT ⚠️
 * Every post, author, publisher and source below is FICTIONAL and exists only
 * so the app can be built and tested. The team member responsible for content
 * will replace these with the real, piloted posts.
 * When the real content is in, set POSTS_ARE_PLACEHOLDER to false.
 *
 * Shape (do not change field names — app.js and the CSV export rely on them):
 *   window.POST_SETS = { S1: [...8 posts], S2: [...], S3: [...] }
 *   post = {
 *     id, author, handle, text,
 *     veracity: 'true' | 'misleading',
 *     topic: 'science' | 'technology' | 'daily life',
 *     source: { publisher, published, evidence, note },
 *     debrief   // correction shown at the end (needed for misleading posts)
 *   }
 * Each set: 8 posts, 4 true + 4 misleading. Post ids must be unique across sets.
 */
window.POSTS_ARE_PLACEHOLDER = true;

window.POST_SETS = {
  S1: [
    {
      id: 'S1-01', author: 'Mira Holt', handle: '@mirah', topic: 'science', veracity: 'true',
      text: 'A 10-year study of 2,000 adults found that people who walked regularly had lower blood pressure on average.',
      source: { publisher: 'Riverside Health Journal (fictional)', published: '14 Mar 2026', evidence: 'Peer-reviewed cohort study, 2,000 participants.', note: 'Shows an association, not proof of cause. Consistent with earlier research.' },
      debrief: 'Accurate summary of the (fictional) study.'
    },
    {
      id: 'S1-02', author: 'TrendWire', handle: '@trendwire_daily', topic: 'science', veracity: 'misleading',
      text: 'Scientists confirm: drinking 8 cups of coffee a day DOUBLES your memory 🤯',
      source: { publisher: 'TrendWire Blog (fictional)', published: '2 Feb 2026', evidence: 'Links to a press release about a study in 12 mice.', note: 'No human data. The headline goes far beyond what the study tested.' },
      debrief: 'Misleading. The underlying study tested caffeine in 12 mice. No study showed that coffee doubles human memory, and 8 cups a day exceeds common caffeine guidance.'
    },
    {
      id: 'S1-03', author: 'Deniz Kaya', handle: '@denizk', topic: 'technology', veracity: 'true',
      text: 'Keeping your phone at 100% charge in hot places wears the battery out faster over time.',
      source: { publisher: 'Open Tech Review (fictional)', published: '20 Jan 2026', evidence: 'Lab tests by battery researchers, summarised with data tables.', note: 'Matches manufacturer guidance on lithium-ion batteries.' },
      debrief: 'Accurate.'
    },
    {
      id: 'S1-04', author: 'Phone Hacks 101', handle: '@phonehacks101', topic: 'technology', veracity: 'misleading',
      text: 'Turn on airplane mode and your phone charges 3x faster. Try it tonight!',
      source: { publisher: 'Short video, no publisher', published: 'Unknown', evidence: 'One person timing their own phone on camera.', note: 'No controlled test. Any speed-up is typically small.' },
      debrief: 'Misleading. Airplane mode can make charging slightly faster because the radios use less power, but nowhere near 3x.'
    },
    {
      id: 'S1-05', author: 'Lena Brooks', handle: '@lenacooks', topic: 'daily life', veracity: 'true',
      text: 'Bread goes stale faster in the fridge than at room temperature. Freezing it keeps it fresh longer.',
      source: { publisher: 'State Food Science Extension (fictional)', published: '5 Nov 2025', evidence: 'Explainer citing food chemistry research on starch.', note: 'Well-established finding.' },
      debrief: 'Accurate.'
    },
    {
      id: 'S1-06', author: 'Kitchen Tips Forum', handle: '@kitchentipsforum', topic: 'daily life', veracity: 'misleading',
      text: 'Experts agree: always rinse raw chicken under the tap before cooking to wash off bacteria.',
      source: { publisher: 'Kitchen Tips Forum (fictional)', published: '30 Sep 2025', evidence: 'No expert or study named.', note: 'Food-safety agencies advise the opposite.' },
      debrief: 'Misleading. Rinsing raw chicken splashes bacteria around the sink and kitchen. Cooking to a safe temperature is what kills them.'
    },
    {
      id: 'S1-07', author: 'Arda Yılmaz', handle: '@ardahistory', topic: 'science', veracity: 'true',
      text: 'Honey sealed in jars can stay edible for a very long time because it has little water and is acidic.',
      source: { publisher: 'Museum of Natural Science blog (fictional)', published: '11 Aug 2025', evidence: 'Explainer by a food chemist with references.', note: 'Storage conditions matter; open honey can absorb moisture.' },
      debrief: 'Accurate.'
    },
    {
      id: 'S1-08', author: 'Leaks & News', handle: '@leaksnnews', topic: 'technology', veracity: 'misleading',
      text: 'BREAKING: new law means ALL messaging apps will read your private messages from next month. Share before it\'s deleted!',
      source: { publisher: 'Anonymous screenshot', published: 'Unknown', evidence: 'Cropped screenshot with no link to any law.', note: 'No official source. Urgent "share before deleted" wording is a warning sign.' },
      debrief: 'Misleading. No such law exists in this (fictional) case. The post relied on an unsourced screenshot and urgency to drive sharing.'
    }
  ],

  S2: [
    {
      id: 'S2-01', author: 'Selin Aksoy', handle: '@selinsci', topic: 'science', veracity: 'true',
      text: 'Regularly sleeping under 6 hours is linked to a weaker immune response to some vaccines.',
      source: { publisher: 'Journal of Sleep Studies (fictional)', published: '3 Apr 2026', evidence: 'Peer-reviewed study plus a review of earlier work.', note: 'Association; the effect size varies across studies.' },
      debrief: 'Accurate.'
    },
    {
      id: 'S2-02', author: 'GlowUp Wellness', handle: '@glowupwell', topic: 'science', veracity: 'misleading',
      text: 'New research PROVES one cold shower a day cures depression. Doctors don\'t want you to know.',
      source: { publisher: 'GlowUp Wellness (fictional)', published: '18 Jan 2026', evidence: 'Online survey of 40 followers about their mood.', note: 'Self-selected survey, no control group.' },
      debrief: 'Misleading. A small self-reported survey cannot show that anything "cures" depression. Depression should be treated with professional support.'
    },
    {
      id: 'S2-03', author: 'Can Demir', handle: '@cansecure', topic: 'technology', veracity: 'true',
      text: 'Reusing the same password on many sites means one data leak can expose all of your accounts.',
      source: { publisher: 'National Cyber Advice Centre (fictional)', published: '9 Dec 2025', evidence: 'Official guidance page with examples of past breaches.', note: 'A password manager or unique passwords reduce the risk.' },
      debrief: 'Accurate.'
    },
    {
      id: 'S2-04', author: 'Battery Saver Tips', handle: '@batterysavertips', topic: 'technology', veracity: 'misleading',
      text: 'Swipe away ALL your background apps every hour — it saves tons of battery.',
      source: { publisher: 'Tips account, no publisher', published: 'Unknown', evidence: 'No test or data shown.', note: 'Phone makers say this usually does not help.' },
      debrief: 'Misleading. Modern phones manage background apps themselves; force-closing and reopening apps can use more battery, not less.'
    },
    {
      id: 'S2-05', author: 'Omar Haddad', handle: '@omarathome', topic: 'daily life', veracity: 'true',
      text: 'Covering food in the microwave helps it heat more evenly and keeps it from drying out.',
      source: { publisher: 'Home Cooking Lab (fictional)', published: '22 Oct 2025', evidence: 'Side-by-side temperature measurements.', note: 'Use a microwave-safe cover.' },
      debrief: 'Accurate.'
    },
    {
      id: 'S2-06', author: 'Fun Facts Daily', handle: '@funfactsdaily', topic: 'daily life', veracity: 'misleading',
      text: 'You lose 80% of your body heat through your head, so a hat matters more than a coat.',
      source: { publisher: 'Fun Facts Daily (fictional)', published: 'Unknown', evidence: 'No source given.', note: 'Based on a misread decades-old experiment.' },
      debrief: 'Misleading. Heat loss is roughly proportional to exposed skin. The head is not special; a coat matters at least as much.'
    },
    {
      id: 'S2-07', author: 'Ece Tan', handle: '@ecetech', topic: 'technology', veracity: 'true',
      text: 'Turning on two-factor authentication blocks most automated attempts to break into accounts.',
      source: { publisher: 'Open Tech Review (fictional)', published: '15 Feb 2026', evidence: 'Summary of published data from large email providers.', note: 'App-based codes or keys are stronger than SMS.' },
      debrief: 'Accurate.'
    },
    {
      id: 'S2-08', author: 'Space Alerts!!', handle: '@spacealerts_now', topic: 'science', veracity: 'misleading',
      text: 'NASA confirms Earth will go through 15 days of total darkness this December. Get ready!',
      source: { publisher: 'Viral post, no publisher', published: 'Unknown', evidence: 'No link to NASA or any agency.', note: 'This hoax has circulated in different years.' },
      debrief: 'Misleading. No space agency has announced this; it is a recurring hoax with no scientific basis.'
    }
  ],

  S3: [
    {
      id: 'S3-01', author: 'Jonas Weber', handle: '@jonasphysics', topic: 'science', veracity: 'true',
      text: 'Bananas are very slightly radioactive because of their potassium — but the dose is harmless.',
      source: { publisher: 'University Physics Outreach (fictional)', published: '7 Mar 2026', evidence: 'Explainer with dose comparisons.', note: 'Your body regulates potassium levels.' },
      debrief: 'Accurate.'
    },
    {
      id: 'S3-02', author: 'MindHacks', handle: '@mindhacks', topic: 'science', veracity: 'misleading',
      text: 'Researchers found we only use 10% of our brains. Imagine unlocking the rest!',
      source: { publisher: 'MindHacks (fictional)', published: 'Unknown', evidence: 'No study cited.', note: 'Brain imaging shows activity across the whole brain.' },
      debrief: 'Misleading. This is a long-standing myth; brain scans show we use virtually all of the brain, just not all regions at once.'
    },
    {
      id: 'S3-03', author: 'Aylin Şahin', handle: '@aylinphotos', topic: 'technology', veracity: 'true',
      text: 'Deleting a photo on most phones moves it to a "Recently deleted" folder where it stays for weeks.',
      source: { publisher: 'Open Tech Review (fictional)', published: '28 Nov 2025', evidence: 'Checked on several current phone models.', note: 'The exact number of days differs by device.' },
      debrief: 'Accurate.'
    },
    {
      id: 'S3-04', author: 'Safety First!!', handle: '@safetyfirst_now', topic: 'technology', veracity: 'misleading',
      text: 'WARNING: charging your phone overnight will make the battery explode. Unplug before bed!',
      source: { publisher: 'Viral post, no publisher', published: 'Unknown', evidence: 'Photo of a burned phone with no details.', note: 'Phones stop charging when full; fires are rare and usually linked to damaged or fake chargers.' },
      debrief: 'Misleading. Phones have charge controllers that stop charging at 100%. Overnight charging with a proper charger is not a known explosion risk.'
    },
    {
      id: 'S3-05', author: 'Nora Lind', handle: '@noralind', topic: 'daily life', veracity: 'true',
      text: 'Reusable water bottles should be washed often — bacteria can build up inside within days.',
      source: { publisher: 'Campus Health Service (fictional)', published: '2 Sep 2025', evidence: 'Swab tests of student bottles.', note: 'Hot soapy water is enough for most bottles.' },
      debrief: 'Accurate.'
    },
    {
      id: 'S3-06', author: 'Health Truths', handle: '@healthtruths', topic: 'daily life', veracity: 'misleading',
      text: 'Doctors warn: cracking your knuckles gives you arthritis. Stop now!',
      source: { publisher: 'Health Truths (fictional)', published: 'Unknown', evidence: 'No doctor or study named.', note: 'Studies have not found a link.' },
      debrief: 'Misleading. Research comparing knuckle-crackers with non-crackers has not found higher arthritis rates.'
    },
    {
      id: 'S3-07', author: 'Kerem Öz', handle: '@keremweather', topic: 'science', veracity: 'true',
      text: 'Lightning can strike the same place more than once — tall buildings get hit many times a year.',
      source: { publisher: 'Weather Service explainer (fictional)', published: '19 Jun 2025', evidence: 'Lightning detection network records.', note: 'Tall, pointed structures are hit most often.' },
      debrief: 'Accurate.'
    },
    {
      id: 'S3-08', author: 'FitFast', handle: '@fitfast', topic: 'daily life', veracity: 'misleading',
      text: 'Eating anything after 8 pm automatically turns into fat. Your metabolism shuts off at night!',
      source: { publisher: 'FitFast (fictional)', published: 'Unknown', evidence: 'No study linked.', note: 'Total daily intake matters more than the clock.' },
      debrief: 'Misleading. Metabolism does not "shut off" at night. Weight change depends mainly on total intake and activity over time.'
    }
  ]
};
