import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import { request } from "http";
import mongoose from "mongoose";

export const GET = async (request: Request) => {
    await dbConnect()
    const session = await getServerSession(authOptions)
    const user = session?.user as User
    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Unauthorized",
        },
        {status: 401})
    }

    const userId = new mongoose.Types.ObjectId(user._id)
    try {
        const user = await UserModel.aggregate([
            { $match: {id: userId} },
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } }
        ])

        if (!user || user.length === 0) {
            return Response.json({
                success: false,
                message: "User not found",
            },
            {status: 404})
        }
        return Response.json({
            success: true,
            message: user[0].messages,
        },
        {status: 200})
    } catch (error) {
        console.log("An unexpected error occurred:", error)
        return Response.json({
            success: false,
            message: "Internal server error",
        },
        {status: 500})
    }
}