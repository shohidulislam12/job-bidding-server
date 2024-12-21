const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config()

const port = process.env.PORT || 9000
const app = express()

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mq5kn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )

const db=client.db('solo-db')
const jobsCollection=db.collection('jobs')
//sabve a data in jobdb
app.post('/add-job',async(req,res)=>{
  const jobdata=req.body
  const result=await jobsCollection.insertOne(jobdata)
  res.send(result)

})
//get job data
app.get('/jobs',async(req,res)=>{
  const jobdata=await jobsCollection.find().toArray()
  res.send(jobdata)
})
//get specific user post
app.get(`/jobs/:email`,async(req,res)=>{
  const email=req.params.email
  const query={'buyer.email':email}
  const result=await jobsCollection.find(query).toArray()
  res.send(result)
})
app.delete('/job/:id',async(req,res)=>{
  const id=req.params.id
  const query={_id:new ObjectId(id)}
  const result=await jobsCollection.deleteOne(query)
  res.send(result)
})
 
//get single  job

app.get('/job/:id',async(req,res)=>{
  const id=req.params.id
  const query={_id:new ObjectId(id)}
  const result=await jobsCollection.findOne(query)
  res.send(result)
 
})
//update single  job
app.put('/update-Job/:id',async(req,res)=>{
  const id=req.params.id
  const filter={_id:new ObjectId(id)}
  const options={upsert:true}
  const jobdata=req.body
  const updatedata={
    $set:jobdata,
  }
 

  const result=await jobsCollection.updateOne(filter,updatedata,options)
  res.send(result)

})

  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir)
app.get('/', (req, res) => {
  res.send('Hello from SoloSphere Server....')
})

app.listen(port, () => console.log(`Server running on port ${port}`))
