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
        if (!session.userData.movie) {
            session.beginDialog('/movie');
        } else {
            next();
        }
    },
    function (session, args, next) {
        // Search for the movie and set it
        if (!session.userData.movieid) {
            session.beginDialog('/find');
        } else {
            next();
        }
    },
    function (session, args, next) {
        if (!session.userData.movielength) {
            session.beginDialog('/movielength');
        } else {
            next();
        }
    },
    function (session) {
        session.send('THIS IS ALL I CAN DO FOR NOW');
        session.endDialog();
    }
]);

bot.dialog('/movie', [
function (session) {
        builder.Prompts.text(session, 'What movie are you watching?');
    },
    function (session, results) {
        session.userData.movie = results.response;
        session.endDialog(session, 'KK whatever '+ session.userData.movie+' sounds ok');
    }
]);

bot.dialog('/find', [
    function (session) {
        // Call the API 
        // Get a list of movies
        var results = [
            { name : "Spider Man",
            poster_url : "https://images-na.ssl-images-amazon.com/images/M/MV5BOWU3ZjIxZmYtMTRkOC00NTUyLTlhYjUtODhjODE4NDI5ZGY2XkEyXkFqcGdeQXVyMjc0MjUzMzU@._V1_SY1000_CR0,0,694,1000_AL_.jpg",
            html_url: "http://www.imdb.com/title/tt0392945/?ref_=fn_al_tt_2"
        },
        
            { name : "Spider Man 1",
            poster_url : "https://images-na.ssl-images-amazon.com/images/M/MV5BOWU3ZjIxZmYtMTRkOC00NTUyLTlhYjUtODhjODE4NDI5ZGY2XkEyXkFqcGdeQXVyMjc0MjUzMzU@._V1_SY1000_CR0,0,694,1000_AL_.jpg",
            html_url: "http://www.imdb.com/title/tt0392945/?ref_=fn_al_tt_2"
        },
        
            { name : "The amazing Spider Man",
            poster_url : "https://images-na.ssl-images-amazon.com/images/M/MV5BOWU3ZjIxZmYtMTRkOC00NTUyLTlhYjUtODhjODE4NDI5ZGY2XkEyXkFqcGdeQXVyMjc0MjUzMzU@._V1_SY1000_CR0,0,694,1000_AL_.jpg",
            html_url: "http://www.imdb.com/title/tt0392945/?ref_=fn_al_tt_2"
        }
        ];
        var cards = results.map(function(item) { return createCard(session, item)});
                    
                    // prompt the user with the list
                    //builder.Prompts.choice(session, 'What profile did you want to load?', usernames);
                    var message = new builder.Message(session).attachments(cards).attachmentLayout('carousel');
                    session.send(message); 
        // display
        // from selection reset name and set id

    }
]);

function createCard(session, movie)
{
    
    var card = new builder.ThumbnailCard(session);

    card.title(movie.name);
    card.images([builder.CardImage.create(session, movie.poster_url)]);
    card.tap(new builder.CardAction.openUrl(session, movie.html_url));
    return card;

} 

bot.dialog('/movielength', [
    function (session, results) {
        session.userData.movielength = 90;// The time in minutes
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
