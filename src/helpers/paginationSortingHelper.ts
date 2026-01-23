type IOption = {
  page?: number | string;
  limit?: number | string;
  sortOrder?: string;
  sortBy?: string;
};
type iOptionResult = {
  page?: number;
  limit?: number;
  skip?: number;
  sortBy: string;
  sortOrder: string;
};



const paginationSortingHelper = (options: IOption): iOptionResult => {
  const result: iOptionResult = {
    sortBy: options.sortBy || "createdAt",
    sortOrder: options.sortOrder || "desc",
  };

  if (options.page !== undefined && options.limit !== undefined) {
    const page = Number(options.page);
    const limit = Number(options.limit);

    result.page = page;
    result.limit = limit;
    result.skip = (page - 1) * limit;
  }

  return result;
};



// const paginationSortingHelper = (options: IOption):iOptionResult => {
//   const page: number = Number(options.page) ||   1;
//   const limit: number = Number(options.limit) || 1;
//   //pagination formula => skip = (page-1) * limit
//   const skip = (page - 1) * limit;

//   const sortBy: string = options.sortBy || "createdAt";
//   const sortOrder: string = options.sortOrder || "desc";

//   return {
//     page,
//     limit,
//     skip,
//     sortBy,
//     sortOrder
//   };
// };

export default paginationSortingHelper;
