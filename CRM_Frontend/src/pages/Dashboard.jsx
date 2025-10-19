import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Dashboard() {
  const campaigns = [
    {
      name: "Winter Sale 2025",
      status: "Active",
      leads: 320,
      conversion: "12%",
      startDate: "2025-01-05",
      color: "var(--green-primary)",
      rules: ["Age > 25", "Purchased last 6 months"],
      customers: [
        { name: "John Doe", email: "john@example.com", status: "Sent", sentAt: "2025-01-06" },
        { name: "Jane Smith", email: "jane@example.com", status: "Pending", sentAt: "2025-01-07" },
      ],
    },
    {
      name: "Product Launch - X1",
      status: "Paused",
      leads: 180,
      conversion: "7%",
      startDate: "2025-03-12",
      color: "var(--orange-primary)",
      rules: ["Purchased X model", "Location USA"],
      customers: [
        { name: "Alice", email: "alice@example.com", status: "Sent", sentAt: "2025-03-13" },
        { name: "Bob", email: "bob@example.com", status: "Failed", sentAt: "2025-03-14" },
      ],
    },
  ];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  return (
    <main className="flex-1 bg-[var(--background)] text-[var(--text)] p-4 sm:p-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-0">
          Campaign Dashboard
        </h1>
      </div>
    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
      <div className="rounded-2xl bg-[var(--card)] p-4 sm:p-6 border border-[var(--muted)]">
        <p className="text-sm text-[var(--text)] mb-1">Total Campaigns</p>
        <p className="text-2xl sm:text-3xl font-semibold text-[var(--primary)]">3</p>
      </div>
      <div className="rounded-2xl bg-[var(--card)] p-4 sm:p-6 border border-[var(--muted)]">
        <p className="text-sm text-[var(--text)] mb-1">Active</p>
        <p className="text-2xl sm:text-3xl font-semibold text-[var(--primary)]">1</p>
      </div>
      <div className="rounded-2xl bg-[var(--card)] p-4 sm:p-6 border border-[var(--muted)]">
        <p className="text-sm text-[var(--text)] mb-1">Paused</p>
        <p className="text-2xl sm:text-3xl font-semibold text-[var(--primary)]">1</p>
      </div>
      <div className="rounded-2xl bg-[var(--card)] p-4 sm:p-6 border border-[var(--muted)]">
        <p className="text-sm text-[var(--text)] mb-1">Completed</p>
        <p className="text-2xl sm:text-3xl font-semibold text-[var(--secondary)]">1</p>
      </div>
    </div>

      {/* Campaigns Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm sm:text-base text-left">
          <thead className="bg-[var(--muted)]/40">
            <tr>
              <th className="px-4 py-2 sm:px-6 sm:py-3 font-medium">Name</th>
              <th className="px-4 py-2 sm:px-6 sm:py-3 font-medium">Status</th>
              <th className="px-4 py-2 sm:px-6 sm:py-3 font-medium">Leads</th>
              <th className="px-4 py-2 sm:px-6 sm:py-3 font-medium">Conversion</th>
              <th className="px-4 py-2 sm:px-6 sm:py-3 font-medium">Start Date</th>
              <th className="px-4 py-2 sm:px-6 sm:py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c, i) => (
              <tr
                key={i}
                className="border-t border-[var(--muted)] hover:bg-[var(--muted)]/20 transition-colors"
              >
                <td className="px-4 py-2 sm:px-6 sm:py-4">{c.name}</td>
                <td className="px-4 py-2 sm:px-6 sm:py-4">
                  <span
                    className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium text-white"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-2 sm:px-6 sm:py-4">{c.leads}</td>
                <td className="px-4 py-2 sm:px-6 sm:py-4">{c.conversion}</td>
                <td className="px-4 py-2 sm:px-6 sm:py-4">{c.startDate}</td>
                <td className="px-4 py-2 sm:px-6 sm:py-4 flex flex-wrap gap-2">
                  {/* View Segment Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-[var(--primary)] text-[var(--primary)]">
                        View Segment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{c.name} - Segment Rules</DialogTitle>
                      </DialogHeader>
                      <ul className="list-disc pl-6 mt-2">
                        {c.rules.map((rule, idx) => (
                          <li key={idx}>{rule}</li>
                        ))}
                      </ul>
                      <DialogClose className="mt-4 bg-[var(--primary)] text-white px-4 py-2 rounded">
                        Close
                      </DialogClose>
                    </DialogContent>
                  </Dialog>
                 {/* Communication Logs Dialog */}
<Dialog>
  <DialogTrigger asChild>
    <Button
      variant="outline"
      className="border-[var(--primary)] text-[var(--primary)]"
    >
      Communication Logs
    </Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-3xl">
    <DialogHeader>
      <DialogTitle>{c.name} - Communication Logs</DialogTitle>
      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <Input
          placeholder="Search by customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Sent">Sent</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </DialogHeader>

    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full text-sm sm:text-base text-left">
        <thead className="bg-[var(--muted)]/40">
          <tr>
            <th className="px-4 py-2 sm:px-6 sm:py-3 font-medium">Customer</th>
            <th className="px-4 py-2 sm:px-6 sm:py-3 font-medium">Email</th>
            <th className="px-4 py-2 sm:px-6 sm:py-3 font-medium">Status</th>
            <th className="px-4 py-2 sm:px-6 sm:py-3 font-medium">Sent At</th>
          </tr>
        </thead>
        <tbody>
          {c.customers
            .filter((cust) =>
              cust.name.toLowerCase().includes(search.toLowerCase())
            )
            .filter((cust) =>
              statusFilter === "all" ? true : cust.status === statusFilter
            )
            .map((cust, idx) => (
              <tr
                key={idx}
                className="border-t border-[var(--muted)] hover:bg-[var(--muted)]/20 transition-colors"
              >
                <td className="px-4 py-2 sm:px-6 sm:py-4">{cust.name}</td>
                <td className="px-4 py-2 sm:px-6 sm:py-4">{cust.email}</td>
                <td className="px-4 py-2 sm:px-6 sm:py-4">{cust.status}</td>
                <td className="px-4 py-2 sm:px-6 sm:py-4">{cust.sentAt}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>

    <DialogClose className="mt-4 bg-[var(--primary)] text-white px-4 py-2 rounded">
      Close
    </DialogClose>
  </DialogContent>
</Dialog>


                  {/* Edit button */}
                  <Button
                    variant="outline"
                    className="border-[var(--muted)]"
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
