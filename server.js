const express = require("express");
const app = express();
const cors = require('cors');
const {connectToDb, getDb} = require('./db')
const { ObjectId } = require('mongodb')
const multer = require('multer')
const path = require('path')
const fs = require("fs")


app.use(express.json());
app.use(cors());

let db

connectToDb((err) => {
    if(!err){
        app.listen(3000, ()=>{
            console.log('app is listening on port 3000')
        })
        db = getDb()
    }
})

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, path.join(__dirname, "images"))
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({storage: storage});


app.get('/users', (req, res) => {
    let users = []
    db.collection('users')
    .find()
    .forEach(user => users.push(user))
    .then(()=> res.status(200).json(users))
    .catch(() => {res.status(500).json({error: 'Could not fetch'})});
})

app.post('/post', upload.single('image'), (req, res) => {
    const newUser = req.body
    db.collection('users')
    .insertOne(newUser)
    .then((result) => {
        res.status(201).json(result)
    })
})

app.delete('/delete/:id' , (req, res)=> {
    if(ObjectId.isValid(req.params.id)){
        db.collection('users')
        .deleteOne({_id: new ObjectId(req.params.id)})
        .then((result)=>{
            res.status(200).json(result)
        })
    }
})

app.patch('/update/:id', (req,res) => {
    const updates = req.body
    if(ObjectId.isValid(req.params.id)){
        db.collection('users')
        .updateOne({_id: new ObjectId(req.params.id)}, {$set: updates})
        .then((result)=>{
            res.status(200).json(result)
        })
    }

})