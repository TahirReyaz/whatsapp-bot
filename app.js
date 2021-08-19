// Supports ES6
// import { create, Whatsapp } from 'venom-bot';
const venom = require("venom-bot");
const truthOrDareFile = require("./data/truth-or-dare.json");
const wyrFile = require("./data/wyr.json");
const axios = require("axios");
const malScraper = require("mal-scraper");


// Create the client
venom
  .create()
  .then((client) => start(client))
  .catch((erro) => { console.log(erro); });

// Start the client
function start(client) {
  client.onMessage((message) => {
    const data = message.body;
    const botQuery = data.split(" ");
    let composeMsg = [], msgString = "", RecievedMsgPermission = false;
    switch(botQuery[0]) {
      //////////////////////////////////////HI BOT//////////////////////////////////////
      case "HiBot" :
        RecievedMsgPermission = true;
        client
          .reply(message.from, "Bot dikha nhi ki mu utha kr chale aye.\nSend 'HelpBot' for commands", message.id.toString())
          .then(() => { console.log("Reply sent\n------------------------------"); })
          .catch((erro) => { console.error('Error when sending: ', erro); });
      break;
      //////////////////////////////////////ROAST///////////////////////////////////////
      case "BotRoast":
        RecievedMsgPermission = true;
        const name = message.body.substring("BotRoast ".length);
        axios
          .get("https://evilinsult.com/generate_insult.php?lang=en&type=json")
          .then(function (response) {
            // Abusive roasts
            if (
              response.data.number == "111" ||
              response.data.number === "119" ||
              response.data.number === "121" ||
              response.data.number === "10" ||
              response.data.number === "11"
            ) {
              composeMsg = ["Ooops..", " Please try again"];
              console.log(response.data.insult);
            } else {
              composeMsg = [ "Dear ", name, ", ", response.data.insult ];
            }
            composeMsg.forEach( txt => { msgString += txt; });
            // Send the response to the sender
            client
              .reply(message.from, msgString, message.id.toString())
              .then(() => { console.log("Sent message: " + msgString + "\n-------------------"); })
              .catch(erro => { console.error("Error when sending kanji definition: ", erro); });
          })
          .catch( error => { console.log(error); });
      break;
      /////////////////////////////////KANJI DEFINITION/////////////////////////////////
      case "KanjiDefine":
        RecievedMsgPermission = true;
        // Get the response from the api
        axios
          .get(encodeURI("https://kanjiapi.dev/v1/kanji/" + botQuery[1]))
          .then(function (res) {
            const kanjiData = res.data;
            let meaningString = "", kunString = "", onString = "", i;
            for(i=0; i< kanjiData.meanings.length; i++) { meaningString += kanjiData.meanings[i] + " , " }
            for(i=0; i< kanjiData.kun_readings.length; i++) { kunString += kanjiData.kun_readings[i] + " , " }
            for(i=0; i< kanjiData.on_readings.length; i++) { onString += kanjiData.on_readings[i] + " , " }
            // Set the fields to be sent in message
            composeMsg = [
              " *Kanji* : ", botQuery[1],
              "\n *Meanings* : ", meaningString,
              "\n *Kunyomi readings* : ", kunString,
              "\n *Onyomi readings* : ", onString
            ];
            composeMsg.forEach(function (txt) { msgString += txt; });
            // Send the response to the sender
            client
              .reply(message.from, msgString, message.id.toString())
              .then(() => { console.log("Sent message: " + msgString + "\n-------------------"); })
              .catch(erro => { console.error("Error when sending kanji definition: ", erro); });
          })
          .catch(err => { // Send not found to sender
            client
              .reply(message.from, "Word not found.. Sorry", message.id.toString())
              .then(() => { console.log(err) })
              .catch((erro) => { console.error("Error when sending error: ", erro); });
        });
      break;
      ////////////////////////////////////DICTIONARY////////////////////////////////////
      case "EnglishDefine":
        RecievedMsgPermission = true;
        let defNexample = [], i;
          // Get the response from the api
          axios
            .get("https://api.dictionaryapi.dev/api/v2/entries/en_US/" + botQuery[1])
            .then(function (response) {
              // Set the fields of the message
              response.data[0].meanings.forEach(meaning => {
                defNexample = [
                  meaning.partOfSpeech, " :  ", meaning.definitions[0].definition,
                  "\nFor Example  : ", meaning.definitions[0].example,
                  "\n---------------------------------------------------\n"
                ];
                // Store the definition and example in an array
                for(i=0; i<defNexample.length; i++) { composeMsg.push(defNexample[i]) }
              })
              // Convert the array into text string
              composeMsg.forEach(txt => { msgString += txt; });
              // Send the response to the sender
              client
                .reply(message.from, msgString, message.id.toString())
                .then(() => { console.log("Sent message: " + msgString + "\n-------------------"); })
                .catch((erro) => { console.error("Error when sending: ", erro); });
            })
            .catch(function (err) {
              client
                .reply(message.from, "Word not found.. Sorry", message.id.toString())
                .then(() => { console.log(err) })
                .catch((erro) => { console.error("Error when sending error: ", erro); });
            });
      break;
      ///////////////////////////////////ANIME DETAIL///////////////////////////////////
      case "AnimeDetail": 
        RecievedMsgPermission = true;
        const animeName = message.body.substring("AnimeDetail ".length);
        malScraper.getInfoFromName(animeName)
          .then((data) => {
            let genreString = "", i;
            for(i=0; i< data.genres.length; i++) {genreString += data.genres[i] + ", "}
            // Set the fields to be sent in message
            composeMsg = [
              " *Title* : ", data.title,
              "\n *Episodes* : ", data.episodes,
              "\n *Aired* : ", data.aired,
              "\n *Genres* : ", genreString,
              "\n *Synopsis* : ", data.synopsis.substring( 0, 450 ) + "..."
            ];
            composeMsg.forEach( txt => { msgString += txt; });
            // Send the response to the sender
            client
              .sendImage(message.from, data.picture, null, msgString)
              .then(() => { console.log("Sent message: \n" + msgString + "\n--------------------"); })
              .catch(erro => { console.error("Error when sending kanji definition: ", erro); });
            })
            .catch(err => { // Send not found to sender
              client
                .reply(message.from, "Anime not found.. Sorry", message.id.toString())
                .then(() => { console.log(err) })
                .catch((erro) => { console.error("Error when sending error: ", erro); });
          });
      break;
      ///////////////////////////////TRUTH OR DARE: TRUTH///////////////////////////////
      case "BotTruth":
        RecievedMsgPermission = true;
        let truthid, truth, truthLevel;
        do {
          truthid = Math.floor(Math.random() * 425); // 424 is the number of entries in the truth-or-dare.json file
          truth = truthOrDareFile.truthNdares[truthid].summary; 
          truthLevel = truthOrDareFile.truthNdares[truthid].level;
        }while(truthOrDareFile.truthNdares[truthid].type != "Truth")
        composeMsg = [ "Truth: ", truth, "\n", "Level: ", truthLevel];
        composeMsg.forEach( txt => { msgString += txt; });
        // Send the response to the sender
        client
          .reply(message.from, msgString, message.id.toString())
          .then(() => { console.log("Sent message: " + msgString + "\n-------------------"); })
          .catch(error => { console.error("Error when sending truth: ", error); });
      break;
      ////////////////////////////////TRUTH OR DARE: DARE///////////////////////////////
      case "BotDare":
        RecievedMsgPermission = true;
        let dareId, dare, DareLevel;
        do {
          dareId = Math.floor(Math.random() * 425); // 424 is the number of entries in the truth-or-dare.json file
          dare = truthOrDareFile.truthNdares[dareId].summary; 
          DareLevel = truthOrDareFile.truthNdares[dareId].level;
        }while(truthOrDareFile.truthNdares[dareId].type != "Dare")
        composeMsg = [ "Dare: ", dare, "\n", "Level: ", DareLevel];
        composeMsg.forEach( txt => { msgString += txt; });
        // Send the response to the sender
        client
          .reply(message.from, msgString, message.id.toString())
          .then(() => { console.log("Sent message: " + msgString + "\n-------------------"); })
          .catch(error => { console.error("Error when sending truth: ", error); });
      break;
      /////////////////////////////////WOULD YOU RATHER/////////////////////////////////
      case "BotWyr":
        RecievedMsgPermission = true;
        let wyrNo;
        wyrNo = Math.floor(Math.random() * 241); // 240 is the number of entries in the wyr.json file
        msgString = wyrFile.questions[wyrNo].question; 
        // Send the response to the sender
        client
          .reply(message.from, msgString, message.id.toString())
          .then(() => { console.log("Sent message: " + msgString + "\n-------------------"); })
          .catch(error => { console.error("Error when sending truth: ", error); });
      break;
      /////////////////////////////////////BOT MENU/////////////////////////////////////
      case "BotHelp":
        RecievedMsgPermission = true;
        client
          .reply(message.from, "HelpBot", message.id.toString())
          .then(() => { console.log("Sent message: ", "HelpBot" + "\n-------------------------"); })
          .catch((erro) => { console.error("Error when sending: ", erro); });
      break;
      case "HelpBot":
        RecievedMsgPermission = true;
        // Compose the message
        composeMsg = [
          "1. For just getting a reply:\nSend ' *HiBot* ' (without the ')",
          "\n--------------------------------------------------",
          "\n2. For roasting someone:\nSend 'BotRoast <Name>'",
          "\n  For example:\n*BotRoast Tahir*",
          "\n--------------------------------------------------",
          "\n3. For Truth or Dare Game:\nSend 'BotTruth' for getting a truth question\nSend 'BotDare' for getting a dare",
          "\n  For example:\n*BotTruth* or *BotDare*",
          "\n--------------------------------------------------",
          "\n4. For getting a 'Would You Rather' question:\nSend 'BotWyr'",
          "\n  For example:\n*BotWyr*",
          "\n--------------------------------------------------",
          "\n5. For getting the meaning of an English word:\nSend 'EnglishDefine <Word>'",
          "\n  For example:\n*EnglishDefine table*",
          "\n--------------------------------------------------",
          "\n6. For getting the details of an Anime:\nSend 'AnimeDetail <Title>'",
          "\n  For example:\n*AnimeDetail Naruto*",
          "\n--------------------------------------------------",
          "\n7. For getting the details of a Kanji:nSend 'KanjiDefine <Kanji>'",
          "\n  For example:\n*KanjiDefine 空*",
        ];
        composeMsg.forEach(function (txt) {
          msgString += txt;
        });
        // Send the message
        client
          .reply(message.from, msgString, message.id.toString())
          .then(() => { console.log("Sent message: ", msgString + "\n-------------------------"); })
          .catch((erro) => { console.error("Error when sending: ", erro); });
      break;
    }
    ////////////////////////////////MISCELLANEOUS FEATURES//////////////////////////////
    if (message.body === 'send contact' && message.isGroupMsg === false) {
      client
        .sendContactVcard(message.from, message.to, 'Tahir')
        .then((result) => {
          console.log('Result: ', result); //return object success
        })
        .catch((erro) => {
          console.error('Error when sending: ', erro); //return object error
        });
    } else if (message.body === 'reply kro' && message.isGroupMsg === false) {
      client
        .reply( message.from, "Are yaar tm so jao (Bot's words, not mine)", message.id.toString() );
    } else if (message.body === 'bhai ek help kr de' && message.isGroupMsg === false) {
      client
      .startTyping(message.from);
    }
    // Print the recived msg
    if(RecievedMsgPermission) {
      console.log("Recieved Message: ", data);
      RecievedMsgPermission = false;
    }
  });
}