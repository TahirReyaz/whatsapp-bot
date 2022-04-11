// Supports ES6
const venom = require("venom-bot");
const axios = require("axios");
const malScraper = require("mal-scraper");
const acb = require("acb-api");
const musicInfo = require("music-info");
const openai = require("openai-grammaticalcorrection");
require("dotenv").config();
const _ = require("lodash");

const { remind } = require("./functions/reminders");
const { truthOrDare, wouldYouRather } = require("./functions/gamesHandlers");
const {
  sendButtons,
  sendReply: VsendReply,
} = require("./functions/venomFunctions");
const { sendMenu } = require("./functions/menuHandlers");
const { groupPerms, showAllRoles } = require("./functions/rolesHandlers");
const {
  stkToImg,
  imgToSticker,
  ocr,
  sendGifSticker,
} = require("./functions/mediaHandlers");

// Create the client
venom
  .create({
    session: "session-name", //name of session
    multidevice: true, // for version not multidevice use false.(default: true)
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
  // Get reminder data from database
  axios.get(`${process.env.FIREBASE_DOMAIN}/reminders.json`).then((res) => {
    for (const key in res.data) {
      for (const remKey in res.data[key]) {
        remind(
          client,
          res.data[key][remKey].time,
          res.data[key][remKey].msg,
          key + ".us",
          remKey
        );
      }
    }
  });

  // Get all groups who have mention all role
  let mentionAllGrps = [];
  axios
    .get(`${process.env.FIREBASE_DOMAIN}/grpFlags/mention-all.json`)
    .then((res) => {
      for (const key in res.data) {
        mentionAllGrps.push({ id: key, grpId: res.data[key].grpId });
      }
      // console.log(mentionAllGrps);
    });

  // Get all groups who have mention all admin only role
  let mentionAllAdminOnlyGrps = [];
  axios
    .get(`${process.env.FIREBASE_DOMAIN}/grpFlags/mention-all-admin-only.json`)
    .then((res) => {
      for (const key in res.data) {
        mentionAllAdminOnlyGrps.push({ id: key, grpId: res.data[key].grpId });
      }
    });

  // Get all groups who have nsfw roast role
  let nsfwRoastGrps = [];
  axios
    .get(`${process.env.FIREBASE_DOMAIN}/grpFlags/nsfw-roast.json`)
    .then((res) => {
      for (const key in res.data) {
        nsfwRoastGrps.push({ id: key, grpId: res.data[key].grpId });
      }
    });

  // Get all group data which contains the roles opted by members
  let grpData = [];
  axios.get(`${process.env.FIREBASE_DOMAIN}/grpData.json`).then((res) => {
    for (const key in res.data) {
      let roleData = [];
      for (const roleKey in res.data[key]) {
        let members = [];

        for (const memberKey in res.data[key][roleKey].members) {
          members.push({
            id: memberKey,
            memberId: res.data[key][roleKey].members[memberKey].memberId,
          });
        }
        roleData.push({
          roleId: roleKey,
          roleName: res.data[key][roleKey].roleName,
          members: members,
        });
      }
      grpData.push({ grpId: key, roles: roleData });
    }
  });
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
    "Rsp",
  ];

  // variables and constants used in the code
  const wikiEndpoint = "https://en.wikipedia.org/w/api.php?";
  const mathsEndpoint = "http://api.mathjs.org/v4/?expr=";
  let buttonsArray = [];
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
    pollerGrp = "",
    selectedGrpIndex;
  let poll = [{}],
    perm = false;
  let grpArray = [],
    selectedGrp = [];

  // This function executes whenever a message is sent or recieved
  client.onAnyMessage((message) => {
    console.log("in any msg");
    // variables and constants required to make the data readable
    const data = message.body;
    console.log(data);
    const botQuery = data.split(" ");
    botQuery[0] = botQuery[0].toLowerCase();
    const queryCutter = botQuery[0] + " ";
    console.log("query 0", botQuery[0]);
    console.log({ botQuery });
    console.table(botQuery);
    const queryWithDesc = data.substring(queryCutter.length).split("\n"); // Get everything written after the command
    let query = queryWithDesc[0]; // This is used as the option people type after the command
    console.log(query);
    const queryPart = query.split("-"); // This is used as extra options that people type after the above query
    let composeMsg = [],
      msgString = "",
      list = [],
      selectedRoleIndex,
      selectedRole,
      roleAbsent = false;
    const songParams = {
      title: queryPart[0],
      artist: queryPart[1],
    };
    let msgObj = {
      type: message.quotedMsg.type ? message.quotedMsg.type : "image",
    };
    console.log({ botQuery });
    console.table(botQuery);

    switch (botQuery[0]) {
      //////////////////////////////////////HI BOT//////////////////////////////////////
      case ".hi":
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
            "This command is not supported here. There are people here who don't like it.\n```THEY AREN'T COOL ENOUGH.```\n\nAsk admins for activating this command in this group\n\nIf you are an admin yourself, then use GroupPerms command for activating this command in this group.",
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

        console.log(mentionAllAdminOnlyGrps);

        console.log(mentionAllGrps);

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
                "People get annoyed by useless mentioning😔\n\nAsk admins for activating this command in this group\n\nIf you are an admin yourself, then use GroupPerms command for activating this command in this group.\n\nFor example:\nGroupPerms")
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
          client
            .getGroupMembersIds(message.chat.groupMetadata.id)
            .then((res) => {
              let members = [];
              res.forEach((member) => {
                members.push(member.user.toString());
                msgString += `@${member.user.toString()} | `;
              });
              msgString += `\n_Total members: ${members.length}_`;

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
      case "kanjidef":
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
      case "engdef":
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
          gsrlimit: 50,
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
          client,
          message.chatId,
          msgString,
          "You can click on the buttons for voting.\nIf buttons are not available- Send '.poll op1' or '.poll op2' to vote or '.poll end' to end the poll.",
          buttonsArray,
          "Error when sending poll response: "
        );
        break;
      ///////////////////////////////////ANIME DETAIL///////////////////////////////////
      case ".ad":
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
      case "bottruth":
        RecievedMsgPermission = true;
        truthOrDare(client, message.chatId, "Truth");
        break;
      ////////////////////////////////TRUTH OR DARE: DARE///////////////////////////////
      case ".dare":
      case "botdare":
        RecievedMsgPermission = true;
        truthOrDare(client, message.chatId, "Dare");
        break;
      /////////////////////////////////WOULD YOU RATHER/////////////////////////////////
      case ".wyr":
      case "botwyr":
        RecievedMsgPermission = true;
        wouldYouRather(client, message.chatId);
        break;
      ////////////////////////////////////REMINDER/////////////////////////////////
      case ".remind":
      case ".rem":
      case "botremind":
        RecievedMsgPermission = true;

        const RemTimeIsValid =
          /^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/.test(query);
        if (!RemTimeIsValid) {
          sendReply(
            message.chatId,
            "Time should be in 24 hour format\nFor example:\n13:45\nAnother example:\n09:15",
            message.id.toString(),
            "Error when sending regex error: "
          );
          break;
        }

        axios
          .post(
            `${
              process.env.FIREBASE_DOMAIN
            }/reminders/${message.chatId.substring(
              0,
              message.chatId.length - 3
            )}.json`,
            { time: query, msg: queryWithDesc[1] ? queryWithDesc[1] : "" }
          )
          .then((res) => {
            msgString = `Will reply to you at ${query}
          ${
            queryWithDesc[1]
              ? "\n----------------------------------------------------\n"
              : ""
          }${queryWithDesc[1] ? queryWithDesc[1] : ""}`;

            sendReply(
              message.chatId,
              msgString,
              message.id.toString(),
              "Error when sending error: "
            );

            remind(
              client,
              query,
              queryWithDesc[1] ? queryWithDesc[1] : "",
              message.chatId,
              res.data.name
            );

            // Remove the new reminder from the new array
            // There's no need to construct a reminder array nor to store the reminder tokens here

            console.log(res.data);
          })
          .catch((err) => {
            sendReply(
              message.chatId,
              "An error occurred\nCheck spellings and syntax",
              message.id.toString(),
              "Error when sending error: "
            );
            console.log(err);
            console.log(err.data);
          });
        break;
      ////////////////////////////////////GRP ROLES/////////////////////////////////
      case "groupperms":
      case ".gperms":
        RecievedMsgPermission = true;
        groupPerms(
          client,
          message.chatId,
          message.chat.groupMetadata.participants,
          message.sender.id,
          message.id.toString()
        );
        break;
      ////////////////////////////////////ADD GRP ROLE/////////////////////////////////
      case ".agp":
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
              console.log("in then");
              grpArray.push({
                id: res.data.name,
                grpId: message.chatId,
              });
              switch (query) {
                case "mention-all":
                  mentionAllGrps = grpArray;
                  console.log(mentionAllGrps);
                  break;
                case "mention-all-admin-only":
                  mentionAllAdminOnlyGrps = grpArray;
                  console.log(mentionAllGrps);
                  break;
                case "nsfw-roast":
                  nsfwRoastGrps = grpArray;
                  console.log(mentionAllGrps);
                  break;
              }

              sendReply(
                message.chatId,
                `Added ${query} permission to this group`,
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
          selectedGrp = grpArray.find((grp) => grp.grpId === message.chatId);
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
                `Removed ${query} permission from this group`,
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
      case "addrole":
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

        let memberRoleAbsent = false;
        // roleArray.forEach((grp) => {
        //   if (grp.grpId === message.chatId) {
        //     grpAbsent = false;
        //   }
        // });

        // If group doesnt have the selected role
        if (memberRoleAbsent) {
          sendReply(
            message.chatId,
            `This group is not a ${query} group`,
            message.id.toString(),
            "Error when sending warning: "
          );
          break;
        } else {
          axios
            .post(
              `${
                process.env.FIREBASE_DOMAIN
              }/grpData/${message.chatId.substring(
                0,
                message.chatId.length - 3
              )}.json`,
              { roleName: query }
            )
            .then((res) => {
              console.log("in then block");
              let selectedGrpIndex = grpData.findIndex(
                (grp) =>
                  grp.grpId ===
                  message.chatId.substring(0, message.chatId.length - 3)
              );
              let newRole = {
                roleId: res.data.name,
                roleName: query,
                members: [],
              };

              if (selectedGrpIndex !== -1) {
                console.log("in if", selectedGrpIndex);
                grpData[selectedGrpIndex].roles.push(newRole);
              } else {
                console.log("in else");
                grpData.push({
                  grpId: message.chatId.substring(0, message.chatId.length - 3),
                  roles: [{ ...newRole }],
                });
              }

              sendReply(
                message.chatId,
                `Added ${query} role to this group`,
                message.id.toString(),
                "Error when sending grp addition: "
              );
              console.log(res.data);
            })
            .catch((err) => {
              sendReply(
                message.chatId,
                "An error occurred\nCheck spellings and syntax",
                message.id.toString(),
                "Error when sending error: "
              );
              console.log(err);
              console.log(err.data);
            });
        }

        break;
      //////////////////////////////////MEMBER ROLES/////////////////////////////////
      case ".roles":
        RecievedMsgPermission = true;
        showAllRoles(client, message.chatId, grpData, message.id.toString());
        break;
      ///////////////////////////////ADD ROLE TO MEMBER/////////////////////////////////
      case ".amr":
      case "addmemeberrole":
        RecievedMsgPermission = true;
        console.log("in add member role");

        selectedGrpIndex = grpData.findIndex(
          (grp) =>
            grp.grpId === message.chatId.substring(0, message.chatId.length - 3)
        );

        roleAbsent = false;

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
          selectedRoleIndex = grpData[selectedGrpIndex].roles.findIndex(
            (role) => role.roleName === query
          );
          selectedRole = grpData[selectedGrpIndex].roles[selectedRoleIndex];

          axios
            .post(
              `${
                process.env.FIREBASE_DOMAIN
              }/grpData/${message.chatId.substring(
                0,
                message.chatId.length - 3
              )}/${selectedRole.roleId}/members.json`,
              { memberId: message.sender.id }
            )
            .then((res) => {
              grpData[selectedGrpIndex].roles[selectedRoleIndex].members.push({
                id: res.data.name,
                memberId: message.sender.id,
              });

              sendReply(
                message.chatId,
                `Added you to ${query}`,
                message.id.toString(),
                "Error when sending grp addition: "
              );
              console.log(res.data);
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
      //////////////////////////////////SEE MY ROLES/////////////////////////////////
      case "showmyroles":
      case ".smr":
        break;
      //////////////////////////////SEE OTHER'S ROLES/////////////////////////////////
      case "showtheirroles":
      case ".str":
        break;
      //////////////////////////////////SEND ROLE MENTIONS/////////////////////////////////
      case ".mention":
      case ".summon":
      case "@":
        RecievedMsgPermission = true;
        console.log("in mention");

        selectedGrpIndex = grpData.findIndex(
          (grp) =>
            grp.grpId === message.chatId.substring(0, message.chatId.length - 3)
        );

        if (!selectedGrpIndex) {
          sendReply(
            message.chatId,
            `There are no member roles in this group\nAsk admins to add some using the .ar command\n\nFor example:\n.ar coders`,
            message.id.toString(),
            "Error when sending warning: "
          );
          break;
        }

        selectedRoleIndex = grpData[selectedGrpIndex].roles.findIndex(
          (role) => role.roleName === query
        );

        // If group doesnt have the selected role
        if (!selectedRoleIndex) {
          sendReply(
            message.chatId,
            `${query} role not present in the group`,
            message.id.toString(),
            "Error when sending warning: "
          );
          break;
        } else {
          selectedRole = grpData[selectedGrpIndex].roles[selectedRoleIndex];

          let mentionList = [];
          msgString = `Summoning ${query}
          ${
            queryWithDesc[1]
              ? "\n----------------------------------------------------\n"
              : ""
          }${
            queryWithDesc[1] ? queryWithDesc[1] : ""
          }----------------------------------------------------\n`;
          selectedRole.members.forEach((member) => {
            mentionList.push(
              member.memberId.substring(0, member.memberId.length - 5)
            );
            msgString += `@${member.memberId.substring(
              0,
              member.memberId.length - 5
            )} | `;
          });
          console.log("mention list", mentionList);

          client
            .sendMentioned(message.chatId, msgString, mentionList)
            .then(() => {
              console.log(
                "Sent message: " + msgString + "\n-------------------"
              );
            })
            .catch((erro) => {
              console.log("Error when tagging: ", erro);
            });

          // grpData[selectedGrpIndex].roles[selectedRoleIndex].members.push({
          //   id: res.data.name,
          //   memberId: message.sender.id,
          // });
        }

        break;
      /////////////////////////////////////HOROSCOPE MENU/////////////////////////////////////
      case ".hsmenu":
      case ".hsm":
      case "horoscopemenu":
        RecievedMsgPermission = true;

        msgString = "Select your Zodiac sign👇";

        // Configuring the list menu
        list = [
          {
            title: "General Commands",
            rows: [
              {
                title: ".hs aries",
                description: "March 21 - April 19\nSend to see the Horoscope",
              },
              {
                title: ".hs taurus",
                description: "April 20 - May 20\nSend to see the Horoscope",
              },
              {
                title: ".hs gemini",
                description: "May 21 - June 20\nSend to see the Horoscope",
              },
              {
                title: ".hs cancer",
                description: "June 21 - July 22\nSend to see the Horoscope",
              },
              {
                title: ".hs leo",
                description: "July 23 - August 22\nSend to see the Horoscope",
              },
              {
                title: ".hs virgo",
                description:
                  "August 23 - September 22\nSend to see the Horoscope",
              },
              {
                title: ".hs libra",
                description:
                  "September 23 - October 22\nSend to see the Horoscope",
              },
              {
                title: ".hs scorpio",
                description:
                  "October 23 - November 21\nSend to see the Horoscope",
              },
              {
                title: ".hs sagittarius",
                description:
                  "November 22 - December 21\nSend to see the Horoscope",
              },
              {
                title: ".hs capricorn",
                description:
                  "December 22 - January 19\nSend to see the Horoscope",
              },
              {
                title: ".hs aquarius",
                description:
                  "January 20 - February 18\nSend to see the Horoscope",
              },
              {
                title: ".hs pisces",
                description:
                  "February 19 - March 20\nSend to see the Horoscope",
              },
            ],
          },
        ];

        sendListMenu(
          message.chatId,
          "Daily Horoscope",
          "Select your Zodiac sign",
          msgString,
          "Zodiac Signs",
          list
        );
        break;
      ///////////////////////////////////HOROSCOPE ////////////////////////////////////
      case ".hs":
      case ".horoscope":
        RecievedMsgPermission = true;
        if (botQuery.length > 0) {
          const zodiacSign = queryPart[0].toLowerCase();
          const zodiacDay = queryPart[1] ? queryPart[1] : "today";

          axios
            .post(
              `https://aztro.sameerkumar.website/?sign=${zodiacSign}&day=${zodiacDay}`
            )
            .then((response) => {
              const { data } = response;
              composeMsg = [
                `*${_.upperFirst(
                  queryPart[0]
                )}'s* Horoscope for ${zodiacDay}\n`,
                "\n----------------------------------------------\n",
                data.description,
                "\n----------------------------------------------\n",
                `You are compatible with *${data.compatibility}*\n`,
                `Make your move on them at ${data.lucky_time} cause that's your lucky time.\n\n`,
                `*Mood*: ${data.mood}\n`,
                `*Color*: ${data.color}\n`,
                `*Lucky Number*: ${data.lucky_number}\n`,
                `\n\n_${_.upperFirst(queryPart[0])}: ${data.date_range}_`,
              ];

              composeMsg.forEach((txt) => (msgString += txt));

              sendReply(
                message.chatId,
                msgString,
                message.id.toString(),
                "Error when sending horoscope: "
              );
            })
            .catch((error) => {
              sendReply(
                message.chatId,
                "An error occurred\nCheck spellings and syntax",
                message.id.toString(),
                "Error when sending error: "
              );
              console.log(error);
            });
        } else {
          sendText(message.chatId, "Please enter a valid sign");
        }

        break;
      ////////////////////////////////// STICKER TO IMAGE ////////////////////////////////////
      case ".image":
      case ".img":
        RecievedMsgPermission = true;
        stkToImg(
          client,
          message.quotedMsg.type,
          message.chatId,
          message.id.toString()
        );
        break;
      ////////////////////////////////// STICKER ////////////////////////////////////
      case ".sticker":
      case ".sparsh":
        RecievedMsgPermission = true;
        for (quotedMsgKey in message.quotedMsg) {
          msgObj[quotedMsgKey] = message.quotedMsg[quotedMsgKey];
        }
        if (msgObj.type === "image") {
          imgToSticker(client, message.chatId, message.id.toString(), msgObj);
        } else if (msgObj.type === "video") {
          sendGifSticker(client, message.chatId, message.id.toString(), msgObj);
        } else {
          VsendReply(
            client,
            message.chatId,
            "The selected message is not an image or a gif",
            message.id.toString(),
            "Error when sending warning: "
          );
        }
        break;
      ////////////////////////////////// OCR ////////////////////////////////////
      case ".ocr":
      case ".imgtotext":
      case "imagetotext":
        RecievedMsgPermission = true;
        for (quotedMsgKey in message.quotedMsg) {
          msgObj[quotedMsgKey] = message.quotedMsg[quotedMsgKey];
        }
        ocr(client, message.chatId, message.id.toString(), msgObj);
        break;
      /////////////////////////////////////BOT MENU/////////////////////////////////////
      case ".help":
      case "helpbot":
        RecievedMsgPermission = true;
        sendMenu(client, message.chatId, "Help and all commands", "Help");
        break;
      ////////////////////////////////ENTERTAINMENT MENU////////////////////////////////
      case ".ehelp":
      case "enthelp":
        RecievedMsgPermission = true;
        sendMenu(
          client,
          message.chatId,
          "Entertainment and Media related commands",
          "Ent"
        );
        break;
      /////////////////////////////////INFORMATION MENU/////////////////////////////////
      case ".ihelp":
      case "infohelp":
        RecievedMsgPermission = true;
        sendMenu(client, message.chatId, "Info related commands", "Info");
        break;
      ////////////////////////////////////GAMES MENU///////////////////////////////////
      case ".ghelp":
      case "gamehelp":
        RecievedMsgPermission = true;
        sendMenu(client, message.chatId, "Commands for Games", "Game");
        break;
      ///////////////////////////////////ANIME MENU////////////////////////////////////
      case ".ahelp":
      case "animehelp":
        RecievedMsgPermission = true;
        sendMenu(client, message.chatId, "Anime related commands", "Anime");
        break;
      ///////////////////////////////////ROLES MENU////////////////////////////////////
      case ".rhelp":
      case "rolehelp":
        RecievedMsgPermission = true;
        sendMenu(client, message.chatId, "Roles related commands", "Role");
        break;
    }

    /////////////////////// Image Functions ////////////////////////
    if (message.type === "image") {
      const imgData = message.caption;
      const imgBotQuery = imgData.split(" ");
      switch (imgBotQuery[0]) {
        /////////////////////// Image Sticker ////////////////////////
        case ".sticker":
        case ".sparsh":
          RecievedMsgPermission = true;
          VsendReply(
            client,
            message.chatId,
            "The usage of this command has been changed\nIt now works with just replying to the image you want to make sticker of with *.sticker*",
            message.id.toString(),
            "Err while sending sticker warning"
          );
          break;
        /////////////////////// OCR ////////////////////////
        case ".ocr":
        case ".imgToText":
        case "imageToText":
          RecievedMsgPermission = true;
          VsendReply(
            client,
            message.chatId,
            "The usage of this command has been changed\nIt now works with just replying to the image you want to make sticker of with *.ocr*",
            message.id.toString(),
            "Err while sending ocr warning"
          );
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
      VsendReply(
        client,
        message.chatId,
        "The usage of this command has been changed\nIt now works with just replying to the gif you want to make sticker of with *.sticker*",
        message.id.toString(),
        "Err while sending ocr warning"
      );
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

  const sendReply = (senderTo, text, messageId, errMsg) => {
    client
      .reply(senderTo, text, messageId)
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
}
