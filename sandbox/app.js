const express = require("express")
const app = express()
const cors = require("cors")
require('dotenv').config()

app.use(cors())

const router = require("./router/route"
)

const PORT = process.env.PORT
app.use(express.json())

app.use((req,res,next)=>{
    console.log("req recieved at " ,req.url)
    next()
})
app.use("/api",router)

app.listen(PORT,()=>{
console.log("server listening at port "+PORT)

})
