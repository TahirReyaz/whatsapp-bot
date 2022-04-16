const tf = require("@tensorflow-models/toxicity");
const _ = require("lodash");

const { sendReply } = require("./venomFunctions");
let model;

(async () => {
  model = await tf.load();
  console.log("Sentiment Analysis Modal Loaded");
})();

const analyzeText = async (client, sendIn, replyTo, text) => {
  const predictions = await model.classify(text);

  const msg = [`Text Analysis`, "------------------------------", ""];

  predictions.forEach((prediction) => {
    let label = _.capitalize(prediction.label.split("_").join(" "));
    msg.push(
      `*${label}* - ${(prediction.results[0].probabilities[1] * 100).toFixed(
        2
      )}%`
    );
  });

  sendReply(
    client,
    sendIn,
    msg.join("\n"),
    replyTo,
    "Error when sending message: "
  );

  return msg;
};

module.exports = {
  analyzeText,
};
