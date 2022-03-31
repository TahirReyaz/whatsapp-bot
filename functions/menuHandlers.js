const { sendListMenu } = require("./venomFunctions");

module.exports.botMenu = (client, sender) => {
  let msgString = "";

  // Compose the message
  const composeMsg = [
    "Check out the bottom menu for commands👇",
    "\nFor making stickers: ",
    "\nSend the image with caption *.sticker*",
    "\nFor extracting text from image (ocr):",
    "\nSend the image with caption *.ocr*",
    "\n--------------------------------------------------",
    "\n```There is no case sensitivity or need to type . in front of the full commands```",
  ];
  composeMsg.forEach((txt) => {
    msgString += txt;
  });

  // Configuring the list menu
  list = [
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
          description:
            "For checking out today's Horoscope\nShort command: .hsm",
        },
        {
          title: "GroupRoles",
          description:
            "For activating certain commands in a group (Admin only)",
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

  sendListMenu(
    client,
    sender,
    "Welcome to THE BOT",
    "Help and all commands",
    msgString,
    "Commands",
    list
  );
};
