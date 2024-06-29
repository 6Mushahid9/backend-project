// we want to standerise the way our errors are shown in our application therefore we will override Error class provided by javascript

class apiError extends Error{
    constructor(
        statusCode,
        message= "Something went boom !!!!",
        error= [],
        stack= ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null,
        this.message= message
        this.success = false,
        this.error = error

        if(stack){
            this.stack =stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}
export {apiError}