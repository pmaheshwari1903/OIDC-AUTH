import 'dotenv/config';
import express from 'express'
import path from "node:path"
import authRoute from "./modules/auth/auth.routes.js"
import clientRoute from "./modules/clients/clients.routes.js"
import oidcRoute from "./modules/oidc/oidc.routes.js"
import cookieParser from "cookie-parser";

const app = express()
const PORT = process.env.PORT

app.use(express.json());
app.use(express.static("src/public"));
app.use(cookieParser());


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

app.get('/home', (req, res) => {
  res.sendFile(path.resolve('src/public/sign-in.html'));
});

app.use('/api/auth', authRoute)
app.use('/api', clientRoute)
app.use('/', oidcRoute)

app.use((req, res) => {
  res.status(404).sendFile(path.resolve('src/public/404.html'));
});

app.listen(PORT, () => {
  console.log(`AuthServer is running on PORT ${PORT}`);
});
