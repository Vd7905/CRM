import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

// ✅ Using OpenRouter API
const openai = new OpenAI({
  apiKey: process.env.OPEN_ROUTER,
  baseURL: "https://openrouter.ai/api/v1",
});

// ---------------- Generate Campaign Content ----------------
const generateCampaignContent = asyncHandler(async (req, res) => {
  const { segmentRules } = req.body;

  if (!segmentRules || !segmentRules.rules) {
    throw new ApiError(400, "Segment rules are required");
  }

  try {
    const rulesDescription = JSON.stringify(segmentRules.rules, null, 2);

    const prompt = `
You are an expert marketing copywriter.

Write a **personalized marketing email** for customers who match these segment rules:
${rulesDescription}

Guidelines:
- Do not use placeholders like {{name}} or {{total_spent}}.
- Instead, infer meaning from the rules (e.g., “customers who spent over ₹5000” or “frequent buyers with more than 5 orders”).
- The tone should be persuasive, warm, and natural — suitable for an Indian audience.
- Include dynamic elements based on spending and behavior.
- Keep it concise and engaging.
- End the email with "Best regards,\\nCRM PRO".

Return the result in this **exact format**:

Subject: [Catchy subject line here]

Body:
[Personalized marketing message here.]

Best regards,
CRM PRO
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a professional marketing copywriter." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const generatedText = response.choices[0].message.content.trim();

    res
      .status(200)
      .json(new ApiResponse(200, generatedText, "Content generated successfully"));
  } catch (error) {
    console.error("OpenRouter Error:", error);
    throw new ApiError(500, "AI content generation failed: " + error.message);
  }
});

// ---------------- Generate Customer Insights ----------------
const generateCustomerInsights = asyncHandler(async (req, res) => {
  const { customerData } = req.body;

  if (!customerData || !Array.isArray(customerData)) {
    throw new ApiError(400, "Customer data array is required");
  }

  try {
    const prompt = `
You are a data-driven CRM marketing analyst.

Analyze the following customer data and generate **actionable marketing insights**:
${JSON.stringify(customerData.slice(0, 50), null, 2)}

Include:
1. Top spending customer segments.
2. Patterns in purchase frequency or engagement.
3. Recommended campaign ideas tailored for these segments.
4. Suggestions to improve retention or conversion.

Return the output in clear, structured paragraphs under proper headings.
End with: "– CRM PRO"
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a professional marketing analyst." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 600,
    });

    const insights = response.choices[0].message.content.trim();

    res
      .status(200)
      .json(new ApiResponse(200, insights, "Insights generated successfully"));
  } catch (error) {
    console.error("OpenRouter Error:", error);
    throw new ApiError(500, "AI insights generation failed: " + error.message);
  }
});

export { generateCampaignContent, generateCustomerInsights };

