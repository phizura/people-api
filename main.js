import express from "express";
import router from "./routers.js";
import cors from "cors";
import authorize from "./services.js";

const app = express();
const port = 5551;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  authorize().then(next()).catch(console.error);
});
app.use("/api", router);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log(`Your app is running on http://localhost:${port}`);
});
