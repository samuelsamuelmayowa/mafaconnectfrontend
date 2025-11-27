// src/lib/api.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_HOME_OO;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token dynamically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiGet = (url) => api.get(url);
export const apiPost = (url, data) => api.post(url, data);
export const apiPut = (url, data) => api.put(url, data);
export const apiDelete = (url) => api.delete(url);



// // src/lib/api.js
// import axios from "axios";

// // 🧠 Base URL of your Node.js backend
// const API_BASE_URL = import.meta.env.VITE_HOME_OO

//  const token = localStorage.getItem("ACCESS_TOKEN");
// // "https://mafaconnectbackendapi.onrender.com/api/v1"
// // import.meta.env.VITE_HOME_OO

// // Axios instance
// export const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//      Authorization: `Bearer ${token}` ,
//   },
// });

// // GET request
// export const apiGet = async (url) => {
//   const response = await api.get(url, {
//      headers: {
//     "Content-Type": "application/json",
//      Authorization: `Bearer ${token}` ,
//   },
//   });
//   return response;
// };

// // POST request
// export const apiPost = async (url, data) => {
//   const response = await api.post(url, data);
//   return response;
// };

// // PUT request
// export const apiPut = async (url, data) => {
//   const response = await api.put(url, data);
//   return response;
// };

// // DELETE request
// export const apiDelete = async (url) => {
//   const response = await api.delete(url);
//   return response;
// };
