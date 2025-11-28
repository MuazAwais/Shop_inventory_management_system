import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { successResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  // Clear auth session cookie
  cookies().delete("auth_session");

  return successResponse({}, "Logged out successfully");
}

