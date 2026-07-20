export type TResponse<T> = {
  content: T | null;
  message: string;
  errors:
    | {
        field: string;
        message: string;
      }[]
    | null;
};

export type TResponseGetAll<T> = TResponse<{
  entries: T[];
  totalData: number;
  totalPage: number;
}>;
