const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());

// Mongodb connection

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8eefy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        // Collections
        const db = client.db("guardianCare");
        const users = db.collection("users");
        const meals = db.collection("meals");

        // All routes here

        // Get all meals
        app.get("/meals", async (req, res) => {
            const allMeals = await meals.find({}).toArray();
            res.json(allMeals);
        });

        // Get meals by id
        app.get("/meals/:id", async (req, res) => {
            const meal = await meals.findOne({
                _id: new ObjectId(req.params.id),
            });
            res.json(meal);
        });

        // Update meal by id
        app.put("/meals/:id", async (req, res) => {
            const updatedMeal = await meals.findOneAndUpdate(
                { _id: new ObjectId(req.params.id) },
                { $set: { ...req.body } },
                { returnDocument: "after" }
            );
            res.json(updatedMeal);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

// Routes
app.get("/", (req, res) => {
    res.send("Guardian Care server started");
});

// Listener
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
