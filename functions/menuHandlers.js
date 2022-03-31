const { sendListMenu } = require("./venomFunctions");

const botMenuList = [
  {
    title: "General Commands",
    rows: [
      {
        title: "HiBot ",
        description: "For just getting a reply",
      },
      {
        title: ".poll <message>-<option 1>-<option 2>",
        description:
          "For creating polls. Example .poll Do you drink tea or coffee?-Tea-Coffee",
      },
      {
        title: ".talk Who are you",
        description: "To talk with an AI",
      },
      {
        title: ".remind 13:01",
        description:
          "For setting a reminder (In 24 hour format). Bot remind you at the specified time. Write the additional message in the next line",
      },
      {
        title: "@everyone <message>",
        description: "For tagging everyone like discord",
      },
      {
        title: "horoscopeMenu",
        description: "For checking out today's Horoscope\nShort command: .hsm",
      },
      {
        title: "GroupRoles",
        description: "For activating certain commands in a group (Admin only)",
      },
      {
        title: "InfoHelp ",
        description:
          "To get Information related commands like wiki, dictionary, maths etc.",
      },
      {
        title: "GameHelp ",
        description:
          "To get help and commands related to Games like truth or dare, Would you rather etc.",
      },
      {
        title: "EntHelp ",
        description:
          "To get Entertainment related commands like movie, song, anime detail and lyrics",
      },
      {
        title: "AnimeHelp ",
        description: "To get help and commands related to Anime",
      },
    ],
  },
];
const botMenuMsg = [
  "Check out the bottom menu for commands👇",
  "\nFor making stickers: ",
  "\nSend the image with caption *.sticker*",
  "\nFor extracting text from image (ocr):",
  "\nSend the image with caption *.ocr*",
  "\n--------------------------------------------------",
  "\n```There is no case sensitivity or need to type . in front of the full commands```",
];

const entMenuList = [
  {
    title: "Entertainment and Media Related Commands",
    rows: [
      {
        title: "MovieDetail Inception",
        description:
          "To get the details of a Movie/ Series | Short Command: .md <title>",
      },
      {
        title: "SongDetail Faded-Alan Walker",
        description:
          "To get the details of a song | Short Command: .sd <Song name>",
      },
      {
        title: ".lyrics Faded-Alan Walker",
        description: "To get the lyrics of a song",
      },
      {
        title: "AnimeHelp ",
        description: "To get help and list of Anime related commands",
      },
      {
        title: "HelpBot ",
        description: "To get help and list of all commands.",
      },
    ],
  },
];
const entMenuMsg = [
  "If you didn't get the desired result then put the name of the artist too with a hyphen ( - )",
  "\nFor example:\n*SongDetail Faded-Alan Walker*",
  "\n--------------------------------------------------",
  "\n```There is no case sensitivity or need to type . in front of the full commands```",
];

const infoMenuList = [
  {
    title: "Info Related Commands",
    rows: [
      {
        title: "EnglishDefine Table",
        description: "To get the definition of an English word",
      },
      {
        title: ".wiki Indian Population",
        description: "For searching a term on Wikipedia",
      },
      {
        title: "wikiPage 14598",
        description: "To get the details of wiki page.",
      },
      {
        title: ".calc 5*34",
        description: "For calculating",
      },
      {
        title: ".calc [5+2, 4*6, a= 24, a+3,5.08 cm in inch,sin(45 deg) ^ 2]",
        description: "For using multiple expressions:",
      },
      {
        title: "KanjiDefine 空",
        description: "For readings and meaning of a Kanji.",
      },
      {
        title: "HelpBot ",
        description: "To get help and list of all commands.",
      },
    ],
  },
];
const infoMenuMsg = [
  "\n1. To get the meaning of an English word:",
  "\nSend 'EnglishDefine <Word>' | Short Command: *.ed* <word>",
  "\nFor example:\n*EnglishDefine table*",
  "\n--------------------------------------------------",
  "\n2. For searching wiki page IDs of a term:",
  "\nSend '.wiki <term>'",
  "\nFor example:\n*.wiki Indian Population*",
  "\n--------------------------------------------------",
  "\n3. To get the details of wiki page from page ID:",
  "\nSend 'wikiPage <page ID>' | Short Command: *.wp* <page ID>",
  "\nFor example:\n*wikiPage 14598*",
  "\n--------------------------------------------------",
  "\n4. For calculating:",
  "\nSend '.calc <expression>'",
  "\nFor example:\n*.calc 5*34*",
  "\nFor using multiple expressions:",
  "\nSend '.calc <expressions as array>",
  "\nFor example:\n*.calc [5+2, 4*6, a= 24, a+3]*",
  "\n--------------------------------------------------",
  "\n5. To get the details of a Kanji:",
  "\nSend 'KanjiDefine <Kanji>' | Short Command: *.kd* <Kanji>",
  "\nFor example:\n*KanjiDefine 空*",
  "\n--------------------------------------------------",
  "\n6. To get other Commands:",
  "\nSend 'HelpBot' | Short Command: *.help*",
  "\nFor example:\n*HelpBot*",
  "\n```There is no case sensitiviy for full commands```",
];

const gameMenuList = [
  {
    title: "Game Commands",
    rows: [
      {
        title: "BotDare ",
        description: "To get a dare",
      },
      {
        title: "BotTruth ",
        description: "To get a truth question",
      },
      {
        title: "BotWyr ",
        description: "To get a 'Would You Rather' question",
      },
      {
        title: "HelpBot ",
        description: "To get help and list of all commands.",
      },
    ],
  },
];
const gameMenuMsg = [
  "```Text based Games related commands```",
  "\n--------------------------------------------------",
  "\n1. For Truth or Dare Game:",
  "\nSend 'BotTruth' To get a truth question | Short Command: *.truth*",
  "\n\nSend 'BotDare' To get a dare | Short Command: *.dare*",
  "\nFor example:\n*BotTruth* or *BotDare*",
  "\n--------------------------------------------------",
  "\n2. To get a 'Would You Rather' question:",
  "\nSend 'BotWyr' | Short Command: *.wyr*",
  "\nFor example:\n*BotWyr*",
  "\n--------------------------------------------------",
  "\n3. To get other Commands:",
  "\nSend 'HelpBot' | Short Command: *.help*",
  "\nFor example:\n*HelpBot*",
  "\n```There is no case sensitiviy for full commands```",
];

const animeMenuList = [
  {
    title: "Anime Commands",
    rows: [
      {
        title: "AnimeDetail Naruto",
        description: "To get the details of an Anime",
      },
      {
        title: "CharDetail Kakashi",
        description: "To get details of an Anime Charater by Search",
      },
      {
        title: "CharIdDetail 10820",
        description: "To get details of an Anime Charater by ID",
      },
      {
        title: "AnimeIds Naruto",
        description: "To get Character IDs of an anime",
      },
      {
        title: "AnimeChars 100053",
        description: "To get Character ID and list.",
      },
      {
        title: "HelpBot ",
        description: "To get help and list of all commands.",
      },
    ],
  },
];
const animeMenuMsg = [
  "1. To get the details of an Anime:",
  "\nSend 'AnimeDetail <Title>' | Short Command: *.ad* <Title>",
  "\nFor example:\n*AnimeDetail Naruto*",
  "\n--------------------------------------------------",
  "\n2. To get details of an Anime character by search:",
  "\nSend 'CharDetail <Name>' | Short Command: *.cd* <Name>",
  "\nFor example:\n*CharDetail Kakashi*",
  "\n--------------------------------------------------",
  "\n3. To get details of an Anime character by id:",
  "\nSend 'CharIdDetail <id>' | Short Command: *.cid* <id>",
  "\nFor example:\n*CharIdDetail 10820*",
  "\n--------------------------------------------------",
  "\n4. To get IDs of an Anime by search:",
  "\nSend 'AnimeIds <Anime name or Title>' | Short Command: *.aid* <Name or Title>",
  "\nFor example:\n*AnimeIds Naruto*",
  "\n--------------------------------------------------",
  "\n5. To get character list and character Ids of an Anime by anime id:",
  "\nSend 'AnimeChars <AnimeId>' | Short Command: *.ac* <AnimeId>",
  "\nFor example:\n*AnimeChars 100053*",
  "\n--------------------------------------------------",
  "\n6. To get other Commands:",
  "\nSend 'HelpBot' | Short Command: *.help*",
  "\nFor example:\n*HelpBot*",
  "\n```There is no case sensitiviy for full commands```",
];

module.exports.sendMenu = (client, sender, title, type) => {
  let msgString = "",
    list,
    msg;

  switch (type) {
    case "Help":
      list = botMenuList;
      msg = botMenuMsg;
      break;
    case "Ent":
      list = entMenuList;
      msg = entMenuMsg;
      break;
    case "Info":
      list = infoMenuList;
      msg = infoMenuMsg;
      break;
    case "Game":
      list = gameMenuList;
      msg = gameMenuMsg;
      break;
    case "Anime":
      list = animeMenuList;
      msg = animeMenuMsg;
      break;
    case "Role":
      list = animeMenuList;
      msg = animeMenuMsg;
      break;
    default:
      list = botMenuList;
      msg = botMenuMsg;
      break;
  }

  // Compose the message
  msg.forEach((txt) => {
    msgString += txt;
  });

  sendListMenu(
    client,
    sender,
    "Welcome to THE BOT",
    title,
    msgString,
    "Commands",
    list
  );
};
