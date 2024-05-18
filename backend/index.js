const express =  require("express");

const { connection } = require("./db");

const app = express();

var cors = require('cors');

app.use(express.json());
app.use(cors())

require('dotenv').config()

const {router} = require("./routes/auth");
// const {eventRouter} = require("./routes/events");


app.get("/",(req,res)=>{
    res.send("HOME PAGE")
})

// Routes
app.use('/auth', router);
// app.use('/events', eventRouter);

app.listen(process.env.port, async()=>{
    try{
        await connection
        console.log("connection");
     }catch(err){
        console.log("not connected");
        console.log(err);
    }
    console.log(`Server is running on port ${process.env.port}`)
})






