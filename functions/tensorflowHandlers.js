const tf = require("@tensorflow-models/toxicity");

const { sendReply } = require("./venomFunctions");
let model;

(
  async () => {
    model = await tf.load();
    console.log("Sentiment Analysis Modal Loaded");
  }
)();

const analyzeText = async (client, sendIn, replyTo, text) => {
      sendReply(
        client,
        sendIn,
        "*Analyzing your text.... please wait*",
        replyTo,
        "Error when sending message: "
    )
    
  const predictions = await model.classify(text);
  
  const values = [`Text Analysis`]; 

  predictions.forEach(prediction => {
    let value = prediction.label;
    values.push(`${value}  -  ${(prediction.results[0].probabilities[1]*100).toFixed(2)}%`);
  });

    sendReply(
        client,
        sendIn,
        values.join("\n"),
        replyTo,
        "Error when sending message: "
    )
    
  return values;
  
};

module.exports = {
    analyzeText
};