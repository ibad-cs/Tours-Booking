const axios = require('axios');
import { showAlert } from './alerts';
export const signup = async (n, email, password, passwordConfirm) => {
  try {
    console.log('In signup');
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data: {
        name: n,
        email,
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Signed Up Successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', 'Something went wrong. Please Try Again Later');
  }
};
