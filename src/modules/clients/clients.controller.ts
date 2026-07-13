import * as clientServices from "./clients.services.js"
import ApiError from "../../common/utils/api-error.js"
import ApiResponse from "../../common/utils/api-response.js"
import { Request, Response } from 'express'

const createClient = async (req: Request, res: Response) => {
    try {
        const client = await clientServices.createClient(req.body)
        return res.status(201).json({
            message: "Client Created Successfully!",
            client
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Something went wrong" })
    }
}

const getClients = async (req: Request, res: Response) => {
    try {
        const clients = await clientServices.getClients()
        if (!clients.length) {
            return res.status(404).json({
                message: "Client Not Found"
            })
        }
        return res.status(200).json(clients)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Something went wrong" })
    }
}

const getClientById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const client = await clientServices.getClientById(id, {});
        return res.status(200).json(client);
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Something went wrong" })
    }
}

const updateClient = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const client = await clientServices.updateClient(id, req.body);
        if (!client) {
            return res.status(404).json({ message: "Client Not Found" })
        }
        return res.status(200).json(client);
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Something went wrong" })
    }
}

const deleteClient = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string
        const deletedClient = await clientServices.deleteClient(id)
        return res.status(200).json({
            message: "Client Deleted Successfully!",
            client: deletedClient
        });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Something went wrong" })
    }
}


export {
    createClient,
    getClients,
    getClientById,
    updateClient,
    deleteClient
}