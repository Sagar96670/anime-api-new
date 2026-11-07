const axios = require("axios");
const fs = require("fs");

async function main() {
  const r = await axios.get("https://blakiteapi.xyz/watch/player.js");
  fs.writeFileSync("blakite-player.js", r.data);
  console.log("Saved:", r.data.length, "characters");
}
main().catch(e => console.log("ERROR:", e.message));
