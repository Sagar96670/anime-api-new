const axios = require("axios");
const cheerio = require("cheerio");

async function main() {
  const r = await axios.get("https://www.helloanime.in/streaming.html");
  const $ = cheerio.load(r.data);

  console.log("STATUS:", r.status);
  console.log("TITLE:", $("title").text());
  console.log("SCRIPTS:");
  $("script[src]").each((i, e) => console.log($(e).attr("src")));

  console.log("\nIFRAMES:");
  $("iframe").each((i, e) => console.log($(e).attr("src")));

  console.log("\nPLAYER ELEMENTS:");
  console.log(r.data.match(/.{0,100}(?:player|episode|season|iframe|embed|video|source).{0,150}/gi)?.slice(0,40).join("\n"));
}

main().catch(e => console.log("ERROR:", e.response?.status, e.message));
