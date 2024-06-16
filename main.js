import express from "express";
import router from "./routes/contact.routes.js";
import authRoute from "./routes/auth.routes.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5551;

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,POST',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true
}

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api", router);
app.use("/api/auth", authRoute);

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});
