// malScraper
//   .getInfoFromName(query)
//   .then((data) => {
//     console.log(data);
//     let genreString = "",
//       staffString = "",
//       charString = "";
//     data.genres.forEach((genre) => {
//       genreString += genre + " | ";
//     });
//     data.staff.forEach((person) => {
//       staffString += `${person.name} (${person.role}) | `;
//     });
//     data.characters.forEach((char) => {
//       if (char.role === "Main") {
//         charString += char.name + " | ";
//       }
//     });
//     // Set the fields to be sent in message
//     composeMsg = [
//       "*Title* : ",
//       data.title,
//       "\n*English Title* : ",
//       data.englishTitle,
//       "\n*Japanese Title* : ",
//       data.japaneseTitle,
//       "\n*Episodes* : ",
//       data.episodes,
//       "\n*Type* : ",
//       data.type,
//       "\n*Aired* : ",
//       data.aired,
//       "\n*Genres* : ",
//       genreString,
//       "\n*Status* : ",
//       data.status,
//       "\n*Duration*🕑 : ",
//       data.duration,
//       "\n*Rating* : ",
//       data.rating,
//       "\n\n*Main Characters* : ",
//       charString,
//       "\n\n*Staff* : ",
//       staffString,
//       "\n\n*Synopsis* : ",
//       data.synopsis,
//     ];
//     composeMsg.forEach((txt) => {
//       msgString += txt;
//     });
//     // Send the response to the sender
//     client
//       .sendImage(message.chatId, data.picture, null, msgString)
//       .then(() => {
//         console.log(
//           "Sent message: \n" + msgString + "\n--------------------"
//         );
//       })
//       .catch((erro) => {
//         console.error("Error when sending kanji definition: ", erro);
//       });
//   })
//   .catch((err) => {
//     // Send not found to sender
//     buttonsArray = [
//       {
//         buttonId: "ad",
//         buttonText: { displayText: "AnimeDetail Naruto" },
//         type: 1,
//       },
//       {
//         buttonId: "ahelp",
//         buttonText: { displayText: "AnimeHelp" },
//         type: 1,
//       },
//       {
//         buttonId: "help",
//         buttonText: { displayText: ".help" },
//         type: 1,
//       },
//     ];
//     client
//       .sendButtons(
//         message.chatId,
//         "Anime not found.. Sorry",
//         buttonsArray,
//         "Chose the buttons for examples and menu"
//       )
//       .then(() => {
//         console.log(err);
//       })
//       .catch((erro) => {
//         console.error("Error when sending error: ", erro);
//       });
//   });

// acb
//   .get_anime_by_search(query)
//   .then((data) => {
//     msgString =
//       "Click on an Anime ID from the buttons to get its characters"; // composeMsg will be used as description of the button options
//     list = [
//       {
//         title: "Search Results",
//         rows: [],
//       },
//     ];

//     data.forEach((result) => {
//       msgString += "\n*" + result.anime_id + "* - " + result.anime_name;
//       list[0].rows.push({
//         title: `AnimeChars ${result.anime_id}`,
//         description: result.anime_name,
//       });
//     });
//     msgString +=
//       "\nGet the IDs of characters of an anime by sending 'AnimeChars <id>\nFor example\n*AnimeChars 101671*";

//     sendListMenu(
//       message.chatId,
//       "Checkout the bottom menu To get character of the Animes",
//       "Help and all commands",
//       msgString,
//       "Commands",
//       list
//     );
//   })
//   .catch((err) => {
//     // Send not found to sender
//     buttonsArray = [
//       {
//         buttonId: "aid",
//         buttonText: { displayText: "AnimeIds Naruto" },
//         type: 1,
//       },
//       {
//         buttonId: "ahelp",
//         buttonText: { displayText: "AnimeHelp" },
//         type: 1,
//       },
//       {
//         buttonId: "help",
//         buttonText: { displayText: ".help" },
//         type: 1,
//       },
//     ];
//     client
//       .sendButtons(
//         message.chatId,
//         "Anime not found.. Sorry. Check if the command syntax is wrong",
//         buttonsArray,
//         "Chose the buttons for examples and menu"
//       )
//       .then(() => {
//         console.log(err);
//       })
//       .catch((erro) => {
//         console.error("Error when sending error: ", erro);
//       });
//   });

// acb
//   .get_character_by_id(query)
//   .then((data) => {
//     // Set the fields to be sent in message
//     composeMsg = [
//       "*Name* : ",
//       data.name,
//       "\n*Gender* : ",
//       data.gender,
//       "\n*ID* : ",
//       data.id,
//       "\n*Description* : ",
//       data.desc,
//     ];
//     composeMsg.forEach((txt) => {
//       msgString += txt;
//     });
//     // Send the response to the sender
//     client
//       .sendImage(message.chatId, data.character_image, null, msgString)
//       .then(() => {
//         console.log(
//           "Sent message: \n" + msgString + "\n--------------------"
//         );
//       })
//       .catch((erro) => {
//         console.error("Error when sending kanji definition: ", erro);
//       });
//   })
//   .catch((err) => {
//     // Send not found to sender
//     client
//       .reply(
//         message.chatId,
//         "Character not found.. Sorry",
//         message.id.toString()
//       )
//       .then(() => {
//         console.log(err);
//       })
//       .catch((erro) => {
//         console.error("Error when sending error: ", erro);
//       });
//   });

// acb
//   .get_character_by_search(query)
//   .then((data) => {
//     // Set the fields to be sent in message
//     composeMsg = [
//       "*Name* : ",
//       data[0].name,
//       "\n*Gender* : ",
//       data[0].gender,
//       "\n*ID* : ",
//       data[0].id,
//       "\n*Description* : ",
//       data[0].desc,
//     ];
//     if (data.length > 1) {
//       list = [
//         {
//           title: "Search Results",
//           rows: [],
//         },
//       ];
//       data.forEach((result) => {
//         list[0].rows.push({
//           title: `CharIdDetail ${result.id}`,
//           description: result.anime_name,
//         });
//       });
//     }
//     composeMsg.forEach((txt) => {
//       msgString += txt;
//     });
//     // Send the response to the sender
//     client
//       .sendImage(
//         message.chatId,
//         data[0].character_image,
//         null,
//         msgString
//       )
//       .then(() => {
//         console.log(
//           "Sent message: \n" + msgString + "\n--------------------"
//         );
//       })
//       .catch((erro) => {
//         console.error("Error when sending character details: ", erro);
//       });

//     sendListMenu(
//       message.chatId,
//       "Characters with similar Names",
//       "subTitle",
//       "Checkout the menu",
//       "Results",
//       list
//     );
//   })
//   .catch((err) => {
//     // Send not found to sender
//     client
//       .reply(
//         message.chatId,
//         "Character not found.. Sorry.\nCheck if the command syntax is right or not.\nDon't get confused by similar looking commands.",
//         message.id.toString()
//       )
//       .then(() => {
//         console.log(err);
//       })
//       .catch((erro) => {
//         console.error("Error when sending error: ", erro);
//       });
//   });

// //////////////////////////////ANIME CHARACTERS IDs////////////////////////////////
// case ".ac":
// case "animechars":
//   RecievedMsgPermission = true;
//   acb
//     .get_anime_by_id(query)
//     .then((data) => {
//       // Set the fields to be sent in message
//       msgString =
//         data.anime_id + "- *" + data.anime_name + "*\n*Characters:*";
//       data.characters.forEach((character) => {
//         msgString += "\n*" + character.id + "* - " + character.name;
//       });
//       msgString +=
//         "\nGet details of a character by sending 'CharIdDetail <id>\nFor example\n*CharIdDetail 10820*";
//       // Send the response to the sender
//       client
//         .sendImage(message.chatId, data.anime_image, null, msgString)
//         .then(() => {
//           console.log(
//             "Sent message: \n" + msgString + "\n--------------------"
//           );
//         })
//         .catch((erro) => {
//           console.error("Error when sending character ids: ", erro);
//         });
//     })
//     .catch((err) => {
//       // Send not found to sender
//       buttonsArray = [
//         {
//           buttonId: "aid",
//           buttonText: { displayText: "AnimeChars Naruto" },
//           type: 1,
//         },
//         {
//           buttonId: "ahelp",
//           buttonText: { displayText: "AnimeHelp" },
//           type: 1,
//         },
//         {
//           buttonId: "help",
//           buttonText: { displayText: ".help" },
//           type: 1,
//         },
//       ];
//       client
//         .sendButtons(
//           message.chatId,
//           "Anime not found.. Sorry",
//           buttonsArray,
//           "Chose the buttons for examples and menu"
//         )
//         .then(() => {
//           console.log(err);
//         })
//         .catch((erro) => {
//           console.error("Error when sending error: ", erro);
//         });
//     });
//   break;
