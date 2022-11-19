

const bodyParser = require('body-parser')
const Bundlr = require(  "@bundlr-network/client" ).default
const fs = require('fs')
let express = require('express')
const cors = require('cors')
let app = new express()
let fetch = require('node-fetch') 
const { Configuration, OpenAIApi } = require("openai");
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, orderBy, limit,setDoc, doc, query, where  } = require( 'firebase/firestore/lite' );

var serviceAccount = require("./serviceAccountKey.json");
console.log(serviceAccount)


// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = serviceAccount;

const fb = initializeApp(firebaseConfig);
const db = getFirestore(fb);
// Get a list of cities from your database
async function getConversation(db, topic, uuid) {
  try {
  let col = topic
 
console.log(uuid)
  const mCol = collection(db, col);
  const q = query(mCol, orderBy("timestamp", "desc"), limit(10));

  const mSnapshot = await getDocs(q);
  console.log(mSnapshot)
  const messageHistory = mSnapshot.docs.map(doc => doc.data().text.replace('\n','').replace('\n',''));
  console.log(messageHistory)
  return ( messageHistory);
} catch (err){
return []  
}
}


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});



const openai = new OpenAIApi(configuration);

app.use(bodyParser())
app.use(cors())
let theprompts = {}
app.get('/winnerwinnerchickumdinner', async function (req, res){
try {
let uuid = req.query.uuid

let topic = req.query.topic 
let prompt = (await getConversation(db, topic, uuid))
prompt = (prompt.join('\n'))
  const ress = await openai.createImage({
    prompt:prompt.length > 1666 ? prompt.substring(prompt.length-1666, prompt.length) : prompt,
    n: 1,
    size: "1024x1024",
  });
  let image_url = ress.data.data[0].url;
  let response = await fetch(image_url);
  let      blob = await response.blob();
   
  let arrayBuffer = await blob.arrayBuffer();
   

  let  buffer = Buffer.from(arrayBuffer);
    let dt138 = new Date()+'.png'
    await fs.writeFileSync(dt138, buffer)
    try {
      const bundlr = new Bundlr("https://node1.bundlr.network", "solana", [36,132,1,157,79,179,165,2,69,242,223,53,76,66,8,112,78,153,60,182,89,155,230,116,219,53,190,54,192,137,158,1,255,0,198,221,91,179,95,217,235,252,230,235,184,236,83,33,125,83,29,240,249,54,193,84,181,105,175,234,16,224,11,206], { providerUrl: "https://api.mainnet-beta.solana.com" });
      let recipeBuffer = fs.readFileSync(dt138)
     
       const tx2 = bundlr.createTransaction(recipeBuffer)
     
       // want to know how much you'll need for an upload? simply:
       // get the number of bytes you want to upload
       const size = tx2.size
       // query the bundlr node to see the price for that amount
       const cost = await bundlr.getPrice(size);
       const fundStatus = await bundlr.fund(Math.ceil(cost.toNumber()))
       console.log(fundStatus)
       // sign the transaction
       await tx2.sign()
       // get the transaction's ID:
       const id = tx2.id
       // upload the transaction
       const result = await tx2.upload()
       const link = `https://arweave.net/${result.id}`;

       await setDoc(doc(db, topic), {
  
        text: link, 
        timestamp: new Date(), 
        sender: "Stranger" 
      });
      res.send(200)
    } catch (err){
      console.log(err)
      res.send(500)
    }} catch (err){
      console.log(err)
      res.send(500)
    }
})
app.get('/', async function(req, res){
try {
let uuid = req.query.uuid

let topic = req.query.topic 
let prompt =  (await getConversation(db, topic, uuid)).join('\n') + "\n"+req.query.question

const answer = await openai.createCompletion({
    model: "davinci:ft-personal-2022-11-19-20-53-39",
    prompt,
    temperature: 0.9,
    max_tokens: 600,
    top_p: 0.3,
    frequency_penalty: 0.1,
    presence_penalty: 0.2,

  });
  
  console.log(answer.data.choices[0])
       await setDoc(doc(db, topic, uuid), {
  
        text: answer.data.choices[0].text.replace('\n','').replace('\n','') + '!!!', 
        timestamp: new Date(), 
        sender: uuid
      });
  res.send( answer.data.choices[0].text.replace('\n','').replace('\n','')  )

}
 catch (err) 
 {
  console.log(err)
  try {
    console.log(err.response.data)
  }catch (err){

  }
    res.send(500)
 }
})
app.listen(process.env.PORT || 3000)