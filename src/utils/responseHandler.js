// Function to create successful responses
export const successResponse = (res, data, message = 'Operation successful', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  };
  
  // Function to create error responses
  export const errorResponse = (res, message = 'Operation failed', statusCode = 400, error = null) => {
    const response = {
      success: false,
      message
    };
    
    if (error) {
      response.error = process.env.NODE_ENV === 'development' ? error.toString() : 'An error occurred';
    }
    
    return res.status(statusCode).json(response);
  };