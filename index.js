const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const webpush = require('web-push');
const fetch = require('node-fetch');
const path = require('path');

const vapid = require('./vapid.json');

const port = 8085;
const database = 'http://localhost:3000';

webpush.setVapidDetails('mailto:test@test.com', vapid.publicKey, vapid.privateKey);


const app = express();
app.use(bodyparser.json());
// Pas le droit de communiquer avec un server autre. L'étoile permet de dire que n'importe qui peut communiquer. Pas faire en prod
app.use(cors('*')); 
app.use(express.static(path.join(__dirname, 'public')));

// Requete POST sur /subscribe
app.post('/subscribe', async (req, res) => {
    const subscription = req.body;
    await fetch(`${database}/clients`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(subscription)
    });

    res.status(201).json();
});
// Requete POST sur /send
app.post('/send', async (req, res) => {
    const result = await fetch(`${database}/clients`);
    const data = await result.json();

    const payload = JSON.stringify({
        title: req.body.title,
        body: req.body.body
    })

    data.map(sub => {
        webpush.sendNotification(sub, payload)
            .catch(console.error);
    });

    res.status(201).json();
});



app.listen(port, () => console.log('App listening on port : ', port));

