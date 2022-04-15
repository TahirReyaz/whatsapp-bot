const anilist = require("anilist-node");
const Anilist = new anilist();

module.exports.animeSearch = (client, query) => {
  Anilist.searchEntry.anime(query).then((res) => {
    console.log(res.media);
  });
};

module.exports.animeDetail = (client, id) => {
  Anilist.media.anime(id).then((data) => {
    console.log(data);
  });
};
