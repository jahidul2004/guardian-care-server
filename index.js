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
        const mealRequests = db.collection("mealRequests");
        const upcomingMeals = db.collection("upcomingMeals");
        const reviews = db.collection("reviews");

        // All routes here

        // Create a new user
        app.post("/users", async (req, res) => {
            const newUser = await users.insertOne(req.body);
            res.json(newUser);
        });

        // Get user by email
        app.get("/user/:email", async (req, res) => {
            const user = await users.findOne({ email: req.params.email });
            res.json(user);
        });

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

        //meal requests post api
        app.post("/mealRequests", async (req, res) => {
            const { mealId, userEmail } = req.body;

            try {
                const existingRequest = await mealRequests.findOne({
                    mealId,
                    userEmail,
                });

                if (existingRequest) {
                    return res.status(400).json({
                        message: "You already request for this meal!",
                    });
                }
                const newMealRequest = await mealRequests.insertOne(req.body);

                res.status(201).json(newMealRequest);
            } catch (error) {
                console.error("Error adding meal request:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );

        // get upcoming meals
        app.get("/upcomingMeals", async (req, res) => {
            const allUpcomingMeals = await upcomingMeals.find({}).toArray();
            res.json(allUpcomingMeals);
        });

        // get requested meals by email
        app.get("/mealRequests/:email", async (req, res) => {
            const allRequestedMeals = await mealRequests
                .find({ userEmail: req.params.email })
                .toArray();
            res.json(allRequestedMeals);
        });

        // delete meal request by id and email
        app.delete("/mealRequests/:id/:email", async (req, res) => {
            const deletedMealRequest = await mealRequests.deleteOne({
                _id: new ObjectId(req.params.id),
                userEmail: req.params.email,
            });
            res.json(deletedMealRequest);
        });

        // Review post api
        app.post("/reviews", async (req, res) => {
            const { mealId, userEmail } = req.body;

            try {
                const existingReview = await reviews.findOne({
                    mealId,
                    userEmail,
                });

                if (existingReview) {
                    return res.status(400).json({
                        message: "You have already reviewed this meal.",
                    });
                }

                const newReview = await reviews.insertOne(req.body);
                res.status(201).json(newReview);
            } catch (error) {
                console.error("Error adding review:", error);
                res.status(500).json({
                    message: "Failed to add review. Please try again later.",
                });
            }
        });
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
