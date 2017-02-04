"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

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
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, args, next) {
        if (!session.dialogData.movie) {
            session.beginDialog('/movie');
        } else {
            next();
        }
    },
    function (session, args, next) {
        builder.Prompts.choice(session, 'I guess ' +session.dialogData.movie+ ' sounds fine. Ready to start this?');

},
    function (session, results, next) {
        if (results.response) {
            session.beginDialog('/moviefacts');
        } else {
            session.send('Fine be that way...')
        }
    },
    function (session, args, next) {
        session.send('THIS IS ALL I CAN DO FOR NOW');
    },
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Sooooo what is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog(session, 'kk whatever '+ session.userData.name+' let us get to the good stuff');
    }
]);

bot.dialog('/movie', [
    function (session) {
        builder.Prompts.confirm(session, 'Have you picked out a movie yet?');
    },
    function (session, results, next) {
        if (results.response) {
            builder.Prompts.text(session, 'What movie are you watching?');
            session.dialogData.movie = results.response;
        } else {
            session.beginDialog('/findmovie');
        }
        session.endDialog();
    }
]);

bot.dialog('/findmovie', [
    function (session) {
        session.send('Well this is embarassing I have no idea how to find you a movie...');
        session.endDialog();
    }
]);


if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}
