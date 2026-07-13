import * as oidcServices from "./oidc.services.js"

import {Request, Response} from 'express'

const serviceDiscovery = async(req : Request, res : Response) => {
    try {
        const discovery = await oidcServices.serviceDiscovery();
        return res.status(200).json(discovery)
    } catch (error) {
        console.error(error);
    }
}

const jwks = async(req : Request, res: Response) => {
    try {
        const jwks = await oidcServices.jwks();
        
        return res.status(200).json(jwks)
    } catch (error) {
        console.error(error);
    }
}

const authorize = async(req: Request, res: Response) => {
    try {
        const {shortCode, redirectUri: redirectUriFromService, state} = await oidcServices.authorize({
            client_id: req.query.client_id as string,
            redirect_uri: req.query.redirect_uri as string,
            response_type: req.query.response_type as string,
            scope: req.query.scope as string,
            state: req.query.state as string | undefined,
            userId: req.user.id,
        });

        const redirectUri = state
            ? `${redirectUriFromService}?code=${shortCode}&state=${state}`
            : `${redirectUriFromService}?code=${shortCode}`
        
        return res.redirect(redirectUriFromService)
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Something went wrong",
        });
    }
}

const token = async(req: Request, res: Response) => {
    try {
        const tokens = await oidcServices.token(req.body)
        
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Pragma", "no-cache");

        return res.status(200).json(tokens);
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Something went wrong",
        });
    }
}

const userInfo = async(req: Request, res: Response) => {
    try {
        const authorization = req.headers.authorization;
        
        if(!authorization){
            return res.status(401).json({
                message: "Authorization header is required",
            });
        }

        const accessToken = authorization.split(" ")[1]

        const user = await oidcServices.userInfo(accessToken);

        return res.status(200).json(user)
    } catch (error) {
        return res.status(401).json({
            message : error instanceof Error ? error.message : "Something went wrong"
        })
    }
}

export {
    serviceDiscovery,
    jwks,
    authorize,
    token,
    userInfo
}