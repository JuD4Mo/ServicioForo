import express from "express";
import 'dotenv/config';
import cors from 'cors'
import foroRouter from "./routers/foroRouter.js"

const app = express();

app.use(express.json());
app.use(cors({
      origin: "https://www.devcorebits.com"
}))
app.use(express.urlencoded({ extended: true }));

app.use("/health", (req, res) => res.send("OK"));
app.use("/foro", foroRouter);

const PORT = 3010;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
