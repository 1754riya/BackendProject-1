import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./db/index.js";
import cookieParser from "cookie-parser";
import {app} from './app.js'
dotenv.config({
    path: './.env'
});
app.use(express.json()); // Parse JSON payload
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads
app.use(cookieParser()); // Enable parsing of cookies
app.use(cors()); // Enable CORS for frontend access




connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at PORT : ${process.env.PORT}`);
    });
})
.catch((error)=>{
    console.log("MONGO db connection failed !!!",error);
})