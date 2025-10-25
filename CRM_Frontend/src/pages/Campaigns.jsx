"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/utils/axios";
import { Loader2 } from "lucide-react";

export default function CreateCampaign() {
  const [campaignName, setCampaignName] = useState("");
  const [segmentDesc, setSegmentDesc] = useState("");
  const [subject, setSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [condition, setCondition] = useState("AND");
  const [rules, setRules] = useState([
    { field: "total_spent", operator: "greater_than", value: "1000" },
  ]);

  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const addRule = () =>
    setRules([...rules, { field: "", operator: "greater_than", value: "" }]);
  const removeRule = (i) => setRules(rules.filter((_, idx) => idx !== i));
  const updateRule = (i, key, val) =>
    setRules(rules.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));

  const mapOperator = (op) => {
    switch (op) {
      case "greater_than":
        return ">";
      case "less_than":
        return "<";
      case "equal_to":
        return "=";
      case "not_equal_to":
        return "!=";
      default:
        return op;
    }
  };

  const mapRulesForBackend = (rules) =>
    rules.map((r) => ({ ...r, operator: mapOperator(r.operator) }));

  const handleEstimateAudience = async () => {
    if (!rules.length) return toast.error("Add at least one rule");
    setLoadingEstimate(true);
    try {
      const res = await api.post("/api/user/estimate-segment", {
        rules: { condition, rules: mapRulesForBackend(rules) },
      });
      if (res.data.success)
        toast.success(`Estimated audience: ${res.data.data.count} users`);
      else toast.error("Failed to estimate segment");
    } catch (err) {
      console.error(err);
      toast.error("Failed to estimate segment");
    } finally {
      setLoadingEstimate(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!rules.length) return toast.error("Add at least one rule");
    setLoadingAI(true);
    try {
      const res = await api.post("/api/ai/generate-campaign-content", {
        segmentRules: { condition, rules: mapRulesForBackend(rules) },
      });

      if (res.data.success) {
        const aiText = res.data.data;
        const subjectMatch = aiText.match(/^Subject:\s*(.+)$/m);
        const bodyMatch = aiText.match(/^Body:\s*([\s\S]+)$/m);
        const generatedSubject = subjectMatch ? subjectMatch[1].trim() : "";
        const generatedBody = bodyMatch ? bodyMatch[1].trim() : "";

        if (generatedSubject) setSubject(generatedSubject);
        if (generatedBody) setMessageBody(generatedBody);

        toast.success("AI content generated successfully");
      } else {
        toast.error("AI content generation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("AI content generation failed");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async () => {
    if (!campaignName || !subject || !messageBody)
      return toast.error("Please fill campaign name, subject, and message body");
    if (!rules.length) return toast.error("Add at least one segment rule");

    setLoadingSubmit(true);
    try {
      const backendRules = mapRulesForBackend(rules);
      const segmentRes = await api.post("/api/user/create-segment", {
        name: segmentDesc || `Segment - ${campaignName}`,
        description: segmentDesc,
        rules: { condition, rules: backendRules },
      });

      if (!segmentRes.data.success) {
        toast.error("Failed to create segment");
        return;
      }

      const segmentId = segmentRes.data.data._id;
      const campaignRes = await api.post("/api/user/create-campaign", {
        name: campaignName,
        segmentId,
        template: { subject, body: messageBody },
      });

      if (!campaignRes.data.success) return toast.error("Failed to create campaign");

      toast.success("Campaign created successfully");
      setCampaignName("");
      setSegmentDesc("");
      setSubject("");
      setMessageBody("");
      setRules([{ field: "total_spent", operator: "greater_than", value: "1000" }]);
      setCondition("AND");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Check console for details");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <main className="flex-1 min-h-screen bg-background text-foreground p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-semibold">Create New Campaign</h1>

        {/* Campaign Details */}
        <Card className="bg-card border border-border rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Campaign Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Campaign Name *
              </label>
              <Input
                placeholder="Summer Sale 2025"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Segment Description
              </label>
              <Input
                placeholder="High-value customers"
                value={segmentDesc}
                onChange={(e) => setSegmentDesc(e.target.value)}
                className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* Audience Segmentation */}
        <Card className="bg-card border border-border rounded-2xl shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <CardTitle className="text-lg font-semibold text-foreground">
              Audience Segmentation
            </CardTitle>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleEstimateAudience}
                disabled={loadingEstimate}
                className="bg-primary text-white hover:bg-secondary transition"
              >
                {loadingEstimate ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : null}
                {loadingEstimate ? "Estimating..." : "Total Customers"}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-foreground">
                Combine rules using:
              </label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="w-32 bg-background border-border text-foreground">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-border">
                  <SelectItem value="AND">AND</SelectItem>
                  <SelectItem value="OR">OR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 mt-2">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-center gap-3 p-3 border border-border rounded-xl bg-muted/20 backdrop-blur-sm"
                >
                  <Select
                    value={rule.field}
                    onValueChange={(v) => updateRule(idx, "field", v)}
                  >
                    <SelectTrigger className="sm:w-40 w-full bg-background border-border text-foreground">
                      <SelectValue placeholder="Field" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground border border-border">
                      <SelectItem value="total_spent">Total Spent</SelectItem>
                      <SelectItem value="order_count">Order Count</SelectItem>
                      <SelectItem value="last_purchase">
                        Days Since Last Purchase
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={rule.operator}
                    onValueChange={(v) => updateRule(idx, "operator", v)}
                  >
                    <SelectTrigger className="sm:w-40 w-full bg-background border-border text-foreground">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground border border-border">
                      <SelectItem value="greater_than">Greater than</SelectItem>
                      <SelectItem value="less_than">Less than</SelectItem>
                      <SelectItem value="equal_to">Equal to</SelectItem>
                      <SelectItem value="not_equal_to">Not equal to</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="text"
                    placeholder="Value"
                    value={rule.value}
                    onChange={(e) => updateRule(idx, "value", e.target.value)}
                    className="sm:w-40 w-full bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />

                  {rules.length > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => removeRule(idx)}
                      className="text-destructive border-destructive hover:bg-destructive/10"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={addRule}
              className="border-primary text-primary hover:bg-primary/10"
            >
              Add Rule
            </Button>
          </CardContent>
        </Card>

        {/* Message Template */}
        <Card className="bg-card border border-border rounded-2xl shadow-sm">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-lg font-semibold text-foreground">
              Message Template
            </CardTitle>
            <Button
              onClick={handleAIGenerate}
              disabled={loadingAI}
              className="bg-primary text-white hover:bg-secondary transition"
            >
              {loadingAI ? (
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
              ) : null}
              {loadingAI ? "Generating..." : "AI Generate"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Subject *</label>
              <Input
                placeholder="Special offer just for you!"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Message Body *
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Use variables like {"{name}"} or {"{total_spent}"}
              </p>
              <Textarea
                placeholder={`Hi {name},\nYou have spent {total_spent} and earned a special reward!`}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="min-h-[150px] bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loadingSubmit}
            className="bg-primary hover:bg-secondary text-white"
          >
            {loadingSubmit ? (
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
            ) : null}
            {loadingSubmit ? "Creating..." : "Create Campaign"}
          </Button>
        </div>
      </div>
    </main>
  );
}
