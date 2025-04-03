// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBh1TDYup49EXnsEbyxig_rUeK1CVtTQq4",
    authDomain: "task-tracer-535b9.firebaseapp.com",
    databaseURL: "https://task-tracer-535b9-default-rtdb.firebaseio.com", // This is missing in your config
    projectId: "task-tracer-535b9",
    storageBucket: "task-tracer-535b9.appspot.com", // This looks slightly different in your config
    messagingSenderId: "415478877546",
    appId: "1:415478877546:web:5f2976371c8f8cecb26913"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Get a reference to the database service
  const database = firebase.database();