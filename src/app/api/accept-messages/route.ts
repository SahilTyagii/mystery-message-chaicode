import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export const POST = async (request: Request) => {
    await dbConnect()
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Unauthorized",
        },
        {status: 401})
    }

    const userId = user._id
    const { acceptMessages } = await request.json()
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessage: acceptMessages },
            { new: true }
        )
        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "User not found",
            },
            {status: 401})
        }
        return Response.json({
            success: true,
            message: "User status updated successfully",
            user: updatedUser,
        },
        {status: 200})
    } catch (error) {
        console.log("Failed to update user status to accept messages: ", error)
        return Response.json({
            success: false,
            message: "Failed to update user status to accept messages",
        },
        {status: 500})
    }
}

export const GET = async (request: Request) => {
    await dbConnect()
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User
    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Unauthorized",
        },
        {status: 401})
    }
    const userId = user._id
    try {
        const foundUser = await UserModel.findById(userId)
        if (!foundUser) {
            return Response.json({
                success: false,
                message: "User not found",
            },
            {status: 404})
        }
        return Response.json({
            success: true,
            isAcceptingMessage: foundUser.isAcceptingMessage,
            message: "User found",
            user: foundUser,
        },
        {status: 200})
    } catch (error) {
        console.log("Failed to get user status to accept messages: ", error)
        return Response.json({
            success: false,
            message: "Failed to get user status to accept messages",
        },
        {status: 500})
    }
}