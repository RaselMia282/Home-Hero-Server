const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { status } = require("express/lib/response");

// middleware
app.use(cors());
app.use(express.json());

// ১. verifyToken Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  jwt.verify(token, "homehero", (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
};

const uri =
  "mongodb+srv://Home-Hero-DB:3mWDEsUjVfsSo8Z4@cluster0.og65bqs.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const database = client.db("HomeHeroDB");
    const servicesCollection = database.collection("services");
    const bookingsCollection = database.collection("bookings");

    // JWT API
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, "homehero", { expiresIn: "10d" });
      res.send({ token });
    });

    // Services APIs
    app.get("/services", async (req, res) => {
      const email = req.query.email;
      const category = req.query.category;
      let query = {};
      if (email) {
        query = { providerEmail: email };
      } else if (category) {
        query = { category: category };
      }
      const result = await servicesCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await servicesCollection.findOne(query);
      res.send(result);
    });

    app.post("/services", async (req, res) => {
      const result = await servicesCollection.insertOne(req.body);
      res.send(result);
    });

    // Bookings API (Protected with verifyToken)
    app.get("/bookings", verifyToken, async (req, res) => {
      const email = req.query.email;
      const providerEmail = req.query.providerEmail;

      if (email && req.decoded.email !== email) {
        return res.status(403).send({ message: "Forbidden access" });
      }

      let query = {};
      if (email) {
        query = { customerEmail: email };
      } else if (providerEmail) {
        query = { providerEmail: providerEmail };
      }

      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/bookings", async (req, res) => {
      const result = await bookingsCollection.insertOne(req.body);
      res.send(result);
    });

    // bookings patch api
    app.patch("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const updatedBookings = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          status: updatedBookings.status,
        },
      };
      const result = await bookingsCollection.updateOne(query, update);
      res.send(result);
    });

    console.log("MongoDB Connected Successfully!");
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Home Hero Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
