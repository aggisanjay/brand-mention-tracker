const axios = require("axios");
const Parser = require("rss-parser");
const parser = new Parser();
require("dotenv").config();

// ------------------------------
// API ENDPOINT
// ------------------------------
const API =
  (process.env.API_PUBLIC || "http://localhost:4000") + "/api/mentions";

// ------------------------------
// TRENDING KEYWORDS
// ------------------------------
const KEYWORDS = [
  "AI",
  "OpenAI",
  "Elon Musk",
  "Tesla",
  "Google",
  "Microsoft",
  "India",
  "Bitcoin",
  "Climate",
];

// ------------------------------
// SIMULATION MESSAGES (Alive feed even if APIs slow)
// ------------------------------
const SIM_MESSAGES = [
  "AI adoption is growing insanely fast this week.",
  "Tesla stock is crashing but I still believe in Elon.",
  "Google silently released a huge new update for Chrome.",
  "Microsoft Teams outage again today — frustrating!",
  "Bitcoin crossed 95,000 again — wild market.",
  "OpenAI’s new model is beating expectations.",
  "Starlink service seems slower lately.",
  "EV adoption is booming in India right now.",
];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ------------------------------
// PUSH TO API
// ------------------------------
async function send(item) {
  try {
    await axios.post(API, item);
    console.log("Sent:", item.text.slice(0, 60));
  } catch (err) {
    console.log("POST FAIL:", err.message);
  }
}

// ------------------------------
// REDDIT FETCHER
// ------------------------------
async function fetchReddit(keyword) {
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(
      keyword
    )}&sort=new`;

    const res = await axios.get(url, {
      headers: { "User-Agent": "BrandTracker" },
    });

    return res.data.data.children.map((c) => ({
      text: c.data.title,
      source: "reddit",
      author: c.data.author,
      url: "https://reddit.com" + c.data.permalink,
      publishedAt: new Date(c.data.created_utc * 1000),
    }));
  } catch (e) {
    console.log("Reddit error:", e.message);
    return [];
  }
}

// ------------------------------
// HN FETCHER
// ------------------------------
async function fetchHN(keyword) {
  try {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(
      keyword
    )}&tags=story`;

    const res = await axios.get(url);

    return res.data.hits.map((h) => ({
      text: h.title,
      source: "hackernews",
      author: h.author,
      url:
        h.url ||
        `https://news.ycombinator.com/item?id=${h.objectID}`,
      publishedAt: new Date(h.created_at),
    }));
  } catch (e) {
    console.log("HN error:", e.message);
    return [];
  }
}

// ------------------------------
// RSS FETCHER (Always returns many)
// ------------------------------
async function fetchRSS() {
  try {
    const feed = await parser.parseURL("https://techcrunch.com/feed/");
    return feed.items.map((item) => ({
      text: item.title,
      source: "techcrunch",
      author: item.creator || "rss",
      url: item.link,
      publishedAt: new Date(item.pubDate),
    }));
  } catch (e) {
    console.log("RSS error:", e.message);
    return [];
  }
}

// ------------------------------
// MAIN LOOP
// ------------------------------
async function run() {
  try {
    const keyword = rand(KEYWORDS);

    console.log("\n🔍 Searching for:", keyword);

    const [r1, r2, r3] = await Promise.all([
      fetchReddit(keyword),
      fetchHN(keyword),
      fetchRSS(),
    ]);

    const all = [...r1, ...r2, ...r3];

    // push real items
    for (const item of all.slice(0, 10)) {
      await send(item);
    }

    // push simulated items (guaranteed real-time feed)
    for (let i = 0; i < 3; i++) {
      await send({
        text: rand(SIM_MESSAGES),
        source: "simulator",
        author: "sim",
        url: "",
        publishedAt: new Date(),
      });
    }
  } catch (e) {
    console.log("Loop error:", e.message);
  }
}

// ------------------------------
// Run every 5 seconds (super live)
// ------------------------------
setInterval(run, 5000);
run();
