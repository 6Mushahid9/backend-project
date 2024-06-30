// require('dotenv').config({path: './env'})

import dotenv from 'dotenv'
import connectDB from "./db/connection.js";
import { app } from './app.js';

dotenv.config({
    path: './env'
})

connectDB()
// till now our database was connected but our application was not listning
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`App is running on port : ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Cannot run app, Database coneection failed", err)
})