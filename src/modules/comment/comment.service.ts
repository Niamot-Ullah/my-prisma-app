import { CommentStatus } from "../../../generated/prisma/enums";
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


const deleteComment = async (commentId: string, authorId: string) => {
    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId
        },
        select: {
            id: true
        }
    });
    if (!commentData) {
        throw new Error("Your data is not found")
    }
    return await prisma.comment.delete({
        where: {
            id: commentData.id,
        },
    });
};

const updateComment = async (commentId: string, authorId: string, data: { content?: string, status?: CommentStatus }) => {

    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId
        },
        select: {
            id: true
        }
    });
    if (!commentData) {
        throw new Error("Your data is not found")
    }
    return await prisma.comment.update({
        where: {
            id: commentId
        },
        data
    })


}

const moderateComment = async (id: string, status: CommentStatus) => {
    // if exists , it contains data in commentData but if not , it will throw an error
    const commentData = await prisma.comment.findUniqueOrThrow({
        where: {
            id
        }
    })
    if(commentData && commentData?.status === status){
        return 'Status already up to date'
    }
    const result = await prisma.comment.update({
        where: {
            id
        },
        data: {
            status
        },
    })
    return result
}

export const commentService = {
    createComment,
    getCommentById,
    getCommentByAuthorId,
    deleteComment,
    updateComment,
    moderateComment,
};
