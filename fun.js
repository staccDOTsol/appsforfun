

const bodyParser = require('body-parser')
const Bundlr = require(  "@bundlr-network/client" ).default
const fs = require('fs')
let express = require('express')
const cors = require('cors')
let app = new express()
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
  const q = query(mCol, orderBy("timestamp", "desc"), limit(5));

  const mSnapshot = await getDocs(q);
  console.log(mSnapshot)
  let messageHistory = mSnapshot.docs.map(doc => doc.data().text).reverse();
  let tM = []
  let tMM = []
  for (var m of messageHistory){
    
    if (!tM.includes(m.replace('\n','').replace('###',''))){
      tM.push(m.replace('\n','').replace('###',''))
      tMM.push(m)
    }
  }
  messageHistory = tMM
  console.log(messageHistory)
  return ( messageHistory);
} catch (err){
return []  
}
}

app.use(bodyParser())
app.use(cors())
let theprompts = {}
const fetch = require('node-fetch')
async function infer(prompt, data, i, oldresp) {
	try {
  const response = await fetch(
		"https://api-inference.huggingface.co/models/staccdotsol/DialoGPT-large-stacc-horror",
		{
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
    let segments = result[0].generated_text.split('.')
    oldresp = (segments[segments.length-1].toString())
    console.log(oldresp)
    if (i > 18){
      return segments[segments.length-1].toString();
    }
if (i == 0 || (segments.length == 1) ){
        return infer(prompt, {"inputs": segments[segments.length-1].toString()}, i+1, segments[segments.length-1].toString())
}else{
    return segments[segments.length-2].toString() + '\n' +  segments[segments.length-1].toString();
}
  } catch (err){
    console.log(err)
    return oldresp
  }
	
}


app.get('/', async function(req, res){
try {
let uuid = req.query.uuid

let topic = req.query.topic 

let prompt =  (await getConversation(db, topic, uuid)).join('\n') + "\n"


let text = await infer(prompt, {"inputs": prompt}, 0, "")
text = text.replace(prompt,'')

  await setDoc(doc(db, topic, new Date().toString()), {
  
        text,
        timestamp: new Date(), 
        sender: ''
      });
  res.send( text )

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