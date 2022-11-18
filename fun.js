

const bodyParser = require('body-parser')
let express = require('express')
const cors = require('cors')
let app = new express()
let fetch = require('node-fetch') 
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(bodyParser())
app.use(cors())
let theprompts = {}
app.get('/', async function(req, res){
try {
let uuid = req.query.uuid

let topic = req.query.topic 
let winner 
let w = 0
let c2 = 0
let prompt = ""
if (!Object.keys(theprompts).includes(uuid) ||  theprompts[uuid].length < 3){
    theprompts[uuid] = []
    let done = false 

    let sample = await (await fetch("https://www.reddit.com/r/" + topic + "/search.json?sort=relevance&show=message&sort=num_comments&limit=100&q="+req.query.question)).json()
    sample = sample.data.children 
while (!done){

let lengths = []
    try { 


let theran = Math.floor(Math.random()* 100)
let op = sample[theran].data.author 
let authors = {}

if(sample[theran].data.num_comments> 50){
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

        if (p.length > avg ){
        p = p.replace(p.split(':')[0], 'You')
        tprompts.push(p)
        }
     }
    console.log(tprompts)
     theprompts[uuid] = tprompts
      prompt = "this is a chatbot that answers in a helpful and conversational manner about " + topic + " without any adult or risquee responses.\n"
    
    }
}
else {
    prompt = "this is a chatbot that answers in a helpful and conversational manner about " + topic + " without any adult or risquee responses.\n"
}
 prompt += theprompts[uuid].join("\n")+"\n"+uuid+":"+req.query.question+"\nYou:"
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
    top_p: 0.1,
    frequency_penalty: 0.2,
    presence_penalty: 0.5
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
  res.send(answer.data.choices[0].text)

}
 catch (err) 
 {
    console.log(err)
    res.send(500)
 }
})
app.listen(process.env.PORT || 3000)