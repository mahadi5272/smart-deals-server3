const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = 3000;

// middal wear
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello Ratul!");
});
// mongodb
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@mahdi.ow7tc2p.mongodb.net/?appName=Mahdi`;

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
    await client.connect();
    const db = client.db("smart-deals");
    const productcollection = db.collection("products");
    const bidcollection = db.collection("bids")
    const userscollection = db.collection("users")

    // users
    app.post('/users',async(req,res)=>{
        const newUser = req.body;
        const email = req.query.email;
        const queary = {email:email}
        const existingUser = userscollection.findOne(queary);
         
        if(existingUser){
            res.send({message:'do not distrub'})
        }else{
            const result = userscollection.insertOne(newUser)
            res.send(result)
        }
    })

    // products
    app.get("/products",async(req,res)=>{
        const cursor = productcollection.find().skip(5).limit(5).sort({price_min:-1})
        const result =await cursor.toArray()
        res.send(result)
    })
    app.get("/products/:id",async(req,res)=>{
        const id = req.params.id
        const queary = {_id:new ObjectId(id)}
        const result =await productcollection.findOne(queary)
        res.send(result)
    })

    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await  productcollection.insertOne(newProduct)
      res.send(result)
    });

    app.delete("/products/:id",async(req,res)=>{
        const id = req.params.id;
        const queary = {_id: new ObjectId(id)}
        const result =await productcollection.deleteOne(queary)
        res.send(result)
    })
    app.patch("/products/:id",async(req,res)=>{
        const id = req.params.id;
        const updatedata = req.body;
        const queary = {_id: new ObjectId(id)}
        const update ={
            $set:{
                name:updatedata.name,
                price:updatedata.price,
            }
        }
        const result = await productcollection.updateOne(queary,update)
        res.send(result)
    })

    // bid api
    app.get("/bids",async(req,res)=>{
        const email = req.query.email
        const queary = {}
        if(email){
            queary.buyer_email =  email;
        }
        const cursor = bidcollection.find(queary);
        const result = cursor.toArray()
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
