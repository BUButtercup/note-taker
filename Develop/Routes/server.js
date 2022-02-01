const express = require('express');
const path = require('path');
const _dirname = path.resolve();
const fs = require('fs');

const notes = require('../db/db.json')

const app = express();

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static('../public'));

app.get('/', (req, res) => res.sendFile(path.join(_dirname, '../public/index.html')));

app.get('/notes', (req, res) => res.sendFile(path.join(_dirname, '../public/notes.html')));

// app.post('/notes', )

app.get('/api/notes', (req, res) => res.json(notes));

app.post('/api/notes', (req, res) => {
    console.log(`${req.method} request recieved to add note.`);
    if(!req.body.title){
        res.status(404).send('Input must include a title.');
        console.log(res.status);
    }

    console.log(req.body);

    const {title, note} = req.body;


    const newNote = {
        title: req.body.title,
        note: req.body.text
    }

    console.log(newNote)

    fs.readFile('../db/db.json', 'utf-8', (err, data) => {
        if(err){throw(err)} else{
            const noteBund = JSON.parse(data);
            noteBund.push(newNote)
            fs.writeFile('../db/db.json', JSON.stringify(noteBund), err => {
                if(err){
                    throw err;
                }
                console.log('written');
            })
        };
      
    })

    console.log(`Did it! newNote: ${newNote} / ${res.statusCode}`);
 
})


app.listen(PORT, () => console.log(`Listening on ${PORT}.`));