const anilist = require("anilist-node");
const { sendListMenu, sendImage } = require("./venomFunctions");
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
      list[0].rows.push({
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

module.exports.animeDetail = (client, sendIn, id) => {
  let msg = [];
  Anilist.media.anime(Number(id)).then((data) => {
    // Compose the caption
    msg.push(...[`*Id* : ${data.id}`, `*MAL id* : ${data.idMal}`]);
    for (title in data.title) {
      msg.push(`*${title}* : ${data.title[title]}`);
    }
    msg.push(
      ...[
        `*Format* : ${data.format}`,
        `*Status* : ${data.status}`,
        `*Total episodes* : ${data.episodes}`,
        `*Started on* : ${data.startDate}`,
        `*Ended on* : ${data.endDate}`,
        `*Duration* : ${data.duration} minutes`,
        `*Genres* : ${data.genres.join(", ")}`,
      ]
    );

    // Send the result
    sendImage(
      client,
      sendIn,
      data.coverImage.large,
      msg.join("\n"),
      "Error while sending anime detail"
    );
  });
};
