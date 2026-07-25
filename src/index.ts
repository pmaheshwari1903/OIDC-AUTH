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
app.use(express.static("public"));
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
  res.sendFile(path.resolve('public/sign-in.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.resolve('public/register.html'));
});

app.use('/api/auth', authRoute)
app.use('/api', clientRoute)
app.use('/', oidcRoute)

app.use((req, res) => {
  res.status(404).sendFile(path.resolve('public/404.html'));
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`AuthServer is running on PORT ${PORT}`);
  });
}

export default app;
