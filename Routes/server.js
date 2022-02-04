const express = require('express');
const path = require('path');
const _dirname = path.resolve();
const fs = require('fs');
const {v4: uuidv4} = require('uuid');

const notes = require('../db/db.json')

const app = express();

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(_dirname, '../public')));

app.get('/', (req, res) => res.sendFile(path.join(_dirname, '../public/index.html')));

app.get('/notes', (req, res) => res.sendFile(path.join(_dirname, '../public/notes.html')));

app.get('/api/notes', (req, res) => {
    console.log(`${req.method} request made for notes list`);
    fs.readFile('../db/db.json', 'utf-8', (err, data) => {
        if(err){
            res.status(500).send(`Request couldn't be completed`)
            throw(err)
        } else{
        res.json(JSON.parse(data));
        console.log(`Status ${res.statusCode}, info sent`)
        }
    })
});

app.get('/api/notes/:id', (req, res) => {
    console.log(`${req.method} request made for note ${req.params.id}`);
    fs.readFile('../db/db.json', 'utf-8', (err, data) => {
        if(err){
            res.status(500).send(`Request couldn't be completed`)
            throw(err)
        } else{
            const noteArr = JSON.parse(data);
            console.log(noteArr);
            const note = noteArr.find(item => {
                if(item.id === req.params.id){
                    res.json(item)
                    return item
                }
            })
            if(!note){
                res.status(404).send(`No note with ID ${req.params.id} in list`)
            }
        }
    })
})

app.post('/api/notes', (req, res) => {
    console.log(`${req.method} request recieved to add note.`);
    if(!req.body.title){
        res.status(404).send('Input must include a title.');
        console.log(res.status);
    }
    console.log(req.body);
    const newNote = {
        id: uuidv4(),
        title: req.body.title,
        note: req.body.text
    }
    console.log(newNote)
    console.log(`Did it! newNote: ${newNote.title} / ${res.statusCode}`);
    fs.readFile('../db/db.json', 'utf-8', (err, data) => {
        if(err){throw(err)} else{
            const noteBund = JSON.parse(data);
            noteBund.push(newNote)
            console.log(noteBund);
            fs.writeFile('../db/db.json', JSON.stringify(noteBund), err => {
                if(err){
                    throw err;
                }
                console.log('written');
                res.json(newNote)
            })
        };
    })
})

app.delete('/api/notes/:id', (req, res)=>{
    console.log(`${req.method} request recieved to delete note.`);
    fs.readFile('../db/db.json', 'utf-8', (err, data) => {
        if(err){
            res.status(500).send(`Request couldn't be completed. Error: ${err}`)
            throw(err)
        }
        try{    
            const noteArr = JSON.parse(data);
            noteArr.filter(note => {
                if(note.id === req.params.id){
                    const i = noteArr.indexOf(note)
                    noteArr.splice(i, 1);
                    fs.writeFile('../db/db.json', JSON.stringify(noteArr), err => {
                        if(err){
                            throw err;
                        }
                        console.log('written');
                    })
                    return res.send(`${note.title} has been deleted!`)
                } else if(!noteArr.some(note => note.id === req.params.id)){ 
                    console.log(`Note # ${req.params.id} does not exist in file. Cannot delete.`);
                    return res.status(404).send(`Note # ${req.params.id} does not exist in file. Cannot delete.`);
                }
            })
        } catch(error){console.error};
    })
})

app.put('/api/notes/:id', (req, res) => {
    console.log(`${req.method} request recieved to edit note.`);
    fs.readFile('../db/db.json', 'utf-8', (err, data) => {
        if(err){
            res.status(500).send(`Request couldn't be completed. Error: ${err}`)
            throw(err)
        }
        const noteArr = JSON.parse(data);
        noteArr.filter(note => {
            if(note.id === req.params.id){
                const newNote = {
                    id: note.id,
                    title: req.body.title,
                    note: req.body.text
                }
                const i = noteArr.indexOf(note)
                noteArr.splice(i, 1, newNote);
                fs.writeFile('../db/db.json', JSON.stringify(noteArr), err => {
                    if(err){
                        throw err;
                    }
                    console.log('written');
                })
                return res.send(`${req.body.title} has been edited!`)
            } else if(!noteArr.some(note => note.id === req.params.id)){ 
                console.log(`Note # ${req.params.id} does not exist in file. Cannot edit.`);
                return res.status(404).send(`Note # ${req.params.id} does not exist in file. Cannot edit.`);
            }
        })
    })
})


app.listen(PORT, () => console.log(`Listening on ${PORT}.`));