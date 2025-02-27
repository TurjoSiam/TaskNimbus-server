require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');


const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.k0g53.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // collections
        const userCollection = client.db("TaskNimbus").collection("users");
        const taskCollection = client.db("TaskNimbus").collection("tasks");


        // user related api
        app.post("/users", async (req, res) => {
            const user = req.body;
            const existingUser = await userCollection.findOne({email: user.email})
            if(existingUser){
                return res.send("User already exist")
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.get("/users", async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        // task related api

        app.post("/tasks", async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result);
        });

        app.get("/tasks/:email", async (req, res) => {
            const email = req.params.email;
            const cursor = taskCollection.find({email: email})
            const result = await cursor.toArray();
            res.json(result);
        });

        // API to update tasks
        app.put("/tasks", async (req, res) => {
            const { taskId, category, position } = req.body;
            await taskCollection.updateOne(
                { _id: taskId },
                { $set: { category, position } }
            );
            res.sendStatus(200);
        });





    } finally {
    }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("server is running")
});

app.listen(port, () => {
    console.log(`server is running in port ${port}`);
})