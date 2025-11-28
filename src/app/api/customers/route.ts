import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getAllCustomers, createCustomer, getCustomerByPhone } from "@/db/queries/customers";
import { validateRequestBody } from "@/lib/validation";
import { customerSchemas } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  conflictErrorResponse,
} from "@/lib/api-response";

/**
 * GET /api/customers
 * Get all customers (authenticated users)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const customers = await getAllCustomers();
    return successResponse(customers);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

/**
 * POST /api/customers
 * Create new customer (authenticated users)
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const validationResult = await validateRequestBody(
      customerSchemas.create,
      request
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message
      );
    }

    const customerData = validationResult.value;

    // Check if phone number already exists (if provided)
    if (customerData.phone) {
      const existingCustomer = await getCustomerByPhone(customerData.phone);
      if (existingCustomer) {
        return conflictErrorResponse("Customer with this phone number already exists");
      }
    }

    const customer = await createCustomer(customerData);
    return successResponse(customer, "Customer created successfully", 201);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error, error.message || "Failed to create customer", 400);
  }
}

