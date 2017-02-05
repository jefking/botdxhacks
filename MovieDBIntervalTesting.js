var builder = require('botbuilder');
var restify = require('restify');
const request = require('request');

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

//create connector 
//console connector
// var connector = new builder.ConsoleConnector().listen();
//chat connector 
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
}

);

//create the bot 
var bot = new builder.UniversalBot(connector);

server.post('/api/messages', connector.listen());

//add in the dialog
// bot.dialog('/',function(session) {
//     // session.send('Hello, bot!')
//     var userMessage = session.message.text;
//     session.send('you said: ' + userMessage);

// });
// bot.dialog('/',[
//     function(session) {
//         builder.Prompts.text(session, 'Please enter your name');
//     },
//     function(session, result) {
//         session.send('Hello, ' + result.response);
//     }
// ]);

bot.dialog('/', [
    function (session) {
        session.beginDialog('/ensureProfile', session.userData.profile);
    },
    function (session, results) {

        request("http://api.themoviedb.org/3/search/movie?api_key=d2bd0f8ec7a732cd06702f331cc9f6b6&query=shrek", function (error, response, body) {
            console.log(process.env.MOVIE_DB_API_KEY);
            console.log(body);
            const result = JSON.parse(body);            
            console.log(result.results[0].id);
   });        
        request("https://api.themoviedb.org/3/movie/808/translations?api_key=d2bd0f8ec7a732cd06702f331cc9f6b6",function(error,response,body) {
            session.send(body);
            const translation = JSON.parse(body);
            var highestRow = translation.translations.length;
            session.send(highestRow.toString());
            session.send(translation.translations[highestRow-1].name);
});
        session.userData.movie = {id:808}
        //https://api.themoviedb.org/3/movie/{movie_id}?api_key=<<api_key>>&language=en-US
        request("https://api.themoviedb.org/3/movie/"+session.userData.movie.id +"?api_key="+"d2bd0f8ec7a732cd06702f331cc9f6b6"+"&language=en-US",function(error,response,body) {
            const details = JSON.parse(body);
            session.userData.movie.length = details.runtime.toString()
            session.send(details.runtime.toString());
});
         var intervalTimer = setInterval(function(){
                session.send('test');
                }, 1000); 

        setTimeout(function(){
        session.send('time is up');
        clearInterval(intervalTimer)}, 5000); 
        
         

    
        //   HttpResponse<String> response = Unirest.get("https://api.themoviedb.org/3/search/movie?include_adult=false&page=1&language=en-US&api_key=%3C%3Capi_key%3E%3E").body("{}").asString();

        // session.userData.profile = results.response;
        // session.send('Hello %(name)s! I love %(company)s!',session.userData.profile);
    }
]);

bot.dialog('/ensureProfile', [
    function (session, args, next) {
        session.dialogData.profile = args || {};
        if (!session.dialogData.profile.name) {
            builder.Prompts.text(session, "what's your name?");
        } else {
            next();
        }
    },
    function (session, results, next) {
        if (results.response) {
            session.dialogData.profile.name = results.response;
        }
        if (!session.dialogData.profile.company) {
            builder.Prompts.text(session, "What company do you work for?");

        } else {
            next();
        }
    },
    function (session, results, next) {
        if (results.response) {
            session.dialogData.profile.company = results.response;
        }
        session.endDialogWithResult({ response: session.dialogData.profile });
    }
]);

