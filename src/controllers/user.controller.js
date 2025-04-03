import { asyncHandler } from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const generateAccessAndRefreshTokens = async(userId)=>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}



    }
    catch(error){
        throw new ApiError(500,"something went wrong while generating refresh and access token ")

    }
}
const registerUser = asyncHandler( async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res


  const {fullName, email, username, password } = req.body;
  //console.log("email: ", email);
  console.log("Password received:", password);

  if (
      [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
      throw new ApiError(400, "All fields are required")
  }

  const existedUser = await User.findOne({
      $or: [{ username }, { email }]
  })

  if (existedUser) {
      throw new ApiError(409, "User with email or username already exists")
  }
  console.log(req.files);
  console.log(req.body);
  console.log("Password:", req.body.password);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path;
  }
  console.log("Avatar Path:", avatarLocalPath);
  console.log("Cover Image Path:", coverImageLocalPath);
  

  if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log("Avatar Upload Result:", avatar);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log("Cover Image Upload Result:", coverImage);

  if (!avatar) {
      throw new ApiError(400, "Avatar file is required")
  }
 

  const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email, 
      password,
      username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
  )

  if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered Successfully")
  )

} )

console.log('Is registerUser defined in controller:', typeof registerUser);

const loginUser = asyncHandler(async(req,res)=>{
// req body ->data
// username or email
// find the user
// password check
// access and refresh token
// send cookies 
const {email,username,password} =  req.body;
console.log("Received Login Request:", req.body);
if(!username && !email){
    throw new ApiError (400,"username or email is required")
}
const user = await User.findOne({
    $or:[{username},{email}]
})
if(!user){
    throw new ApiError(404,"user does not exist")
}
const isPasswordValid= user.isPasswordCorrect (password)
if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    console.log("User Found:", loggedInUser);
    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);

    const options = {
        httpOnly: true,
        secure: false
        
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})


const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})


  


export { registerUser,loginUser,logoutUser }; 
 