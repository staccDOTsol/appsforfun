

const bodyParser = require('body-parser')
const Bundlr = require(  "@bundlr-network/client" ).default
const fs = require('fs')
let express = require('express')
const cors = require('cors')
let app = new express()
let fetch = require('node-fetch') 
const { Configuration, OpenAIApi } = require("openai");
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, setDoc, doc, query, where  } = require( 'firebase/firestore/lite' );

var serviceAccount = require("./serviceAccountKey.json");
console.log(serviceAccount)
async function addStore(topic, sender, timestamp, text){
  let child = topic 
  if (topic == 'roblox'){
    child = 'messages'
  } if (topic == 'Minecraft'){
    child = 'messages2'
  }
  if (topic == 'AmongUs'){
    child = 'messages3'
  }
  
  await setDoc(doc(db, child, Math.random().toString()), {
  
    text, 
    timestamp, 
    sender 
  });
  
}

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = serviceAccount;

const fb = initializeApp(firebaseConfig);
const db = getFirestore(fb);
// Get a list of cities from your database
async function getConversation(db, topic, uuid) {
  try {
  let col = 'messages'
  if (topic == 'Minecraft'){
    col = 'messages2'
  }
else  if (topic == 'AmongUs'){
  col = 'messages3'
}
console.log(uuid)
  const mCol = collection(db, col);
  const q = query(mCol, where("sender", "==", uuid));
      const aSs = await getDocs(q);
      console.log(aSs)
      console.log(aSs.docs.map(doc => doc.data()))
      if (aSs.docs.map(doc => doc.data()).length == 0){

        return []
  }
  const mSnapshot = await getDocs(mCol);
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
       res.send(link)
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
let winner 
let w = 0
let c2 = 0
let prompt = ""
let history = (await getConversation(db, topic, uuid))
console.log(history)
theprompts[uuid] = history
if (topic == 'roblox'){
  topic = 'mindcrack'
}
else if (topic == 'Minecraft'){
  topic = 'crazyideas'
}
else if (topic == 'AmongUs'){
  topic = 'showerthoughts'
}
if (history.length == 0){
    theprompts[uuid] = []
    let done = false 

    let sample = await (await fetch("https://www.reddit.com/r/" + topic + "/search.json?sort=relevance&show=message&sort=num_comments&nsfw=1&limit=100&q="+req.query.question)).json()
    sample = sample.data.children 
while (!done){

let lengths = []
    try { 


let theran = Math.floor(Math.random()* 100)
let op = sample[theran].data.author 
let authors = {}

if(sample[theran].data.num_comments> 10){
    theprompts[uuid].push(op +": " + sample[theran].data.selftext.replace('\n',''))
try {
    let thread = await (await fetch(sample[theran].data.url.substring(0, sample[theran].data.url.length-1) + '.json')).json()
    for (var t of thread){
     for (var c of t.data.children){
        if (c.data.body){
        if (c.data.body.length < 500 && theprompts[uuid].join().length < 3000){
            if (!Object.keys(authors).includes(c.data.author)){
                authors[c.data.author] = 0 
            }
            lengths.push(c.data.body.length)
            authors[c.data.author] ++
         theprompts[uuid].push(c.data.author+ ": " +c.data.body.replace('\n',''))
        }
    }
     }
    }
 } catch (err){
console.log(err)
 }
}
 console.log(authors)
 w = 0
 for (var author of Object.keys(authors)){
    if (Object.values(authors)[c2] > w ){
        w = Object.values(authors)[c2] 
        winner = author 
        console.log(winner)
        console.log(w)
    }
    c2++
 }
 console.log(winner)
 console.log(w)
 if (w > 0){
    done = true
 } } catch (err){
    console.log(err)
     }
let t2 = 0 

     for (var l of lengths){
t2+=l 
}
let avg = t2 / lengths.length 
     let tprompts = []
     for (var p of theprompts[uuid]){

        p = p.replace(uuid, 'You')
        tprompts.push(p)
     }
    console.log(tprompts)
     theprompts[uuid] = tprompts
     addStore(topic,author, new Date(), tprompts[uuid][tprompts[uuid].length-3])

      prompt = "this is a chatbot that rephrases the original input to sound much more genuinely informed about " + topic + " keeping the theme, tone, and intention of the original input intact, while never including adult or risquee content.\n\n"
    
    }
}
else {
    prompt = "this is a chatbot that rephrases the original input to sound much more genuinely informed about " + topic + " keeping the theme, tone, and intention of the original input intact, while never including adult or risquee content.\n\n"
}
let tprompts = []

for (var p of theprompts[uuid]){
  p = p.replace(uuid, 'You')
  tprompts.push(p)
}
 prompt += theprompts[uuid].join("\n")+"\nYou: " 
 if (req.query.question == 'image'){
  console.log(prompt.join('\n'))
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
       res.send(link)
       return
    } catch (err){
      console.log(err)
      res.send(500)
      return
    }
}
 console.log(prompt)
/*let author = req.query.author 
/let response = await (await fetch("https://api.quotable.io/search/quotes?fields=author&query="+author)).json()
/let results = response.results 
let a1 =Math.floor(Math.random() * results.length)
let a2 =Math.floor(Math.random() * results.length)
let a3 =Math.floor(Math.random() * results.length)
let a4 =Math.floor(Math.random() * results.length)
let prompt = "this is a chatbot that answers like " + author + " would, keeping in character at all times.\nYou: How many pounds are in a kilogram?\n" + author + ": There are 2.2 pounds in a kilogram. "+results[a2].content+"\nYou: What does HTML stand for?\n" + author + ": Hypertext Markup Language.  "+results[a1].content+"\nYou: When did the first airplane fly?\n" + author + ": On December 17, 1903, Wilbur and Orville Wright made the first flights.  "+results[a3].content+"\nYou: What is the meaning of life?\n" + author + results[a4].content+": \nYou: " + req.query.question +"\n" + author + ":"
*/

const answer = await openai.createCompletion({
    model: "text-davinci-002",
    prompt,
    temperature: 0.9,
    max_tokens: 600,
    top_p: 0.3,
    frequency_penalty: 0.4,
    presence_penalty: 0.8
  });
   var tprompts2 = [] 
   let c3 = 0
let tl = 0
  for (var p of theprompts[uuid] ){
    tl += p.length 
  }
  if (tl > 3500){
    for (var p of theprompts[uuid] ){

if (c3 >1){
    tprompts2.push(p)
}
    c3++
  }
}
  tprompts2.push(uuid+": "+req.query.question)
  tprompts2.push("You: " +answer.data.choices[0].text)
  theprompts[uuid] = tprompts2


  
  res.send('You: '+ answer.data.choices[0].text.replace('\n','').replace('\n',''))

}
 catch (err) 
 {
    console.log(err)
    res.send(500)
 }
})
app.listen(process.env.PORT || 3000)