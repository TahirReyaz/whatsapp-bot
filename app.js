// Supports ES6
// import { create, Whatsapp } from 'venom-bot';
const venom = require("venom-bot");
const truthOrDareFile = require("./data/truth-or-dare.json");
const axios = require("axios");
const malScraper = require("mal-scraper");
const acb = require("acb-api");
const musicInfo = require("music-info");
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
    // variables and constants required to make the data readable
    const data = message.body;
    const botQuery = data.split(" ");
    let composeMsg = [], msgString = "", RecievedMsgPermission = false;
    const queryCutter = botQuery[0] + " ";
    const query = data.substring(queryCutter.length);
    const wikiEndpoint = "https://en.wikipedia.org/w/api.php?", params = {};
    const songParams = {
      title: query
      // artist: "Kana Boon"
    }

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
      case "BotRoast":
      case "Botroast":
      case "botroast":
        RecievedMsgPermission = true;
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
          .get(encodeURI("https://kanjiapi.dev/v1/kanji/" + query))
          .then(function (res) {
            const kanjiData = res.data;
            let meaningString = "", kunString = "", onString = "", i;
            for(i=0; i< kanjiData.meanings.length; i++) { meaningString += kanjiData.meanings[i] + " , " }
            for(i=0; i< kanjiData.kun_readings.length; i++) { kunString += kanjiData.kun_readings[i] + " , " }
            for(i=0; i< kanjiData.on_readings.length; i++) { onString += kanjiData.on_readings[i] + " , " }
            // Set the fields to be sent in message
            composeMsg = [
              " *Kanji* : ", query,
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
            .get("https://api.dictionaryapi.dev/api/v2/entries/en_US/" + query)
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
      /////////////////////////////////WIKIPEDIA SEARCH/////////////////////////////////
      case ".wiki":
        RecievedMsgPermission = true;
        params = {
          origin: "*",
          format: "json",
          action: "query",
          prop: "extracts",
          exintro: true,
          explaintext: true,
          generator: "search",
          gsrlimit: 10,
          gsrsearch: query
        };
        axios
          .get(wikiEndpoint, { params })
          .then(response => {
            if(response.data.query) { // If the page is found then query exists
              const wikis = Object.values(response.data.query.pages)
              // Set the fields to be sent in message
              composeMsg = ["Use the Page IDs for further details"];
              wikis.forEach(wiki => {
                composeMsg.push(
                  "\n*Title* : ", wiki.title,
                  " - *Page ID* : ", wiki.pageid
                );
              });
              composeMsg.push("\nSend 'wikiPage <Page ID>' for further details");
              composeMsg.forEach( txt => { msgString += txt; });
              // Send the response to the sender
              client
                .reply(message.from, msgString, message.id.toString())
                .then(() => { console.log("Sent message: \n" + msgString + "\n--------------------"); })
                .catch(erro => { console.error("Error when wiki page IDs: ", erro); });
            } else {
              client
                .reply(message.from,
                  "```Search Results Not Found```\nCheck the syntax and search term\nDon't get confused with similar commands\nCheck them by sending *InfoHelp*",
                  message.id.toString()
                )
                .then(() => { console.log("Results Not found\n-------------------------")})
                .catch(erro => { console.error("Error when sending error: ", erro); });
            }
          })
          .catch(error => {
            console.log(error);
          })
      break;
      //////////////////////////////////WIKIPEDIA PAGE//////////////////////////////////
      case ".wp":
      case "wikiPage":
      case "WikiPage":
      case "wikipage":
        RecievedMsgPermission = true;
        params = {
          origin: "*",
          format: "json",
          action: "query",
          prop: "extracts",
          pageids: query,
          exintro: true,
          explaintext: true,
        };
        axios
          .get(wikiEndpoint, { params })
          .then(response => {
            if(response.data.query) { // If the page is found then query exists
              const wiki = Object.values(response.data.query.pages);
              // Set the fields to be sent in message
              composeMsg= [
                "*Page ID* : ", wiki[0].pageid,
                "\n*Title* : ", wiki[0].title,
                "\n*Info* : ", wiki[0].extract//.substring(0, 400)
              ];
              composeMsg.forEach( txt => { msgString += txt; });
              // Send the response to the sender
              client
                .reply(message.from, msgString, message.id.toString())
                .then(() => { console.log("Sent message: \n" + msgString + "\n--------------------"); })
                .catch(erro => { console.error("Error when sending kanji definition: ", erro); });
            } else {
              client
                .reply(message.from,
                  "```Page Not Found```\nCheck the syntax and page id\nDon't get confused with similar commands\nCheck them by sending *InfoHelp*",
                  message.id.toString()
                )
                .then(() => { console.log("Page Not found\n---------------------------")})
                .catch(erro => { console.error("Error when sending error: ", erro); });
            }
          })
          .catch(error => {
            console.log(error);
          })
      break;
      ///////////////////////////////////ANIME DETAIL///////////////////////////////////
      case ".ad": 
      case "AnimeDetail": 
      case "Animedetail": 
      case "animedetail": 
        RecievedMsgPermission = true;
        malScraper.getInfoFromName(query)
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
      case "AnimeIds": 
      case "Animeids": 
      case "animeids": 
        RecievedMsgPermission = true;
        acb.get_anime_by_search(query)
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
        acb.get_anime_by_id(query)
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
      case "CharDetail": 
      case "Chardetail": 
      case "chardetail": 
        RecievedMsgPermission = true;
        acb.get_character_by_search(query)
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
      case "MovieDetail": 
      case "Moviedetail":
      case "moviedetail":
        RecievedMsgPermission = true;
        axios
        .get("https://www.omdbapi.com/?apikey=" + process.env.OMDB_API_KEY + "&t=" + query)
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
      /////////////////////////////////////SONG DETAIL//////////////////////////////////
      case ".sd":
      case "SongDetail": 
      case "Songdetail": 
      case "songdetail": 
        RecievedMsgPermission = true;
        musicInfo.searchSong(songParams, 600)
          .then(song => {
            const songLength = song.lengthMilliSec / 1000;
            const lengthString = Math.floor(songLength / 60) + ":" + Math.floor(songLength % 60);
            composeMsg = [
              "*Title* : ", song.title,
              "\n*Artist* : ", song.artist,
              "\n*Album* : ", song.album,
              "\n*Released* : ", song.releaseDate.substring(0, 10),
              "\n*Length* : ", lengthString,
              "\n*Genre* : ", song.genre
            ];
            // Convert the array into text string
            composeMsg.forEach(txt => { msgString += txt; });
            // Send the response to the sender
            client
              .sendImage(message.from, song.artwork, null, msgString)
              .then(() => { console.log("Sent message: \n" + msgString + "\n--------------------") })
              .catch((erro) => { console.error("Error when sending error: ", erro); });
          })
          .catch(err => {
            client
              .reply(message.from, "Song not found\n-Add Artist too\n-Check the syntax and spelling", message.id.toString())
              .then(() => { console.log(err) })
              .catch((erro) => { console.error("Error when sending error: ", erro); });
          });
      break;
      /////////////////////////////////////SONG LYRICS//////////////////////////////////
      case ".lyrics":
        RecievedMsgPermission = true;
        musicInfo.searchLyrics(songParams, 600)
          .then(song => {
            composeMsg = [
              "*Title* : ", query,
              "\n-------------------------------------",
              "\n*Lyrics* :\n", song.lyrics,
            ];
            // Convert the array into text string
            composeMsg.forEach(txt => { msgString += txt; });
            // Send the response to the sender
            client
              .reply(message.from, msgString, message.id.toString())
              .then(() => { console.log("Sent message: \n" + msgString + "\n--------------------") })
              .catch((erro) => { console.error("Error when sending error: ", erro); });
          })
          .catch(err => {
            client
              .reply(message.from, "Lyrics not found\n-Add Artist too\n-Check the syntax and spelling", message.id.toString())
              .then(() => { console.log(err) })
              .catch((erro) => { console.error("Error when sending error: ", erro); });
          });
      break;
      ///////////////////////////ANIME CHARACTER DETAIL- BY ID//////////////////////////
      case ".cid": 
      case "CharIdDetail": 
      case "Chariddetail": 
      case "chariddetail": 
        RecievedMsgPermission = true;
        acb.get_character_by_id(query)
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
          "1. For just getting a reply:",
          "\nSend ' *HiBot* ' (without the ')",
          "\n--------------------------------------------------",
          "\n2. For roasting someone:",
          "\nSend 'BotRoast <Name>' | Short Command: *.roast* <Name>",
          "\nFor example:\n*BotRoast Tahir*",
          "\n--------------------------------------------------",
          "\n3. For getting Information related commands like wiki, dictionary etc.:",
          "\nSend 'InfoHelp' | Short Command: *.ihelp*",
          "\nFor example:\n*InfoHelp*",
          "\n--------------------------------------------------",
          "\n4. For getting Text based games related commands like truth or dare, Would you rather etc.:",
          "\nSend 'GameHelp' | Short Command: *.ghelp*",
          "\nFor example:\n*GameHelp*",
          "\n--------------------------------------------------",
          "\n5. For getting Entertainment related commands like movie detail, anime detail etc.:",
          "\nSend 'EntHelp' | Short Command: *.ehelp*",
          "\nFor example:\n*EntHelp*",
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
      ////////////////////////////////ENTERTAINMENT MENU////////////////////////////////
      case ".ehelp":
      case "EntHelp":
      case "Enthelp":
      case "enthelp":
        RecievedMsgPermission = true;
        // Compose the message
        composeMsg = [
          "1. For getting the details of a Movie or a Series:",
          "\nSend 'MovieDetail <title>' | Short Command: *.md* <title>",
          "\nFor example:\n*MovieDetail Daredevil*",
          "\n--------------------------------------------------",
          "\n2. For getting the details of a song:",
          "\nSend 'SongDetail <Song name> | Short Command: *.sd*",
          "\nFor example:\n*SongDetail Faded*",
          "\nIf you didn't get the desired result then put the name of the artist too",
          "\nFor example:\n*SongDetail Faded Alan Walker*",
          "\n--------------------------------------------------",
          "\n3. For getting the lyrics of a song:",
          "\nSend '.lyrics <Song name>",
          "\nFor example:\n*.lyrics Faded*",
          "\n--------------------------------------------------",
          "\n4. For getting the Anime commands:",
          "\nSend 'AnimeHelp | Short Command: *.ahelp*",
          "\nFor example:\n*AnimeHelp*",
          "\n--------------------------------------------------",
          "\n5. For getting other Commands:",
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
      /////////////////////////////////INFORMATION MENU/////////////////////////////////
      case ".ihelp":
      case "InfoHelp":
      case "Infohelp":
      case "infohelp":
        RecievedMsgPermission = true;
        // Compose the message
        composeMsg = [
          "\n1. For getting the meaning of an English word:",
          "\nSend 'EnglishDefine <Word>' | Short Command: *.ed* <word>",
          "\nFor example:\n*EnglishDefine table*",
          "\n--------------------------------------------------",
          "\n2. For searching wiki page IDs of a term:",
          "\nSend '.wiki <term>'",
          "\nFor example:\n*.wiki Indian Population*",
          "\n--------------------------------------------------",
          "\n3. For getting the details of wiki page from page ID:",
          "\nSend 'wikiPage <page ID>' | Short Command: *.wp* <page ID>",
          "\nFor example:\n*wikiPage 14598*",
          "\n--------------------------------------------------",
          "\n4. For getting the details of a Kanji:",
          "\nSend 'KanjiDefine <Kanji>' | Short Command: *.kd* <Kanji>",
          "\nFor example:\n*KanjiDefine 空*",
          "\n--------------------------------------------------",
          "\n5. For getting other Commands:",
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
      ////////////////////////////////////GAMES MENU///////////////////////////////////
      case ".ghelp":
      case "GameHelp":
      case "Gamehelp":
      case "gamehelp":
        RecievedMsgPermission = true;
        // Compose the message
        composeMsg = [
          "```Text based Games related commands```",
          "\n--------------------------------------------------",
          "\n1. For Truth or Dare Game:", 
          "\nSend 'BotTruth' for getting a truth question | Short Command: *.truth*",
          "\n\nSend 'BotDare' for getting a dare | Short Command: *.dare*",
          "\nFor example:\n*BotTruth* or *BotDare*",
          "\n--------------------------------------------------",
          "\n2. For getting a 'Would You Rather' question:",
          "\nSend 'BotWyr' | Short Command: *.wyr*",
          "\nFor example:\n*BotWyr*",
          "\n--------------------------------------------------",
          "\n3. For getting other Commands:",
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
      ///////////////////////////////////ANIME MENU////////////////////////////////////
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