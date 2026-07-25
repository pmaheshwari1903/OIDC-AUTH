import * as authServices from "./auth.services.js"
import { Request, Response } from 'express'

const showSignInPage = async (req: Request, res: Response) => {

}

const signIn = async (req: Request, res: Response) => {
    try {
        const { accessToken, user } = await authServices.signIn(req.body)

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
        })

        return res.status(200).json({
            message: "Login Successfull",
            user
        })
    } catch (error) {
        return res.status(400).json({
            message: error instanceof Error ? error.message : "Something went wrong",
        });
    }
}

const showSignUpPage = async (req: Request, res: Response) => {

}

const signUp = async (req: Request, res: Response) => {
    try {
        const { user } = await authServices.signUp(req.body);

        return res.status(201).json({
            message: "Sign up successful. Please verify your email.",
            user
        })
    } catch (error) {
        return res.status(400).json({
            message: error instanceof Error ? error.message : "Something went wrong"
        });
    }
}

const logout = async (req: Request, res: Response) => {
    res.clearCookie("accessToken");

    return res.status(200).json({
        message: "Logged out successfully",
    });
}


const verifyEmail = async (req: Request, res: Response) => {
    try {
        const token = req.query.token as string;
        await authServices.verifyEmail(token);
        return res.status(200).send(`
            <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                <h1 style="color: #10b981;">Email Verified! ✅</h1>
                <p>Your email has been successfully verified. You can now log into your account.</p>
            </div>
        `);
    } catch (error) {
        return res.status(400).send(`
            <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                <h1 style="color: #ef4444;">Verification Failed ❌</h1>
                <p>${error instanceof Error ? error.message : "Invalid token"}</p>
            </div>
        `);
    }
}

export {
    showSignInPage,
    signIn,
    showSignUpPage,
    signUp,
    logout,
    verifyEmail
}

