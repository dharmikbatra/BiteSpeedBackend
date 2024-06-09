const express = require("express")
var cors= require('cors');
const {getConnection} = require('./db')


const app = express()


app.use(express.json({
    limit:'10kb'
}));
app.use(express.urlencoded({extended:true, limit:'10kb'}))
app.use(cors());








app.post("/identify" , async (req,res) => {
    res.send("hello")
})


module.exports =  app