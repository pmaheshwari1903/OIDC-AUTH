import express from 'express'
import path from "node:path"
import authRoute from "./modules/auth/auth.routes.js"
import cookieParser from "cookie-parser";

const app = express()
const PORT = process.env.PORT

app.use(express.json());
app.use(express.static(path.resolve("public")))
app.use(cookieParser());

app.use(express.static("src/public"));


app.get("/", (req, res) => {
    res.json({
        message: "Hello from Auth Server"
    })
})

app.get("/health", (req, res) => {
    res.json({
        message: "Server is Healthy",
        healthy: true
    })
})

app.use('/api/auth', authRoute)

app.listen(PORT, () => {
  console.log(`AuthServer is running on PORT ${PORT}`);
});
