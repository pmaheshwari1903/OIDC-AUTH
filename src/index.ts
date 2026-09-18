import 'dotenv/config';
import express from 'express'
import path from "node:path"
import authRoute from "./modules/auth/auth.routes.js"
import clientRoute from "./modules/clients/clients.routes.js"
import oidcRoute from "./modules/oidc/oidc.routes.js"
import consentsRoute from "./modules/consents/consents.routes.js"
import dataAccessRoute from "./modules/data-access/data-access.routes.js"
import adminRoute from "./modules/admin/admin.routes.js"
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

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.resolve('public/forgot-password.html'));
});

app.get('/api/auth/reset-password', (req, res) => {
  res.sendFile(path.resolve('public/reset-password.html'));
});

app.get('/consent', (req, res) => {
  res.sendFile(path.resolve('public/consent.html'));
});

app.get('/data-access', (req, res) => {
  res.sendFile(path.resolve('public/data-access.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.resolve('public/admin.html'));
});

app.use('/api/auth', authRoute)
app.use('/api', clientRoute)
app.use('/', clientRoute)
app.use('/api', consentsRoute)
app.use('/api', dataAccessRoute)
app.use('/api', adminRoute)
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
