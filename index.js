const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config()
const  jwt = require('jsonwebtoken');
const port = process.env.PORT || 9000
const app = express()


const corsOption = {
  origin: ['http://localhost:5173'],
  credentials: true,              
  optionsSuccessStatus: 200,        
};
app.use(cors(corsOption))
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
const bidsCollection=db.collection('bids')

//sabve a data in jobdb
app.post('/add-job',async(req,res)=>{
  const jobdata=req.body
  const result=await jobsCollection.insertOne(jobdata)
  res.send(result)

})
//sabve bid data in db
app.post('/bids',async(req,res)=>{
  //0.check useralready have 
  const biddata=req.body
  const query={email:biddata.email,
    job_id:biddata.
    job_id}
  const alreadyExist=await bidsCollection.findOne(query)

  if(alreadyExist) return res.status(400).send("you have already placed on bid this job")
    console.log(alreadyExist)
  //1.creat bid data
  
  const result=await bidsCollection.insertOne(biddata)
  //2.increase bid count in jobs collection 
  const filter={_id:new ObjectId(biddata.job_id )}
  const update={
    $inc:{
      
bid_count:1,


    }
  }
  const updateBidCount=await jobsCollection.updateOne(filter,update)

  res.send(result)

})
// get all bids for specific user
app.get('/bids/:email',async(req,res)=>{

  const email=req.params.email
  const query={email}
  const result=await bidsCollection.find(query).toArray()
  res.send(result)
})
// get all bids requiest specific user
app.get('/bid-request/:email',async(req,res)=>{
  const email=req.params.email
  const query={buyerEmail:email}
  const result=await bidsCollection.find(query).toArray()
  res.send(result)
})
//update bid status
app.patch('/bid-status/:id',async(req,res)=>{
  const {status}=req.body
  const id=req.params.id

  const filter={_id:new ObjectId(id)}
  const updated={
    $set:{
      status:status}
  }
const result =await bidsCollection.updateOne(filter,updated)
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
//get all jobs
app.get('/all-jobs',async(req,res)=>{
const filter=req.query.filter
const search=req.query.search
const sort=req.query.sort
console.log(search)
let options={}
if(sort) options={sort:{deadline:sort==='asc'?1:-1}}
let query={
  job_title:{
  $regex:search ,$options:'i'
}}

if(filter) query.category=filter  // const query={category:filter}
  const result=await jobsCollection.find(query,options).toArray()
  res.send(result)
})

// generate jwtoken  
app.post('/jwt',async(req,res)=>{
  const email=req.body
//creat token 

const token = jwt.sign({ email }, process.env.DB_TOKEN, { expiresIn: '900d' });
res.cookie('token',token,{
  httpOnly:true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
}).send({success:true})
})

//logOut cokkie||clear cookie
app.get('/logOut',async(req,res)=>{
  res.clearCookie('token',{
    maxAge:0,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  }).send({success:true})
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
