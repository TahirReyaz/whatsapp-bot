const { sendListMenu } = require("./venomFunctions");

const botMenuList = [
  {
    title: "General Commands",
    rows: [
      {
        title: "HiBot",
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
        title: ".sticker",
        description:
          "To generate stickers, reply to the image or gif with .sticker",
      },
      {
        title: ".feel",
        description:
          "To extract the feelings from a text using machine learning. Reply to a text message with *.feel*",
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
  "--------------------------------------------------",
  "```There is no case sensitivity or need to type . in front of the full commands```",
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
  "For example:\n*SongDetail Faded-Alan Walker*",
  "--------------------------------------------------",
  "```There is no case sensitivity or need to type . in front of the full commands```",
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
  "1. To get the meaning of an English word:",
  "Send 'EnglishDefine <Word>' | Short Command: *.ed* <word>",
  "For example:\n*EnglishDefine table*",
  "--------------------------------------------------",
  "2. For searching wiki page IDs of a term:",
  "Send '.wiki <term>'",
  "For example:\n*.wiki Indian Population*",
  "--------------------------------------------------",
  "3. To get the details of wiki page from page ID:",
  "Send 'wikiPage <page ID>' | Short Command: *.wp* <page ID>",
  "For example:\n*wikiPage 14598*",
  "--------------------------------------------------",
  "4. For calculating:",
  "Send '.calc <expression>'",
  "For example:\n*.calc 5*34*",
  "For using multiple expressions:",
  "Send '.calc <expressions as array>",
  "For example:\n*.calc [5+2, 4*6, a= 24, a+3]*",
  "--------------------------------------------------",
  "5. To get the details of a Kanji:",
  "Send 'KanjiDefine <Kanji>' | Short Command: *.kd* <Kanji>",
  "For example:\n*KanjiDefine 空*",
  "--------------------------------------------------",
  "6. To get other Commands:",
  "Send 'HelpBot' | Short Command: *.help*",
  "For example:\n*HelpBot*",
  "```There is no case sensitiviy for full commands```",
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
  "--------------------------------------------------",
  "1. For Truth or Dare Game:",
  "Send 'BotTruth' To get a truth question | Short Command: *.truth*",
  "\nSend 'BotDare' To get a dare | Short Command: *.dare*",
  "For example:\n*BotTruth* or *BotDare*",
  "--------------------------------------------------",
  "2. To get a 'Would You Rather' question:",
  "Send 'BotWyr' | Short Command: *.wyr*",
  "For example:\n*BotWyr*",
  "--------------------------------------------------",
  "3. To get other Commands:",
  "Send 'HelpBot' | Short Command: *.help*",
  "For example:\n*HelpBot*",
  "```There is no case sensitiviy for full commands```",
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
        title: ".cid 17",
        description: "To get details of an Anime Charater by ID",
      },
      {
        title: "mangasearch Naruto",
        description: "To search for the details of a manga",
      },
      {
        title: "HelpBot",
        description: "To get help about all commands.",
      },
    ],
  },
];
const animeMenuMsg = [
  "Checkout the bottom menu for commands",
  "",
  "To get help about all commands",
  "Send 'HelpBot' | Short Command: *.help*",
  "For example:\n*HelpBot*",
  "```There is no case sensitiviy for full commands```",
];

const roleMenuList = [
  {
    title: "Role Commands",
    rows: [
      {
        title: ".roles",
        description: "To check the available roles in the group",
      },
    ],
  },
];
const roleMenuMsg = [
  "Checkout the menu for roles related commands",
  "```There is no case sensitiviy for full commands```",
];

module.exports.sendMenu = (client, sender, title, type) => {
  let list, msg;

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
      list = roleMenuList;
      msg = roleMenuMsg;
      break;
    default:
      list = botMenuList;
      msg = botMenuMsg;
      break;
  }

  sendListMenu(
    client,
    sender,
    "Welcome to THE BOT",
    title,
    msg.join("\n"),
    "Commands",
    list
  );
};
