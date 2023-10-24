const cache = require("node-cache")
const {createAuthorizationHeader} = require("ondc-crypto-sdk-nodejs")

const myCache = new cache( { stdTTL: 100, checkperiod: 120 } );

function  insertRequest(request,header){
let response = myCache.get(request.context.transaction_id)||[]
const order = response.length >= 1 ? response[response.length-1].order+1 : 1
const date = new Date()
myCache.set(request.context.transaction_id,[...response,{action: request.context.action,order:order,header:header?header:null,timestamp:date,data:request}],15000)
return order
}

function getCache(key){
    if(key === undefined || key===""){
        return myCache.keys()
    }
    
    return myCache.get(key)
}

async function generateHeader(message){
    const result =  await createAuthorizationHeader({
       message: message,
       privateKey: process.env.PRIVATE_KEY , //SIGNING private key
       bapId: process.env.BAPID , // Subscriber ID that you get after registering to ONDC Network
       bapUniqueKeyId: process.env.UNIQUE_KEY, // Unique Key Id or uKid that you get after registering to ONDC Network
     })
     
     return result
       
   }

module.exports = {
insertRequest,getCache,generateHeader
}

