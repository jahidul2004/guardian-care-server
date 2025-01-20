const express = require("express");
const cors = require("cors");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const app = express();
const port = process.env.PORT || 3000;

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
        const memberships = db.collection("membership");
        const transactions = db.collection("transactions");

        // All routes here

        //Stripe payment intent
        app.post("/create-payment-intent", async (req, res) => {
            const { price } = req.body;

            const amount = parseInt(price * 100);

            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency: "usd",
                payment_method_types: ["card"],
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        // transaction post api
        app.post("/transactions", async (req, res) => {
            const newTransaction = await transactions.insertOne(req.body);
            res.json(newTransaction);
        });

        //get transactions by email
        app.get("/transactions/:email", async (req, res) => {
            const allTransactions = await transactions
                .find({ userEmail: req.params.email })
                .toArray();
            res.json(allTransactions);
        });

        // membership by id
        app.get("/membership/:id", async (req, res) => {
            const membership = await memberships.findOne({
                _id: new ObjectId(req.params.id),
            });
            res.json(membership);
        });

        //get all memberships
        app.get("/memberships", async (req, res) => {
            const allMemberships = await memberships.find({}).toArray();
            res.json(allMemberships);
        });

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

        // get all users
        app.get("/users", async (req, res) => {
            const allUsers = await users.find({}).toArray();
            res.json(allUsers);
        });

        // Update user role
        app.patch("/users/:id", async (req, res) => {
            const id = req.params.id;
            const { role } = req.body;

            const result = await users.updateOne(
                { _id: new ObjectId(id) },
                { $set: { role } }
            );

            res.json({ modifiedCount: result.modifiedCount });
        });

        // update user badge by email
        app.patch("/users/badge/:email", async (req, res) => {
            const email = req.params.email;
            const { badge } = req.body;

            const result = await users.updateOne(
                { email },
                { $set: { badge } }
            );

            res.json({ modifiedCount: result.modifiedCount });
        });

        // add a new meal
        app.post("/meals", async (req, res) => {
            const newMeal = await meals.insertOne(req.body);
            res.json(newMeal);
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

        //delete meal by id
        app.delete("/meals/:id", async (req, res) => {
            const deletedMeal = await meals.deleteOne({
                _id: new ObjectId(req.params.id),
            });
            res.json(deletedMeal);
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

        // get all meal requests
        app.get("/mealRequests", async (req, res) => {
            const allMealRequests = await mealRequests.find({}).toArray();
            res.json(allMealRequests);
        });

        // Update meal request by id
        app.put("/mealRequests/:id", async (req, res) => {
            const updatedMealRequest = await mealRequests.findOneAndUpdate(
                { _id: new ObjectId(req.params.id) },
                { $set: { ...req.body } },
                { returnDocument: "after" }
            );
            res.json(updatedMealRequest);
        });

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log(
        //     "Pinged your deployment. You successfully connected to MongoDB!"
        // );

        // get upcoming meals
        app.get("/upcomingMeals", async (req, res) => {
            const allUpcomingMeals = await upcomingMeals.find({}).toArray();
            res.json(allUpcomingMeals);
        });

        //get upcoming meals by id
        app.get("/upcomingMeals/:id", async (req, res) => {
            const upcomingMeal = await upcomingMeals.findOne({
                _id: new ObjectId(req.params.id),
            });
            res.json(upcomingMeal);
        });

        // Delete upcoming meal by id
        app.delete("/upcomingMeals/:id", async (req, res) => {
            const deletedUpcomingMeal = await upcomingMeals.deleteOne({
                _id: new ObjectId(req.params.id),
            });
            res.json(deletedUpcomingMeal);
        });

        // Update upcoming meal by id
        app.put("/upcomingMeals/:id", async (req, res) => {
            const updatedUpcomingMeal = await upcomingMeals.findOneAndUpdate(
                { _id: new ObjectId(req.params.id) },
                { $set: { ...req.body } },
                { returnDocument: "after" }
            );
            res.json(updatedUpcomingMeal);
        });

        // Post upcoming meals
        app.post("/upcomingMeals", async (req, res) => {
            const newUpcomingMeal = await upcomingMeals.insertOne(req.body);
            res.json(newUpcomingMeal);
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

        // Reviews get api by userEmail
        app.get("/reviews/:email", async (req, res) => {
            const allReviews = await reviews
                .find({ userEmail: req.params.email })
                .toArray();
            res.json(allReviews);
        });

        // getReviews by mealId
        app.get("/reviews/meal/:mealId", async (req, res) => {
            console.log(req.params.mealId);
            const allReviews = await reviews
                .find({ mealId: new ObjectId(req.params.mealId).toString() })
                .toArray();
            res.json(allReviews);
        });

        // get all reviews
        app.get("/reviews", async (req, res) => {
            const allReviews = await reviews.find({}).toArray();
            res.json(allReviews);
        });

        //delete review by id
        app.delete("/reviews/:id", async (req, res) => {
            const deletedReview = await reviews.deleteOne({
                _id: new ObjectId(req.params.id),
            });
            res.json(deletedReview);
        });

        // get dashboard stats
        app.get("/dashboard", async (req, res) => {
            const totalUsers = await users.countDocuments();
            const totalMeals = await meals.countDocuments();
            const totalMealRequests = await mealRequests.countDocuments();
            const totalUpcomingMeals = await upcomingMeals.countDocuments();
            const totalReviews = await reviews.countDocuments();
            const totalMemberships = await memberships.countDocuments();
            const totalTransactions = await transactions.countDocuments();

            res.json({
                totalUsers,
                totalMeals,
                totalMealRequests,
                totalUpcomingMeals,
                totalReviews,
                totalMemberships,
                totalTransactions,
            });
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
