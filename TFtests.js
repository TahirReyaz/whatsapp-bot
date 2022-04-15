const tf = require("@tensorflow-models/toxicity");

const analyzeText = async (text) => {
	const model = await tf.load();
  const predictions = await model.classify(text);
  
  const values = []; 

  predictions.forEach(prediction => {
    let value = prediction.label;
    values.push(`${value}  -  ${(prediction.results[0].probabilities[1]*100).toFixed(2)}%`);
  });

  return values;
  
};

analyzeText("son of a bitch").then((result) => {
  console.log(result);
});
