const axios = require("axios");
const fs = require("fs");

async function main() {
  const r = await axios.get("https://blakiteapi.xyz/embed/1429/1-1");
  fs.writeFileSync("blakite-embed.html", r.data);
  console.log("Saved blakite-embed.html:", r.data.length, "characters");
}
main().catch(e => console.log("ERROR:", e.message));
