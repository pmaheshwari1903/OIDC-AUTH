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
        const { accessToken, user } = await authServices.signUp(req.body);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
        })

        return res.status(201).json({
            message: "Sign Up Successfull",
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


export {
    showSignInPage,
    signIn,
    showSignUpPage,
    signUp,
    logout
}

