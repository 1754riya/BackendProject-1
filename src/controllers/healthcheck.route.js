import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const HealthCheck = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, "ok", "API is healthy"));
});

export { HealthCheck};