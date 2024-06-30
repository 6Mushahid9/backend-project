// this file will create a asynt await wrapper func. utility and export it. We can achive this by two ways: 1) using try catch and 2) using promises
const asyncHandler = (fn)=>async(req,res,next) =>{
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}

// const asyncHandler = (fn)=>{
//     return (req,res,next)=>{
//         Promise.resolve(fn(req,res,next)).catch((err)=> next(err))
//     }
// }

export {asyncHandler}