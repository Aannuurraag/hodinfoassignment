const dotenv=require("dotenv")
 dotenv.config()

const express = require("express");
const app = express();
const axios = require("axios");
const mongoose = require("mongoose");
const path = require("path")


const PORT = 3000;

// MongoDB connection configuration
main()
  .then(() => {
    console.log("connected");
  })
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.DB_URL);
}

// Define MongoDB schema
const DataSchema = new mongoose.Schema({
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  volume: Number,
  base_unit: String,
});

// Define MongoDB model
const Data = mongoose.model('Data', DataSchema);

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "/public")))

// Middleware for parsing JSON data
app.use(express.json());

// Fetch data from WazirX API and store in MongoDB
app.get('/fetchAndStoreData', async (req, res) => {
  try {
    const response = await axios.get(process.env.API);
    const Fetchdata = response.data;

    // Clear existing data
    await Data.deleteMany({});

    //Store data in mongoose
    Object.entries(Fetchdata).forEach(([key, value]) => {
      const { name, last, buy, sell, volume, base_unit } = value;
      Data.create({
        name,
        last,
        buy,
        sell,
        volume,
        base_unit
      })
    });

    res.json({ message: 'Data fetched and stored successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Route to get stored data from MongoDB
app.get('/getData', async (req, res) => {
  try {
    const storedData = await Data.find().limit(10);
    const datas = storedData
    res.render("index", { datas })

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/", async (req, res) => {
  res.send("root")
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
