# whatsapp-bot

## Features
This project runs on node.js and uses a npm package called _venom-bot_ for interacting with WhatsApp.  
A user types certain commands and sends them to me on WhatsApp and venom-bot reads those commands and replies accordingly.  
Various other packages and APIs are also used.  
Some of the cool features of this bot are:

- Getting the details of movies, anime and songs and get lyrics too
- Playing text based games such as Truth or Dare, Would you rather etc.
- Search and view wikipedia content on WhatsApp
- Tag everyone | admin only tag everyone
- Correct grammar and translate sentences
- Create stickers
- Read text from Images
- Convert Images and gifs to stickers
- Create polls and vote
- Do mathematical calculations
- English Dictionary
- Discord like member roles and mentioning

## Installation
- clone or fork this repository  
- run the command ```cd whatsapp-bot``` to get inside the project folder
- run ```npm install``` to install the npm packages used in this project  Make sure that you have installed **node** already  
- Prepare a firebase project and start the Realtime Database and copy the database end point (url) to be used in the _.env_ file in the next step  
- set up api keys and database url in _.env_ file  
```OMDB_API_KEY=<YOUR OMDB API KEY>```  
```OPENAI_API_KEY=<YOUR OPENAI API KEY>```  
```FIREBASE_DOMAIN=https:<YOUR FIREBASE DATABASE URL>```  
The firebase rtdb url looks like this: ```https://<YOUR PROJECT NAME>.firebaseio.com```  
- install system dependencies like tesseract and image editing engines like _gm_ and _im_ on your machine
- Now you are ready, run ```npm start```
