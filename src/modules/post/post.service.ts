import {
  CommentStatus,
  Post,
  postStatus,
} from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
// import { CommentStatus } from './../../../generated/prisma/enums';



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
      _count: {
        select: { comments: true }
      },
    },
  });

  return postData;
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
    include: {
      _count: {
        select: { comments: true }
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
const getMyPosts = async (authorId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id: authorId,
      status: 'ACTIVE'
    }
  })

  const result = await prisma.post.findMany({
    where: {
      authorId
    },
    orderBy: {
      "createdAt": 'desc'
    },
    include: {
      _count: {
        select: {
          comments: true
        }
      }
    }
  })
  const totalPosts = await prisma.post.count({
    where: {
      authorId
    }
  })

  return { result, totalPosts }
}

const updatePost = async (postId: string, authorId: string, data: Partial<Post>, isAdmin: boolean) => {
  const postData = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId
    },
    select: {
      id: true,
      authorId: true
    }
  })
  if (!isAdmin && (postData.authorId !== authorId)) throw new Error("Your are not owner of this post")

  if (!isAdmin) delete data.isFeatured


  const result = await prisma.post.update({
    where: {
      id: postData.id
    },
    data
  })
  return result
}

const deletePost = async (postId: string, authorId: string, isAdmin: boolean) => {
  const postData = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId
    },
    select: {
      id: true,
      authorId: true
    }
  })
  if (!isAdmin && (postData.authorId !== authorId)) throw new Error("Your are not owner of this post")
  const result = await prisma.post.delete({
    where: {
      id: postData.id
    }
  })
  return result
}

const getStats = async () => {
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    archivedPosts,
    totalComments,
    approvedComment,
    totalUsers,
    adminCount,
    userCount,
    totalViews
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: postStatus.PUBLISHED } }),
    prisma.post.count({ where: { status: postStatus.DRAFT } }),
    prisma.post.count({ where: { status: postStatus.ARCHIVED } }),
    prisma.comment.count(),
    prisma.comment.count({ where: { status: CommentStatus.APPROVED } }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.post.aggregate({ _sum: { views: true } }),
  ]);

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    archivedPosts,
    totalComments,
    approvedComment,
    totalUsers,
    adminCount,
    userCount,
    totalViews: totalViews._sum.views ?? 0,
  };
};




export const postService = {
  createPost,
  getPosts,
  getSinglePost,
  getMyPosts,
  updatePost,
  deletePost,
  getStats
};
