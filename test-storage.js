require("dotenv").config();

const { saveRecord, getRecord } = require("./src/storage/blogger-store");

async function main() {
  const anime = {
    id: "test-anime-001",
    title: "Test Anime",
    poster: "https://example.com/test.jpg",
    source: "DesiDubAnime",
    created_at: new Date().toISOString()
  };

  const saved = await saveRecord("anime", anime.id, anime);

  console.log("Save result:", saved);

  const loaded = await getRecord("anime", anime.id);

  console.log("Loaded anime:", loaded);
}

main().catch(error => {
  console.error("Storage test failed:", error.message);
});
