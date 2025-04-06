import { Router } from 'express';
import { loginUser,logoutUser,registerUser } from '../controllers/user.controller.js'; 
import { upload } from '../middlewares/multer.middleware.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from '../controllers/user.controller.js';


const router = Router();
console.log('Is registerUser defined in routes:', typeof registerUser);

router.route('/register').post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser);
    router.post("/upload-test", upload.single("avatar"), async (req, res) => {
        try {
            const filePath = req.file?.path;
            console.log("File Path:", filePath);
    
            const result = await uploadOnCloudinary(filePath);
            if (!result) {
                return res.status(500).json({ message: "Cloudinary upload failed" });
            }
    
            return res.status(200).json({ url: result.url });
        } catch (error) {
            console.error("Error in upload-test:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

    router.route("/login").post(loginUser);
    router.route("/logout").post(verifyJWT,  logoutUser);
    router.route("/refresh-token").post(refreshAccessToken)
export default router;
