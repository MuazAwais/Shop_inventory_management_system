import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { SaleService } from "@/services";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { saleSchemas } from "@/lib/validation/schemas";
import { validateRequestBody } from "@/lib/validation";

/**
 * POST /api/sales
 * Create a new sale with items (POS)
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth();

    const validationResult = await validateRequestBody(
      saleSchemas.create,
      request,
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message,
      );
    }

    const body = validationResult.value;

    // Prefer authenticated user's branch when available
    const branchId = (user.branchId as number | null) ?? body.branchId;
    if (!branchId) {
      return errorResponse(
        new Error("Branch is required for sales"),
        "Branch is required for sales",
        400,
      );
    }

    const sale = await SaleService.createSale({
      branchId,
      customerId: body.customerId ?? undefined,
      invoiceNo: body.invoiceNo,
      items: body.items,
      paymentMethod: body.paymentMethod,
      paymentDetails: body.paymentDetails ?? undefined,
      isCreditSale: body.isCreditSale ?? body.paymentMethod === "credit",
      fbrInvoiceNumber:
        typeof body.fbrInvoiceNumber === "number"
          ? body.fbrInvoiceNumber
          : undefined,
      createdBy: user.id as number,
    });

    return successResponse(sale, "Sale created successfully", 201);
  } catch (error: any) {
    // Log the error for debugging
    console.error("Error creating sale:", error);
    
    if (error.message && error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }

    // Handle foreign key constraint errors
    if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY" || error.libsqlError) {
      let message = "Invalid reference: ";
      if (error.message?.includes("Branch")) {
        message += "Branch not found. Please ensure the branch exists.";
      } else if (error.message?.includes("User")) {
        message += "User not found. Please ensure you are properly authenticated.";
      } else if (error.message?.includes("Customer")) {
        message += "Customer not found. Please check the customer ID.";
      } else {
        message += "One of the referenced records (branch, user, or customer) does not exist.";
      }
      return errorResponse(error, message, 400);
    }

    return errorResponse(
      error,
      error.message || "Failed to create sale",
      500
    );
  }
}
