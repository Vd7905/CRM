"use client";
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
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

export default function CreateCampaign() {
  const [campaignName, setCampaignName] = useState("");
  const [segmentDesc, setSegmentDesc] = useState("");
  const [subject, setSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [condition, setCondition] = useState("AND");
  const [rules, setRules] = useState([
    { field: "total_spent", operator: "greater_than", value: "1000" },
  ]);

  // Add, remove, update rules
  const addRule = () =>
    setRules([...rules, { field: "", operator: "equal_to", value: "" }]);
  const removeRule = (i) => setRules(rules.filter((_, idx) => idx !== i));
  const updateRule = (i, key, val) =>
    setRules(rules.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));

  // Dummy handlers
  const handleAIGenerate = () =>
    setMessageBody(
      "Hi {name},\nWe’ve prepared a special offer for you since you’ve spent {total_spent} with us!"
    );

  const handleEstimateAudience = () =>
    alert("📊 Estimated Audience Size: 1,240 users (demo)");

  const handleSubmit = () => {
    const payload = {
      campaignName,
      segmentDesc,
      messageTemplate: { subject, messageBody },
      segmentation: { condition, rules },
    };
    console.log(payload);
    alert("✅ Campaign created successfully!");
  };

  return (
    <main className="flex-1 min-h-screen bg-background text-foreground p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-semibold">Create New Campaign</h1>

        {/* --- Campaign Details --- */}
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

        {/* --- Audience Segmentation --- */}
        <Card className="bg-card border border-border rounded-2xl shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <CardTitle className="text-lg font-semibold text-foreground">
              Audience Segmentation
            </CardTitle>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleEstimateAudience}
                className="bg-primary text-white hover:bg-secondary transition"
              >
                Estimate Audience
              </Button>
              <NavLink to="/segment-customers">
                  <Button className="bg-primary text-white hover:bg-secondary transition">
                     Analyze Segment Customers
                  </Button>
              </NavLink>
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
                  {/* Field */}
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
                      <SelectItem value="days_since_last_purchase">
                        Days Since Last Purchase
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Operator */}
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
                      <SelectItem value="not_equal_to">
                        Not equal to
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Value */}
                  <Input
                    type="text"
                    placeholder="Value"
                    value={rule.value}
                    onChange={(e) => updateRule(idx, "value", e.target.value)}
                    className="sm:w-40 w-full bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />

                  {/* Remove */}
                  {rules.length > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => removeRule(idx)}
                      className="text-destructive border-destructive hover:bg-destructive/10"
                    >
                      ✕
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
              + Add Rule
            </Button>
          </CardContent>
        </Card>

        {/* --- Message Template --- */}
        <Card className="bg-card border border-border rounded-2xl shadow-sm">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-lg font-semibold text-foreground">
              Message Template
            </CardTitle>
            <Button
              onClick={handleAIGenerate}
              className="bg-primary text-white hover:bg-secondary transition"
            >
               AI Generate
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Subject *
              </label>
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
                placeholder={`Hi {name},\nYou’ve spent {total_spent} and earned a special reward!`}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="min-h-[150px] bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* --- Footer --- */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary hover:bg-secondary text-white"
          >
            Create Campaign
          </Button>
        </div>
      </div>
    </main>
  );
}
