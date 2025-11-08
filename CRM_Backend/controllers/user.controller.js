import { Campaign } from "../models/campaign.model.js";
import { Segment } from "../models/segment.model.js";
import { CommunicationLog } from "../models/comunicationLog.model.js";
import { Customer } from "../models/customer.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../utils/sendEmail.js";


// Helper to build MongoDB query from rules
const buildSegmentQuery = (rules) => {
  // Handle both direct rules object and segment document format
  const segmentRules = rules.rules ? rules : rules.rules;

  const query = {};
  const getFieldPath = (field) => {
    const fieldMap = {
      total_spent: "stats.total_spent",
      order_count: "stats.order_count",
      last_purchase: "stats.last_purchase",
      city: "address.city",
      is_active: "is_active",
    };
    return fieldMap[field] || field;
  };

  const conditions = segmentRules.rules.map((rule) => {
    const fieldPath = getFieldPath(rule.field);
    let value = rule.value;

    // Special handling for last_purchase (convert days to date)
    if (rule.field === "last_purchase") {
      const daysAgo = parseInt(value);
      if (!isNaN(daysAgo)) {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        value = date;
      }
    }

    // Special handling for boolean fields
    if (rule.field === "is_active") {
      value = value === "true" || value === true;
    }

    switch (rule.operator) {
      case ">":
        return { [fieldPath]: { $gt: value } };
      case "<":
        return { [fieldPath]: { $lt: value } };
      case ">=":
        return { [fieldPath]: { $gte: value } };
      case "<=":
        return { [fieldPath]: { $lte: value } };
      case "==":
        return { [fieldPath]: { $eq: value } };
      case "!=":
        return { [fieldPath]: { $ne: value } };
      case "contains":
        return { [fieldPath]: { $regex: value, $options: "i" } };
      default:
        return {};
    }
  });

  if (segmentRules.combinator === "and" || segmentRules.condition === "AND") {
    query.$and = conditions;
  } else {
    query.$or = conditions;
  }

  return query;
};

// Create segment
const createSegment = asyncHandler(async (req, res) => {
  const { name, description, rules } = req.body;

  // 1. Validate input
  if (!name || !rules?.rules || rules.rules.length === 0) {
    throw new ApiError(400, "Name and at least one rule are required");
  }

  // 2. Build query and estimate count
  const query = buildSegmentQuery(rules);
  const estimatedCount = await Customer.countDocuments(query);

  // 3. Create segment linked to authenticated user
  const segment = await Segment.create({
    name,
    description,
    rules,
    estimated_count: estimatedCount,
    created_by: req.user._id,
    is_dynamic: true,
  });

  res
    .status(201)
    .json(new ApiResponse(201, segment, "Segment created successfully"));
});


const getUserSegments = asyncHandler(async (req, res) => {
  const { id } = req.query;

  if (!id) {
    throw new ApiError(400, "Segment ID is required");
  }

  // Find the segment created by this user
  const segment = await Segment.findOne({ _id: id, created_by: req.user.id }).lean();

  if (!segment) {
    throw new ApiError(404, "Segment not found or you don't have access");
  }

  // Transform the rules for better frontend display
  const transformedSegment = {
    ...segment,
    rules: {
      condition: segment.rules.condition,
      rules: segment.rules.rules.map((rule) => ({
        field: rule.field,
        operator: rule.operator,
        value: rule.value,
        value_type: rule.value_type,
      })),
    },
  };

  res.status(200).json(
    new ApiResponse(
      200,
      transformedSegment,
      "Segment details fetched successfully"
    )
  );
});


// Estimate segment size
const estimateSegment = asyncHandler(async (req, res) => {
  const { rules } = req.body;

  if (!rules?.rules || rules.rules.length === 0) {
    throw new ApiError(400, "At least one rule is required");
  }

  const query = buildSegmentQuery(rules);
   query.uploaded_by = req.user?._id;

  const count = await Customer.countDocuments(query);

  res
    .status(200)
    .json(new ApiResponse(200, { count }, "Segment estimated successfully"));
});


// return the customers for a particular segment

const getSegmentCustomers = asyncHandler(async (req, res) => {
  const { segmentId } = req.params; // <- updated

  if (!segmentId) {
    throw new ApiError(400, "Segment ID is required");
  }

  // 1. Fetch the segment
  const segment = await Segment.findById(segmentId).lean();

  if (!segment) {
    throw new ApiError(404, "Segment not found");
  }

  // 2. Build query from rules
  const query = buildSegmentQuery(segment.rules);

  query.uploaded_by = req.user.id;
  // 3. Fetch customers
  const customers = await Customer.find(query).lean();

  // 4. Return customers
  res
    .status(200)
    .json(new ApiResponse(200, customers, "Segment customers fetched successfully"));
});




// Create campaign
const createCampaign = asyncHandler(async (req, res) => {
  const { name, segmentId, template } = req.body;

  // 1. Validate input
  if (!name || !segmentId || !template?.subject || !template?.body) {
    throw new ApiError(400, "Name, segment ID, and template are required");
  }

  // 2. Verify segment belongs to user and has rules
  const segment = await Segment.findOne({
    _id: segmentId,
    created_by: req.user._id,
  });

  if (!segment) {
    throw new ApiError(404, "Segment not found or access denied");
  }

  if (!segment.rules || segment.rules.rules.length === 0) {
    throw new ApiError(400, "Segment has no rules defined");
  }

  // 3. Verify the segment actually matches customers
  const query = buildSegmentQuery(segment.rules);
  const customerCount = await Customer.countDocuments(query);

  if (customerCount === 0) {
    throw new ApiError(
      400,
      "Segment matches 0 customers - cannot create campaign"
    );
  }

  // 4. Create campaign with accurate initial count
  const campaign = await Campaign.create({
    name,
    segment_id: segmentId,
    template,
    created_by: req.user._id,
    status: "draft",
    stats: {
      total_recipients: customerCount, // Use actual count from query
    },
  });

  // 5. Process campaign in background
  processCampaignInBackground(campaign._id);

  res
    .status(201)
    .json(new ApiResponse(201, campaign, "Campaign created successfully"));
});

// Get user's campaigns
const getUserCampaigns = asyncHandler(async (req, res) => {
  const campaigns = await Campaign.find({ created_by: req.user._id })
    .populate("segment_id", "name estimated_count")
    .sort("-created_at");

  res
    .status(200)
    .json(new ApiResponse(200, campaigns, "Campaigns fetched successfully"));
});

// const getCommuniactionLog = asyncHandler(async (req, res) => {
//   const { campaignId } = req.query;

//   if (!campaignId) {
//     throw new ApiError(400, "Campaign ID is required");
//   }

//   const logs = await CommunicationLog.find({ campaign_id: campaignId })
//     .populate({
//       path: "customer_id",
//       select: "name email phone address",
//       model: Customer,
//     })
//     .sort({ sent_at: -1 });

//   // Transform the data to flatten customer info
//   const transformedLogs = logs.map((log) => {
//     const logObj = log.toObject();
//     return {
//       ...logObj,
//       customer: logObj.customer_id,
//       customer_id: undefined, // Remove the nested customer_id
//     };
//   });

//   res
//     .status(200)
//     .json(
//       new ApiResponse(
//         200,
//         transformedLogs,
//         "Communication logs fetched successfully"
//       )
//     );
// });

const getCommuniactionLog = asyncHandler(async (req, res) => {
  const { campaignId } = req.query;

  if (!campaignId) {
    throw new ApiError(400, "Campaign ID is required");
  }

  // 1. Verify campaign belongs to this user
  const campaign = await Campaign.findOne({
    _id: campaignId,
    created_by: req.user._id,
  });

  if (!campaign) {
    throw new ApiError(404, "Campaign not found or access denied");
  }

  // 2. Fetch logs only for this campaign
  const logs = await CommunicationLog.find({ campaign_id: campaignId })
    .populate({
      path: "customer_id",
      select: "name email phone address uploaded_by",
      model: Customer,
    })
    .sort({ sent_at: -1 })
    .lean();

  // 3. Filter logs to include only customers uploaded by this user
  const filteredLogs = logs.filter(
    (log) => log.customer_id?.uploaded_by?.toString() === req.user._id.toString()
  );

  // 4. Transform data
  const transformedLogs = filteredLogs.map((log) => {
    return {
      ...log,
      customer: log.customer_id,
      customer_id: undefined,
    };
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        transformedLogs,
        "Communication logs fetched successfully"
      )
    );
});

const processCampaignInBackground = async (campaignId) => {
  try {
    // 1. Fetch campaign with segment
    const campaign = await Campaign.findById(campaignId)
      .populate("segment_id")
      .populate("created_by");

    if (!campaign) return;

    // 2. Get customers matching the segment
    const query = buildSegmentQuery(campaign.segment_id.rules);
    const customers = await Customer.find(query).lean();

    console.log(`Processing campaign for ${customers.length} customers`);

    // 3. Update campaign status to processing
    campaign.status = "processing";
    campaign.stats.total_recipients = customers.length;
    await campaign.save();

    let sent = 0;
    let failed = 0;

    // 4. Batch processing to avoid server overload
    const batchSize = 100;
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);

      const logPromises = batch.map(async (customer) => {
        try {
          // Personalize email
          const emailBody = campaign.template.body
            .replace("{{name}}", customer.name)
            .replace("{{email}}", customer.email);
          const emailSubject = campaign.template.subject;

          // Send email
          await sendEmail({
            to: customer.email,
            subject: emailSubject,
            text: emailBody,
          });

          // Log success
          const log = await CommunicationLog.create({
            campaign_id: campaign._id,
            customer_id: customer._id,
            status: "sent",
            sent_at: new Date(),
          });

          return log;
        } catch (err) {
          // Log failure
          const log = await CommunicationLog.create({
            campaign_id: campaign._id,
            customer_id: customer._id,
            status: "failed",
            failure_reason: err.message,
            sent_at: new Date(),
          });

          return log;
        }
      });

      const results = await Promise.allSettled(logPromises);

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          if (result.value.status === "sent") sent++;
          else failed++;
        } else {
          failed++;
          console.error("Failed to create log:", result.reason);
        }
      });
    }

    // 5. Finalize campaign stats
    campaign.status = "completed";
    campaign.stats.sent = sent;
    campaign.stats.failed = failed;
    campaign.stats.delivery_rate =
      customers.length > 0 ? (sent / customers.length) * 100 : 0;

    await campaign.save();
    console.log(`Campaign ${campaign.name} completed. Sent: ${sent}, Failed: ${failed}`);
  } catch (error) {
    console.error("Campaign processing failed:", error);

    await Campaign.findByIdAndUpdate(campaignId, {
      status: "failed",
      "stats.failure_reason": error.message,
    });
  }
};

// Delete all data (no JWT required)
// const deleteAllData = asyncHandler(async (req, res) => {
//   try {
//     // Delete all related documents
//     await Promise.all([
//       Campaign.deleteMany({}),
//       Segment.deleteMany({}),
//       CommunicationLog.deleteMany({}),
//       Customer.deleteMany({})
//     ]);

//     res
//       .status(200)
//       .json(new ApiResponse(200, null, "All campaigns, segments, customers, and communication logs deleted successfully"));
//   } catch (error) {
//     throw new ApiError(500, "Failed to delete all data: " + error.message);
//   }
// });


export {
  createCampaign,
  getUserCampaigns,
  createSegment,
  getUserSegments,
  estimateSegment,
  getCommuniactionLog,
  getSegmentCustomers,
};



