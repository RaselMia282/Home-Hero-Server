const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// middleware
app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send("Home Hero Server is running")
})

// Home-Hero-DB
// 3mWDEsUjVfsSo8Z4
const uri = "mongodb+srv://Home-Hero-DB:3mWDEsUjVfsSo8Z4@cluster0.og65bqs.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run (){
    try{
        await client.connect();
        // all apis here;
const database = client.db("HomeHeroDB");
const servicesCollection = database.collection("services");
const usersCollection = database.collection("users");
const reviews = database.collection("reviews");

// services api here;

app.get('/services',async(req,res)=>{
  const email = req.query.email;
  let query ={};
  if(email){
    query={email:email};
  }
const cursor = servicesCollection.find(query);
const result = await cursor.toArray();
res.send(result);
})

// to get specific service api here,
app.get('/services/:id',async(req,res)=>{
  const id = req.params.id;
  const query = {_id:new ObjectId(id)};
  const result = await servicesCollection.findOne(query);
  res.send (result);
})

// services delete api,
app.delete('/services/:id',async(req,res)=>{
  const id = req.params.id;
  const query = {_id:new ObjectId(id)};
  const result = await servicesCollection.deleteOne(query);
  res.send(result);
})

// services patch api here,
app.patch('/services/:id',async(req,res)=>{
  const id = req.params.id;
  const updatedService = req.body;
  const query = {_id:new ObjectId(id)};
  const update={
    $set:{
      ...updatedService
    }
  }
  const result = await servicesCollection.updateOne(query,update);
  res.send(result);
})







        // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally{};

}
run().catch(console.dir);

app.listen(port,()=>{
    console.log(`user server started on port ${3000}`);
    
})
