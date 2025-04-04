import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req,res,next)=>{
   try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "");
    //  console.log('token is here', token);
    if(!token){
     throw new ApiError(401,"Unauthorized request")
    }
     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

     const user = await User.findById(decodedToken?.id).select("-password -refreshToken");
    //  console.log('user object is ', user);
     if(!user){
         throw new ApiError (401, "Invalid Access Token")
     }

     req.user = user;
     next()
   } catch (error) {
    throw new ApiError(401,error?.message || "Invalid access token")

   }




})