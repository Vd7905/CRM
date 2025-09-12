import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

// For generating campaign content
const generateCampaignContent = asyncHandler(async (req, res) => {
  const { segmentRules } = req.body;

  if (!segmentRules || !segmentRules.rules) {
    throw new ApiError(400, "Segment rules are required");
  }

  try {
    const prompt = `Generate an email subject and body for customers matching: ${JSON.stringify(
      segmentRules.rules
    )}.\nInclude variables like {name} and {total_spent}.\nFormat as:\nSubject: [subject here]\nBody: [body here]`;

    const response = await cohere.generate({
      prompt: prompt,
      maxTokens: 300,
      temperature: 0.7,
    });

    const generatedText = response.generations[0].text;
    res
      .status(200)
      .json(
        new ApiResponse(200, generatedText, "Content generated successfully")
      );
  } catch (error) {
    console.error("Cohere Error:", error);
    throw new ApiError(500, "AI content generation failed: " + error.message);
  }
});

// For customer insights
const generateCustomerInsights = asyncHandler(async (req, res) => {
  const { customerData } = req.body;

  if (!customerData || !Array.isArray(customerData)) {
    throw new ApiError(400, "Customer data array is required");
  }

  try {
    const prompt = `Analyze this customer data and provide marketing insights: ${JSON.stringify(
      customerData.slice(0, 50) // Limit data
    )}.\nHighlight:\n1. Top spending segments\n2. Purchase frequency trends\n3. Recommended campaign types`;

    const response = await cohere.generate({
      prompt: prompt,
      maxTokens: 500,
      temperature: 0.5, // Lower for more factual responses
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          response.generations[0].text,
          "Insights generated successfully"
        )
      );
  } catch (error) {
    console.error("Cohere Error:", error);
    throw new ApiError(500, "AI insights generation failed: " + error.message);
  }
});

export { generateCampaignContent, generateCustomerInsights };