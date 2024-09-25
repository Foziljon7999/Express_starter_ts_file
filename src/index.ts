import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import passport from "./config/passport";
import session from "express-session";
import router from "./routes";
import path from "path";

dotenv.config();

const app: Application = express();

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src", "views"));

app.use(session({
    secret: process.env.SESSION_SECRET || "alone",
    resave: false,
    saveUninitialized: false,
})
);

app.use(passport.initialize());
app.use(passport.session());

app.use(router);

app.get("/login", (req: Request, res: Response) => {
    res.render("login");
});

app.get("/auth/google/login",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        accessType: "offline",
        prompt: "consent",
    })
);

app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req: Request, res: Response) => {
        let user = req.user as any;
        res.send(`Hello, ${user.firstName}`);
    }
);

const PORT = process.env.APP_PORT || 8000;
app.listen(PORT, () => {
    console.log(`The server is running ${PORT}`);
});
