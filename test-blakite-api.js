const axios = require("axios");

async function main() {
  const url = "https://blakiteapi.xyz/api/get.php?id=1-1&tmdbId=1429";

  try {
    const r = await axios.get(url, {
      headers: {
        Referer: "https://blakiteapi.xyz/embed/1429/1-1",
        Origin: "https://blakiteapi.xyz",
        "User-Agent": "Mozilla/5.0"
      }
    });

    console.log("STATUS:", r.status);
    console.log(JSON.stringify(r.data, null, 2));
  } catch (e) {
    console.log("STATUS:", e.response?.status);
    console.log("BODY:", String(e.response?.data).slice(0, 500));
  }
}

main();
