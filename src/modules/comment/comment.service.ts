import { prisma } from "../../lib/prisma";
import { Request } from "express";

const createComment = async (payload: {
    content: string;
    authorId: string;
    postId: string;
    parentId?: string;
}) => {
    await prisma.post.findUniqueOrThrow({
        where: {
            id: payload.postId,
        },
    });
    if (payload.parentId) {
        await prisma.comment.findUniqueOrThrow({
            where: {
                id: payload.parentId,
            },
        });
    }

    const result = await prisma.comment.create({
        data: payload,
    });
    return result;
};
const getCommentById = async (commentId: string) => {
    const result = await prisma.comment.findUnique({
        where: {
            id: commentId,
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true,
                    views: true,
                },
            },
        },
    });
    return result;
};
const getCommentByAuthorId = async (authorId: string) => {
    const result = await prisma.comment.findMany({
        where: {
            authorId,
        },
        orderBy: { createdAt: "desc" },
        include: {
            post: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
    });
    return result;
};


const deleteComment = async (commentId: string,authorId:string) => {
    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId
        },
        select:{
            id:true
        }
    });
    if(!commentData){
        throw new Error("Your data is not found")
    }
    return await prisma.comment.delete({
        where: {
            id: commentData.id,
        },
    });
};


export const commentService = {
    createComment,
    getCommentById,
    getCommentByAuthorId,
    deleteComment,
};
