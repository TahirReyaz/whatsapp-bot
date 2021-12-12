// Supports ES6
// import { create, Whatsapp } from 'venom-bot';
const venom = require("venom-bot");
const { useragentOverride } = require('venom-bot/dist/config/WAuserAgente');
const { makeOptions, magix, timeout } = require('venom-bot/dist/api/helpers/decrypt');
const truthOrDareFile = require("./data/truth-or-dare.json");
const axios = require("axios");
const malScraper = require("mal-scraper");
const acb = require("acb-api");
const musicInfo = require("music-info");
const wyr = require("wyr");
const openai = require('openai-grammaticalcorrection')
require('dotenv').config();

// Create the client
venom
  .create({
    session: 'session-name', //name of session
    multidevice: false // for version not multidevice use false.(default: true)
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

// Start the client
function start(client) {
  let RecievedMsgPermission = false, buttonsArray= [];
  const nsfwGrps = ["MEMES", "CATS", "WE", "OT4KU", "Chaman", "pendicul", "testing"];
  const annoyGrps = ["CATS", "WE", "Chaman", "CS Team", "BDAY", "pendicul", "testing"];
  const wikiEndpoint = "https://en.wikipedia.org/w/api.php?";
  let params = {};
  let counter = 0;
  let op1count = 0, op2count=0, totalVotes=0, pollActive = false;
  let pollMsg = "", op1msg = "", op2msg = "";
  let op1percent = 0, op2percent = 0, pollerId = "";
  client.onAnyMessage((message) => {
    // variables and constants required to make the data readable
    const data = message.body;
    const botQuery = data.split(" ");
    const queryCutter = botQuery[0] + " ";
    const queryWithDesc = data.substring(queryCutter.length).split("\n"); // Get everything written after the command
    const query = queryWithDesc[0];
    const queryPart = query.split("-");
    let composeMsg = [], msgString = "", list= [];
    const songParams = {
      title: queryPart[0],
      artist: queryPart[1]
    }
  
    switch(botQuery[0]) {
      //////////////////////////////////////HI BOT//////////////////////////////////////
      case "HiBot" :
      case "Hibot" :
      case "hibot" :
        RecievedMsgPermission = true;
        client
          .reply(message.from, "No need to say hi to me, I am always here, reading every message you send to this guy😁.\nSend 'HelpBot' for commands", message.id.toString())
          .then(() => { console.log("Reply sent\n------------------------------"); })
          .catch((erro) => { console.error('Error when sending: ', erro); });
      break;
      //////////////////////////////////////ROAST///////////////////////////////////////
      case ".roast":
      case "BotRoast":
      case "Botroast":
      case "botroast":
        RecievedMsgPermission = true;
        let roastPerm = false;
        // Check if the group allows nsfw roats or not
        nsfwGrps.forEach(grp => {
          if(message.isGroupMsg && message.chat.name.search(grp) !== -1) {
            roastPerm = true;
          }
        })
        axios
          .get("https://evilinsult.com/generate_insult.php?lang=en&type=json")
          .then(function (response) {
            // Abusive roasts
            if(!roastPerm) {
              composeMsg = [ "This command is not supported in dms. If this is a group then there are people here who don't like it.\n```THEY AREN'T COOL ENOUGH.```" ];
            } else if (
              response.data.number == "111" ||
              response.data.number === "119" ||
              response.data.number === "121" ||
              response.data.number === "10" ||
              response.data.number === "11"
            ) {
              composeMsg = ["Ooops..", " Please try again"];
              console.log(response.data.insult);
            } else {
              composeMsg = [ "Dear ", query, ", ", response.data.insult ];
            }
            composeMsg.forEach( txt => { msgString += txt; });
            // Send the response to the sender
            client
              .reply(message.from, msgString, message.id.toString())
              .then(() => { console.log("Sent message: " + msgString + "\n-------------------"); })
              .catch(erro => { console.error("Error when sending the roast: ", erro); });
          })
          .catch( error => { console.log(error); });
      break;
      //////////////////////////////////////ROAST///////////////////////////////////////
      case ".yall":
      case ".y'all":
      case ".all":
      case ".every":
      case "@everyone":
      case ".everyone":
        RecievedMsgPermission = true;
        let annoyPerm = false;
        query = queryWithDesc;
        // Check if the group allows annoying mentions or not
        annoyGrps.forEach(grp => {
          if(message.isGroupMsg && message.chat.name.search(grp) !== -1) {
            annoyPerm = true;
          }
        });
        if(!annoyPerm) {
          msgString = "This command is not supported in dms. If this is a group then people get annoyed by useless mentioning.";
            // Send the response to the sender
            client
              .reply(message.from, msgString, message.id.toString())
              .then(() => { console.log("Sent message: " + msgString + "\n-------------------"); })
              .catch(erro => { console.error("Error when sending kanji definition: ", erro); });
        } else {
          composeMsg = [ 
            "```Tagging Everyone on request of``` *", 
            message.sender.pushname, 
            "*\n\n----------------------------------------------------\n", 
            query,
            "\n----------------------------------------------------\n"
          ];
          composeMsg.forEach(txt => msgString+=txt);
          // Send the response to the sender
          client
            .getGroupMembersIds(message.chat.groupMetadata.id)
            .then(res => { 
              let members= [];
              res.forEach(member => {
                members.push(member.user.toString());
                msgString+= `@${member.user.toString()} , `;
              })
              client
                .sendMentioned(message.from, msgString, members)
                .then(() => { console.log("Sent message: " + msgString + "\n-------------------"); })
                .catch(erro => { console.log("Error when tagging: ", erro); });
            })
            .catch(erro => { console.error("Error when tagging: ", erro); });
        }
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
            for(i=0; i< kanjiData.meanings.length; i++) { meaningString += kanjiData.meanings[i] + " | " }
            for(i=0; i< kanjiData.kun_readings.length; i++) { kunString += kanjiData.kun_readings[i] + " | " }
            for(i=0; i< kanjiData.on_readings.length; i++) { onString += kanjiData.on_readings[i] + " | " }
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
        buttonsArray = [
          {buttonId: 'ed', buttonText: {displayText: "EnglishDefine Inception"}, type: 1},
          {buttonId: 'ihelp', buttonText: {displayText: ".ihelp"}, type: 1},
          {buttonId: 'help', buttonText: {displayText: ".help"}, type: 1}
        ];
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
              .sendButtons(message.from, msgString, buttonsArray, "Click on buttons for other menus and examples")              
              .then(() => { console.log("Sent message: " + msgString + "\n-------------------"); })
              .catch((erro) => { console.error("Error when sending: ", erro); });
          })
          .catch(err => {
            client
              .sendButtons(message.from, err.response.data.message, buttonsArray, "Click on buttons for other menus and examples")              
              .then(() => { console.log(err) })
              .catch((erro) => { console.error("Error when sending error: ", erro); });
          });
      break;
      //////////////////////////TRANSLATE AND CORRECT GRAMMAR/////////////////////////////////
      case ".gram":
      case ".grammar":
      case ".ayaz":
        RecievedMsgPermission = true;
        openai.APIkey(process.env.OPENAI_API_KEY);
        (async () => {
          const data = await openai.GetError(query);
          txt = "Grammar correction/ Translation:\n";
          txt += data.choices[0].text;
          console.log(data);
          client
            .reply(message.from, txt, message.id.toString())
            .then(() => { console.log('Sent message: ' + txt + '\n------------------\n') })
            .catch((erro) => { console.error("Error when correcting grammer: ", erro); });
        })();
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
              composeMsg = ["Checkout the bottom menu to read the page details"]; // composeMsg will be used as description of the button options
              list = [{
                title: "Search Results",
                rows: []
              }];
              wikis.forEach(wiki => {
                composeMsg.push(
                  "\n*Title* : ", wiki.title,
                  " - *Page ID* : ", wiki.pageid
                );
                list[0].rows.push({
                  title: `WikiPage ${wiki.pageid}`,
                  description: wiki.title,
                })
              });
              composeMsg.forEach( txt => { msgString += txt; });
              sendListMenu(message.from, 'Search Results', 'subTitle', msgString, 'Results', list);
            } else {
              buttonsArray = [
                {buttonId: 'wiki', buttonText: {displayText: ".wiki Inception"}, type: 1},
                {buttonId: 'ihelp', buttonText: {displayText: ".ihelp"}, type: 1},
                {buttonId: 'help', buttonText: {displayText: ".help"}, type: 1}
              ];      
              client
                .sendButtons(message.from, `Searched query: ${query}\n_Search Results Not Found_\n-Check the syntax and search term\n-Don't get confused with similar commands\n-Check them by sending *InfoHelp*`, buttonsArray, msgString)              
                .then(() => { console.log("Results Not found\n-------------------------")})
                .catch(erro => { console.error("Error when sending error: ", erro); });
            }
          })
          .catch(error => { console.log(error); })
      break;
      //////////////////////////////////WIKIPEDIA PAGE//////////////////////////////////
      case ".wp":
      case "wikiPage":
      case "WikiPage":
      case "wikipage":
        RecievedMsgPermission = true;
        console.log(message.id);
        params = {
          origin: "*",
          format: "json",
          action: "query",
          prop: "extracts",
          pageids: query,
          exintro: true,
          explaintext: true,
        };
        buttonsArray = [
          {buttonId: 'wp', buttonText: {displayText: "WikiPage 14598"}, type: 1},
          {buttonId: 'ihelp', buttonText: {displayText: "InfoHelp"}, type: 1},
          {buttonId: 'help', buttonText: {displayText: ".help"}, type: 1}
        ];
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
                .sendButtons(message.from, msgString, buttonsArray, "Chose the buttons for examples and menu")              
                .then(() => { console.log("Sent message: \n" + msgString + "\n--------------------"); })
                .catch(erro => { console.error("Error when sending page details: ", erro); });
            } else {
              client
                .sendButtons(message.from, `Searched query: ${query}\n_Page Not Found_\nCheck the syntax and page id\nDon't get confused with similar commands\nCheck them by sending *InfoHelp*`, buttonsArray, "Chose the buttons for examples and menu")              
                .then(() => { console.log("Page Not found\n---------------------------")})
                .catch(erro => { console.error("Error when sending error: ", erro); });
            }
          })
          .catch(error => { console.log(error); });
      break;
      /////////////////////////////////////Testing///////////////////////////////
      case ".reply":
        client
          .returnReply(message)
          .then(res => console.log(res))
          .catch(err => console.log(err));
      ///////////////////////////////////+1 COUNTER///////////////////////////////
      case "+1":
        RecievedMsgPermission = true;
        if(query === "reset") {
          counter = 0;
          composeMsg = ["Counter reset"];
        } else {
          counter++;
          composeMsg = [
            "Counting +1s\n",
            "-------------------\n",
            "Current count: +", counter];
        }
        composeMsg.forEach( txt => { msgString += txt; });
        buttonsArray = [
          {buttonId: '+1', buttonText: {displayText: "+1"}, type: 1},
          {buttonId: 'reset', buttonText: {displayText: "+1 reset"}, type: 1}
        ]
        // Send the response to the sender if count is more than 1
        if(counter !== 1) {
          client
            .sendButtons(message.from, msgString, buttonsArray, "You can click on the button for further counting.\nOr just count as usual")              
            .then(() => { console.log("Sent message: " + msgString + "\n-------------------"); })
            .catch(error => { console.error("Error when sending truth: ", error); });
          }
      break;
      //////////////////////////////////////POLL///////////////////////////////
      case ".poll":
        RecievedMsgPermission = true;
        if(!queryPart[2] && !pollActive) {
          msgString = "Enter the command properly";
          client
            .sendText(message.from, msgString)
            .then(() => { console.log('Sent message: ' + msgString + '\n------------------\n') })
            .catch((erro) => { console.error("Error while ending the poll: ", erro); });
          break;
        }
        if(query === "end" && pollerId === message.from) {
          composeMsg = [
            "```Closed the poll on request of``` *", 
            message.sender.verifiedName,
            "*\n----------------------------------\n*",
            pollMsg,
            "*\nResult:",
            "\n1. ", op1msg, " (", op1percent, "%)",
            "\n2. ", op2msg, " (", op2percent, "%)",
            "\nTotal votes: ", totalVotes
          ];
          composeMsg.forEach( txt => { msgString += txt; });
          op1count = 0, op2count=0, totalVotes=0;
          pollMsg = "", op1msg = "", op2msg = "";
          op1percent = 0, op2percent = 0;
          pollActive= false;
          client
            .sendText(message.from, msgString)
            .then(() => { console.log('Sent message: ' + msgString + '\n------------------\n') })
            .catch((erro) => { console.error("Error while ending the poll: ", erro); });
          break;
        } else if(query === "end" && pollerId !== message.from) {
          msgString = "Only the creater of the poll can end it";
          client
            .sendText(message.from, msgString)
            .then(() => { console.log('Sent message: ' + msgString + '\n------------------\n') })
            .catch((erro) => { console.error("Error while ending the poll: ", erro); });
          break;
        }
        if(queryPart[0] === "op1") {
          op1count++;
          totalVotes++;
        } else if (queryPart[0] === "op2") {
          op2count++;
          totalVotes++;
        } else if (totalVotes === 0) {
          pollMsg = queryPart[0];
          op1msg = queryPart[1];
          op2msg = queryPart[2];
          op1percent = 0;
          op2percent = 0;
          pollerId = message.from;
          pollActive = true;
        }
        if(totalVotes !== 0) {
          op1percent = (op1count/totalVotes) * 100;
          op2percent = (op2count/totalVotes) * 100;
          op1percent = op1percent.toFixed(2);
          op2percent = op2percent.toFixed(2);
        }
        composeMsg = [
          "```Started poll on request of``` *", 
          message.sender.verifiedName,
          "*\n----------------------------------\n*",
          pollMsg,
          "*\nOptions:",
          "\n1. ", op1msg, " (", op1percent, "%)",
          "\n2. ", op2msg, " (", op2percent, "%)",
          "\nTotal votes: ", totalVotes
        ];
        composeMsg.forEach( txt => { msgString += txt; });
        buttonsArray = [
          {buttonId: 'opt1', buttonText: {displayText: ".poll op1-" + op1msg}, type: 1},
          {buttonId: 'opt2', buttonText: {displayText: ".poll op2-" + op2msg}, type: 1},
          {buttonId: 'reset', buttonText: {displayText: ".poll end"}, type: 1}
        ]
        // Send the response to the sender if count is more than 1
        client
          .sendButtons(message.from, msgString, buttonsArray, "You can click on the buttons for voting.")              
          .then(() => { console.log("Sent message: " + msgString + "\n-------------------"); })
          .catch(error => { console.error("Error when sending truth: ", error); });
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
              "\n *Synopsis* : ", data.synopsis
            ];
            composeMsg.forEach( txt => { msgString += txt; });
            // Send the response to the sender
            client
              .sendImage(message.from, data.picture, null, msgString)
              .then(() => { console.log("Sent message: \n" + msgString + "\n--------------------"); })
              .catch(erro => { console.error("Error when sending kanji definition: ", erro); });
            })
          .catch(err => { // Send not found to sender
            buttonsArray = [
              {buttonId: 'ad', buttonText: {displayText: "AnimeDetail Naruto"}, type: 1},
              {buttonId: 'ahelp', buttonText: {displayText: "AnimeHelp"}, type: 1},
              {buttonId: 'help', buttonText: {displayText: ".help"}, type: 1}
            ];      
            client
                .sendButtons(message.from, "Anime not found.. Sorry", buttonsArray, "Chose the buttons for examples and menu")              
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
            msgString = "Click on an Anime ID from the buttons to get its characters"; // composeMsg will be used as description of the button options
            data.forEach(result => {
              msgString += "\n*" + result.anime_id + "* - " + result.anime_name;
              buttonsArray.push( {buttonId: 'anime' + result.anime_id, buttonText: {displayText: ".ac " + result.anime_id}, type: 1} )
            });
            msgString+= "\nGet the IDs of characters of an anime by sending 'AnimeChars <id>\nFor example\n*AnimeChars 101671*" 
            // Send the response to the sender
            client
            .sendButtons(message.from, `Searched query: ${query}\nFor getting character list send *AnimeChars <anime id>*\nFor example:\n*AnimeChars 101671*`, buttonsArray, msgString)              
            .then(() => { console.log("Sent message: \n" + msgString + "\n--------------------"); })
            .catch(erro => { console.error("Error when sending Anime search results:\n", erro); });
          })
          .catch(err => { // Send not found to sender
            buttonsArray = [
              {buttonId: 'aid', buttonText: {displayText: "AnimeIds Naruto"}, type: 1},
              {buttonId: 'ahelp', buttonText: {displayText: "AnimeHelp"}, type: 1},
              {buttonId: 'help', buttonText: {displayText: ".help"}, type: 1}
            ];      
            client
              .sendButtons(message.from, "Anime not found.. Sorry. Check if the command syntax is wrong", buttonsArray, "Chose the buttons for examples and menu")              
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
            buttonsArray = [
              {buttonId: 'aid', buttonText: {displayText: "AnimeChars Naruto"}, type: 1},
              {buttonId: 'ahelp', buttonText: {displayText: "AnimeHelp"}, type: 1},
              {buttonId: 'help', buttonText: {displayText: ".help"}, type: 1}
            ];      
            client
              .sendButtons(message.from, "Anime not found.. Sorry", buttonsArray, "Chose the buttons for examples and menu")              
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
        buttonsArray = [
          {buttonId: 'md', buttonText: {displayText: "MovieDetail Inception"}, type: 1},
          {buttonId: 'ehelp', buttonText: {displayText: "EntHelp"}, type: 1},
          {buttonId: 'help', buttonText: {displayText: ".help"}, type: 1}
        ];      
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
                  .sendButtons(message.from, msgString, buttonsArray, "Chose the buttons for examples and menu")              
                  .then(() => { console.log("Sent message: " + msgString + "\n-------------------"); })
                  .catch((erro) => { console.error("Error when sending: ", erro); });            
              } else { // If there is a poster then send the details with the poster           
                client
                  .sendImage(message.from, response.data.Poster, null, msgString)
                  .then(() => { console.log("Sent message: " + msgString + "\n-------------------"); })
                  .catch((erro) => { console.error("Error when sending: ", erro); });            
              }          
            } else {  // If movie/ series is not found
              client
                .sendButtons(message.from, "Movie/ Series not found.. Sorry. Check the spelling", buttonsArray, "Chose the buttons for examples and menu")              
                .then(() => { console.log(response.data.Error) })
                .catch((erro) => { console.error("Error when sending error: ", erro); });
            }
          })
          .catch(err => { console.error("Error when getting movie: ", erro); });
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
              "\n*Genre* : ", song.genre,
              "\n--------------------------------------------------",
              "For lyrics of the song:\n Send '.lyrics' <Song name>'",
              "For example:\n*.lyrics Faded*"
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
              "*Searched* : ", query,
              "\n-------------------------------------",
              "\n*Lyrics* :\n", song.lyrics,
              "\n--------------------------------------------------",
              "\nFor getting the details of a song:",
              "\nSend 'SongDetail <Song name> | Short Command: *.sd*",
              "\nFor example:\n*SongDetail Faded*",
              "\nIf you didn't get the desired result then put the name of the artist too",
              "\nFor example:\n*SongDetail Faded Alan Walker*",
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
        buttonsArray = [
          {buttonId: 'truth', buttonText: {displayText: ".truth"}, type: 1},
          {buttonId: 'dare', buttonText: {displayText: ".dare"}, type: 1},
          {buttonId: 'ghelp', buttonText: {displayText: ".ghelp"}, type: 1}
        ]
        // Send the response to the sender
        client
          .sendButtons(message.from, msgString, buttonsArray, "Click on the buttons for help and other games")              
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
        buttonsArray = [
          {buttonId: 'truth', buttonText: {displayText: ".truth"}, type: 1},
          {buttonId: 'dare', buttonText: {displayText: ".dare"}, type: 1},
          {buttonId: 'ghelp', buttonText: {displayText: ".ghelp"}, type: 1}
        ]
        // Send the response to the sender
        client
          .sendButtons(message.from, msgString, buttonsArray, "Click on the buttons for help and other games")              
          .then(() => { console.log("Sent message: " + msgString + "\n-------------------"); })
          .catch(error => { console.error("Error when sending truth: ", error); });
      break;
      /////////////////////////////////WOULD YOU RATHER/////////////////////////////////
      case ".wyr":
      case "BotWyr":
      case "Botwyr":
      case "botwyr":
        RecievedMsgPermission = true;
        wyr()
          .then(response => {
            buttonsArray = [
              {buttonId: 'wyr1', buttonText: {displayText: response.blue.question}, type: 1},
              {buttonId: 'wyr2', buttonText: {displayText: response.red.question}, type: 1},
              {buttonId: 'ghelp', buttonText: {displayText: ".ghelp"}, type: 1}
            ];
            composeMsg = [
              "Click on an option to choose it",
              "\nA: ", response.blue.question,
              "\nB: ", response.red.question
            ];
            composeMsg.forEach( txt => { msgString += txt; });
            // Send the response to the sender
            client
              .sendButtons(message.from, "Would you rather:", buttonsArray, msgString)              
              .then(() => { console.log("Sent Wyr question:\n"+ response.blue.question + "\n" + response.red.question + "\n-------------------"); })
              .catch(error => { console.error("Error when sending truth: ", error); });
          })
          .catch(err => { // Send not found to sender
            buttonsArray = [
              {buttonId: 'wyr', buttonText: {displayText: ".wyr"}, type: 1},
              {buttonId: 'ghelp', buttonText: {displayText: "GameHelp"}, type: 1},
              {buttonId: 'help', buttonText: {displayText: ".help"}, type: 1}
            ];      
            client
              .sendButtons(message.from, "Question not found.. Sorry\nTry again", buttonsArray, "Chose the buttons for examples and menu")              
              .then(() => { console.log(err) })
              .catch((erro) => { console.error("Error when sending error: ", erro); });
          });
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
          "\n2. For creating a Poll:",
          "\nSend \n```.poll <message>-<option1>-<option2>```",
          "\nFor example:\n.poll Do you drink tea or coffee?-Tea-Coffee",
          "\n--------------------------------------------------",
          "\n3. For mentioning everyone:",
          "\nSend '```.everyone```' | Short Command: *.yall*",
          "\nFor example:\n*.everyone*",
          "\nWith msg: ```.everyone <msg>```",
          "\nFor example: *.everyone Hello*",
          "\n--------------------------------------------------",
          "\n4. For getting Information related commands like _wiki, dictionary_ etc.:",
          "\nSend '```InfoHelp```' | Short Command: *.ihelp*",
          "\nFor example:\n*InfoHelp*",
          "\n--------------------------------------------------",
          "\n5. For getting Text based games related commands like _truth or dare, Would you rather_ etc.:",
          "\nSend '```GameHelp```' | Short Command: *.ghelp*",
          "\nFor example:\n*GameHelp*",
          "\n--------------------------------------------------",
          "\n6. For getting Entertainment related commands like _movie, song, anime detail and lyrics_:",
          "\nSend '```EntHelp```' | Short Command: *.ehelp*",
          "\nFor example:\n*EntHelp*",
          "\n--------------------------------------------------",
          "\n7. For making stickers: ",
          "\nSend the image with caption *.sticker*",
          "\n```Gifs and videos are not supported yet```",
          "\n--------------------------------------------------",
          "\n8. For roasting someone:",
          "\nSend '```BotRoast <Name>```' | Short Command: *.roast* <Name>",
          "\nFor example:\n*BotRoast John Doe*",
          "\n--------------------------------------------------",
          "\n```There is no case sensitiviy for full commands```"
        ];
        composeMsg.forEach(txt => { msgString += txt; });

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
                description: "\nFor creating polls",
              },
              {
                title: "@everyone <message>",
                description: "For tagging everyone like discord",
              },
              {
                title: "InfoHelp ",
                description: "For getting help and commands related to Info",
              },
              {
                title: "GameHelp ",
                description: "For getting help and commands related to Games",
              },
              {
                title: "EntHelp ",
                description: "For getting help and commands related to Entertainment and Media",
              },
              {
                title: "AnimeHelp ",
                description: "For getting help and commands related to Anime",
              },
              {
                title: ".roast John Doe",
                description: "For Roasting someone. Use this wisely.",
              }
            ]
          },
          {
            title: "Info Related Commands",
            rows: [
              {
                title: "EnglishDefine Table",
                description: "For getting the definition of an English word",
              },
              {
                title: ".wiki Indian Population",
                description: "For searching a term on Wikipedia",
              },
              {
                title: "wikiPage 14598",
                description: "For getting the details of wiki page.",
              },
              {
                title: "KanjiDefine 空",
                description: "For readings and meaning of a Kanji.",
              }
            ]
          },
          {
            title: "Entertainment and Media Related Commands",
            rows: [
              {
                title: "MovieDetail Inception",
                description: "For getting the details of a Movie/ Series",
              },
              {
                title: "SongDetail Faded-Alan Walker",
                description: "Details of a song",
              },
              {
                title: ".lyrics Faded-Alan Walker",
                description: "Lyrics of a song",
              },
              {
                title: "AnimeHelp ",
                description: "For getting help and list of Anime related commands",
              }
            ]
          },
          {
            title: "Game Commands",
            rows: [
              {
                title: "BotDare ",
                description: "For getting a dare",
              },
              {
                title: "BotTruth ",
                description: "For getting a truth question",
              },
              {
                title: "BotWyr ",
                description: "For getting a 'Would You Rather' question",
              }
            ]
          },
          {
            title: "Anime Commands",
            rows: [
              {
                title: "AnimeDetail Naruto",
                description: "For getting the details of an Anime",
              },
              {
                title: "CharDetail Kakashi",
                description: "For getting details of an Anime Charater by Search",
              },
              {
                title: "CharIdDetail 10820",
                description: "For getting details of an Anime Charater by ID",
              },
              {
                title: "AnimeIds Naruto",
                description: "For getting Character IDs of an anime",
              },
              {
                title: "AnimeChars 100053",
                description: "For getting Character ID and list.",
              }
            ]
          }
        ];

        sendListMenu(message.from, 'Welcome to THE BOT', 'Help and all commands', msgString, 'Commands', list);
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
          "\nSend 'SongDetail <Song name>' | Short Command: *.sd* <Song name>",
          "\nFor example:\n*SongDetail Faded*",
          "\nIf you didn't get the desired result then put the name of the artist too with a hyphen ( - )",
          "\nFor example:\n*SongDetail Faded-Alan Walker*",
          "\n--------------------------------------------------",
          "\n3. For getting the lyrics of a song:",
          "\nSend '.lyrics <Song name>'",
          "\nFor example:\n*.lyrics Faded*",
          "\n--------------------------------------------------",
          "\n4. For getting the Anime commands:",
          "\nSend 'AnimeHelp' | Short Command: *.ahelp*",
          "\nFor example:\n*AnimeHelp*",
          "\n--------------------------------------------------",
          "\n5. For getting other Commands:",
          "\nSend 'HelpBot' | Short Command: *.help*",
          "\nFor example:\n*HelpBot*",
          "\n```There is no case sensitiviy for full commands```"
        ];
        composeMsg.forEach(txt => { msgString += txt; });
        list = [
          {
            title: "Entertainment and Media Related Commands",
            rows: [
              {
                title: "MovieDetail Inception",
                description: "For getting the details of a Movie/ Series",
              },
              {
                title: "SongDetail Faded-Alan Walker",
                description: "Details of a song",
              },
              {
                title: ".lyrics Faded-Alan Walker",
                description: "Lyrics of a song",
              },
              {
                title: "AnimeHelp ",
                description: "For getting help and list of Anime related commands",
              },
              {
                title: "HelpBot ",
                description: "For getting help and list of all commands.",
              }
            ]
          }
        ];

        sendListMenu(message.from, 'Entertainment and Media related commands', 'subTitle', msgString, 'Commands', list);
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
        composeMsg.forEach(txt => { msgString += txt; });
        list = [
          {
            title: "Info Related Commands",
            rows: [
              {
                title: "EnglishDefine Table",
                description: "For getting the definition of an English word",
              },
              {
                title: ".wiki Indian Population",
                description: "For searching a term on Wikipedia",
              },
              {
                title: "wikiPage 14598",
                description: "For getting the details of wiki page.",
              },
              {
                title: "KanjiDefine 空",
                description: "For readings and meaning of a Kanji.",
              },
              {
                title: "HelpBot ",
                description: "For getting help and list of all commands.",
              }
            ]
          }
        ];

        sendListMenu(message.from, 'Info related commands', 'subTitle', msgString, 'Commands', list);
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
        composeMsg.forEach(txt => { msgString += txt; });
        list = [
          {
            title: "Game Commands",
            rows: [
              {
                title: "BotDare ",
                description: "For getting a dare",
              },
              {
                title: "BotTruth ",
                description: "For getting a truth question",
              },
              {
                title: "BotWyr ",
                description: "For getting a 'Would You Rather' question",
              },
              {
                title: "HelpBot ",
                description: "For getting help and list of all commands.",
              }
            ]
          }
        ];

        sendListMenu(message.from, 'Commands for Games', 'subTitle', msgString, 'Commands', list);
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
        composeMsg.forEach(function (txt) { msgString += txt; });
        list = [
          {
            title: "Anime Commands",
            rows: [
              {
                title: "AnimeDetail Naruto",
                description: "For getting the details of an Anime",
              },
              {
                title: "CharDetail Kakashi",
                description: "For getting details of an Anime Charater by Search",
              },
              {
                title: "CharIdDetail 10820",
                description: "For getting details of an Anime Charater by ID",
              },
              {
                title: "AnimeIds Naruto",
                description: "For getting Character IDs of an anime",
              },
              {
                title: "AnimeChars 100053",
                description: "For getting Character ID and list.",
              },
              {
                title: "HelpBot ",
                description: "For getting help and list of all commands.",
              }
            ]
          }
        ];

        sendListMenu(message.from, 'Anime related commands', 'subTitle', msgString, 'Commands', list);
      break;
      case ".list":
        //This function does not work for Bussines contacts
        composeMsg = [
          "1. For just getting a reply:",
          "\nSend ' *HiBot* ' (without the ')",
          "\n--------------------------------------------------",
          "\n2. For creating a Poll:",
          "\nSend \n```.poll <message>-<option1>-<option2>```",
          "\nFor example:\n.poll Do you drink tea or coffee?-Tea-Coffee",
          "\n--------------------------------------------------",
          "\n3. For mentioning everyone:",
          "\nSend '```.everyone```' | Short Command: *.yall*",
          "\nFor example:\n*.everyone*",
          "\nWith msg: ```.everyone <msg>```",
          "\nFor example: *.everyone Hello*",
          "\n--------------------------------------------------",
          "\n4. For getting Information related commands like _wiki, dictionary_ etc.:",
          "\nSend '```InfoHelp```' | Short Command: *.ihelp*",
          "\nFor example:\n*InfoHelp*",
          "\n--------------------------------------------------",
          "\n5. For getting Text based games related commands like _truth or dare, Would you rather_ etc.:",
          "\nSend '```GameHelp```' | Short Command: *.ghelp*",
          "\nFor example:\n*GameHelp*",
          "\n--------------------------------------------------",
          "\n6. For getting Entertainment related commands like _movie, song, anime detail and lyrics_:",
          "\nSend '```EntHelp```' | Short Command: *.ehelp*",
          "\nFor example:\n*EntHelp*",
          "\n--------------------------------------------------",
          "\n7. For making stickers: ",
          "\nSend the image with caption *.sticker*",
          "\n```Gifs and videos are not supported yet```",
          "\n--------------------------------------------------",
          "\n8. For roasting someone:",
          "\nSend '```BotRoast <Name>```' | Short Command: *.roast* <Name>",
          "\nFor example:\n*BotRoast John Doe*",
          "\n--------------------------------------------------",
          "\n```There is no case sensitiviy for full commands```"
        ];
        composeMsg.forEach(function (txt) { msgString += txt; });

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
                description: "\nFor creating polls",
              },
              {
                title: "@everyone <message>",
                description: "For tagging everyone like discord",
              },
              {
                title: "InfoHelp ",
                description: "For getting help and commands related to Info",
              },
              {
                title: "GameHelp ",
                description: "For getting help and commands related to Games",
              },
              {
                title: "EntHelp ",
                description: "For getting help and commands related to Entertainment and Media",
              },
              {
                title: "AnimeHelp ",
                description: "For getting help and commands related to Anime",
              },
              {
                title: ".roast John Doe",
                description: "For Roasting someone. Use this wisely.",
              }
            ]
          },
          {
            title: "Info Related Commands",
            rows: [
              {
                title: "EnglishDefine Table",
                description: "For getting the definition of an English word",
              },
              {
                title: ".wiki Indian Population",
                description: "For searching a term on Wikipedia",
              },
              {
                title: "wikiPage 14598",
                description: "For getting the details of wiki page.",
              },
              {
                title: "KanjiDefine 空",
                description: "For readings and meaning of a Kanji.",
              },
              {
                title: "HelpBot ",
                description: "For getting help and list of all commands.",
              }
            ]
          },
          {
            title: "Entertainment and Media Related Commands",
            rows: [
              {
                title: "MovieDetail Inception",
                description: "For getting the details of a Movie/ Series",
              },
              {
                title: "SongDetail Faded-Alan Walker",
                description: "Details of a song",
              },
              {
                title: ".lyrics Faded-Alan Walker",
                description: "Lyrics of a song",
              },
              {
                title: "AnimeHelp ",
                description: "For getting help and list of Anime related commands",
              },
              {
                title: "HelpBot ",
                description: "For getting help and list of all commands.",
              }
            ]
          },
          {
            title: "Game Commands",
            rows: [
              {
                title: "BotDare ",
                description: "For getting a dare",
              },
              {
                title: "BotTruth ",
                description: "For getting a truth question",
              },
              {
                title: "BotWyr ",
                description: "For getting a 'Would You Rather' question",
              },
              {
                title: "HelpBot ",
                description: "For getting help and list of all commands.",
              }
            ]
          },
          {
            title: "Anime Commands",
            rows: [
              {
                title: "AnimeDetail Naruto",
                description: "For getting the details of an Anime",
              },
              {
                title: "CharDetail Kakashi",
                description: "For getting details of an Anime Charater by Search",
              },
              {
                title: "CharIdDetail 10820",
                description: "For getting details of an Anime Charater by ID",
              },
              {
                title: "AnimeIds Naruto",
                description: "For getting Character IDs of an anime",
              },
              {
                title: "AnimeChars 100053",
                description: "For getting Character ID and list.",
              },
              {
                title: "HelpBot ",
                description: "For getting help and list of all commands.",
              }
            ]
          }
        ];

        sendListMenu(message.from, 'Welcome to THE BOT', 'subTitle', msgString, 'Commands', list);
      break;
    }
    ////////////////////////////////MISCELLANEOUS FEATURES//////////////////////////////
    if (message.body === 'send contact' && message.isGroupMsg === false) {
      client
        .sendContactVcard(message.from, message.to, 'Tahir')
        .then((result) => {console.log('Result: ', result);})
        .catch((erro) => {console.error('Error when sending: ', erro);});
    } else if (message.body === 'bhai ek help kr de' && message.isGroupMsg === false) {
      client
      .startTyping(message.from)
      .then((result) => {console.log('Result: ', result);})
      .catch((erro) => {console.error('Error when sending: ', erro);});
    } else if (message.type === "image" && ( message.caption === ".sticker" || message.caption === ".sparsh")) {
      console.log('\nSaw an image');
      console.log('\nmessage id: ' + message.id);
      client
        .reply(message.from, "*Somry*\n\nThe sticker command is not working right now. Due to issues in the venom-bot package. I'll fix it as soon as the develepors fix the issue.\nSomeone has commented a workaround, I'll look into it and fixed it when I feel so.\n\nContact the sticker maker of your group if you still want a sticker or\nDO IT YOURSELF", message.id.toString())              
        .then(() => { console.log("gif not sent\n-------------------------\n") })
        .catch((erro) => { console.error("Error when sending sticker: ", erro); });    

      // console.log(message);
      // .then(res => console.log(Buffer.from(res).toString('base64').substring(0, 100)));
      // client
      // .decryptFile(message)
      // .then(result => {
      //   // const img = result.substring(23, result.length);
      //   const img = Buffer.from(result).toString('base64');
      //   const imgTrimmed = img.substring(23, img.length);
      //   console.log('\ndownloaded it');
      //   console.log(img.substring(0, 100));
      //   // console.log('\nresult: ' + result);
      //   client
      //     .sendImageAsSticker(message.from, imgTrimmed)              
      //     .then(() => { console.log("Sticker sent\n-------------------------\n") })
      //     .catch((erro) => { console.error("Error when sending sticker: \n" + erro); });    
      // })
      // .catch(erro => console.log(erro));
      // client
      //   .downloadMedia(message.id)
      //   .then(result => {
      //     const img = result.substring(23, result.length);
      //     console.log('\ndownloaded it');
      //     console.log('\nresult:----------------\n' + result.substring(0, 300));
      //     client
      //       .sendImageAsSticker(message.from, img)              
      //       .then(() => { console.log("Sticker sent\n-------------------------\n") })
      //       .catch((erro) => { console.error("Error when sending sticker: \n" + erro); });    
      //   })
      //   .catch(errorGranzia => {
      //     console.log('In catch block of download media')
      //     console.log(errorGranzia)
      //   });
    } else if (message.type === "video" && ( message.caption === ".sticker" || message.caption === ".sparsh")) {
      client
      .reply(message.from, "gifs and videos are not supported yet", message.id.toString())              
      .then(() => { console.log("gif not sent\n-------------------------\n") })
      .catch((erro) => { console.error("Error when sending sticker: ", erro); });    
      // client
        // .downloadMedia(message.id)
        // .then(result => {
          // console.log(result.substring(22, 50));
          // const gif = result.substring(22, result.length);
        // })
        // .catch(erro => (console.log(erro)));
    // } else if (message.isMedia === true || message.isMMS === true) {
    //   client
    //     .decryptFile(message)
    //     .then(res => console.log(Buffer.from(res).toString('base64').substring(0, 100)));
      // const buffer = client.decryptFile(message);
      // console.log(buffer);
      // At this point you can do whatever you want with the buffer
      // Most likely you want to write it into a file
      // const fileName = `some-file-name.${mime.extension(message.mimetype)}`;
      // await fs.writeFile(fileName, buffer, (err) => {
      //   ...
      // });
    }
    // Print the recieved msg
    if(RecievedMsgPermission) {
      console.log('------------------------------------------\n');
      console.log("Recieved Message: ", data, "\nType: ", message.type, "\nName: ", message.sender.pushname);
      RecievedMsgPermission = false;
    }
  });

  //////////////////////////// FUNCTIONS ///////////////////////////

  const sendButtons = (sender, msg, buttons, description) => {
    client
    .sendButtons(sender, msg, buttons, description)              
    .then(() => { console.log("Sent message: ", msg + "\n-------------------------"); })
    .catch((erro) => { console.error("Error when sending: ", erro); });
  }

  const sendListMenu = (sender, title, subtitle, desc, menuName, list) => {
    client.sendListMenu(sender, title, subtitle, desc, menuName, list)
    .then((result) => { console.log('Result: ', result); })
    .catch((erro) => { console.error('Error when sending: ', erro); });
  }
}