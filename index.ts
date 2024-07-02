import dotenv from "dotenv";
import cors from "cors";
import express, { Request, Response, Express } from "express";
import mongoose, { Schema, model } from "mongoose";

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI ?? "");

const urlSchema = new Schema({
  url: {
    type: String,
  },
  shorturl: {
    type: Number,
  },
});

let urlInfo = model("urlInfo", urlSchema);

let counter = 0;

// enable CORS so app is testable by FreeCodeCamp

app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

app.use(express.static("public"));

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/shorturl", async (req: Request, res: Response) => {
  if (!req.body.url) {
    res.json({ error: "Errore" });
    return;
  }
  const urlToFind = await urlInfo.find({ url: req.body.url });
  if (!urlToFind.length) {
    const docNumber = await urlInfo.countDocuments();
    const newUrl = await urlInfo.create({
      url: req.body.url,
      shorturl: docNumber,
    });
    res.json(newUrl);
  }
  res.json(urlToFind[0]);
});

app.get("/api/reset", async (req: Request, res: Response) => {
  await urlInfo.deleteMany({});
  res.json({ reset: "reset" });
});

app.listen(port, () => {
  console.log("Your app is listening on port " + port);
});
