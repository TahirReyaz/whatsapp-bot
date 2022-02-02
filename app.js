// Supports ES6
// import { create, Whatsapp } from 'venom-bot';
const venom = require("venom-bot");
const truthOrDareFile = require("./data/truth-or-dare.json");
const axios = require("axios");
const malScraper = require("mal-scraper");
const acb = require("acb-api");
const musicInfo = require("music-info");
const wyr = require("wyr");
const openai = require("openai-grammaticalcorrection");
const fs = require("fs");
const mime = require("mime-types");
const { MediaType } = require("venom-bot/dist/api/model/enum");
const gify = require("gify");
const gm = require("gm").subClass({ imageMagick: true });
require("dotenv").config();
const tesseract = require("node-tesseract-ocr");

var Poll = require("./models/poll");

const ocrConfig = {
  lang: "eng",
  oem: 1,
  psm: 3,
};

// Create the client
venom
  .create({
    session: "session-name", //name of session
    multidevice: false, // for version not multidevice use false.(default: true)
  })
  .then((client) => {
    start(client);
  })
  .catch((erro) => {
    console.log(erro);
  });
let RecievedMsgPermission = false;
// Start the client
function start(client) {
  buttonsArray = [];
  let mentionAllGrps = [];
  axios
    .get(`${process.env.FIREBASE_DOMAIN}/grpFlags/mention-all.json`)
    .then((res) => {
      for (const key in res.data) {
        mentionAllGrps.push({ id: key, grpId: res.data[key].grpId });
      }
      console.log(mentionAllGrps);
    });
  let mentionAllAdminOnlyGrps = [];
  axios
    .get(`${process.env.FIREBASE_DOMAIN}/grpFlags/mention-all-admin-only.json`)
    .then((res) => {
      for (const key in res.data) {
        mentionAllAdminOnlyGrps.push({ id: key, grpId: res.data[key].grpId });
      }
      console.log(mentionAllAdminOnlyGrps);
    });
  let nsfwRoastGrps = [];
  axios
    .get(`${process.env.FIREBASE_DOMAIN}/grpFlags/nsfw-roast.json`)
    .then((res) => {
      for (const key in res.data) {
        nsfwRoastGrps.push({ id: key, grpId: res.data[key].grpId });
      }
    });
  let grpData = [];
  axios.get(`${process.env.FIREBASE_DOMAIN}/grpData.json`).then((res) => {
    for (const key in res.data) {
      grpData.push({ id: key, data: res.data[key].data });
    }
    console.log(grpData);
  });

  const grpRoles = [
    {
      title: ".agr mention-all",
      description:
        "To enable this group for letting all members mention everyone like discord",
    },
    {
      title: ".agr mention-all-admin-only",
      description:
        "To enable this group for letting only admins mention everyone",
    },
    {
      title: ".agr nsfw-roast",
      description:
        "To enable this group for letting all members use roast command which may be nsfw",
    },
  ];
  const pollGrps = [
    "Unofficial",
    "#3: HASH",
    "OT4KU",
    "Straw Hat",
    "CATS",
    "WE",
    "Chaman",
    "CS Team",
    "BDAY",
    "pendicul",
    "testing",
  ];
  const wikiEndpoint = "https://en.wikipedia.org/w/api.php?";
  const mathsEndpoint = "http://api.mathjs.org/v4/?expr=";
  let params = {},
    op1count = 0,
    op2count = 0,
    totalVotes = 0,
    pollActive = false,
    pollMsg = "",
    op1msg = "",
    op2msg = "",
    pollVoters = [],
    op1percent = 0,
    op2percent = 0,
    pollerId = "",
    pollerName = "",
    pollerGrp = "";
  let poll = [{}],
    perm = false;
  let grpArray = [];

  client.onAnyMessage((message) => {
    // variables and constants required to make the data readable
    const data = message.body;
    const botQuery = data.split(" ");
    const queryCutter = botQuery[0] + " ";
    const queryWithDesc = data.substring(queryCutter.length).split("\n"); // Get everything written after the command
    let query = queryWithDesc[0];
    console.log("query", query, "queryWithDesc", queryWithDesc);
    const queryPart = query.split("-");
    let composeMsg = [],
      msgString = "",
      list = [];
    const songParams = {
      title: queryPart[0],
      artist: queryPart[1],
    };

    switch (botQuery[0]) {
      //////////////////////////////////////HI BOT//////////////////////////////////////
      case "HiBot":
      case "Hibot":
      case "hibot":
        RecievedMsgPermission = true;
        sendReply(
          message.chatId,
          "No need to say hi to me, I am always here, reading every message you send to this guy.😁\nSend 'HelpBot' for commands",
          message.id.toString(),
          "Error when sending: "
        );
        break;
      ////////////////////////////////////CALCULATE//////////////////////////////////////
      case ".calc":
        RecievedMsgPermission = true;
        axios
          .get(mathsEndpoint + encodeURIComponent(query) + "&precision=3")
          .then((response) => {
            sendReply(
              message.chatId,
              response.data.toString(),
              message.id.toString(),
              "Error when sending: "
            );
          })
          .catch((error) => {
            console.log(error.response.data);
            sendReply(
              message.chatId,
              error.response.data,
              message.id.toString(),
              "Error when sending: "
            );
          });
        break;
      //////////////////////////////////////ROAST///////////////////////////////////////
      case ".roast":
      case "BotRoast":
      case "Botroast":
      case "botroast":
        RecievedMsgPermission = true;
        let roastPerm = false;
        // Check if the group allows nsfw roats or not
        nsfwRoastGrps.forEach((grp) => {
          if (message.chat.name.search(grp) !== -1 || !message.isGroupMsg) {
            roastPerm = true;
          }
        });
        if (!roastPerm) {
          composeMsg = [
            "This command is not supported here. There are people here who don't like it.\n```THEY AREN'T COOL ENOUGH.```\n\nAsk admins for activating this command in this group\n\nIf you are an admin yourself, then use GroupRoles command for activating this command in this group.",
          ];
          composeMsg.forEach((txt) => {
            msgString += txt;
          });
          sendReply(
            message.chatId,
            msgString,
            message.id.toString(),
            "Error while sending roast"
          );
          break;
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
              composeMsg = [
                "Ooops.. Please try again\nThe roast was too severe",
              ];
              console.log(response.data.insult);
            } else {
              composeMsg = [
                "Roast from Bot\n-------------------------\n",
                "Dear ",
                query,
                ", ",
                response.data.insult,
              ];
            }
            composeMsg.forEach((txt) => {
              msgString += txt;
            });
            // Send the response to the sender
            client
              .reply(message.chatId, msgString, message.id.toString())
              .then(() => {
                console.log(
                  "Sent message: " + msgString + "\n-------------------"
                );
              })
              .catch((erro) => {
                console.error("Error when sending the roast: ", erro);
              });
          })
          .catch((error) => {
            console.log(error);
          });
        break;
      ///////////////////////////////////TAG EVERYONE///////////////////////////////////////
      case ".yall":
      case ".y'all":
      case ".all":
      case ".every":
      case "@everyone":
      case ".everyone":
        RecievedMsgPermission = true;
        let annoyPerm = false,
          isAdmin = false;
        query = data.substring(queryCutter.length);
        // Check if the group allows annoying mentions or not
        message.chat.groupMetadata.participants.forEach((participant) => {
          if (participant.isAdmin && participant.id === message.sender.id) {
            isAdmin = true;
          }
        });

        mentionAllAdminOnlyGrps.forEach((grp) => {
          if (message.isGroupMsg && message.chatId === grp.grpId && isAdmin) {
            annoyPerm = true;
          }
        });
        mentionAllGrps.forEach((grp) => {
          if (message.isGroupMsg && message.chatId === grp.grpId) {
            annoyPerm = true;
          }
        });

        if (!annoyPerm) {
          message.isGroupMsg
            ? (msgString =
                "People get annoyed by useless mentioning😔\n\nAsk admins for activating this command in this group\n\nIf you are an admin yourself, then use GroupRoles command for activating this command in this group.")
            : (msgString = "This command is not supported in dms😁");

          // Send the response to the sender
          client
            .reply(message.chatId, msgString, message.id.toString())
            .then(() => {
              console.log(
                "Sent message: " + msgString + "\n-------------------"
              );
            })
            .catch((erro) => {
              console.error("Error when sending kanji definition: ", erro);
            });
        } else {
          composeMsg = [
            "‼```Tagging Everyone on request of``` *",
            message.sender.verifiedName
              ? message.sender.verifiedName
              : message.sender.notifyName,
            "‼*\n",
            query
              ? "\n----------------------------------------------------\n"
              : "",
            query ? query : "",
            "\n----------------------------------------------------\n",
          ];
          composeMsg.forEach((txt) => (msgString += txt));
          // Send the response to the sender
          client
            .getGroupMembersIds(message.chat.groupMetadata.id)
            .then((res) => {
              let members = [];
              res.forEach((member) => {
                members.push(member.user.toString());
                msgString += `@${member.user.toString()} | `;
              });
              client
                .sendMentioned(message.chatId, msgString, members)
                .then(() => {
                  console.log(
                    "Sent message: " + msgString + "\n-------------------"
                  );
                })
                .catch((erro) => {
                  console.log("Error when tagging: ", erro);
                });
            })
            .catch((erro) => {
              console.error("Error when tagging: ", erro);
            });
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
            let meaningString = "",
              kunString = "",
              onString = "",
              i;
            for (i = 0; i < kanjiData.meanings.length; i++) {
              meaningString += kanjiData.meanings[i] + " | ";
            }
            for (i = 0; i < kanjiData.kun_readings.length; i++) {
              kunString += kanjiData.kun_readings[i] + " | ";
            }
            for (i = 0; i < kanjiData.on_readings.length; i++) {
              onString += kanjiData.on_readings[i] + " | ";
            }
            // Set the fields to be sent in message
            composeMsg = [
              " *Kanji* : ",
              query,
              "\n *Meanings* : ",
              meaningString,
              "\n *Kunyomi readings* : ",
              kunString,
              "\n *Onyomi readings* : ",
              onString,
            ];
            composeMsg.forEach(function (txt) {
              msgString += txt;
            });
            // Send the response to the sender
            client
              .reply(message.chatId, msgString, message.id.toString())
              .then(() => {
                console.log(
                  "Sent message: " + msgString + "\n-------------------"
                );
              })
              .catch((erro) => {
                console.error("Error when sending kanji definition: ", erro);
              });
          })
          .catch((err) => {
            // Send not found to sender
            client
              .reply(
                message.chatId,
                "Word not found.. Sorry",
                message.id.toString()
              )
              .then(() => {
                console.log(err);
              })
              .catch((erro) => {
                console.error("Error when sending error: ", erro);
              });
          });
        break;
      ////////////////////////////////////DICTIONARY////////////////////////////////////
      case ".ed":
      case "Engdef":
      case "EnglishDefine":
      case "Englishdefine":
      case "englishdefine":
        RecievedMsgPermission = true;
        buttonsArray = [
          {
            buttonId: "ed",
            buttonText: { displayText: "EnglishDefine Inception" },
            type: 1,
          },
          { buttonId: "ihelp", buttonText: { displayText: ".ihelp" }, type: 1 },
          { buttonId: "help", buttonText: { displayText: ".help" }, type: 1 },
        ];
        // Get the response from the api
        axios
          .get("https://api.dictionaryapi.dev/api/v2/entries/en_US/" + query)
          .then((response) => {
            // Set the fields of the message
            response.data[0].meanings.forEach((meaning) => {
              composeMsg.push("*", meaning.partOfSpeech, "*\n\n");
              meaning.definitions.forEach((def) => {
                composeMsg.push(
                  "*Definition*: ",
                  def.definition,
                  "\n*For Example*: ",
                  def.example ? def.example : "Not Available😕",
                  "\n\n"
                );
              });
              composeMsg.push(
                "\n---------------------------------------------------\n"
              );
            });
            composeMsg.forEach((txt) => {
              msgString += txt;
            });
            // Send the response to the sender
            client
              .sendButtons(
                message.chatId,
                msgString,
                buttonsArray,
                "Click on buttons for other menus and examples"
              )
              .then(() => {
                console.log(
                  "Sent message: " + msgString + "\n-------------------"
                );
              })
              .catch((erro) => {
                console.error("Error when sending: ", erro);
              });
          })
          .catch((err) => {
            client
              .sendButtons(
                message.chatId,
                err.response.data.message +
                  "\n\n" +
                  err.response.data.resolution,
                buttonsArray,
                "Click on buttons for other menus and examples"
              )
              .then(() => {
                console.log(err);
              })
              .catch((erro) => {
                console.error("Error when sending error: ", erro);
              });
          });
        break;
      /////////////////////////////TALK WITH AI/////////////////////////////////
      case ".talk":
        RecievedMsgPermission = true;
        query = data.substring(queryCutter.length);
        openai.APIkey(process.env.OPENAI_API_KEY);
        (async () => {
          const data = await openai.GetResponse(query);
          msgString =
            "You are talking with an AI\nIt said:\n-----------------------\n" +
            data.choices[0].text;
          sendReply(
            message.chatId,
            msgString,
            message.id.toString(),
            "Error when sending AI response: "
          );
        })();
        break;
      //////////////////////////TRANSLATE AND CORRECT GRAMMAR/////////////////////////////////
      case ".gram":
      case ".grammar":
      case ".tran":
      case ".translate":
      case ".ayaz":
        RecievedMsgPermission = true;
        query = data.substring(queryCutter.length);
        openai.APIkey(process.env.OPENAI_API_KEY);
        (async () => {
          const data = await openai.GetError(query);
          composeMsg = [
            botQuery[0] === ".tran" || botQuery[0] === ".translate"
              ? "Translation:"
              : "Grammar correction:",
            "\n--------------------\n",
            data.choices[0].text,
            " 😌",
          ];
          composeMsg.forEach((txt) => {
            msgString += txt;
          });
          sendReply(
            message.chatId,
            msgString,
            message.id.toString(),
            "Error when correcting grammer: "
          );
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
          gsrsearch: query,
        };
        axios
          .get(wikiEndpoint, { params })
          .then((response) => {
            if (response.data.query) {
              // If the page is found then query exists
              const wikis = Object.values(response.data.query.pages);
              // Set the fields to be sent in message
              composeMsg = ["Checkout the menu for the page details👇"]; // composeMsg will be used as description of the button options
              list = [
                {
                  title: "Search Results👌",
                  rows: [],
                },
              ];
              wikis.forEach((wiki) => {
                list[0].rows.push({
                  title: `WikiPage ${wiki.pageid}`,
                  description: wiki.title,
                });
              });
              composeMsg.forEach((txt) => {
                msgString += txt;
              });
              sendListMenu(
                message.chatId,
                `Searched: '${query}'`,
                "subTitle",
                msgString,
                "Results",
                list
              );
            } else {
              sendReply(
                message.chatId,
                "Not found",
                message.id.toString(),
                "Error when sending Not found: "
              );
            }
          })
          .catch((error) => {
            console.log(error);
          });
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
          prop: "pageimages|extracts",
          pithumbsize: 400,
          pageids: query,
          exintro: true,
          explaintext: true,
        };
        axios
          .get(wikiEndpoint, { params })
          .then((response) => {
            if (response.data.query) {
              // If the page is found then query exists
              const wiki = Object.values(response.data.query.pages);
              // Set the fields to be sent in message
              composeMsg = [
                "*Image File name* :\n",
                wiki[0].pageimage ? wiki[0].pageimage : "_No image found_ ☹",
                "\n*Page ID* : ",
                wiki[0].pageid,
                "\n*Title* : ",
                wiki[0].title,
                "\n*Info* : ",
                wiki[0].extract,
              ];
              composeMsg.forEach((txt) => {
                msgString += txt;
              });
              // Send the response to the sender
              if (wiki[0].thumbnail) {
                sendImage(
                  message.chatId,
                  wiki[0].thumbnail.source,
                  msgString,
                  "Error when sending page details: "
                );
              } else {
                sendText(
                  message.chatId,
                  msgString,
                  "Error when sending page details: "
                );
              }
            } else {
              sendText(
                message.chatId,
                `Searched query: ${query}\n_Page Not Found_\nCheck the syntax and page id\nDon't get confused with similar commands\nCheck them by sending *InfoHelp*`,
                "Error when sending page not found"
              );
            }
          })
          .catch((error) => {
            console.log(error);
          });
        break;
      ///////////////////////////////////// POLL //////////////////////////////
      case ".poll":
        RecievedMsgPermission = true;

        // Check permission
        let pollPerm = false;
        pollGrps.forEach((grp) => {
          if (message.isGroupMsg && message.chat.name.search(grp) !== -1) {
            pollPerm = true;
          }
        });
        if (!pollPerm) {
          message.isGroupMsg
            ? (msgString =
                "Maybe the members won't like the spam\n\nAsk admins for activating this command in this group")
            : (msgString = "This command is not supported in dms😁");

          sendText(message.chatId, msgString, "Error when sending warning: ");
          break;
        }

        // If there is an active poll going on
        if (message.chatId !== pollerGrp && pollActive && !message.fromMe) {
          msgString =
            "There is already a poll going on in another group.\nWait for it to end😅";
          sendText(message.chatId, msgString, "Error when sending warning: ");
          break;
        }

        // Someone entered wrong syntax
        if (!queryPart[2] && !pollActive) {
          msgString =
            "Enter the command properly🤦‍♂️\n\nOr maybe the poll has ended😅";
          client
            .sendText(message.chatId, msgString)
            .then(() => {
              console.log(
                "Sent message: " + msgString + "\n------------------\n"
              );
            })
            .catch((erro) => {
              console.error("Error while ending the poll: ", erro);
            });
          break;
        }

        // If someone requested to end the poll
        if (
          query === "end" &&
          (pollerId === message.sender.id || message.fromMe)
        ) {
          composeMsg = [
            "```Closed the poll on request of``` *",
            message.sender.displayName,
            "*\n----------------------------------\n*",
            pollMsg,
            "*\nResult:",
            "\n1. ",
            op1msg,
            " (",
            op1percent,
            "%)",
            "\n2. ",
            op2msg,
            " (",
            op2percent,
            "%)",
            "\nTotal votes: ",
            totalVotes,
          ];
          composeMsg.forEach((txt) => {
            msgString += txt;
          });
          (op1count = 0), (op2count = 0), (totalVotes = 0);
          (pollMsg = ""), (op1msg = ""), (op2msg = "");
          (op1percent = 0), (op2percent = 0);
          pollActive = false;
          pollVoters = [];
          client
            .sendText(message.chatId, msgString)
            .then(() => {
              console.log(
                "Sent message: " + msgString + "\n------------------\n"
              );
            })
            .catch((erro) => {
              console.error("Error while ending the poll: ", erro);
            });
          break;
        } else if (query === "end" && pollerId !== message.sender.id) {
          msgString = `Only the creater of the poll (${pollerName}) can end it`;
          sendText(message.chatId, msgString, "Error while ending the poll: ");
          break;
        }

        // Voting logic
        if (queryPart[0] === "op1") {
          if (!pollVoters.includes(message.sender.id)) {
            op1count++;
            totalVotes++;
            pollVoters.push(message.sender.id);
          } else {
            msgString = `${
              message.sender.verifiedName
                ? message.sender.verifiedName
                : message.sender.displayName
            }, You have voted already!!`;
            sendText(message.chatId, msgString, "Error while sending warning");
            break;
          }
        } else if (queryPart[0] === "op2") {
          if (!pollVoters.includes(message.sender.id)) {
            op2count++;
            totalVotes++;
            pollVoters.push(message.sender.id);
          } else {
            msgString = `${
              message.sender.verifiedName
                ? message.sender.verifiedName
                : message.sender.displayName
            }, You have voted already!!`;
            sendText(message.chatId, msgString, "Error while sending warning");
            break;
          }
        } else if (totalVotes === 0) {
          pollMsg = queryPart[0];
          op1msg = queryPart[1];
          op2msg = queryPart[2];
          op1percent = 0;
          op2percent = 0;
          pollerGrp = message.chatId;
          pollerId = message.sender.id;
          (pollerName = message.sender.verifiedName
            ? message.sender.verifiedName
            : message.sender.notifyName),
            (pollActive = true);
        }
        if (totalVotes !== 0) {
          op1percent = (op1count / totalVotes) * 100;
          op2percent = (op2count / totalVotes) * 100;
          op1percent = op1percent.toFixed(2);
          op2percent = op2percent.toFixed(2);
        }

        // Sending response
        composeMsg = [
          "```Started a poll on the request of``` *",
          pollerName,
          "*\n----------------------------------\n*",
          pollMsg,
          "*\nOptions:",
          "\n1. ",
          op1msg,
          " (",
          op1percent,
          "%)",
          "\n2. ",
          op2msg,
          " (",
          op2percent,
          "%)",
          "\nTotal votes: ",
          totalVotes,
        ];
        composeMsg.forEach((txt) => {
          msgString += txt;
        });
        buttonsArray = [
          {
            buttonId: "opt1",
            buttonText: { displayText: ".poll op1-" + op1msg },
            type: 1,
          },
          {
            buttonId: "opt2",
            buttonText: { displayText: ".poll op2-" + op2msg },
            type: 1,
          },
          {
            buttonId: "reset",
            buttonText: { displayText: ".poll end" },
            type: 1,
          },
        ];
        sendButtons(
          message.chatId,
          msgString,
          buttonsArray,
          "You can click on the buttons for voting.\nIf buttons are not availabe- Send '.poll op1' or '.poll op2' to vote or '.poll end' to end the poll."
        );
        break;
      ///////////////////////////////////ANIME DETAIL///////////////////////////////////
      case ".ad":
      case "AnimeDetail":
      case "Animedetail":
      case "animedetail":
        RecievedMsgPermission = true;
        malScraper
          .getInfoFromName(query)
          .then((data) => {
            console.log(data);
            let genreString = "",
              staffString = "",
              charString = "";
            data.genres.forEach((genre) => {
              genreString += genre + " | ";
            });
            data.staff.forEach((person) => {
              staffString += `${person.name} (${person.role}) | `;
            });
            data.characters.forEach((char) => {
              if (char.role === "Main") {
                charString += char.name + " | ";
              }
            });
            // Set the fields to be sent in message
            composeMsg = [
              "*Title* : ",
              data.title,
              "\n*English Title* : ",
              data.englishTitle,
              "\n*Japanese Title* : ",
              data.japaneseTitle,
              "\n*Episodes* : ",
              data.episodes,
              "\n*Type* : ",
              data.type,
              "\n*Aired* : ",
              data.aired,
              "\n*Genres* : ",
              genreString,
              "\n*Status* : ",
              data.status,
              "\n*Duration*🕑 : ",
              data.duration,
              "\n*Rating* : ",
              data.rating,
              "\n\n*Main Characters* : ",
              charString,
              "\n\n*Staff* : ",
              staffString,
              "\n\n*Synopsis* : ",
              data.synopsis,
            ];
            composeMsg.forEach((txt) => {
              msgString += txt;
            });
            // Send the response to the sender
            client
              .sendImage(message.chatId, data.picture, null, msgString)
              .then(() => {
                console.log(
                  "Sent message: \n" + msgString + "\n--------------------"
                );
              })
              .catch((erro) => {
                console.error("Error when sending kanji definition: ", erro);
              });
          })
          .catch((err) => {
            // Send not found to sender
            buttonsArray = [
              {
                buttonId: "ad",
                buttonText: { displayText: "AnimeDetail Naruto" },
                type: 1,
              },
              {
                buttonId: "ahelp",
                buttonText: { displayText: "AnimeHelp" },
                type: 1,
              },
              {
                buttonId: "help",
                buttonText: { displayText: ".help" },
                type: 1,
              },
            ];
            client
              .sendButtons(
                message.chatId,
                "Anime not found.. Sorry",
                buttonsArray,
                "Chose the buttons for examples and menu"
              )
              .then(() => {
                console.log(err);
              })
              .catch((erro) => {
                console.error("Error when sending error: ", erro);
              });
          });
        break;
      ////////////////////////////////////ANIME IDs/////////////////////////////////////
      case ".aid":
      case "AnimeIds":
      case "Animeids":
      case "animeids":
        RecievedMsgPermission = true;
        acb
          .get_anime_by_search(query)
          .then((data) => {
            msgString =
              "Click on an Anime ID from the buttons to get its characters"; // composeMsg will be used as description of the button options
            list = [
              {
                title: "Search Results",
                rows: [],
              },
            ];

            data.forEach((result) => {
              msgString += "\n*" + result.anime_id + "* - " + result.anime_name;
              list[0].rows.push({
                title: `AnimeChars ${result.anime_id}`,
                description: result.anime_name,
              });
            });
            msgString +=
              "\nGet the IDs of characters of an anime by sending 'AnimeChars <id>\nFor example\n*AnimeChars 101671*";

            sendListMenu(
              message.chatId,
              "Checkout the bottom menu To get character of the Animes",
              "Help and all commands",
              msgString,
              "Commands",
              list
            );
          })
          .catch((err) => {
            // Send not found to sender
            buttonsArray = [
              {
                buttonId: "aid",
                buttonText: { displayText: "AnimeIds Naruto" },
                type: 1,
              },
              {
                buttonId: "ahelp",
                buttonText: { displayText: "AnimeHelp" },
                type: 1,
              },
              {
                buttonId: "help",
                buttonText: { displayText: ".help" },
                type: 1,
              },
            ];
            client
              .sendButtons(
                message.chatId,
                "Anime not found.. Sorry. Check if the command syntax is wrong",
                buttonsArray,
                "Chose the buttons for examples and menu"
              )
              .then(() => {
                console.log(err);
              })
              .catch((erro) => {
                console.error("Error when sending error: ", erro);
              });
          });
        break;
      //////////////////////////////ANIME CHARACTERS IDs////////////////////////////////
      case ".ac":
      case "AnimeChars":
      case "AnimeChars":
      case "animechars":
        RecievedMsgPermission = true;
        acb
          .get_anime_by_id(query)
          .then((data) => {
            // Set the fields to be sent in message
            msgString =
              data.anime_id + "- *" + data.anime_name + "*\n*Characters:*";
            data.characters.forEach((character) => {
              msgString += "\n*" + character.id + "* - " + character.name;
            });
            msgString +=
              "\nGet details of a character by sending 'CharIdDetail <id>\nFor example\n*CharIdDetail 10820*";
            // Send the response to the sender
            client
              .sendImage(message.chatId, data.anime_image, null, msgString)
              .then(() => {
                console.log(
                  "Sent message: \n" + msgString + "\n--------------------"
                );
              })
              .catch((erro) => {
                console.error("Error when sending character ids: ", erro);
              });
          })
          .catch((err) => {
            // Send not found to sender
            buttonsArray = [
              {
                buttonId: "aid",
                buttonText: { displayText: "AnimeChars Naruto" },
                type: 1,
              },
              {
                buttonId: "ahelp",
                buttonText: { displayText: "AnimeHelp" },
                type: 1,
              },
              {
                buttonId: "help",
                buttonText: { displayText: ".help" },
                type: 1,
              },
            ];
            client
              .sendButtons(
                message.chatId,
                "Anime not found.. Sorry",
                buttonsArray,
                "Chose the buttons for examples and menu"
              )
              .then(() => {
                console.log(err);
              })
              .catch((erro) => {
                console.error("Error when sending error: ", erro);
              });
          });
        break;
      /////////////////////////ANIME CHARACTER DETAIL- BY SEARCH////////////////////////
      case ".cd":
      case "CharDetail":
      case "Chardetail":
      case "chardetail":
        RecievedMsgPermission = true;
        acb
          .get_character_by_search(query)
          .then((data) => {
            // Set the fields to be sent in message
            composeMsg = [
              "*Name* : ",
              data[0].name,
              "\n*Gender* : ",
              data[0].gender,
              "\n*ID* : ",
              data[0].id,
              "\n*Description* : ",
              data[0].desc,
            ];
            if (data.length > 1) {
              list = [
                {
                  title: "Search Results",
                  rows: [],
                },
              ];
              data.forEach((result) => {
                list[0].rows.push({
                  title: `CharIdDetail ${result.id}`,
                  description: result.anime_name,
                });
              });
            }
            composeMsg.forEach((txt) => {
              msgString += txt;
            });
            // Send the response to the sender
            client
              .sendImage(
                message.chatId,
                data[0].character_image,
                null,
                msgString
              )
              .then(() => {
                console.log(
                  "Sent message: \n" + msgString + "\n--------------------"
                );
              })
              .catch((erro) => {
                console.error("Error when sending character details: ", erro);
              });

            sendListMenu(
              message.chatId,
              "Characters with similar Names",
              "subTitle",
              "Checkout the menu",
              "Results",
              list
            );
          })
          .catch((err) => {
            // Send not found to sender
            client
              .reply(
                message.chatId,
                "Character not found.. Sorry.\nCheck if the command syntax is right or not.\nDon't get confused by similar looking commands.",
                message.id.toString()
              )
              .then(() => {
                console.log(err);
              })
              .catch((erro) => {
                console.error("Error when sending error: ", erro);
              });
          });
        break;
      ////////////////////////////////////MOVIE DETAIL//////////////////////////////////
      case ".md":
      case "MovieDetail":
      case "Moviedetail":
      case "moviedetail":
        RecievedMsgPermission = true;
        buttonsArray = [
          {
            buttonId: "md",
            buttonText: { displayText: "MovieDetail Inception" },
            type: 1,
          },
          {
            buttonId: "ehelp",
            buttonText: { displayText: "EntHelp" },
            type: 1,
          },
          { buttonId: "help", buttonText: { displayText: ".help" }, type: 1 },
        ];
        axios
          .get(
            "https://www.omdbapi.com/?apikey=" +
              process.env.OMDB_API_KEY +
              "&t=" +
              query
          )
          .then((response) => {
            // Set the fields of the message
            composeMsg = [
              "*Title* : ",
              response.data.Title,
              "\n*Type* : ",
              response.data.Type,
              "\n*Year* : ",
              response.data.Year,
              "\n*Rated* : ",
              response.data.Rated,
              "\n*Released* : ",
              response.data.Released,
              "\n*Run-time* : ",
              response.data.Runtime,
              "\n*Genre* : ",
              response.data.Genre,
              "\n*Director* : ",
              response.data.Director,
              "\n*Writer* : ",
              response.data.Writer,
              "\n*Actors* : ",
              response.data.Actors,
              "\n*Language* : ",
              response.data.Language,
              "\n*Country* : ",
              response.data.Country,
              "\n*Awards* : ",
              response.data.Awards,
              "\n*IMDB rating* : ",
              response.data.imdbRating,
              "\n*Plot* : ",
              response.data.Plot,
            ];
            // Convert the array into text string
            composeMsg.forEach((txt) => {
              msgString += txt;
            });
            // Send the response to the sender
            if (response.data.Response === "True") {
              // If the movie was found then send the details and poster
              if (response.data.Poster === "N/A") {
                // If there is no poster then send only the details
                client
                  .sendButtons(
                    message.chatId,
                    msgString,
                    buttonsArray,
                    "Chose the buttons for examples and menu"
                  )
                  .then(() => {
                    console.log(
                      "Sent message: " + msgString + "\n-------------------"
                    );
                  })
                  .catch((erro) => {
                    console.error("Error when sending: ", erro);
                  });
              } else {
                // If there is a poster then send the details with the poster
                client
                  .sendImage(
                    message.chatId,
                    response.data.Poster,
                    null,
                    msgString
                  )
                  .then(() => {
                    console.log(
                      "Sent message: " + msgString + "\n-------------------"
                    );
                  })
                  .catch((erro) => {
                    console.error("Error when sending: ", erro);
                  });
              }
            } else {
              // If movie/ series is not found
              client
                .sendButtons(
                  message.chatId,
                  "Movie/ Series not found.. Sorry. Check the spelling",
                  buttonsArray,
                  "Chose the buttons for examples and menu"
                )
                .then(() => {
                  console.log(response.data.Error);
                })
                .catch((erro) => {
                  console.error("Error when sending error: ", erro);
                });
            }
          })
          .catch((err) => {
            console.error("Error when getting movie: ", erro);
          });
        break;
      /////////////////////////////////////SONG DETAIL//////////////////////////////////
      case ".sd":
      case "SongDetail":
      case "Songdetail":
      case "songdetail":
        RecievedMsgPermission = true;
        musicInfo
          .searchSong(songParams, 600)
          .then((song) => {
            const songLength = song.lengthMilliSec / 1000;
            const lengthString =
              Math.floor(songLength / 60) + ":" + Math.floor(songLength % 60);
            composeMsg = [
              "*Title* : ",
              song.title,
              "\n*Artist* : ",
              song.artist,
              "\n*Album* : ",
              song.album,
              "\n*Released* : ",
              song.releaseDate.substring(0, 10),
              "\n*Length* : ",
              lengthString,
              "\n*Genre* : ",
              song.genre,
              "\n--------------------------------------------------",
              "For lyrics of the song:\n Send '.lyrics' <Song name>'",
              "For example:\n*.lyrics Faded*",
            ];
            // Convert the array into text string
            composeMsg.forEach((txt) => {
              msgString += txt;
            });
            // Send the response to the sender
            client
              .sendImage(message.chatId, song.artwork, null, msgString)
              .then(() => {
                console.log(
                  "Sent message: \n" + msgString + "\n--------------------"
                );
              })
              .catch((erro) => {
                console.error("Error when sending error: ", erro);
              });
          })
          .catch((err) => {
            client
              .reply(
                message.chatId,
                "Song not found\n-Add Artist too\n-Check the syntax and spelling",
                message.id.toString()
              )
              .then(() => {
                console.log(err);
              })
              .catch((erro) => {
                console.error("Error when sending error: ", erro);
              });
          });
        break;
      /////////////////////////////////////SONG LYRICS//////////////////////////////////
      case ".lyrics":
        RecievedMsgPermission = true;
        musicInfo
          .searchLyrics(songParams, 600)
          .then((song) => {
            composeMsg = [
              "*Searched* : ",
              query,
              "\n-------------------------------------",
              "\n*Lyrics* :\n",
              song.lyrics,
              "\n--------------------------------------------------",
              "\nTo get the details of a song:",
              "\nSend 'SongDetail <Song name> | Short Command: *.sd*",
              "\nFor example:\n*SongDetail Faded*",
              "\nIf you didn't get the desired result then put the name of the artist too",
              "\nFor example:\n*SongDetail Faded Alan Walker*",
            ];
            // Convert the array into text string
            composeMsg.forEach((txt) => {
              msgString += txt;
            });
            // Send the response to the sender
            client
              .reply(message.chatId, msgString, message.id.toString())
              .then(() => {
                console.log(
                  "Sent message: \n" + msgString + "\n--------------------"
                );
              })
              .catch((erro) => {
                console.error("Error when sending error: ", erro);
              });
          })
          .catch((err) => {
            client
              .reply(
                message.chatId,
                "Lyrics not found\n-Add Artist too\n-Check the syntax and spelling",
                message.id.toString()
              )
              .then(() => {
                console.log(err);
              })
              .catch((erro) => {
                console.error("Error when sending error: ", erro);
              });
          });
        break;
      ///////////////////////////ANIME CHARACTER DETAIL- BY ID//////////////////////////
      case ".cid":
      case "CharIdDetail":
      case "Chariddetail":
      case "chariddetail":
        RecievedMsgPermission = true;
        acb
          .get_character_by_id(query)
          .then((data) => {
            // Set the fields to be sent in message
            composeMsg = [
              "*Name* : ",
              data.name,
              "\n*Gender* : ",
              data.gender,
              "\n*ID* : ",
              data.id,
              "\n*Description* : ",
              data.desc,
            ];
            composeMsg.forEach((txt) => {
              msgString += txt;
            });
            // Send the response to the sender
            client
              .sendImage(message.chatId, data.character_image, null, msgString)
              .then(() => {
                console.log(
                  "Sent message: \n" + msgString + "\n--------------------"
                );
              })
              .catch((erro) => {
                console.error("Error when sending kanji definition: ", erro);
              });
          })
          .catch((err) => {
            // Send not found to sender
            client
              .reply(
                message.chatId,
                "Character not found.. Sorry",
                message.id.toString()
              )
              .then(() => {
                console.log(err);
              })
              .catch((erro) => {
                console.error("Error when sending error: ", erro);
              });
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
        } while (truthOrDareFile.truthNdares[truthid].type != "Truth");
        composeMsg = ["Truth: ", truth, "\n", "Level: ", truthLevel];
        composeMsg.forEach((txt) => {
          msgString += txt;
        });
        buttonsArray = [
          { buttonId: "truth", buttonText: { displayText: ".truth" }, type: 1 },
          { buttonId: "dare", buttonText: { displayText: ".dare" }, type: 1 },
          { buttonId: "ghelp", buttonText: { displayText: ".ghelp" }, type: 1 },
        ];
        // Send the response to the sender
        client
          .sendButtons(
            message.chatId,
            msgString,
            buttonsArray,
            "Click on the buttons for help and other games"
          )
          .then(() => {
            console.log("Sent message: " + msgString + "\n-------------------");
          })
          .catch((error) => {
            console.error("Error when sending truth: ", error);
          });
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
        } while (truthOrDareFile.truthNdares[dareId].type != "Dare");
        composeMsg = ["Dare: ", dare, "\n", "Level: ", DareLevel];
        composeMsg.forEach((txt) => {
          msgString += txt;
        });
        buttonsArray = [
          { buttonId: "truth", buttonText: { displayText: ".truth" }, type: 1 },
          { buttonId: "dare", buttonText: { displayText: ".dare" }, type: 1 },
          { buttonId: "ghelp", buttonText: { displayText: ".ghelp" }, type: 1 },
        ];
        // Send the response to the sender
        client
          .sendButtons(
            message.chatId,
            msgString,
            buttonsArray,
            "Click on the buttons for help and other games"
          )
          .then(() => {
            console.log("Sent message: " + msgString + "\n-------------------");
          })
          .catch((error) => {
            console.error("Error when sending truth: ", error);
          });
        break;
      /////////////////////////////////WOULD YOU RATHER/////////////////////////////////
      case ".wyr":
      case "BotWyr":
      case "Botwyr":
      case "botwyr":
        RecievedMsgPermission = true;
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
            composeMsg = [
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
            client
              .sendButtons(
                message.chatId,
                "Would you rather:",
                buttonsArray,
                msgString
              )
              .then(() => {
                console.log(
                  "Sent Wyr question:\n" +
                    response.blue.question +
                    "\n" +
                    response.red.question +
                    "\n-------------------"
                );
              })
              .catch((error) => {
                console.error("Error when sending truth: ", error);
              });
          })
          .catch((err) => {
            // Send not found to sender
            buttonsArray = [
              { buttonId: "wyr", buttonText: { displayText: ".wyr" }, type: 1 },
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
            client
              .sendButtons(
                message.chatId,
                "Question not found.. Sorry\nTry again",
                buttonsArray,
                "Chose the buttons for examples and menu"
              )
              .then(() => {
                console.log(err);
              })
              .catch((erro) => {
                console.error("Error when sending error: ", erro);
              });
          });
        break;
      ////////////////////////////////////GRP ROLES/////////////////////////////////
      case ".grpRoles":
      case ".groupRoles":
      case ".grouproles":
      case "GroupRoles":
      case "Grouproles":
      case ".groles":
        RecievedMsgPermission = true;
        console.log("in groles");
        perm = false;
        message.chat.groupMetadata.participants.forEach((participant) => {
          if (participant.isAdmin && participant.id === message.sender.id) {
            perm = true;
          }
        });

        // If sender is not a an admin then send warning
        if (!perm) {
          sendReply(
            message.chatId,
            "This command is used for choosing a group roles.\n\nThis commands is only for admins",
            message.id.toString(),
            "Error when sending warning: "
          );
          break;
        }

        list = [
          {
            title: "Group Roles",
            rows: grpRoles,
          },
        ];

        sendListMenu(
          message.chatId,
          "Welcome to THE BOT",
          "Select the type of role",
          "Select the Group Role for this group\n\nThis command is only for admins",
          "Group Roles",
          list
        );
        break;
      ////////////////////////////////////ADD GRP ROLE/////////////////////////////////
      case ".agr":
        RecievedMsgPermission = true;
        console.log("in add groles");

        // Check whether the sender is an admin
        perm = false;
        message.chat.groupMetadata.participants.forEach((participant) => {
          if (participant.isAdmin && participant.id === message.sender.id) {
            perm = true;
          }
        });
        // If sender is not an admin then send warning
        if (!perm && !message.fromMe) {
          sendReply(
            message.chatId,
            "This command is used for choosing a group roles.\n\nThis commands is only for admins",
            message.id.toString(),
            "Error when sending warning: "
          );
          break;
        }

        switch (query) {
          case "mention-all":
            grpArray = mentionAllGrps;
            break;
          case "mention-all-admin-only":
            grpArray = mentionAllAdminOnlyGrps;
            break;
          case "nsfw-roast":
            grpArray = nsfwRoastGrps;
            break;
        }

        let grpPresentAlready = false;
        grpArray.forEach((grp) => {
          if (grp.grpId === message.chatId) {
            grpPresentAlready = true;
          }
        });

        // If group already has the selected role
        if (grpPresentAlready) {
          sendReply(
            message.chatId,
            `This group is already a ${query} group`,
            message.id.toString(),
            "Error when sending warning: "
          );
        } else {
          axios
            .post(`${process.env.FIREBASE_DOMAIN}/grpFlags/${query}.json`, {
              grpId: message.chatId,
            })
            .then((res) => {
              let updatedGrpArr = grpArray.push({
                id: res.data.name,
                grpId: message.chatId,
              });
              switch (query) {
                case "mention-all":
                  mentionAllGrps = updatedGrpArr;
                  break;
                case "mention-all-admin-only":
                  mentionAllAdminOnlyGrps = updatedGrpArr;
                  break;
                case "nsfw-roast":
                  nsfwRoastGrps = updatedGrpArr;
                  break;
              }

              sendReply(
                message.chatId,
                `Added this group to ${query}`,
                message.id.toString(),
                "Error when sending warning: "
              );
              console.log(res.data);
            })
            .catch((err) => console.log(err));
        }

        break;
      //////////////////////////////////DELETE GRP ROLE/////////////////////////////////
      case ".dgr":
        RecievedMsgPermission = true;
        console.log("in del groles");

        // Check whether the sender is an admin
        perm = false;
        message.chat.groupMetadata.participants.forEach((participant) => {
          if (participant.isAdmin && participant.id === message.sender.id) {
            perm = true;
          }
        });
        // If sender is not an admin then send warning
        if (!perm && !message.fromMe) {
          sendReply(
            message.chatId,
            "This command is used for deleting a group role.\n\nThis commands is only for admins",
            message.id.toString(),
            "Error when sending warning: "
          );
          break;
        }

        // Select the group to work on
        console.log(query);
        switch (query) {
          case "mention-all":
            grpArray = mentionAllGrps;
            break;
          case "mention-all-admin-only":
            grpArray = mentionAllAdminOnlyGrps;
            break;
          case "nsfw-roast":
            grpArray = nsfwRoastGrps;
            break;
        }

        let grpAbsent = true;
        grpArray.forEach((grp) => {
          if (grp.grpId === message.chatId) {
            grpAbsent = false;
          }
        });

        // If group doesnt have the selected role
        if (grpAbsent) {
          sendReply(
            message.chatId,
            `This group is not a ${query} group`,
            message.id.toString(),
            "Error when sending warning: "
          );
          break;
        } else {
          let selectedGrp = grpArray.find(
            (grp) => grp.grpId === message.chatId
          );
          console.log(grpArray);
          console.log("selectedgrp:", selectedGrp.id);

          axios
            .delete(
              `${process.env.FIREBASE_DOMAIN}/grpFlags/${query}/${selectedGrp.id}.json`
            )
            .then((res) => {
              let updatedGrpArr = grpArray.filter((grp) => {
                console.log(
                  message.chatId !== grp.grpId,
                  message.chatId != grp.grpId
                );
                return message.chatId !== grp.grpId;
              });
              console.log("grp array", updatedGrpArr);
              switch (query) {
                case "mention-all":
                  mentionAllGrps = updatedGrpArr;
                  console.log("all grps", mentionAllGrps);
                  break;
                case "mention-all-admin-only":
                  mentionAllAdminOnlyGrps = updatedGrpArr;
                  break;
                case "nsfw-roast":
                  nsfwRoastGrps = updatedGrpArr;
                  break;
              }

              sendReply(
                message.chatId,
                `Removed ${query} role from this group`,
                message.id.toString(),
                "Error when sending warning: "
              );
            })
            .catch((err) => {
              sendReply(
                message.chatId,
                "An error occurred\nCheck spellings and syntax",
                message.id.toString(),
                "Error when sending error: "
              );
              console.log(err.data);
            });
        }

        break;
      //////////////////////////////////ADD ROLE/////////////////////////////////
      case ".ar":
        RecievedMsgPermission = true;
        console.log("in add role");

        // Check whether the sender is an admin
        perm = false;
        message.chat.groupMetadata.participants.forEach((participant) => {
          if (participant.isAdmin && participant.id === message.sender.id) {
            perm = true;
          }
        });
        // If sender is not an admin then send warning
        if (!perm && !message.fromMe) {
          sendReply(
            message.chatId,
            "This command is used for deleting a group role.\n\nThis commands is only for admins",
            message.id.toString(),
            "Error when sending warning: "
          );
          break;
        }

        // Select the group to work on
        console.log(message.data);
        console.log(query);

        let roleAbsent = false;
        // roleArray.forEach((grp) => {
        //   if (grp.grpId === message.chatId) {
        //     grpAbsent = false;
        //   }
        // });

        // If group doesnt have the selected role
        if (roleAbsent) {
          sendReply(
            message.chatId,
            `This group is not a ${query} group`,
            message.id.toString(),
            "Error when sending warning: "
          );
          break;
        } else {
          // let selectedGrp = grpArray.find(
          //   (grp) => grp.grpId === message.chatId
          // );
          // console.log(grpArray);
          // console.log("selectedgrp:", selectedGrp.id);

          axios
            .post(
              `${process.env.FIREBASE_DOMAIN}/grpData/${message.chatId}.json`,
              { [query]: [] }
            )
            .then((res) => {
              // let updatedGrpArr = grpArray.filter((grp) => {
              //   console.log(
              //     message.chatId !== grp.grpId,
              //     message.chatId != grp.grpId
              //   );
              //   return message.chatId !== grp.grpId;
              // });
              // console.log("grp array", updatedGrpArr);

              sendReply(
                message.chatId,
                `Added ${query} role in this group`,
                message.id.toString(),
                "Error when sending grp addition: "
              );
            })
            .catch((err) => {
              sendReply(
                message.chatId,
                "An error occurred\nCheck spellings and syntax",
                message.id.toString(),
                "Error when sending error: "
              );
              console.log(err.data);
            });
        }

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
          "Check out the bottom menu for commands👇",
          "\nFor making stickers: ",
          "\nSend the image with caption *.sticker*",
          "\nFor extracting text from image (ocr):",
          "\nSend the image with caption *.ocr*",
          "\n--------------------------------------------------",
          "\n```There is no case sensitivity or need to type . in front of the full commands```",
        ];
        composeMsg.forEach((txt) => {
          msgString += txt;
        });

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
                description:
                  "For creating polls. Example .poll Do you drink tea or coffee?-Tea-Coffee",
              },
              {
                title: ".talk Who are you",
                description: "To talk with an AI",
              },
              {
                title: "@everyone <message>",
                description: "For tagging everyone like discord",
              },
              {
                title: "GroupRoles",
                description:
                  "For activating certain commands in a group (Admin only)",
              },
              {
                title: "InfoHelp ",
                description:
                  "To get Information related commands like wiki, dictionary, maths etc.",
              },
              {
                title: "GameHelp ",
                description:
                  "To get help and commands related to Games like truth or dare, Would you rather etc.",
              },
              {
                title: "EntHelp ",
                description:
                  "To get Entertainment related commands like movie, song, anime detail and lyrics",
              },
              {
                title: "AnimeHelp ",
                description: "To get help and commands related to Anime",
              },
            ],
          },
        ];

        sendListMenu(
          message.chatId,
          "Welcome to THE BOT",
          "Help and all commands",
          msgString,
          "Commands",
          list
        );
        break;
      ////////////////////////////////ENTERTAINMENT MENU////////////////////////////////
      case ".ehelp":
      case "EntHelp":
      case "Enthelp":
      case "enthelp":
        RecievedMsgPermission = true;
        // Compose the message
        composeMsg = [
          "If you didn't get the desired result then put the name of the artist too with a hyphen ( - )",
          "\nFor example:\n*SongDetail Faded-Alan Walker*",
          "\n--------------------------------------------------",
          "\n```There is no case sensitivity or need to type . in front of the full commands```",
        ];
        composeMsg.forEach((txt) => {
          msgString += txt;
        });
        list = [
          {
            title: "Entertainment and Media Related Commands",
            rows: [
              {
                title: "MovieDetail Inception",
                description:
                  "To get the details of a Movie/ Series | Short Command: .md <title>",
              },
              {
                title: "SongDetail Faded-Alan Walker",
                description:
                  "To get the details of a song | Short Command: .sd <Song name>",
              },
              {
                title: ".lyrics Faded-Alan Walker",
                description: "To get the lyrics of a song",
              },
              {
                title: "AnimeHelp ",
                description: "To get help and list of Anime related commands",
              },
              {
                title: "HelpBot ",
                description: "To get help and list of all commands.",
              },
            ],
          },
        ];

        sendListMenu(
          message.chatId,
          "Entertainment and Media related commands",
          "subTitle",
          msgString,
          "Commands",
          list
        );
        break;
      /////////////////////////////////INFORMATION MENU/////////////////////////////////
      case ".ihelp":
      case "InfoHelp":
      case "Infohelp":
      case "infohelp":
        RecievedMsgPermission = true;
        // Compose the message
        composeMsg = [
          "\n1. To get the meaning of an English word:",
          "\nSend 'EnglishDefine <Word>' | Short Command: *.ed* <word>",
          "\nFor example:\n*EnglishDefine table*",
          "\n--------------------------------------------------",
          "\n2. For searching wiki page IDs of a term:",
          "\nSend '.wiki <term>'",
          "\nFor example:\n*.wiki Indian Population*",
          "\n--------------------------------------------------",
          "\n3. To get the details of wiki page from page ID:",
          "\nSend 'wikiPage <page ID>' | Short Command: *.wp* <page ID>",
          "\nFor example:\n*wikiPage 14598*",
          "\n--------------------------------------------------",
          "\n4. For calculating:",
          "\nSend '.calc <expression>'",
          "\nFor example:\n*.calc 5*34*",
          "\nFor using multiple expressions:",
          "\nSend '.calc <expressions as array>",
          "\nFor example:\n*.calc [5+2, 4*6, a= 24, a+3]*",
          "\n--------------------------------------------------",
          "\n5. To get the details of a Kanji:",
          "\nSend 'KanjiDefine <Kanji>' | Short Command: *.kd* <Kanji>",
          "\nFor example:\n*KanjiDefine 空*",
          "\n--------------------------------------------------",
          "\n6. To get other Commands:",
          "\nSend 'HelpBot' | Short Command: *.help*",
          "\nFor example:\n*HelpBot*",
          "\n```There is no case sensitiviy for full commands```",
        ];
        composeMsg.forEach((txt) => {
          msgString += txt;
        });
        list = [
          {
            title: "Info Related Commands",
            rows: [
              {
                title: "EnglishDefine Table",
                description: "To get the definition of an English word",
              },
              {
                title: ".wiki Indian Population",
                description: "For searching a term on Wikipedia",
              },
              {
                title: "wikiPage 14598",
                description: "To get the details of wiki page.",
              },
              {
                title: ".calc 5*34",
                description: "For calculating",
              },
              {
                title:
                  ".calc [5+2, 4*6, a= 24, a+3,5.08 cm in inch,sin(45 deg) ^ 2]",
                description: "For using multiple expressions:",
              },
              {
                title: "KanjiDefine 空",
                description: "For readings and meaning of a Kanji.",
              },
              {
                title: "HelpBot ",
                description: "To get help and list of all commands.",
              },
            ],
          },
        ];

        sendListMenu(
          message.chatId,
          "Info related commands",
          "subTitle",
          msgString,
          "Commands",
          list
        );
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
          "\nSend 'BotTruth' To get a truth question | Short Command: *.truth*",
          "\n\nSend 'BotDare' To get a dare | Short Command: *.dare*",
          "\nFor example:\n*BotTruth* or *BotDare*",
          "\n--------------------------------------------------",
          "\n2. To get a 'Would You Rather' question:",
          "\nSend 'BotWyr' | Short Command: *.wyr*",
          "\nFor example:\n*BotWyr*",
          "\n--------------------------------------------------",
          "\n3. To get other Commands:",
          "\nSend 'HelpBot' | Short Command: *.help*",
          "\nFor example:\n*HelpBot*",
          "\n```There is no case sensitiviy for full commands```",
        ];
        composeMsg.forEach((txt) => {
          msgString += txt;
        });
        list = [
          {
            title: "Game Commands",
            rows: [
              {
                title: "BotDare ",
                description: "To get a dare",
              },
              {
                title: "BotTruth ",
                description: "To get a truth question",
              },
              {
                title: "BotWyr ",
                description: "To get a 'Would You Rather' question",
              },
              {
                title: "HelpBot ",
                description: "To get help and list of all commands.",
              },
            ],
          },
        ];

        sendListMenu(
          message.chatId,
          "Commands for Games",
          "subTitle",
          msgString,
          "Commands",
          list
        );
        break;
      ///////////////////////////////////ANIME MENU////////////////////////////////////
      case ".ahelp":
      case "AnimeHelp":
      case "Animehelp":
      case "animehelp":
        RecievedMsgPermission = true;
        // Compose the message
        composeMsg = [
          "1. To get the details of an Anime:",
          "\nSend 'AnimeDetail <Title>' | Short Command: *.ad* <Title>",
          "\nFor example:\n*AnimeDetail Naruto*",
          "\n--------------------------------------------------",
          "\n2. To get details of an Anime character by search:",
          "\nSend 'CharDetail <Name>' | Short Command: *.cd* <Name>",
          "\nFor example:\n*CharDetail Kakashi*",
          "\n--------------------------------------------------",
          "\n3. To get details of an Anime character by id:",
          "\nSend 'CharIdDetail <id>' | Short Command: *.cid* <id>",
          "\nFor example:\n*CharIdDetail 10820*",
          "\n--------------------------------------------------",
          "\n4. To get IDs of an Anime by search:",
          "\nSend 'AnimeIds <Anime name or Title>' | Short Command: *.aid* <Name or Title>",
          "\nFor example:\n*AnimeIds Naruto*",
          "\n--------------------------------------------------",
          "\n5. To get character list and character Ids of an Anime by anime id:",
          "\nSend 'AnimeChars <AnimeId>' | Short Command: *.ac* <AnimeId>",
          "\nFor example:\n*AnimeChars 100053*",
          "\n--------------------------------------------------",
          "\n6. To get other Commands:",
          "\nSend 'HelpBot' | Short Command: *.help*",
          "\nFor example:\n*HelpBot*",
          "\n```There is no case sensitiviy for full commands```",
        ];
        composeMsg.forEach(function (txt) {
          msgString += txt;
        });
        list = [
          {
            title: "Anime Commands",
            rows: [
              {
                title: "AnimeDetail Naruto",
                description: "To get the details of an Anime",
              },
              {
                title: "CharDetail Kakashi",
                description: "To get details of an Anime Charater by Search",
              },
              {
                title: "CharIdDetail 10820",
                description: "To get details of an Anime Charater by ID",
              },
              {
                title: "AnimeIds Naruto",
                description: "To get Character IDs of an anime",
              },
              {
                title: "AnimeChars 100053",
                description: "To get Character ID and list.",
              },
              {
                title: "HelpBot ",
                description: "To get help and list of all commands.",
              },
            ],
          },
        ];

        sendListMenu(
          message.chatId,
          "Anime related commands",
          "subTitle",
          msgString,
          "Commands",
          list
        );
        break;
    }

    /////////////////////// Image Functions ////////////////////////
    if (message.type === "image") {
      const imgData = message.caption;
      const imgBotQuery = imgData.split(" ");
      const imgQueryCutter = imgBotQuery[0] + " ";
      query = imgData.substring(imgQueryCutter.length);
      const imgQueryPart = query.split("-");
      switch (imgBotQuery[0]) {
        /////////////////////// Image Sticker ////////////////////////
        case ".sticker":
        case ".sparsh":
          RecievedMsgPermission = true;
          sendImgSticker(message);
          break;
        /////////////////////// OCR ////////////////////////
        case ".ocr":
        case ".imgToText":
        case "imageToText":
          RecievedMsgPermission = true;
          if (query) {
            ocrConfig.lang = query;
          }
          sendOCR(message);
          break;
      }
    }
    /////////////////////// Video and gif functions ////////////////////////
    /////////////////////// Gif Sticker ////////////////////////
    if (
      message.type === "video" &&
      (message.caption === ".sticker" || message.caption === ".sparsh")
    ) {
      RecievedMsgPermission = true;
      sendGifSticker(message);
    }

    // Log the recieved msg
    if (RecievedMsgPermission) {
      const messageTime = new Date(message.timestamp * 1000);
      const messageTxt = "Recieved Message:\n" + data;
      if (message.type === "image" || message.type === "video") {
        messageTxt = "";
      }

      console.log(
        "------------------------------------------\n",
        messageTxt,
        "\nType: ",
        message.type,
        "\nName: ",
        message.sender.displayName,
        "\nID: ",
        message.sender.id,
        "\nTime: ",
        messageTime.toString()
      );
      RecievedMsgPermission = false;
    }
  });

  //////////////////////////// FUNCTIONS ///////////////////////////

  const sendButtons = (sender, msg, buttons, description) => {
    client
      .sendButtons(sender, msg, buttons, description)
      .then(() => {
        console.log("Sent message: ", msg + "\n-------------------------");
      })
      .catch((erro) => {
        console.error("Error when sending: ", erro);
      });
  };

  const sendListMenu = (sender, title, subtitle, desc, menuName, list) => {
    client
      .sendListMenu(sender, title, subtitle, desc, menuName, list)
      .then(() => {
        console.log("Menu sent");
      })
      .catch((erro) => {
        console.error("Error when sending: ", erro);
      });
  };

  const sendText = (sender, text, errMsg) => {
    client
      .sendText(sender, text)
      .then(() => {
        console.log("Sent message: " + text + "\n------------------\n");
      })
      .catch((erro) => {
        console.error(errMsg, erro);
      });
  };

  const sendReply = (sender, text, messageId, errMsg) => {
    client
      .reply(sender, text, messageId)
      .then(() => {
        console.log(
          "Reply sent:\n" + text + "\n------------------------------"
        );
      })
      .catch((erro) => {
        console.error(errMsg, erro);
      });
  };

  const sendImage = (sender, img, text, errMsg) => {
    client
      .sendImage(sender, img, null, text)
      .then(() => {
        console.log("Sent message: \n" + text + "\n--------------------");
      })
      .catch((erro) => {
        console.error(errMsg, erro);
      });
  };

  const sendImgSticker = async (message) => {
    const buffer = await client.decryptFile(message);
    console.log("Buffer generated");
    let fileName = `some-file-name.${mime.extension(message.mimetype)}`;
    fs.writeFile(fileName, buffer, (err) => {
      sendReply(
        message.chatId,
        "Image Downloaded successfully🦾",
        message.id.toString(),
        "Error when sending sticker progress: "
      );
      gm(fileName)
        .resizeExact(500, 500)
        .gravity("Center")
        .write(fileName, function (err) {
          if (!err) {
            sendReply(
              message.chatId,
              "Image editing completed🦾\n\nSending Sticker",
              message.id.toString(),
              "Error when sending sticker progress: "
            );
          } else {
            sendReply(
              message.chatId,
              "Image editing failed😞\n\nTry again",
              message.id.toString(),
              "Error when sending sticker progress: "
            );
            return;
          }
          client
            .sendImageAsSticker(message.chatId, fileName)
            .then(() => {
              console.log("Sticker sent\n-------------------------\n");
            })
            .catch((erro) => {
              console.error("Error when sending sticker: \n", erro);
              sendReply(
                message.chatId,
                "Sending sticker failed😞\n\nTry again",
                message.id.toString(),
                "Error when sending sticker error: "
              );
            });
        });
      //fs.unlink(fileName,(err)=>{});
    });
  };

  const sendGifSticker = async (message) => {
    const buffer = await client.decryptFile(message);
    console.log("Buffer generated");
    fileName = `some-file-name.${mime.extension(message.mimetype)}`;
    fs.writeFile(fileName, buffer, (err) => {
      //console.log("Error while writing file", err);
    });
    console.log("File write successful");
    sendReply(
      message.chatId,
      "Gif Downloaded successfully🦾",
      message.id.toString(),
      "Error when sending sticker progress: "
    );
    fileName = fileName.slice(0, 14) + ".gif";
    gify("some-file-name.mp4", "some-file-name.gif", function (err) {
      if (err) {
        sendReply(
          message.chatId,
          "Gif conversion failed😞",
          message.id.toString(),
          "Error when sending sticker error: "
        );
        throw err;
      }
      console.log("Gify converted the mp4 to gif");
      gm(fileName)
        .resizeExact(500, 500)
        .gravity("Center")
        .write(fileName, async function (err) {
          if (!err) {
            sendReply(
              message.chatId,
              "Gif resizing completed🦾\n\nSending Sticker",
              message.id.toString(),
              "Error when sending sticker progress: "
            );
            console.log(" hooray! ");
          }
          client
            .sendImageAsStickerGif(message.chatId, fileName)
            .then(() => {
              console.log("Sticker sent\n-------------------------\n");
            })
            .catch((erro) => {
              console.error("Error when sending sticker: \n" + erro);
              sendReply(
                message.chatId,
                "Sending sticker failed😞\n\nTry again",
                message.id.toString(),
                "Error when sending sticker error: "
              );
            });
        });
    });
  };

  const sendOCR = async (message) => {
    const buffer = await client.decryptFile(message);
    console.log("Buffer generated");
    let filename = `some-file-name.jpg`;
    fs.writeFile(filename, buffer, async (err) => {
      if (err) throw err;
      console.log("File write successful");
      console.log(`${__dirname}/${filename}`);

      tesseract
        .recognize(`${__dirname}/${filename}`, ocrConfig)
        .then((text) => {
          console.log("Result:", text);
          sendReply(
            message.chatId,
            "Text recognised through OCR:",
            message.id.toString(),
            "Error when sending ocr: "
          );
          sendReply(
            message.chatId,
            text,
            message.id.toString(),
            "Error when sending ocr: "
          );
          ocrConfig.lang = "eng";
        })
        .catch((error) => {
          console.log("ERROR");
          console.log(error.message);
          sendReply(
            message.chatId,
            "Text not found",
            message.id.toString(),
            "Error when sending ocr failure: "
          );
          ocrConfig.lang = "eng";
        });
    });
  };
}
