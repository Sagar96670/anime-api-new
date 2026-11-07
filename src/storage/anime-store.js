const jsonStore = require("./json-store");

module.exports = {
  saveAnime: jsonStore.saveAnime,
  getAnime: jsonStore.getAnime,
  listAnime: jsonStore.listAnime
};
