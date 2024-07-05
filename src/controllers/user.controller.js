import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"

const options = {
    httpOnly: true,
    secure: true
}
// above code will help to secure cookies

const registerUser= asyncHandler(async(req,res)=>{
    // res.status(200).json({message: "ok"})

    // get user deails from frontend
    // validation - fields not empty
    // check if user already exists: username, email
    // check for images
    // create user object - entry id DB
    // remove password and refresh token from respose
    // return respose

    const {fullName, userName, email, password}= req.body
    console.log("email:", email)

    // if(username === "") throw new apiError(400, "username required")
    // we can do apply same check for rest of fields
    // but here we will do in single block of code
    if(
        [fullName, email, userName, password].some((field)=>
            field?.trim()=== "")
    ){
        throw new apiError(400, "all fields are required")
    }

    // const existedUser= User.findOne(email)
    // above code will check for existing user using email field only, if we want to use multiple fields then :
    const existedUser = await User.findOne({
        $or: [{userName}, {email}]
    })
    // ".findOne" return any object present in DB, if its null then user is new 
    if(existedUser){
        throw new apiError(409, "user already exists")
    }

    // to recieve img. we need multer
    // multer has already uploaded images from body to our server and we want its path to upload it on cloudinary
    // here we are unig "?" becuase image or path may not be present
    const avatarLocalPath= req.files?.avatar[0]?.path
    const coverImageLocalPath= req.files?.coverImage[0]?.path
    // let coverImageLocalPath;
    // if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    //     coverImageLocalPath = req.files.coverImage[0].path
    // }

    if(!avatarLocalPath)    throw new apiError(400, "avatar img is required (multer)")

    // below code will upload on cloudinary
    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    // now before entering in DB once again check if avatar is available
    if(!avatar) throw new apiError(400, "avatar img is required (cloud)")

    // finally we are going to save entries in DB
    const user= User.create({
        fullName,
        avatar: avatar.url, // cloudinary will give many fields as response in avatar but v need only url
        coverImage: coverImage.url || "", // coverImage is not neseccary so if there is no cover image then we will save ampty string, this is why we never checked for coverImage
        email,
        password,
        userName: userName.toLowerCase()
    })

    // there can be an error by server so we will check even if user was created
    // while checking we will use "_id" field, but will skip password and refreshtoken
    const userCreated = await User.find(user._id).select(
        "-password -refreshToken"
    ) 
    if(!userCreated){
        throw new apiError(500, "User not Registered")
    }
    return res.status(201).json(
        new apiResponse(200, userCreated, "User registered successfully")
    )
})
// till this point we have successfully registered our new user
// now we want to log in existing user

const generateAccessAndRefreshToken= async(userId)=> {
    try {
        // to generate tokens we need user 
        const user = await User.findById(userId)
        const accessToken= user.generateAccessToken()
        const refreshToken= user.generateRefreshToken()
        // now we have to update current user and DB too
        user.refreshToken= refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}
    } catch (error) {
        throw new apiError(500, "unable to generate tokens")
    }
}

const loginUser = asyncHandler(async (req,res)=>{
    // take data from body
    // email or password present ??
    // find user
    // authenticate
    // access and refresh token
    // send cookie
    
    const {email, password, userName}= req.body
    if(!userName) throw new apiError(400, "username required")
    
    const user= await User.findOne({
        $or: [{userName}, {password}]
    })
    if(!user)   throw new apiError(400, "User not found")
    
    const isPasswordValid= await user.isPasswordCorrect(password)
    if(!isPasswordValid) throw new apiError(401, "wrong password")

    const {accessToken, refreshToken}= await generateAccessAndRefreshToken(user._id)
    
    // our user was updated in DB but object here (user) is not updated 
    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        200,
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "user logged in successfuly"
    )
})

// now we will create logout func.
// to log out we only need to remove refresh token of current user from DB and clear cookies from browser
const logoutUser = asyncHandler(async(req,res)=>{
    // see in route we called auth middleware that will place current user in req
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        }
    )

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged out"))

})

// making an endpoint to generate new access token using saved refresh token
const refreshAccessToken = asyncHandler(async(req,res)=>{

    // first extract refresh token
    const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken)   throw new apiError(400, "unauthorised request")
    
    // we got our refresh token, now check if its valid
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    if(!decodedToken) throw new apiError(400, "refresh token is not valid")
    
    
    // now find user from DB
    const user = await User.findById(decodedToken._id)
    if(!user) throw new apiError(400, "unabe to find user")

    // now check if the refresh token we got & token saved in DB is same or not
    if(!user.refreshToken == incomingRefreshToken) throw new apiError(400, "Refresh token expired")

    // now since everything is fine we will generate new tokens
    const {accessToken, newRefreshToken}= await generateAccessAndRefreshToken(user._id)

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new apiResponse(
            200, 
            {accessToken, refreshToken: newRefreshToken},
            "access token refreshed"
        )
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}