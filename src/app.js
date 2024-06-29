import express from 'express'
import cors from "cors"
import cookieParser from 'cookie-parser'

const app = express()

// app.use(cors())
// this much is enough to use cors 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true  //added this for fun
}))

// we can set middlewares using app.use() 

// when we are getting data from a form then we have to set some limit 
app.use(express.json({limit: "16kb"}))
// when recieving data from url there can be format problem
app.use(express.urlencoded())
// there will be some files which we can allow for public use
app.use(express.static("public"))
// to access and to set cookies of browser 
app.use(cookieParser())



export {app}