import express from "express";
import 'dotenv/config';
import cors from 'cors'
import foroRouter from "./routers/foroRouter.js"

const app = express();

app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: true }));


app.use("/foro", foroRouter);

const PORT = 3010;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
