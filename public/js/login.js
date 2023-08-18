const axios = require('axios');
import { showAlert } from './alerts';
export const login = async (email, password) => {
  try {
    console.log('here');
    console.log(email, password);
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in Successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    console.log('in error');
    // console.log(err);
    showAlert('error', 'Incorrect Email or Password');
  }
};
export const logout = async () => {
  try {
    console.log('reached');
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });
    if ((res.data.status = 'success')) {
      console.log('s');
      location.assign('/login');
    }
  } catch (err) {
    showAlert('error', 'Error logging out ! Please try again in a while');
  }
};
