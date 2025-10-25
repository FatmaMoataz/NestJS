import { NextFunction, Request, Response } from "express";

export const setDefaultLang = (req: Request, res: Response, next:NextFunction) => {
    req.headers['accept-language'] = req.headers['accept-language'] ?? 'EN'
next()
}