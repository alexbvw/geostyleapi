class Response {
    timeStamp: string;
    statusCode: any;
    httpStatus: any;
    message: any;
    data: any;
    constructor(
      statusCode: any, 
      httpStatus: any, 
      message: any, 
      data: any
      ){
      this.timeStamp = Date().toLocaleString();
      this.statusCode = statusCode;
      this.httpStatus = httpStatus;
      this.message = message;
      this.data = data;
    }
  }
  
  export default Response;