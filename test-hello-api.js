const axios = require("axios");

async function main() {
  try {
    const r = await axios.get("https://blakiteapi.xyz/api/getAllAnime.php");
    console.log("STATUS:", r.status);
    console.log("TYPE:", typeof r.data);
    console.log("DATA:", JSON.stringify(r.data, null, 2).slice(0, 3000));
  } catch (e) {
    console.log("ERROR:", e.response?.status, e.message);
  }
}

main();
