const axios = require("axios");
const fs = require("fs");

async function main() {
  const r = await axios.get("https://www.helloanime.in/streaming.html");
  fs.writeFileSync("helloanime-streaming.html", r.data);

  console.log("Saved: helloanime-streaming.html");
  console.log("\nPARAMETERS:");
  console.log(r.data.match(/.{0,100}(?:URLSearchParams|location.search|episode_id|anime_id|data-id|data-episode|loadPlayer|embed_holder|DagPlay).{0,180}/gi)?.slice(0,50).join("\n"));

  console.log("\nINLINE SCRIPTS:");
  const scripts = [...r.data.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(x=>x[1]).filter(x=>x.trim());
  scripts.forEach((s,i)=> {
    fs.writeFileSync("hello-inline-"+i+".js",s);
    console.log(i, "length:",s.length);
  });
}
main().catch(e=>console.log(e.message));
