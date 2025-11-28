import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getProductById,
  updateProduct,
  deleteProduct,
  getProductByCode,
} from "@/db/queries";
import { validateRequestBody } from "@/lib/validation";
import { productSchemas } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
  conflictErrorResponse,
} from "@/lib/api-response";

/**
 * GET /api/products/[id]
 * Get product by ID (authenticated users)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const productId = parseInt(params.id);
    
    if (isNaN(productId)) {
      return errorResponse(new Error("Invalid product ID"), "Invalid product ID", 400);
    }

    const product = await getProductById(productId);
    
    if (!product) {
      return notFoundResponse("Product");
    }

    return successResponse(product);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

/**
 * PATCH /api/products/[id]
 * Update product (authenticated users)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const productId = parseInt(params.id);
    
    if (isNaN(productId)) {
      return errorResponse(new Error("Invalid product ID"), "Invalid product ID", 400);
    }

    const product = await getProductById(productId);
    if (!product) {
      return notFoundResponse("Product");
    }

    const validationResult = await validateRequestBody(
      productSchemas.update,
      request
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message
      );
    }

    const updateData = validationResult.value as any;

    // If code is being updated, check for uniqueness
    if (updateData.code && updateData.code !== product.code) {
      const existingProduct = await getProductByCode(updateData.code);
      if (existingProduct) {
        return conflictErrorResponse("Product code already exists");
      }
    }

    const updated = await updateProduct(productId, updateData);
    return successResponse(updated, "Product updated successfully");
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

/**
 * DELETE /api/products/[id]
 * Delete product (authenticated users)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const productId = parseInt(params.id);
    
    if (isNaN(productId)) {
      return errorResponse(new Error("Invalid product ID"), "Invalid product ID", 400);
    }

    const product = await getProductById(productId);
    if (!product) {
      return notFoundResponse("Product");
    }

    await deleteProduct(productId);
    return successResponse({}, "Product deleted successfully");
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

