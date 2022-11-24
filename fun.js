

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
  const q = query(mCol, orderBy("timestamp", "desc"), limit(20));

  const mSnapshot = await getDocs(q);
  console.log(mSnapshot)
  let messageHistory = mSnapshot.docs.map(doc => doc.data().text);
  let tM = []
  let tMM = []
  for (var m of messageHistory){
    
    if (!tM.includes(m.replace('\N','').replace('###',''))){
      tM.push(m.replace('\N','').replace('###',''))
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
async function infer(data, i) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/staccdotsol/DialoGPT-large-stacc-horror",
		{
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
    console.log(result)
    let segments = result[0].generated_text.split('.')
if (i == 0 || segments.length == 1){
        return infer({"inputs": segments[segments.length-1].toString()}, i+1)
}else{
    return result[0].generated_text.split('.')[result[0].generated_text.split('.').length-1];
}

	
}


app.get('/', async function(req, res){
try {
let uuid = req.query.uuid

let topic = req.query.topic 

let prompt =  (await getConversation(db, topic, uuid)).join('\n') + "\n"
console.log(prompt)


let text = await infer({"inputs": prompt}, 0)
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