const {MongoClient} = require("mongodb");

let dbConnection;
const uri = 'mongodb+srv://salimraji:1234@mycluster.lbrtq.mongodb.net/sample_mflix?retryWrites=true&w=majority&appName=myCluster'
module.exports={
    connectToDb: (cb) => {
        MongoClient.connect(uri)
        .then((client) => {
            dbConnection = client.db()
            return cb();
        })
        .catch(err => {
            console.log(err)
            return cb(err)
        })
    },
    getDb: () => dbConnection
}