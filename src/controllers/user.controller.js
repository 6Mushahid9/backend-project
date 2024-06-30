import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"

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
    const userCreated = await User.findById(user._id).select(
        "-password  -refreshToken"
    ) 
    if(!userCreated)    throw new apiError(500, "User not Registered")

    return res.status(201).json(
        new apiResponse(200, userCreated, "User registered successfully")
    )
})

export {registerUser}