import { NextRequest } from "next/server";
import { validateRequestBody } from "@/lib/validation";
import { userSchemas } from "@/lib/validation/schemas";
import { AuthService } from "@/services";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  // Validate request body
  const validationResult = await validateRequestBody(
    userSchemas.login,
    request
  );

  if (validationResult.isFailure()) {
    return validationErrorResponse(
      validationResult.error.errors || {},
      validationResult.error.message
    );
  }

  const { username, password } = validationResult.value;

  try {
    // Authenticate user
    const authResult = await AuthService.authenticate(username, password);

    if (!authResult.success || !authResult.user) {
      return errorResponse(
        new Error(authResult.error || "Invalid credentials"),
        "Invalid username or password",
        401
      );
    }

    // Set a simple auth cookie (for now - can be enhanced with proper session management)
    cookies().set("auth_session", JSON.stringify({
      userId: authResult.user.id,
      username: authResult.user.username,
      role: authResult.user.role,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return successResponse(
      {
        user: {
          id: authResult.user.id,
          username: authResult.user.username,
          role: authResult.user.role,
        },
      },
      "Login successful"
    );
  } catch (error) {
    return errorResponse(error);
  }
}

