import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async(req,res,next)=>{
   try {
     // this func. will get user currently using application
     const token= req.cookies?.accessToken || req.header("Authentication")?.replace("Bearer", "")
     // we can retrive token using req
     // header code is used when using mobile, 
     // the header section have ` Authentication: Bearer <token> ` from where we can extract token
 
     if(!token) throw new apiError(401, "Unauthorised request")
 
     // the token we got is encoded and can be decoded by the encoder i.e. JWT
     // so we ask jwt to verify the token
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
 
     // now we can find user in DB
     const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
     
     if(!user)   throw new apiError(401, "Invalid access token")
     
     req.user= user
     // here we set user field in req to the current user so that it can be used by the func. after this middleware
     next()
     // above line will call next func. in line
   } catch (error) {
        throw new apiError(401, error)
   }
})