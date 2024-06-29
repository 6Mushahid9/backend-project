// we want to standerise the way our responces are shown in our application
class apiResponce{
    constructor(statusCode, data, message= "Success"){
        this.statusCode = statusCode
        this.data= data
        this.message= message
        this.status= statusCode < 400
    }
}
export {apiResponce}