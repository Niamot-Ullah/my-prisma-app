import {
  CommentStatus,
  Post,
  postStatus,
} from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const getSinglePost = async (id: string) => {
  // increment views (fire and forget)
  await prisma.post.update({
    where: { id },
    data: {
      views: { increment: 1 },
    },
  });

  // fetch post data
  const postData = await prisma.post.findUnique({
    where: { id },
    include: {
      comments: {
        where: {
          parentId: null,
          status: CommentStatus.APPROVED,
        },
        orderBy: { createdAt: "desc" },
        include: {
          replies: {
            where: {
              status: CommentStatus.APPROVED,
            },
            orderBy: { createdAt: "asc" },
            include: {
              replies: true,
            },
          },
        },
      },
      _count:{
        select:{comments:true}
      },
    },
  });

  return postData;
};

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">,
  userId: string
) => {
  const result = await prisma.post.create({
    data: {
      ...data,
      authorId: userId,
    },
  });
  return result;
};

const getPosts = async (payload: {
  search: string | undefined;
  tags: string[] | [];
  isFeatured: boolean | undefined;
  status: postStatus | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const { isFeatured, status, page, limit, skip, sortBy, sortOrder } = payload;
  //pagination formula => skip = (page-1) * limit

  const andConditions: PostWhereInput[] = [];
  if (payload.search) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: payload.search as string,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: payload.search as string,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: payload.search as string,
          },
        },
      ],
    });
  }
  if (payload.tags.length > 0) {
    andConditions.push({
      tags: {
        hasEvery: payload.tags,
      },
    });
  }
  if (typeof isFeatured === "boolean") {
    andConditions.push({
      isFeatured,
    });
  }
  if (status) {
    andConditions.push({
      status,
    });
  }

  const result = await prisma.post.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    include:{
      _count:{
        select:{comments:true}
      }
    }
  });
  const total = await prisma.post.count({
    where: {
      AND: andConditions,
    },
  });
  return {
    data: result,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// const getSinglePost = async (id: string) => {
//   return await prisma.$transaction(async (tx) => {
//     await tx.post.update({
//       where: { id },
//       data: {
//         views: { increment: 1 },
//       },
//     });

//     const postData = await tx.post.findUnique({
//       where: { id },
//       include: {
//         comments: {
//           where: {
//             parentId: null,
//           },
//           include: {
//             replies: {
//               include: {
//                 replies: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     return postData;
//   });
// };

export const postService = {
  createPost,
  getPosts,
  getSinglePost,
};
