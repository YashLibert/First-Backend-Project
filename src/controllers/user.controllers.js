import { asyncHandler } from "../utils/asynicHandler.js";
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.modal.js"
import {uploadOnCloudinary} from "../utils/Cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
const registerUser = asyncHandler( async (req, res) => {
    
    const {fullName, email, username, password} = req.body
    console.log("email: ",email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "Full Name is Required !!! ")
    }

    const existinguser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existinguser) {
        throw new ApiError(409, "User With Username and Email Already Exist !!!")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath =  req.files?.coverimage[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is Required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverimage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar is Required")
    }

    const user =  await User.create({
        fullName,
        avatar: avatar.url,
        coverimage: coverimage.url || "",
        email,
        password,
        username: username.toLoweCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registration")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

export {registerUser}



