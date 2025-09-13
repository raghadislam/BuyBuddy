import axios from "axios";
import env from "../../config/env.config";
import { AIImageSearchPayload, AITextSearchPayload } from "./ai.type";
import APIError from "../../utils/APIError";
import { HttpStatus } from "../../enums/httpStatus.enum";
import logger from "../../config/logger.config";

class AIService {
  private readonly apiUrl = env.AI_SEARCH_API_URL;

  async searchByText(payload: AITextSearchPayload): Promise<string[]> {
    try {
      const { query } = payload;
      const formData = new FormData();
      formData.append("query", query);

      const response = await axios.post(
        `${this.apiUrl}/search-text`,
        formData,
        {
          timeout: 30000,
        }
      );
      return response.data.productIds || [];
    } catch (error) {
      logger.error("AI text search error:", error);
      throw new APIError(
        "Failed to search products by text",
        HttpStatus.InternalServerError
      );
    }
  }

  async searchByImage(payload: AIImageSearchPayload): Promise<string[]> {
    try {
      const { image } = payload;
      const formData = new FormData();
      formData.append("file", image);

      const response = await axios.post(
        `${this.apiUrl}/search-image`,
        formData,
        {
          timeout: 60000,
        }
      );
      return response.data.productIds || [];
    } catch (error) {
      console.error("AI image search error:", error);
      throw new APIError(
        "Failed to search products by image",
        HttpStatus.InternalServerError
      );
    }
  }
}

export default new AIService();
