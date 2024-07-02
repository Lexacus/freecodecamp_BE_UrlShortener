import dotenv from "dotenv";
import cors from "cors";
import express, { Request, Response, Express } from "express";
import mongoose, { Schema, model } from "mongoose";
import dns from "node:dns";

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI ?? "");

const isValidUrl = (urlString: string) => {
  let url;
  try {
    url = new URL(urlString);
  } catch (e) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
};

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

app
  .post("/api/shorturl", async (req: Request, res: Response) => {
    if (!isValidUrl(req.body.url)) {
      res.json({ error: "invalid url" });
    }
    const urlToFind = await urlInfo
      .find({ url: req.body.url })
      .select({ url: 1, shorturl: 1 });
    if (!urlToFind.length) {
      const docNumber = await urlInfo.countDocuments();
      const newUrl = await urlInfo.create({
        url: req.body.url,
        shorturl: docNumber,
      });
      res.json(newUrl);
    }
    res.json(urlToFind[0]);
  })
  .get("/api/shorturl/:shortUrl", async (req: Request, res: Response) => {
    const urlToFind = await urlInfo.find({ shorturl: req.params.shortUrl });
    if (!urlToFind.length) {
      return res.json({ notFound: "short url not found" });
    }
    const urlToRedirect = urlToFind[0].toObject().url;
    if (!urlToRedirect) {
      return res.json({ notValid: "recovered url is not valid" });
    }
    res.redirect(urlToRedirect);
  });

app.get("/api/reset", async (req: Request, res: Response) => {
  await urlInfo.deleteMany({});
  res.json({ reset: "reset" });
});

app.listen(port, () => {
  console.log("Your app is listening on port " + port);
});
