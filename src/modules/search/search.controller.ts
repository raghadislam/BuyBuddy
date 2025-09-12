import { RequestHandler } from "express";
import { searchService } from "./search.service";
import { sendResponse } from "../../utils/response";
import { HttpStatus } from "../../enums/httpStatus.enum";
import { SearchByTextPayload } from "./search.type";

export const searchProductsByText: RequestHandler = async (req, res) => {
  const { query } = req.body;

  const payload: SearchByTextPayload = { query };
  const data = await searchService.searchByText(payload);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Products found successfully",
    data,
  });
};
