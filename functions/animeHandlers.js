const anilist = require("anilist-node");
const { sendListMenu, sendImage } = require("./venomFunctions");
const _ = require("lodash");
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
      msg.push(`*${_.capitalize(title)}* : ${data.title[title]}`);
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
        "",
        `*Description* : ${data.description}`,
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

    // Related Media
    const relatedAnimeList = [
      {
        title: "Related to your search",
        rows: [],
      },
    ];

    data.relations.forEach((relation) => {
      relation.type === "ANIME" &&
        relatedAnimeList[0].rows.push({
          title: ".aid " + relation.id,
          description: relation.title.english + "\n" + relation.title.romaji,
        });
    });

    sendListMenu(
      client,
      sendIn,
      "Related animes",
      "Hi",
      "Checkout the bottom menu for related animes",
      "Related animes",
      relatedAnimeList
    );

    // Tags
    console.table(data.tags);
    // Characters
    const charactersList = [
      {
        title: "Featured Characters",
        rows: [],
      },
    ];

    data.characters.forEach((character) => {
      charactersList[0].rows.push({
        title: ".cid " + character.id,
        description: character.name,
      });
    });

    sendListMenu(
      client,
      sendIn,
      "Featured Characters",
      "Hi",
      "Checkout the bottom menu for characters appearing in this anime",
      "Featured Characters",
      charactersList
    );

    // Staff
    const staffList = [
      {
        title: "Staff",
        rows: [],
      },
    ];

    data.staff.forEach((staff) => {
      staffList[0].rows.push({
        title: ".asid " + staff.id,
        description: staff.name,
      });
    });

    sendListMenu(
      client,
      sendIn,
      "Staff",
      "Hi",
      "Checkout the bottom menu for the people who worked on this anime",
      "Staff",
      staffList
    );
  });
};

module.exports.charDetailById = (client, sendIn, id) => {
  Anilist.people.character(Number(id)).then((data) => {
    const msg = [];
    msg.push(
      ...[
        `*Id* : ${data.id}`,
        `*Name (English)* : ${data.name.english}`,
        `*Name (Native)* : ${data.name.native}`,
        data.name.alternative &&
          `*Alt Names* : ${data.name.alternative.join(", ")}`,
        "",
        `*Description* : ${data.description}`,
      ]
    );
    sendImage(
      client,
      sendIn,
      data.image.large,
      msg.join("\n"),
      "Error while sending character detail"
    );
  });
};

module.exports.animeStaffDetails = (client, sendIn, id) => {
  Anilist.people.staff(Number(id)).then((data) => {
    const msg = [];
    msg.push(
      ...[
        `*Id* : ${data.id}`,
        `*Name (English)* : ${data.name.english}`,
        `*Name (Native)* : ${data.name.native}`,
        data.name.alternative &&
          `*Alt Names* : ${data.name.alternative.join(", ")}`,
        `*Language* : ${data.language}`,
        "",
        `*Description* : ${data.description}`,
      ]
    );
    sendImage(
      client,
      sendIn,
      data.image.large,
      msg.join("\n"),
      "Error while sending staff detail"
    );
  });
};

module.exports.searchCharacterDetail = (client, sendIn, query) => {
  Anilist.searchEntry.character(query, 1, 30).then((data) => {
    const list = [
      {
        title: "Search Results",
        rows: [],
      },
    ];

    data.characters.forEach((character) => {
      list[0].rows.push({
        title: ".cid " + character.id,
        description: character.name.english,
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
