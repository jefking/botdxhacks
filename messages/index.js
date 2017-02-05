"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var request = require("request");

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

// Add dialog
bot.dialog('/', [
    function (session, args, next) {
        if (!session.userData.movie) {
            session.beginDialog('/movie');
        } else {
            next();
        }
    }
]);

bot.dialog('/movie', [
    function (session) {
        builder.Prompts.text(session, 'What movie are you watching?');
    },
    function (session, results) {
        request("https://api.themoviedb.org/3/search/movie?api_key=d2bd0f8ec7a732cd06702f331cc9f6b6&language=en-US&page=1&include_adult=false&query=" + results.response, function (error, response, body) {
            if (response) {
                var movies = JSON.parse(body);

                var topFive = movies.results.slice(0, 5);
                var cards = topFive.map(function (item) { return createCard(session, item) });
                var message = new builder.Message(session).attachments(cards).attachmentLayout('carousel');
                session.send(message);
            } else {
                session.send('Well this is embarassing I have no idea how to find you a movie...');
            }
        });

        session.endDialog();
    },
    function (session, results) {
        session.userData.movie = results.response;
        session.endDialog(session, 'KK whatever ' + session.userData.movie + ' sounds ok');
    }
]);


bot.dialog('/startmovie', [
    function (session, result) {

        var title = result.title;

        if (result.response) {
            session.userData.movielength = 90;// The time in minutes            
            session.send("You are watching " + title + ". Let's get this party started!");

            var intervalTimer = setInterval(function () {
                session.send('test');
            }, 1000);

            setTimeout(function () {
                session.send('time is up');
                clearInterval(intervalTimer)
            }, 5000);


            if (result.response) {
                session.send("You are watching " + result + ". Let's get this party started!");
                session.userData.movielength = 90;// The time in minutes            

                session.endDialog();

            } else {
                session.send("ok");
            }
        }
    }
]);



if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function () {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}



function createCard(session, movie) {
    var card = new builder.ThumbnailCard(session);

    card.title(movie.title);
    card.images([builder.CardImage.create(session, "https://image.tmdb.org/t/p/w500" + movie.poster_path)]);
    card.text("Are you watching this movie? Tap this to receive fun facts throughout the show!");
    card.tap(new builder.CardAction.imBack(session, movie.title, "Let's do this!"));
    return card;
} 
