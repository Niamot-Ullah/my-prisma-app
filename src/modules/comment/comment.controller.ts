import { Request, Response } from "express";
import { commentService } from "./comment.service";


const createComment = async (req: Request, res: Response) => {
  try {
    const user = req.user
    req.body.authorId = user?.id
    const result = await commentService.createComment(req.body);
     res.status(201).json({
      success: true,
      message: "data created",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

const getCommentById = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.commentId
    const result = await commentService.getCommentById(commentId as any);
     res.status(201).json({
      success: true,
      message: "data retrieved",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

const getCommentByAuthorId = async (req: Request, res: Response) => {
  try {
    const authorId = req.params.authorId
    const result = await commentService.getCommentByAuthorId(authorId as any);
     res.status(201).json({
      success: true,
      message: "data retrieved by author id",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

const deleteComment = async (req: Request, res: Response) => {
  try {
    const user = req.user 

    const commentId = req.params.commentId
    const result = await commentService.deleteComment(commentId as string,user?.id as string);
     res.status(201).json({
      success: true,
      message: "Comment deleted",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};






export const commentController = {
  createComment,
  getCommentById,
  getCommentByAuthorId,
  deleteComment
};
