class AppError extends Error{
    constructor(message,statuscode){
        super(message);
        this.statuscode=statuscode;
        this.status= `${statuscode}`.startsWith('4')?'fail':'error';
        console.log(this.statuscode);
        this.isOperational=true;
        Error.captureStackTrace(this,this.constructor);
    }
}
module.exports= AppError;