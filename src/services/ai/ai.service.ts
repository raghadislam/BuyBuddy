import axios from "axios";
import env from "../../config/env.config";
import { AIImageSearchPayload, AITextSearchPayload } from "./ai.type";
import APIError from "../../utils/APIError";
import { HttpStatus } from "../../enums/httpStatus.enum";
import logger from "../../config/logger.config";

class AIService {
  private readonly apiUrl = env.AI_SEARCH_API_URL;
  private readonly apiKey = env.AI_SEARCH_API_KEY;

  async searchByText(payload: AITextSearchPayload): Promise<string[]> {
    try {
      // Work in progress: Mock response for now
      return [
        "843e7a0c-8831-4395-98bc-dfc030c68d56",
        "8b50cdc8-4083-4356-9757-6f5a1e4f2a86",
      ];

      //   const { query } = payload;
      //   const response = await axios.post<AISearchResponse>(
      //     `${this.apiUrl}/search/text`,
      //     {
      //       query,
      //     },
      //     {
      //       headers: {
      //         Authorization: `Bearer ${this.apiKey}`,
      //         "Content-Type": "application/json",
      //       },
      //       timeout: 30000,
      //     }
      //   );
      //   return response.data.productIds || [];
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
      // Work in progress: Mock response for now
      return [
        "843e7a0c-8831-4395-98bc-dfc030c68d56",
        "8b50cdc8-4083-4356-9757-6f5a1e4f2a86",
      ];

      //   const { image } = payload;
      //     const response = await axios.post<AISearchResponse>(
      //       `${this.apiUrl}/search/image`,
      //       image,
      //       {
      //         headers: {
      //           Authorization: `Bearer ${this.apiKey}`,
      //         },
      //         timeout: 60000,
      //       }
      //     );

      //   return response.data.productIds || [];
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
