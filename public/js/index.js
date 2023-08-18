import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './book';
import { signup } from './signup';

const mapbox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logoutElement = document.querySelector('.nav__el--logout');
const updateElement = document.querySelector('.form-user-data');
const userPassForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
if (updateElement) {
  updateElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);

    updateSettings(form, 'data');
  });
}
if (mapbox) {
  const locations = JSON.parse(mapbox.dataset.locations);
  displayMap(locations);
}
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutElement) logoutElement.addEventListener('click', logout);
if (userPassForm) {
  userPassForm.addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const password = document.getElementById('password-current').value;
    const newpass = document.getElementById('password').value;
    const newpassconfirm = document.getElementById('password-confirm').value;
    updateSettings({ password, newpass, newpassconfirm }, 'password');
    document.querySelector('.btn--save-password').textContent = 'Save password';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}

if (signupForm) {
  console.log('here');
  signupForm.addEventListener('submit', (e) => {
    console.log('In signupForm');
    e.preventDefault();
    const n = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('confpassword').value;

    signup(n, email, password, passwordConfirm);
  });
}
