const axios = require("axios");

async function main() {
  const dataId = "fwe2/29/s8/2/A/f/I/b/AfIbw";
  const url = `https://hugh.cdn.rumble.cloud/video/${dataId}.caa.mp4`;

  console.log("Testing:", url);

  try {
    const r = await axios.get(url, {
      headers: { Referer: "https://blakiteapi.xyz/" },
      responseType: "stream",
      timeout: 20000
    });

    console.log("STATUS:", r.status);
    console.log("CONTENT-TYPE:", r.headers["content-type"]);
    console.log("CONTENT-LENGTH:", r.headers["content-length"]);
    r.data.destroy();
  } catch (e) {
    console.log("STATUS:", e.response?.status);
    console.log("ERROR:", e.message);
  }
}

main();
