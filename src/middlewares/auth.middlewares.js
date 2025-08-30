import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynicHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.modal.js";

export const verifyJWT = asyncHandler(async(req,res,next ) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodetoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodetoken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})