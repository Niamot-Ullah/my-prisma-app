import { Request, Response } from "express";
import { postService } from "./post.service";
import { prisma } from "../../lib/prisma";
import { postStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";

const getSinglePost = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const result = await postService.getSinglePost(id);

    res.status(200).json({
      success: true,
      message: "data retrieved",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error,
    });
  }
};
const createPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(400).json({
        success: false,
        error: "Unauthorized",
      });
    }

    console.log(req.user);
    const result = await postService.createPost(req.body, req.user.id);
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
const getPosts = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const searchString = typeof search === "string" ? search : undefined;
    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];

    const isFeatured = req.query.isFeatured
      ? req.query.isFeatured === "true"
        ? true
        : req.query.isFeatured === "false"
        ? false
        : undefined
      : undefined;

    const status = req.query.status as postStatus | undefined;

    const {page,limit,skip,sortBy,sortOrder} = paginationSortingHelper(req.query)


    const result = await postService.getPosts({
      search: searchString,
      tags,
      isFeatured,
      status,
      page,
      limit,
      skip,
      sortBy,
      sortOrder
    });
    res.status(200).json({
      success: true,
      message: "data retrieved",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error,
    });
  }
};


export const postController = {
  createPost,
  getPosts,
  getSinglePost,
};
