const anilist = require("anilist-node");
const { sendListMenu } = require("./venomFunctions");
const Anilist = new anilist();

module.exports.animeSearch = (client, sendIn, query) => {
  Anilist.searchEntry.anime(query).then((res) => {
    const list = [
      {
        title: "Search Results",
        rows: [],
      },
    ];

    res.media.forEach((anime) => {
      list.rows.push({
        title: ".aid " + anime.id,
        description: anime.title.english + "\n" + anime.title.romaji,
      });
    });

    sendListMenu(
      client,
      sendIn,
      "Searched: " + query,
      "Hi",
      "Checkout the bottom menu for results",
      "Search results",
      list
    );
  });
};

module.exports.animeDetail = (client, id) => {
  Anilist.media.anime(id).then((data) => {
    console.log(data);
  });
};
