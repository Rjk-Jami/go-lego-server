const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()



// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.LEGO_USER}:${process.env.LEGO_KEY}@cluster0.anem91w.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("LegoDB");
    const legoCollection = database.collection("lego");
    // Replace field1 and field2 with your actual field names
    const indexKeys = { name: 1, category: 1 };
    // Replace index_name with the desired index name
    const indexOptions = { name: "name" };
    const result = await legoCollection.createIndex(indexKeys, indexOptions);
    console.log(result);

    //for search
    app.get("/getToysByText/:text", async (req, res) => {
      const text = req.params.text;
      console.log(text)
      const result = await legoCollection.find({ name: { $regex: text, $options: "i" } }).toArray();
      res.send(result);
    });


    // add to db
    app.post('/addAToy', async (req, res) => {
      const body = req.body
      // console.log(body)
      const lego = await legoCollection.insertOne(body)
      res.send(lego)
    })
    //all toys
    app.get('/allToys', async (req, res) => {
      let toys;
      console.log(req.query.sort)
      if (req.query.sort === 'all') {
        toys = await legoCollection.find().limit(20).toArray();
      } else {
        toys = await legoCollection.find().limit(20).sort({ price: req.query.sort === 'desc' ? -1 : 1 }).toArray();
      }
      res.send(toys);

    })

    //my toys sort by email
    app.get('/myToys', async (req, res) => {
      const { email } = req.query;
      console.log(email)
      toys = await legoCollection.find({ email }).toArray();
      res.send(toys);

    })

    //query id
    app.get('/allToys/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const toys = await legoCollection.findOne(query)
      res.send(toys);

    })
    //delete by id
    app.delete('/allToys/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await legoCollection.deleteOne(query)
      res.send(result)
    })
    //update by id
    app.patch('/allToys/:id', async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;
      const toys = await db.collection('products').updateOne({ _id: new ObjectId(id) }, { $set: updateData });

      res.send(toys)

    })

    //updated toys find
    app.get('/updateToys/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const toys = await legoCollection.findOne(query)
      res.send(toys);

    })

    //update by id
    app.put('/updateToys/:id', async (req, res) => {
      const id = req.params.id
      const updateData = req.body
      const query = { _id: new ObjectId(id) }
      const toys = await legoCollection.updateOne(query, { $set: updateData });

      res.send(toys);

    })
    //find all qunique category 
    app.get('/categories', async (req, res) => {

      const categories = await legoCollection.find({}, { category: 1 }).toArray();

      const uniqueCategories = [...new Set(categories.map((category) => category.category))];
      res.send(uniqueCategories);

    });

    //category related toy
    app.get('/toysByCategory', async (req, res) => {


      const toys = await legoCollection.find(req.query).toArray(); // Use the category as the filter

      res.send(toys);

    });
    // all photo
    app.get("/photos", async (req, res) => {
      const photos = await legoCollection.find().toArray();
      // {}, { imgLink: 1 }
      // const imgLinks = photos.map((photo) => photo.imgLink);
      res.send(photos);

    })

    //height price

    app.get("/offer", async (req, res) => {


      const options = {
        sort: { price: -1 },

      };

      // Find the highest-priced toy
      const toy = await legoCollection.findOne({}, options);
      res.send(toy)
    })

    //all data 
    app.get("/review", async (req, res) => {


      const options = {
        sort: { applyDate: -1 },

      };

      // Find the highest-priced toy
      const toy = await legoCollection.find({}, options).limit(4).toArray();
      res.send(toy)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Welcome to GO LEGO')
})




app.listen(port, () => {
  console.log(`GO LEGO at your service on PORT: ${port}`)
})