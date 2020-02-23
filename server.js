//console.log(`Your port is ${process.env.PORT}`); // undefined
//const dotenv = require('dotenv');
//dotenv.config();
//console.log(`Your port is ${process.env.PORT}`); // now defined


// after making a config file this will work
const { port } = require('./config');
console.log(`Your port is ${port}`);