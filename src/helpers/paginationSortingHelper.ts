type IOption = {
  page?: number | string;
  limit?: number | string;
  sortOrder?: string;
  sortBy?: string;
};
type iOptionResult ={
    page:number;
    limit:number;
    skip:number;
    sortBy:string;
    sortOrder:string
}

const paginationSortingHelper = (options: IOption):iOptionResult => {
  const page: number = Number(options.page) || 1;
  const limit: number = Number(options.limit) || 1;
  //pagination formula => skip = (page-1) * limit
  const skip = (page - 1) * limit;

  const sortBy: string = options.sortBy || "createdAt";
  const sortOrder: string = options.sortOrder || "desc";

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder
  };
};

export default paginationSortingHelper;
