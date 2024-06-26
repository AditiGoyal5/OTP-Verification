import jwt from "jsonwebtoken";
import express, { Request, Response, NextFunction } from "express";
const secretKey = "secret"
export const createJwtToken = (user: {
    id: number;
    firstName: string;
    lastName: string;
    mobile: String;
    email: string;
    password: string;
    token : String;
    isVerified: Boolean
}) => {
    return jwt.sign(user, secretKey, { expiresIn: "24h" })
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    
    console.log(req.cookies);
    let token = req.cookies.token;
    let decode = jwt.verify(token, secretKey);
    console.log(decode);
    if (decode) {
        req.user = decode;
        return next();
    }
    res.send("token invalid");
}