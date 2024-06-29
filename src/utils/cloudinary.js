import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// utility func. to upload file from destination
const uploadOnCloudinary= async(localFilePath)=>{
    try {
        if(!localFilePath)  return null
        // upload when location found
        const response =await cloudinary.uploader.upload(localFilePath, { resource_type: "auto"})  
        // resource type is given for easy saving and later easy retrival 
        console.log("file is uploaded successfully", response.url)
        return response
    } catch (error) {
        // if ther comes a problem and file is not uloaded then we want to remove it from our server as well
        fs.unlinkSync(localFilePath)
        return null
    }
}

export {uploadOnCloudinary}

// this method was given by cloudiary

// const uploadResult = await cloudinary.uploader
//        .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                public_id: 'shoes',
//            }
//        )
//        .catch((error) => {
//            console.log(error);
//        });
    
//     console.log(uploadResult);