import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerByPhone,
} from "@/db/queries/customers";
import { validateRequestBody } from "@/lib/validation";
import { customerSchemas } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
  conflictErrorResponse,
} from "@/lib/api-response";

/**
 * GET /api/customers/[id]
 * Get customer by ID (authenticated users)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const customerId = parseInt(params.id);
    
    if (isNaN(customerId)) {
      return errorResponse(new Error("Invalid customer ID"), "Invalid customer ID", 400);
    }

    const customer = await getCustomerById(customerId);
    
    if (!customer) {
      return notFoundResponse("Customer");
    }

    return successResponse(customer);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

/**
 * PATCH /api/customers/[id]
 * Update customer (authenticated users)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const customerId = parseInt(params.id);
    
    if (isNaN(customerId)) {
      return errorResponse(new Error("Invalid customer ID"), "Invalid customer ID", 400);
    }

    const customer = await getCustomerById(customerId);
    if (!customer) {
      return notFoundResponse("Customer");
    }

    const validationResult = await validateRequestBody(
      customerSchemas.update,
      request
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message
      );
    }

    const updateData = validationResult.value as any;

    // If phone is being updated, check for uniqueness
    if (updateData.phone && updateData.phone !== customer.phone) {
      const existingCustomer = await getCustomerByPhone(updateData.phone);
      if (existingCustomer) {
        return conflictErrorResponse("Customer with this phone number already exists");
      }
    }

    const updated = await updateCustomer(customerId, updateData);
    return successResponse(updated, "Customer updated successfully");
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

/**
 * DELETE /api/customers/[id]
 * Delete customer (authenticated users)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const customerId = parseInt(params.id);
    
    if (isNaN(customerId)) {
      return errorResponse(new Error("Invalid customer ID"), "Invalid customer ID", 400);
    }

    const customer = await getCustomerById(customerId);
    if (!customer) {
      return notFoundResponse("Customer");
    }

    await deleteCustomer(customerId);
    return successResponse({}, "Customer deleted successfully");
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

