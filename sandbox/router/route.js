process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


const router = require("express").Router()
const axios = require("axios")
const mockUrl = process.env.mockUrl ,callbackUrl = process.env.callbackUrl , GATEWAY_URL = process.env.GATEWAY_URL
const {insertRequest,getCache,generateHeader} = require("../utils/utils")


//router.get("*",async(req,res)=>{
//	console.log(req.url)
//	res.send("server working")

//})

router.post("/createHeader", async function (req,res) {
  try {
    const response = await generateHeader(req.body)
    res.setHeader("Authorization",response)
    res.setHeader("Access-Control-Expose-Headers","*")
      return res.send(req.body)
  } catch (error) {
    console.error(error);
    res.status(500).send("an error occurred")
   
  }
});

router.post("/:method",async(req,res)=>{
    try{
        const method = req.params.method, body = req.body
        if(!body?.context?.bap_uri || !body?.context?.transaction_id || !body?.context?.bpp_uri && req.params.method !== 'search'  ){
            return res.status(400).send({data:"validations failed bap_uri || transactionid || bppuri missing"})
        }

        body.context.bap_uri=`${callbackUrl}/ondc/`
        let url ;

        if(req.params.method == 'search'){
            url = GATEWAY_URL
        }else{
            url = body.context.bpp_uri
        }

        if(url[url.length-1]!="/"){ //"add / if not exists in bap uri"
            url=url+"/"
          }

        const header ={headers:{Authorization:await generateHeader(req.body)}}

        insertRequest(body,req.headers)
        const response  =  await axios.post(`${url}${method}`,body,header)
        

        // if(original_uri[original_uri.length-1]!="/"){ //"add / if not exists in bap uri"
        //     original_uri=original_uri+"/"
        //   }
        // axios.post(`${original_uri}${response.data.context.action}`,response.data,{headers:{Authorization:await generateHeader(response.data)}}).catch((err)=>{ //hit back on original uri
        //     console.log(original_uri+"is incorrect")
        // })

        res.status(response.status).send(response.data)


    }catch(err){
        res.status(err?.response?.status || 500).send(err?.response?.data ? err?.response?.data :err.message)
    }
})

router.get("/cache",async(req,res)=>{
    try{
        const response = getCache(req.query.transactionid) || {message:'TransactionId does not have any data'}
        res.send(response)
    }
    catch(err){
        console.log(err)
    }
})

router.post("/ondc/:method",(req,res)=>{
     let body = req.body
     insertRequest(body,req.headers)
})


module.exports = router
