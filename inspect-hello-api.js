const axios = require("axios");

async function main() {
  const r = await axios.get("https://blakiteapi.xyz/api/getAllAnime.php");
  const data = r.data.data;

  console.log("TOP KEYS:", Object.keys(data));

  for (const key of Object.keys(data)) {
    const section = data[key];
    console.log("\nSECTION:", key);
    console.log("COUNT:", Object.keys(section || {}).length);

    const firstKey = Object.keys(section || {})[0];
    if (firstKey) {
      console.log("SAMPLE ID:", firstKey);
      console.log(JSON.stringify(section[firstKey], null, 2).slice(0, 1800));
    }
  }
}

main().catch(e => console.log("ERROR:", e.message));
