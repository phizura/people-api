import express from "express";
import router from "./routers/index.js";
import cors from 'cors';

const app = express();
const port = 5551;

app.use(cors())
app.use(express.json());
app.use("/api", router)

app.get("/", (req, res) => {
  res.send("hello world");
});


app.listen(port, () => {
  console.log(`Your app is running on http://localhost:${port}`);
});
