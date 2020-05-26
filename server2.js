'use strict';

//var util = require('util');
var https = require('https');
var app = require('express')();
//var cookieParser = require('cookie-parser');
//var passport = require('passport');
var fs = require('fs');
//var SamlStrategy = require('passport-saml').Strategy;
var path = require("path");
//var bodyParser = require('body-parser');
var express = require('express');
app.use(express.urlencoded({extended:false}));
app.use(express.json());

const samlp = require('samlp');

 
app.get('/', (req,res) => {
    res.redirect('/samlp')
})

app.get('/samlp', samlp.auth({
    issuer:     'https://spago-sql2014.spago.local:4000',
    cert:       fs.readFileSync(path.join(__dirname, 'certificate.pem')),
    key:        fs.readFileSync(path.join(__dirname, 'tokensigning.cer')),
    getPostURL: function (wtrealm, wreply, req, callback) {
                //console.log(req);
                  return callback( null, 'https://localhost:4000/callback')
                }
  }));
  
  app.get('/samlp/FederationMetadata/2007-06/FederationMetadata.xml', samlp.metadata({
    issuer:   'https://spago-sql2014.spago.local:4000',
    cert:     fs.readFileSync(path.join(__dirname, 'certificate.pem')),
  }));  

app.get('/callback', (req,res) => {
    res.send('<h1>Done</h1>')
})


var certOptions = {
    key: fs.readFileSync(path.join(__dirname,'/client-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '/client-cert.pem'))
}
var server = https.createServer(certOptions,app).listen(4000)
console.log('Express server started on https://localhost:4000');
