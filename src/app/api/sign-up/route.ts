import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export const POST = async (request: Request) => {
    await dbConnect();

    try {
        const {username, email, password} = await request.json()
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if (existingUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: "Username already taken",
            },
            {
                status: 400
            });
        }

        const existingUserVerifiedByEmail = await UserModel.findOne({
            email,
            isVerified: true
        })

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (existingUserVerifiedByEmail) {
            if (existingUserVerifiedByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "Email already in use",
                },
                {
                    status: 400
                });
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserVerifiedByEmail.password = hashedPassword;
                const expiryDate = new Date();
                expiryDate.setHours(expiryDate.getHours() + 1);
                existingUserVerifiedByEmail.verifyCode = verifyCode;
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: [],
            })

            await newUser.save();
        }

        // send verification email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);

        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message,
            },
            {
                status: 500
            });
        }

        return Response.json({
            success: true,
            message: "User signed up successfully. Please verify your email address to login",
        },
        {
            status: 201
        });
        
    } catch (error) {
        console.error(error);
        return Response.json({
            success: false,
            message: "Error occurred while signing up",
        },
        {
            status: 500
        }    
    );
    }
}