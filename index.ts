import dotenv from "dotenv";
import cors from "cors";
import express, { Request, Response, Express } from "express";

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 3000;

// enable CORS so app is testable by FreeCodeCamp

app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

app.use(express.static("public"));

app.get("/", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/:name", (req: Request, res: Response) => {
  res.json({ insulto: `sei ${req.params.name}` });
});

app.listen(port, () => {
  console.log("Your app is listening on port " + port);
});
