import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getAllProducts, createProduct, getProductByCode } from "@/db/queries";
import { validateRequestBody } from "@/lib/validation";
import { productSchemas } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  conflictErrorResponse,
} from "@/lib/api-response";

/**
 * GET /api/products
 * Get all products (authenticated users)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const products = await getAllProducts();
    return successResponse(products);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

/**
 * POST /api/products
 * Create new product (authenticated users)
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const validationResult = await validateRequestBody(
      productSchemas.create,
      request
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message
      );
    }

    const productData = validationResult.value;

    // Check if product code already exists
    const existingProduct = await getProductByCode(productData.code);
    if (existingProduct) {
      return conflictErrorResponse("Product code already exists");
    }

    const product = await createProduct(productData);
    return successResponse(product, "Product created successfully", 201);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error, error.message || "Failed to create product", 400);
  }
}

