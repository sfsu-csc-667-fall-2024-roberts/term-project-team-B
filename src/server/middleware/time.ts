import { NextFunction, Request, Response } from "express";

const timeMiddleware = (
    request: Request, 
    resopnse: Response,
    next: NextFunction
) => {
    console.log(`Time: ${new Date()}`);
    next();
};

export {timeMiddleware};