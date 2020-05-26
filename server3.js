var trustClient = require('wstrust-client');

trustClient.requestSecurityToken({
    scope: 'https://localhost:44384/',
    //scope: 'https://spago-sql2014.spago.local:4000',
    username: 'spinstall@spago.local',
    password: 'Leader1',
    //endpoint: 'https://spago-sql2014.spago.local/adfs/services/trust/13/UsernameMixed'
    endpoint: 'https://spago-xi12-1.spago.local/InforIntSTS/connect/token'
}, function (rstr) {

    // Access the token and enjoy it!
    var rawToken = rstr.token;

    console.log(rawToken);
    //console.log(rstr);

}, function (error) {

    // Error Callback
    console.log(error)

});