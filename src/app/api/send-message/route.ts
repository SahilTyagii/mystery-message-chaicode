import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";
import { create } from "domain";

export const POST = async (request: Request) => {
    await dbConnect()
    const {username, content} = await request.json()
    try {
        const user = await UserModel.findOne({username})
        if (!user) {
            return Response.json({
                success: false,
                message: "User not found",
            },
            {status: 404})
        }
        // is user accepting messages
        if (!user.isAcceptingMessage) {
            return Response.json({
                success: false,
                message: "User is not accepting messages",
            },
            {status: 403})
        }
        const newMessage = {content, createdAt: new Date()}
        user.message.push(newMessage as Message)
        await user.save()
        return Response.json({
            success: true,
            message: "Message sent successfully",
        },
        {status: 200})
    } catch (error) {
        console.log("Error adding messages:", error)
        return Response.json({
            success: false,
            message: "Internal server error",
        },
        {status: 500})
    }
}