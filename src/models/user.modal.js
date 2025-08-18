import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String,   // cloudinary url
        required: true,
    },
    coverimage: {
        type: String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is Required'],
    },
    refreshToken: {
        type: String,
    },
},
    { timestamps: true }

)

// Mongoose pre-save middleware to hash the user's password before saving it to the database.
// - Runs only if the password field has been modified (e.g., on user creation or password change)
// - Uses bcrypt with a salt round of 10 for secure, one-way hashing
// - Ensures that plain text passwords are never stored in the database

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// Instance method to verify if the provided password matches the user's stored hashed password.
// - Accepts a plain text password as input
// - Uses bcrypt.compare() to securely check the password against the stored hash
// - Returns true if the passwords match, false otherwise

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generatesAccessToken = function () {
    return jwt.sign({
        _id: this.id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generatesRefreshToken = function () {
    return jwt.sign({
        _id: this.id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        })
}

export const User = mongoose.model("User", userSchema)