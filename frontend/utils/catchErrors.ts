import { AxiosError } from 'axios';
import { ServerError } from './types';

const catchErrors = (error: AxiosError) => {
  let errorMsg = '';

  if (error.response) {
    // If the request was made and the server not responded with a status code in the range of 2xx

    const { message } = error.response.data as ServerError;
    errorMsg = message;

    console.error(errorMsg);
  } else if (error.request) {
    // if the request was made and no response was recevied from server
    errorMsg = error.request;

    console.error(errorMsg);
  } else {
    // if something else happened while making the request
    errorMsg = error.message;

    console.error(errorMsg);
  }
  return errorMsg;
};

export default catchErrors;
