import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'

const connectDB = async ()=>{
    try {
        // await also returns an object for mongoose that we can use for further details
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MongoDB connnected !! HOST -> ${connectionInstance.connection.host}`)

        // simply we can do this also
        // await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    } catch (error) {
        console.log("MongoDB conection error", error)
        process.exit(1)
    }
}  

export default connectDB