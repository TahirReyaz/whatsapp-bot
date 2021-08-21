// Supports ES6
// import { create, Whatsapp } from 'venom-bot';
const venom = require("venom-bot");
const truthOrDareFile = require("./data/truth-or-dare.json");
const axios = require("axios");
const malScraper = require("mal-scraper");
const acb = require("acb-api");
const bandcamp = require("bandcamp-scraper")
const nameToImdb = require("name-to-imdb");
const wyr = require("wyr");

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
                .reply(message.from, "Word not found.. Sorry. Check if the Command Syntax was wrong", message.id.toString())
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
      ////////////////////////////////////ANIME IDs/////////////////////////////////////
      case "AnimeIds": 
        RecievedMsgPermission = true;
        const charAnime = message.body.substring("AnimeIds".length);
        acb.get_anime_by_search(charAnime)
          .then(data => {
            data.forEach(result => {msgString += "\n*" + result.anime_id + "* - " + result.anime_name})
            msgString+= "\nGet the IDs of characters of an anime by sending 'AnimeChars <id>\nFor example\n*AnimeChars 101671*" 
            // Send the response to the sender
            client
              .reply(message.from, msgString, message.id.toString())
              .then(() => { console.log("Sent message: \n" + msgString + "\n--------------------"); })
              .catch(erro => { console.error("Error when sending Anime search results:\n", erro); });
            })
            .catch(err => { // Send not found to sender
              client
                .reply(message.from, "Anime not found.. Sorry. Check if the command syntax is wrong", message.id.toString())
                .then(() => { console.log(err) })
                .catch((erro) => { console.error("Error when sending error: ", erro); });
          });
      break;
      //////////////////////////////ANIME CHARACTERS IDs////////////////////////////////
      case "AnimeChars": 
        RecievedMsgPermission = true;
        const animeId = botQuery[1];
        acb.get_anime_by_id(animeId)
          .then(data => {
            // Set the fields to be sent in message
            msgString = data.anime_id + "- *" + data.anime_name + "*\n*Characters:*";
            data.characters.forEach(character => {msgString += "\n*" + character.id + "* - " + character.name});
            msgString += "\nGet details of a character by sending 'CharIdDetail <id>\nFor example\n*CharIdDetail 10820*";
            // Send the response to the sender
            client
            .sendImage(message.from, data.anime_image, null, msgString)
            .then(() => { console.log("Sent message: \n" + msgString + "\n--------------------"); })
            .catch(erro => { console.error("Error when sending character ids: ", erro); });
            })
            .catch(err => { // Send not found to sender
              client
                .reply(message.from, "Anime not found.. Sorry", message.id.toString())
                .then(() => { console.log(err) })
                .catch((erro) => { console.error("Error when sending error: ", erro); });
          });
      break;
      /////////////////////////ANIME CHARACTER DETAIL- BY SEARCH////////////////////////
      case "CharDetail": 
        RecievedMsgPermission = true;
        const charName = message.body.substring("CharDetail ".length);
        acb.get_character_by_search(charName)
          .then((data) => {
            // Set the fields to be sent in message
            composeMsg = [
              "*Name* : ", data[0].name,
              "\n*Gender* : ", data[0].gender,
              "\n*ID* : ", data[0].id,
              "\n*Description* : ", data[0].desc
            ];
            if(data.length > 1) {
              let idString = "";
              data.forEach(result => {idString += "\n*" + result.id + "* - " + result.anime_name}) 
                composeMsg.push (
                "\n\n*IDs of characters with similar name:*", idString,
                "\nGet Details of other characters by sending *CharIdDetail <id>*"
              );
            }
            composeMsg.forEach( txt => { msgString += txt; });
            // Send the response to the sender
            client
              .sendImage(message.from, data[0].character_image, null, msgString)
              .then(() => { console.log("Sent message: \n" + msgString + "\n--------------------"); })
              .catch(erro => { console.error("Error when sending character details: ", erro); });
            })
            .catch(err => { // Send not found to sender
              client
                .reply(message.from, 
                  "Character not found.. Sorry.\nCheck if the command syntax is right or not.\nDon't get confused by similar looking commands.", 
                  message.id.toString())
                .then(() => { console.log(err) })
                .catch((erro) => { console.error("Error when sending error: ", erro); });
          });
      break;
      ////////////////////////////////////MOVIE DETAIL//////////////////////////////////
      case "MovieDetail": 
        RecievedMsgPermission = true;
        const movieName = message.body.substring("MovieDetail ".length);
        nameToImdb(movieName, function(error, res, inf) { 
          if(!error) {
            // Set the fields to be sent in message
            composeMsg = [
              "*ID* : ", inf.meta.id,
              "\n*Name* : ", inf.meta.name,
              "\n*Year* : ", inf.meta.year,
              "\n*Type* : ", inf.meta.type,
              "\n*Year Range* : ", inf.meta.yearRange,
              "\n*Starring* : ", inf.meta.starring,
              "\n*Similarity* : ", inf.meta.similarity,
            ];
            composeMsg.forEach( txt => { msgString += txt; });
            // Send the response to the sender
            client
              .sendImage(message.from, inf.meta.image.src, null, msgString)
              .then(() => { console.log("Sent message: \n" + msgString + "\n--------------------"); })
              .catch(erro => { console.error("Error when sending character details: ", erro); });
          }
          else { // Send not found to sender
              client
                .reply(message.from, 
                  "Character not found.. Sorry.\nCheck if the command syntax is right or not.\nDon't get confused by similar looking commands.", 
                  message.id.toString())
                .then(() => { console.log(error) })
                .catch((erro) => { console.error("Error when sending error: ", erro); });
          }
        });
      break;
      ///////////////////////////////SONG DETAIL- BY SEARCH/////////////////////////////
      case "SongSearch": 
        RecievedMsgPermission = true;
        const songName = message.body.substring("SongSearch ".length);
        bandcamp.search({query: songName, page: 1}, (error, searchResults) => {
          if(!error) {
            let tagString = "", songImgUrl;
            searchResults.forEach(result => {
              if(result.type === "track") {
                result.tags.every(tag => {tagString += tag + ", "}) 
                // Set the fields to be sent in message
                composeMsg = [
                  "*Name* : ", result.name,
                  "\n*Type* : ", result.type,
                  "\n*Artist* : ", result.artist,
                  "\n*Tags* : ", tagString,
                ];
                songImgUrl = result.imageUrl;
                return false;
              }
              return true;
            })
            composeMsg.forEach( txt => { msgString += txt; });
            // Send the response to the sender
            client
              .sendImage(message.from, songImgUrl, null, msgString)
              .then(() => { console.log("Sent message: \n" + msgString + "\n--------------------"); })
              .catch(erro => { console.error("Error when sending character details: ", erro); });
            }
          else { // Send not found to sender
              client
                .reply(message.from, 
                  "Character not found.. Sorry.\nCheck if the command syntax is right or not.\nDon't get confused by similar looking commands.", 
                  message.id.toString())
                .then(() => { console.log(error) })
                .catch((erro) => { console.error("Error when sending error: ", erro); });
          }
        });
      break;
      ///////////////////////////ANIME CHARACTER DETAIL- BY ID//////////////////////////
      case "CharIdDetail": 
        RecievedMsgPermission = true;
        const charId = botQuery[1];
        acb.get_character_by_id(charId)
          .then(data => {
            // Set the fields to be sent in message
            composeMsg = [
              "*Name* : ", data.name,
              "\n*Gender* : ", data.gender,
              "\n*ID* : ", data.id,
              "\n*Description* : ", data.desc,
            ];
            composeMsg.forEach( txt => { msgString += txt; });
            // Send the response to the sender
            client
              .sendImage(message.from, data.character_image, null, msgString)
              .then(() => { console.log("Sent message: \n" + msgString + "\n--------------------"); })
              .catch(erro => { console.error("Error when sending kanji definition: ", erro); });
            })
            .catch(err => { // Send not found to sender
              client
                .reply(message.from, "Character not found.. Sorry", message.id.toString())
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
        wyr().
          then(response => {
            composeMsg = [
              "Would you rather:",
              "\n*A* : ", response.blue.question, "\nOr",
              "\n*B* : ", response.red.question
            ]
            composeMsg.forEach(txt => {msgString += txt}); 
            // Send the response to the sender
            client
              .reply(message.from, msgString, message.id.toString())
              .then(() => { console.log("Sent message: " + msgString + "\n-------------------"); })
              .catch(error => { console.error("Error when sending truth: ", error); });
        })
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
          "\nFor example:\n*BotRoast Tahir*",
          "\n--------------------------------------------------",
          "\n3. For Truth or Dare Game:\nSend 'BotTruth' for getting a truth question\nSend 'BotDare' for getting a dare",
          "\nFor example:\n*BotTruth* or *BotDare*",
          "\n--------------------------------------------------",
          "\n4. For getting a 'Would You Rather' question:\nSend 'BotWyr'",
          "\nFor example:\n*BotWyr*",
          "\n--------------------------------------------------",
          "\n5. For getting the meaning of an English word:\nSend 'EnglishDefine <Word>'",
          "\nFor example:\n*EnglishDefine table*",
          "\n--------------------------------------------------",
          "\n6. For getting the details of a movie or a series:\nSend 'MovieDetail <title>'",
          "\nFor example:\n*MovieDetail Daredevil*",
          "\n--------------------------------------------------",
          "\n7. For getting the Anime commands:\nSend 'AnimeHelp",
          "\nFor example:\n*AnimeHelp*",
          "\n--------------------------------------------------",
          "\n8. For getting the details of a Kanji:nSend 'KanjiDefine <Kanji>'",
          "\nFor example:\n*KanjiDefine 空*",
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
      ////////////////////////////////////ANIME MENU/////////////////////////////////////
      case "AnimeHelp":
        RecievedMsgPermission = true;
        // Compose the message
        composeMsg = [
          "1. For getting the details of an Anime:\nSend 'AnimeDetail <Title>'",
          "\nFor example:\n*AnimeDetail Naruto*",
          "\n--------------------------------------------------",
          "\n2. For getting details of an Anime character by search:\nSend 'CharDetail <Name>'",
          "\nFor example:\n*CharDetail Kakashi*",
          "\n--------------------------------------------------",
          "\n3. For getting details of an Anime character by id:\nSend 'CharIdDetail <id>'",
          "\nFor example:\n*CharIdDetail 10820*",
          "\n--------------------------------------------------",
          "\n4. For getting IDs of an Anime by search:\nSend 'AnimeIds <Anime name or Title>'",
          "\nFor example:\n*AnimeIds Naruto*",
          "\n--------------------------------------------------",
          "\n5. For getting character list and character Ids of an Anime by anime id:\nSend 'AnimeChars <AnimeId>'",
          "\nFor example:\n*AnimeChars 100053*",
          "\n--------------------------------------------------",
          "\n6. For getting other Commands:\nSend 'HelpBot'",
          "\nFor example:\n*HelpBot*",
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