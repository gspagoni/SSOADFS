'use strict';

var util = require('util');
var https = require('https');
var app = require('express')();
var cookieParser = require('cookie-parser');
var passport = require('passport');
var fs = require('fs');
var SamlStrategy = require('passport-saml').Strategy;
var path = require("path");
//var bodyParser = require('body-parser');
//var utility = require('./util');
var express = require('express');
app.use(express.urlencoded({extended:false}));
app.use(express.json());

const root = __dirname;
const verifyFunction = function(profile, done) {
    console.log("Verifying"+ JSON.stringify(profile));
     return done(null,
         {
             upn: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'],
             Email: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
             GivenName: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'],
             MingleUserGUID: profile['http://schemas.infor.com/claims/MingleUserGuid'],
             // e.g. if you added a Group claim
             group: profile['http://schemas.xmlsoap.org/claims/Group']
         });
};


var strategy = new SamlStrategy(
    {    
        entryPoint: 'https://spago-sql2014.spago.local/adfs/ls/',
        issuer: 'https://spago-sql2014.spago.local:3000',
        callbackUrl: 'https://spago-sql2014.spago.local:3000/adfs/postResponse',
       // privateCert: fs.readFileSync(root + '/client-key.pem', 'utf-8'),
        cert: fs.readFileSync(root + '/certificate.pem', 'utf-8'),
        authnContext: 'http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password',
        //authnContext: 'http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/windows',
        identifierFormat: null
    },
    verifyFunction    
);

/* 
var strategy = new SamlStrategy(
    {
        entryPoint: 'https://nonp-adfs.dsgapps.dk/adfs/ls',
        issuer: 'acme_tools_com',
        callbackUrl: 'http://localhost:3000/adfs/postResponse',
        //privateCert: fs.readFileSync(root + '/acme_tools_com.key', 'utf-8'),
        cert: fs.readFileSync(root + '/spago.local.renew-2020.crt', 'utf-8'),
        authnContext: 'http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password',
        // not sure if this is necessary?
        acceptedClockSkewMs: -1,
        identifierFormat: null,
        signatureAlgorithm: 'sha256'
    },
    verifyFunction
);
 */
strategy.userProfile = function(accessToken, done) {
    console.log("UserProfile:" + accessToken);
    done(null, accessToken);
};


passport.use('provider', strategy);
passport.serializeUser(function(user, done) {
    console.log("Serializing user");
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    console.log("Deserializing user");
    done(null, user);
});

function validateAccessToken(accessToken) {
    console.log("AccessToken: "+ accessToken);
    return;
}


// Configure express app
app.use(cookieParser());
app.use(passport.initialize());

app.get('/login',
    passport.authenticate('provider', { failureRedirect: '/', failureFlash: true })
);
app.post('/adfs/postResponse',
    function(req, res, next) {
        console.log("Before authenticating: " );
        next();
    },
    passport.authenticate('provider', { failureRedirect: '/', failureFlash: true }),
    function(req, res) {
        console.log("User: " + util.inspect(req.user));
        res.cookie('accessToken', req.user);
        res.redirect('/');
    }
);
app.get('/', function (req, res) {
    req.user = req.cookies['accessToken'];
    res.send(
        !req.user ? '<a href="/login">Log In</a>' : '<a href="/logout">Log Out</a>' +
        '<pre>' + JSON.stringify(req.user, null, 2) + '</pre>');
});

app.get('/logout', function (req, res) {
    res.clearCookie('accessToken');
    res.redirect('/');
});

/* var certOptions = {
    key: fs.readFileSync(root + '/localhost.key'),
    cert: fs.readFileSync(root + '/localhost.cert')
}
 */

 var certOptions = {
     key: fs.readFileSync(root + '/client-key.pem'),
     cert: fs.readFileSync(root + '/client-cert.pem')
 }
var server = https.createServer(certOptions,app).listen(3000)
console.log('Express server started on https://localhost:3000');
