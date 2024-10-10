const express = require("express");
const app = express();
const cors = require('cors');
const {connectToDb, getDb} = require('./db')
const { ObjectId } = require('mongodb')
const path = require("path")

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




app.get('/users', (req, res) => {
    let users = []
    db.collection('users')
    .find()
    .forEach(user => users.push(user))
    .then(()=> res.status(200).json(users))
    .catch(() => {res.status(500).json({error: 'Could not fetch'})});
})

app.post('/post', (req, res) => {
    const newUser = req.body

    if(newUser.imageUrl){
        const base64Data = newUser.imageUrl.replace(/^data:image\/png;base64,/,"")
        const filePath = path.join(__dirname, 'uploads', `${Date.now()}.png`);

        fs.writeFile(filePath, base64Data, 'base64', (err) => {
            if (err){
                return res.status(500).json({error: 'Error saving image'});
            }

            newUser.imagePath = filePath;
            db.collection('users')
            .insertOne(newUser)
            .then((result) => {
                res.status(201).json(result)
            });

        })
    }else{
        db.collection('users')
        .insertOne(newUser)
        .then((result) => {
            res.status(201).json(result)
        })
    }




});

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