const wyr = require("wyr");

const { sendButtons } = require("./venomFunctions");
const truthOrDareFile = require("../data/truth-or-dare.json");

module.exports.truthOrDare = (client, sender, type) => {
  let resId,
    res,
    resLevel,
    msgString = "";
  do {
    resId = Math.floor(Math.random() * 425); // 424 is the number of entries in the truth-or-dare.json file
    res = truthOrDareFile.truthNdares[resId].summary;
    resLevel = truthOrDareFile.truthNdares[resId].level;
  } while (truthOrDareFile.truthNdares[resId].type != type);
  const composeMsg = [type, ": ", res, "\n", "Level: ", resLevel];
  composeMsg.forEach((txt) => {
    msgString += txt;
  });
  buttonsArray = [
    { buttonId: "truth", buttonText: { displayText: ".truth" }, type: 1 },
    { buttonId: "dare", buttonText: { displayText: ".dare" }, type: 1 },
    { buttonId: "ghelp", buttonText: { displayText: ".ghelp" }, type: 1 },
  ];
  // Send the response to the sender
  sendButtons(
    client,
    sender,
    msgString,
    "Click on the buttons for help and other games",
    buttonsArray,
    "Error when sending truth or dare: "
  );
};

module.exports.wouldYouRather = (client, sender) => {
  let msgString = "";
  wyr()
    .then((response) => {
      buttonsArray = [
        {
          buttonId: "wyr1",
          buttonText: { displayText: response.blue.question },
          type: 1,
        },
        {
          buttonId: "wyr2",
          buttonText: { displayText: response.red.question },
          type: 1,
        },
        {
          buttonId: "ghelp",
          buttonText: { displayText: ".ghelp" },
          type: 1,
        },
      ];
      const composeMsg = [
        "Click on an option to choose it",
        "\nA: ",
        response.blue.question,
        "\nB: ",
        response.red.question,
      ];
      composeMsg.forEach((txt) => {
        msgString += txt;
      });
      // Send the response to the sender
      sendButtons(
        client,
        sender,
        "Would you rather:",
        msgString,
        buttonsArray,
        "Error when sending wyr: "
      );
    })
    .catch((err) => {
      // Send not found to sender
      buttonsArray = [
        {
          buttonId: "wyr",
          buttonText: { displayText: ".wyr" },
          type: 1,
        },
        {
          buttonId: "ghelp",
          buttonText: { displayText: "GameHelp" },
          type: 1,
        },
        {
          buttonId: "help",
          buttonText: { displayText: ".help" },
          type: 1,
        },
      ];
      sendButtons(
        client,
        sender,
        "Question not found.. Sorry\nTry again",
        "Chose the buttons for examples and menu",
        buttonsArray,
        "Error when sending error: "
      );
      console.log(err);
    });
};
