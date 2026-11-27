/*
 * posts.js — post sets for the study.
 *
 * Each STORY is a real news article (url) with two headlines that appear as two posts
 * in the SAME feed: one accurate ('true') and one distorted ('misleading').
 * 18 stories (6 per set, one per topic) = 12 posts per set.
 *
 * Accounts are fictional and neutral: every account posts both true and misleading
 * headlines, and the two versions of one story come from different accounts, so the
 * account name gives no hint about veracity.
 *
 * Shape (app.js and the CSV export rely on these field names):
 *   window.POST_SETS = { S1: [...], S2: [...], S3: [...] }
 *   post = { id, story, author, handle, text, veracity: 'true'|'misleading', topic,
 *            url, publisher, debrief }
 * Every set must have the same number of posts, and every story both versions.
 */
window.POSTS_ARE_PLACEHOLDER = false;

(function () {
  const ACCOUNTS = [
    { author: 'Daily Brief', handle: '@dailybrief' },
    { author: 'News Wire Now', handle: '@newswirenow' },
    { author: 'The Feed Report', handle: '@thefeedreport' },
    { author: 'World Updates', handle: '@worldupdates' },
    { author: 'Headline Hub', handle: '@headlinehub' },
    { author: 'Around the Globe', handle: '@aroundtheglobe' }
  ];

  // [set, story key, topic, publisher, url, true headline, misleading headline]
  const STORIES = [
    // ---- S1 ----
    ['S1', 'veruschka', 'Entertainment', 'CNN',
      'https://edition.cnn.com/2026/11/26/style/supermodel-veruschka-dies-hnk-intl',
      'Veruschka, one of world’s first supermodels, has died',
      'Veruschka, one of world’s first supermodels, has fallen victim to homicide'],
    ['S1', 'thelma-golden', 'Culture', 'Artnet News',
      'https://news.artnet.com/art-world/thelma-golden-steps-down-studio-museum-2841588?amp=1',
      'After more than two decades at the helm of the Studio Museum in Harlem, Thelma Golden is stepping down as director.',
      'After two decades as director of the Studio Museum in Harlem, Thelma Golden’s contract is terminated and she is removed from her duties.'],
    ['S1', 'la-schools-google', 'General News', 'ABC News',
      'https://abcnews.com/Technology/wireStory/google-threatens-cut-schools-search-access-los-angeles-138476437?cid=social_twitter_abcn',
      'Los Angeles schools plan to drop the use of Google products unless the company gives them a permanent AI workaround',
      'Los Angeles county bans the use of AI and Google products in schools'],
    ['S1', 'flamingos', 'Science', 'Hürriyet Daily News',
      'https://www.hurriyetdailynews.com/warm-weather-tempts-flamingos-to-stay-longer-at-van-lake-229884',
      'Warm weather due to climate change keeps flamingos at Van Lake instead of following their regular annual migration patterns.',
      'The flamingos prefer Van Lake over Africa due to prettier scenery'],
    ['S1', 'aras-fenerbahce', 'Sports', 'World of Volley',
      'https://worldofvolley.com/latest_news/turkey/337389/aras-kargo-fenerbahce-postponed.html',
      'Aras Kargo - Fenerbahçe Medicana volleyball match postponed due to food poisoning',
      'Aras Kargo players forced to compete in volleyball match against Fenerbahçe Medicana despite food poisoning'],

    // ---- S2 ----
    ['S2', 'bella-hadid', 'Entertainment', 'E! News',
      'https://www.eonline.com/news/1438425/bella-hadid-shares-pots-pmdd-endometriosis-diagnoses-in-addition-to-lyme',
      'Bella Hadid shares multiple health diagnoses and talks about the pressure they put on her career',
      'Bella Hadid shares she’s taking a pause from her career due to her multiple diagnoses'],
    ['S2', 'istanbul-photo', 'Culture', 'Hürriyet Daily News',
      'https://www.hurriyetdailynews.com/istanbul-photo-awards-exhibition-opens-in-washington-229887',
      'Istanbul Photo Awards exhibition opens in Washington following earlier displays in Ankara and Rome',
      'First ever Istanbul Photo Awards exhibition opens in Washington'],
    ['S2', 'crocodile', 'General News', 'Aftonbladet',
      'https://www.aftonbladet.se/nyheter/a/qL7mmo/crocodile-attacks-man-at-crayfish-party-in-stockholm',
      'Crocodile attacks local man at a dinner party',
      'Local man threatens and fights a crocodile at a dinner party'],
    ['S2', 'riemann', 'Science', 'Science News',
      'https://www.sciencenews.org/article/riemann-hypothesis-solved-math-ai',
      'Mathematician Levent Alpöge solves the Riemann hypothesis with Anthropic’s LLM Claude’s help',
      'Mathematician Levent Alpöge solves the Riemann hypothesis with manual calculations'],
    ['S2', 'club-world-champs', 'Sports', 'Volleyball World',
      'https://en.volleyballworld.com/volleyball/competitions/club-world-championship-women/news/stellar-squads-announced-for-2026-women-s-club-world-championship?',
      'Top teams from the Turkish National Volleyball league to compete in the FIVB Volleyball Women’s Club World Championship in Brazil.',
      'Turkish national volleyball team to compete in the Women’s World Cup in Brazil.'],

    // ---- S3 ----
    ['S3', 'dwts', 'Entertainment', 'E! News',
      'https://www.eonline.com/news/1438429/dwts-brandon-armstrong-shows-off-cut-from-ezra-frechs-prosthetic-leg',
      'Dancing with the Stars dancer Brandon Armstrong’s leg was cut after costar Ezra Frech’s prosthetic leg came off during their performance',
      'Dancing with the Stars dancer Brandon Armstrong claims costar Ezra Frech cut a split in his leg during their performance'],
    ['S3', 'antalya-piano', 'Culture', 'Hürriyet Daily News',
      'https://www.hurriyetdailynews.com/international-antalya-piano-festival-kicks-off-today-229890',
      'International Antalya Piano Festival kicks off',
      'International Antalya Piano Festival kicks off with the highest attendance record in festival’s history'],
    ['S3', 'royal-jewellery', 'General News', 'Aftonbladet',
      'https://www.aftonbladet.se/nyheter/a/9m7MwE/stolen-royal-jewellery-found-in-bin-marked-bomb',
      'The stolen Swedish royal jewellery was found in a bin, marked with BOMB across it',
      'The thieves hid stolen Swedish royal jewellery in a hand grenade case'],
    ['S3', 'gene-therapy-sight', 'Science', 'Science News',
      'https://www.sciencenews.org/article/cells-detect-light-blind-vision',
      'Gene therapy and special goggles give some blind people limited sight',
      'Gene therapy and special goggles reverse blindness and restore sight'],
    ['S3', 'fenerbahce-roma', 'Sports', 'beIN Sports',
      'https://www.beinsports.com/en-mena/football/uefa-champions-league/articles-video/fenerbahce-draw-with-roma-on-return-to-champions-league-2026-09-10',
      'Fenerbahce returns to the Champions League after 18 years upon draw with Roma',
      'Fenerbahce to compete in the Champions League for the first time after win against Roma'],

    // ---- Travel & Tourism (one per set) ----
    ['S1', 'istanbul-chengdu', 'Travel & Tourism', 'Travel PR News',
      'https://travelprnews.com/article/news-recap-11-november-2026-chengdu-gains-an-istanbul-link-as-hotels-put-cinema-and-dining-on-sale/',
      'Turkish Airlines launches a new direct flight route between Istanbul and Chengdu, China.',
      'Turkish Airlines resumes direct flights between Istanbul and Chengdu after years of suspension.'],
    ['S2', 'southernmost-hotel', 'Travel & Tourism', 'Euronews',
      'https://www.euronews.com/2026/11/12/new-gateway-to-antarctica-worlds-southernmost-hotel-opens-in-chile',
      'The world’s southernmost hotel opens in Chile, offering accommodation for tourists travelling to Antarctica.',
      'The world’s southernmost hotel opens in Antarctica, offering accommodation for tourists visiting the continent.'],
    ['S3', 'northern-lights', 'Travel & Tourism', 'PR Newswire',
      'https://www.prnewswire.com/news-releases/the-aurora-allure-why-its-still-on-everyones-bucket-list-and-where-its-taking-travellers-302933110.html',
      'Bookings for Northern Lights tours increase by 225% compared to last year.',
      'Bookings for Northern Lights tours reach a record low as tourists lose interest in Arctic destinations.']
  ];

  const sets = { S1: [], S2: [], S3: [] };
  STORIES.forEach(function (s, i) {
    const set = s[0], key = s[1], topic = s[2], publisher = s[3], url = s[4];
    const tAcc = ACCOUNTS[i % ACCOUNTS.length];
    const fAcc = ACCOUNTS[(i + 3) % ACCOUNTS.length]; // always a different account
    sets[set].push({
      id: set + '-' + key + '-T', story: key, author: tAcc.author, handle: tAcc.handle,
      text: s[5], veracity: 'true', topic: topic, url: url, publisher: publisher,
      debrief: 'Accurate.'
    });
    sets[set].push({
      id: set + '-' + key + '-F', story: key, author: fAcc.author, handle: fAcc.handle,
      text: s[6], veracity: 'misleading', topic: topic, url: url, publisher: publisher,
      debrief: 'What the article (' + publisher + ') actually says: ' + s[5]
    });
  });
  window.POST_SETS = sets;
})();
