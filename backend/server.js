const express = require("express");

const app = express();

const cors = require("cors");


const bodyParser = require('body-parser')

require("dotenv").config({ path: "./.env" });
const port = process.env.PORT || 443;

app.use(cors());

app.use(express.json());

app.use(bodyParser.urlencoded())

app.use(require("./routes/route"));
 
app.listen(5000, () => {
  console.log(`Server is running on port: ${port}`);
});