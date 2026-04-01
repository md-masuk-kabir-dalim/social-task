import { Model, Query } from "mongoose";

export interface PopulateOption {
  path: string;
  select?: string;
}

interface SearchPaginateOptions<T> {
  model: Model<T>;
  searchFields?: (keyof T)[];
  filters?: Record<string, any>;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  select?: string;
  populate?: PopulateOption | PopulateOption[];
  skipCount?: boolean;
}

export const searchPaginate = async <T>({
  model,
  searchFields = [],
  filters = {},
  search = "",
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
  select,
  populate,
  skipCount = false,
}: SearchPaginateOptions<T>) => {
  const filter: any = {};

  if (search && searchFields.length > 0) {
    filter.$text = { $search: search };
  }
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (typeof value === "object" && !Array.isArray(value)) {
      const range: any = {};
      if (value.gte !== undefined) range.$gte = value.gte;
      if (value.lte !== undefined) range.$lte = value.lte;
      if (Object.keys(range).length) {
        filter[key] = range;
        return;
      }

      filter[key] = value;
      return;
    }

    // IN query
    if (Array.isArray(value)) {
      filter[key] = { $in: value };
      return;
    }

    filter[key] = value;
  });

  const skip = (page - 1) * limit;

  let queryBuilder: Query<any[], any> = model
    .find(filter)
    .lean()
    .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
    .skip(skip)
    .limit(limit);

  if (select) queryBuilder = queryBuilder.select(select);

  if (populate) {
    (Array.isArray(populate) ? populate : [populate]).forEach(
      (p) => (queryBuilder = queryBuilder.populate(p)),
    );
  }

  const dataPromise = queryBuilder.exec();
  const totalPromise = skipCount
    ? dataPromise.then((d) => d.length)
    : model.countDocuments(filter);

  const [data, total] = await Promise.all([dataPromise, totalPromise]);

  return {
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    data,
  };
};
