// Supports ES6
// import { create, Whatsapp } from 'venom-bot';
const venom = require("venom-bot");
const truthOrDareFile = require("./data/truth-or-dare.json");
const axios = require("axios");
const malScraper = require("mal-scraper");
const acb = require("acb-api");
const bandcamp = require("bandcamp-scraper")
const wyr = require("wyr");
require('dotenv').config();

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
    let name, animeName, charName, charAnime, movieName, songName; 
    let queryPermission = true;
    switch(botQuery[0]) {
      //////////////////////////////////////HI BOT//////////////////////////////////////
      case "HiBot" :
      case "Hibot" :
      case "hibot" :
        RecievedMsgPermission = true;
        client
          .reply(message.from, "Bot dikha nhi ki mu utha kr chale aye.\nSend 'HelpBot' for commands", message.id.toString())
          .then(() => { console.log("Reply sent\n------------------------------"); })
          .catch((erro) => { console.error('Error when sending: ', erro); });
      break;
      //////////////////////////////////////ROAST///////////////////////////////////////
      case ".roast":
        name = message.body.substring(".roast ".length);
        queryPermission = false;
      case "BotRoast":
        if(queryPermission) {
          name = message.body.substring("BotRoast ".length);
          queryPermission = false;
        }
      case "Botroast":
        if(queryPermission) {
          name = message.body.substring("Botroast ".length);
          queryPermission = false;
        }
      case "botroast":
        RecievedMsgPermission = true;
        if(queryPermission) {
          name = message.body.substring("botroast ".length);
        }
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
      case ".kd":
      case "KanjiDef":
      case "KanjiDefine":
      case "Kanjidefine":
      case "kanjidefine":
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
      case ".ed":
      case "Engdef":
      case "EnglishDefine":
      case "Englishdefine":
      case "englishdefine":
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
      case ".ad": 
        animeName = message.body.substring(".ad ".length);
        queryPermission = false;
      case "AnimeDetail": 
        if(queryPermission) {
          animeName = message.body.substring("AnimeDetail ".length);
          queryPermission = false;
        }
      case "Animedetail": 
        if(queryPermission) {
          animeName = message.body.substring("Animedetail ".length);
          queryPermission = false;
        }
      case "animedetail": 
        RecievedMsgPermission = true;
        if(queryPermission) {
          animeName = message.body.substring("animedetail ".length);
          queryPermission = false;
        }
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
      case ".aid": 
        charAnime = message.body.substring(".aid ".length);
        queryPermission = false;
      case "AnimeIds": 
        if(queryPermission) {
          charAnime = message.body.substring("AnimeIds ".length);
          queryPermission = false;
        }
      case "Animeids": 
        if(queryPermission) {
          charAnime = message.body.substring("Animeids ".length);
          queryPermission = false;
        }
      case "animeids": 
        RecievedMsgPermission = true;
        if(queryPermission) {
          charAnime = message.body.substring("animeids ".length);
          queryPermission = false;
        }
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
      case ".ac": 
      case "AnimeChars": 
      case "AnimeChars": 
      case "animechars": 
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
      case ".cd":
        charName = message.body.substring(".cd ".length);
        queryPermission = false;
      case "CharDetail": 
        if(queryPermission) {
          charName = message.body.substring("CharDetail ".length);
          queryPermission = false;
        }
      case "Chardetail": 
        if(queryPermission) {
          charName = message.body.substring("Chardetail ".length);
          queryPermission = false;
        }
      case "chardetail": 
        RecievedMsgPermission = true;
        if(queryPermission) {
          charName = message.body.substring("chardetail ".length);
          queryPermission = false;
        }
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
      case ".md":
        movieName = message.body.substring(".md ".length);
        queryPermission = false;
      case "MovieDetail": 
        if(queryPermission) {
          movieName = message.body.substring("MovieDetail ".length);
          queryPermission = false;
        }
      case "Moviedetail":
        if(queryPermission) {
          movieName = message.body.substring("Moviedetail ".length);
          queryPermission = false;
        }
      case "moviedetail":
        RecievedMsgPermission = true;
        if(queryPermission) {
          movieName = message.body.substring("moviedetail ".length);
          queryPermission = false;
        }
        axios
        .get("https://www.omdbapi.com/?apikey=" + process.env.OMDB_API_KEY + "&t=" + movieName)
        .then( response => {
          // Set the fields of the message
            composeMsg = [
              "*Title* : ", response.data.Title,
              "\n*Type* : ", response.data.Type,
              "\n*Year* : ", response.data.Year,
              "\n*Rated* : ", response.data.Rated,
              "\n*Released* : ", response.data.Released,
              "\n*Run-time* : ", response.data.Runtime,
              "\n*Genre* : ", response.data.Genre,
              "\n*Director* : ", response.data.Director,
              "\n*Writer* : ", response.data.Writer,
              "\n*Actors* : ", response.data.Actors,
              "\n*Language* : ", response.data.Language,
              "\n*Country* : ", response.data.Country,
              "\n*Awards* : ", response.data.Awards,
              "\n*IMDB rating* : ", response.data.imdbRating,
              "\n*Plot* : ", response.data.Plot
            ];
          // Convert the array into text string
          composeMsg.forEach(txt => { msgString += txt; });
          // Send the response to the sender
          if(response.data.Response === "True") { // If the movie was found then send the details and poster
            if(response.data.Poster === "N/A") { // If there is no poster then send only the details
              client
                .reply(message.from, msgString, message.id.toString())
                .then(() => { console.log("Sent message: " + msgString + "\n-------------------"); })
                .catch((erro) => { console.error("Error when sending: ", erro); });            
            } else { // If there is a poster then send the details with the poster           
              client
                .sendImage(message.from, response.data.Poster, null, msgString)
                .then(() => { console.log("Sent message: " + msgString + "\n-------------------"); })
                .catch((erro) => { console.error("Error when sending: ", erro); });            
            }          
          } else {
            client
              .reply(message.from, "Movie/ Series not found.. Sorry. Check the spelling", message.id.toString())
              .then(() => { console.log(response.data.Error) })
              .catch((erro) => { console.error("Error when sending error: ", erro); });
          }
        })
        .catch(function (err) {
          client
            .reply(message.from, "Movie/ Series not found.. Sorry. Check if the Command Syntax was wrong", message.id.toString())
            .then(() => { console.log(err) })
            .catch((erro) => { console.error("Error when sending error: ", erro); });
        });
      break;
      ///////////////////////////////SONG DETAIL- BY SEARCH/////////////////////////////
      case ".ss":
      case "SongSearch": 
      case "Songsearch": 
      case "songsearch": 
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
      case ".cid": 
      case "CharIdDetail": 
      case "Chariddetail": 
      case "chariddetail": 
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
      case ".truth":
      case "BotTruth":
      case "Bottruth":
      case "bottruth":
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
      case ".dare":
      case "BotDare":
      case "Botdare":
      case "botdare":
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
      case ".wyr":
      case "BotWyr":
      case "Botwyr":
      case "botwyr":
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
      case ".help":
      case "BotHelp":
      case "Bothelp":
      case "HelpBot":
      case "Helpbot":
      case "helpbot":
        RecievedMsgPermission = true;
        // Compose the message
        composeMsg = [
          "1. For just getting a reply:\nSend ' *HiBot* ' (without the ')",
          "\n--------------------------------------------------",
          "\n2. For roasting someone:\nSend 'BotRoast <Name>' | Short Command: *.roast* <Name>",
          "\nFor example:\n*BotRoast Tahir*",
          "\n--------------------------------------------------",
          "\n3. For Truth or Dare Game:", 
          "\nSend 'BotTruth' for getting a truth question | Short Command: *.truth*",
          "\n\nSend 'BotDare' for getting a dare | Short Command: *.dare*",
          "\nFor example:\n*BotTruth* or *BotDare*",
          "\n--------------------------------------------------",
          "\n4. For getting a 'Would You Rather' question:",
          "\nSend 'BotWyr' | Short Command: *.wyr*",
          "\nFor example:\n*BotWyr*",
          "\n--------------------------------------------------",
          "\n5. For getting the meaning of an English word:",
          "\nSend 'EnglishDefine <Word>' | Short Command: *.ed* <word>",
          "\nFor example:\n*EnglishDefine table*",
          "\n--------------------------------------------------",
          "\n6. For getting the details of a movie or a series:",
          "\nSend 'MovieDetail <title>' | Short Command: *.md* <title>",
          "\nFor example:\n*MovieDetail Daredevil*",
          "\n--------------------------------------------------",
          "\n7. For getting the Anime commands:",
          "\nSend 'AnimeHelp | Short Command: *.ahelp*",
          "\nFor example:\n*AnimeHelp*",
          "\n--------------------------------------------------",
          "\n8. For getting the details of a Kanji:",
          "\nSend 'KanjiDefine <Kanji>' | Short Command: *.kd* <Kanji>",
          "\nFor example:\n*KanjiDefine 空*",
          "\n```There is no case sensitiviy for full commands```"
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
      case ".ahelp":
      case "AnimeHelp":
      case "Animehelp":
      case "animehelp":
        RecievedMsgPermission = true;
        // Compose the message
        composeMsg = [
          "1. For getting the details of an Anime:",
          "\nSend 'AnimeDetail <Title>' | Short Command: *.ad* <Title>",
          "\nFor example:\n*AnimeDetail Naruto*",
          "\n--------------------------------------------------",
          "\n2. For getting details of an Anime character by search:",
          "\nSend 'CharDetail <Name>' | Short Command: *.cd* <Name>",
          "\nFor example:\n*CharDetail Kakashi*",
          "\n--------------------------------------------------",
          "\n3. For getting details of an Anime character by id:",
          "\nSend 'CharIdDetail <id>' | Short Command: *.cid* <id>",
          "\nFor example:\n*CharIdDetail 10820*",
          "\n--------------------------------------------------",
          "\n4. For getting IDs of an Anime by search:",
          "\nSend 'AnimeIds <Anime name or Title>' | Short Command: *.aid* <Name or Title>",
          "\nFor example:\n*AnimeIds Naruto*",
          "\n--------------------------------------------------",
          "\n5. For getting character list and character Ids of an Anime by anime id:",
          "\nSend 'AnimeChars <AnimeId>' | Short Command: *.ac* <AnimeId>",
          "\nFor example:\n*AnimeChars 100053*",
          "\n--------------------------------------------------",
          "\n6. For getting other Commands:",
          "\nSend 'HelpBot' | Short Command: *.help*",
          "\nFor example:\n*HelpBot*",
          "\n```There is no case sensitiviy for full commands```"
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