require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});
const { Duffel } = require("@duffel/api");

const duffel = new Duffel({
  token: process.env.TOKEN,
});

module.exports = duffel;
