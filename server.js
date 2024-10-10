const express = require("express");
const app = express();
const cors = require('cors');
const {connectToDb, getDb} = require('./db')
const { ObjectId } = require('mongodb')
const path = require("path")
const sharp = require("sharp")

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

app.post('/post', async (req, res) => {
    const newUser = req.body;

    try {
        if (newUser.imageUrl) {
            const base64Data = newUser.imageUrl.replace(/^data:image\/png;base64,/, "");
            const filePath = path.join(__dirname, 'uploads', `${Date.now()}.png`);


            await sharp(Buffer.from(base64Data, 'base64'))
                .resize(400, 400)
                .png()
                .toFile(filePath);

            newUser.imagePath = filePath;
        }

        const result = await db.collection('users').insertOne(newUser);
        res.status(201).json(result);
    } catch (err) {
        console.error('Error processing request:', err);
        res.status(500).json({ error: 'Error processing request' });
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