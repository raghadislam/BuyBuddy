import aiService from "../../services/ai/ai.service";
import { SearchByTextPayload } from "./search.type";
import productService from "../product/product.service";
import logger from "../../config/logger.config";

class SearchService {
  async searchByText(payload: SearchByTextPayload) {
    // Get product IDs from AI API
    const { query } = payload;
    const productIds = await aiService.searchByText(payload);

    // Fetch actual products from database
    const products = (
      await Promise.all(
        productIds.map(async (id: string) => {
          try {
            return await productService.getProductById(id);
          } catch (error) {
            logger.error(`Failed to fetch product with ID ${id}:`, error);
            return null;
          }
        })
      )
    ).filter((product) => product !== null);

    return {
      query,
      total: products.length,
      products,
    };
  }
}

export const searchService = new SearchService();
