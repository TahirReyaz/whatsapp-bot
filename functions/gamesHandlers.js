const { sendButtons } = require("./venomFunctions");
const truthOrDareFile = require("../data/truth-or-dare.json");

module.exports.truth = (client, sender) => {
  let truthid,
    truth,
    truthLevel,
    msgString = "";
  do {
    truthid = Math.floor(Math.random() * 425); // 424 is the number of entries in the truth-or-dare.json file
    truth = truthOrDareFile.truthNdares[truthid].summary;
    truthLevel = truthOrDareFile.truthNdares[truthid].level;
  } while (truthOrDareFile.truthNdares[truthid].type != "Truth");
  const composeMsg = ["Truth: ", truth, "\n", "Level: ", truthLevel];
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
    "Error when sending truth: "
  );
};
