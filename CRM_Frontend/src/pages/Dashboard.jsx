import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import api from "@/utils/axios";
import { NavLink } from "react-router-dom";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [segmentDetails, setSegmentDetails] = useState({});
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(false);
  const [segmentLoading, setSegmentLoading] = useState({});
  const [logLoading, setLogLoading] = useState({});

  // Fetch all campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/user/get-campaign");
        if (res.data.success && res.data.data) {
          setCampaigns(res.data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  // Fetch segment details
  const fetchSegmentDetails = async (segmentId) => {
    if (segmentDetails[segmentId]) return;
    setSegmentLoading((prev) => ({ ...prev, [segmentId]: true }));
    try {
      const res = await api.get(`/api/user/get-segment`, { params: { id: segmentId } });
      if (res.data.data) {
        setSegmentDetails((prev) => ({ ...prev, [segmentId]: res.data.data }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch segment details");
    } finally {
      setSegmentLoading((prev) => ({ ...prev, [segmentId]: false }));
    }
  };

  // Fetch communication logs
  const fetchLogs = async (campaignId) => {
    if (logs[campaignId]) return;
    setLogLoading((prev) => ({ ...prev, [campaignId]: true }));
    try {
      const res = await api.get(`/api/user/get-log?campaignId=${campaignId}`);
      if (res.data?.data) {
        setLogs((prev) => ({ ...prev, [campaignId]: res.data.data }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch communication logs");
    } finally {
      setLogLoading((prev) => ({ ...prev, [campaignId]: false }));
    }
  };

  if (loading) {
    return (
      <main className="flex-1 bg-[var(--background)] flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[var(--muted)] border-t-[var(--primary)] rounded-full animate-spin"></div>
          <p className="text-[var(--text)] text-lg">Loading campaigns...</p>
        </div>
      </main>
    );
  }

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
          <p className="text-2xl sm:text-3xl font-semibold text-[var(--primary)]">
            {campaigns.length}
          </p>
        </div>
        <div className="rounded-2xl bg-[var(--card)] p-4 sm:p-6 border border-[var(--muted)]">
          <p className="text-sm text-[var(--text)] mb-1">Active</p>
          <p className="text-2xl sm:text-3xl font-semibold text-[var(--primary)]">
            {campaigns.filter((c) => c.status.toLowerCase() === "active").length}
          </p>
        </div>
        <div className="rounded-2xl bg-[var(--card)] p-4 sm:p-6 border border-[var(--muted)]">
          <p className="text-sm text-[var(--text)] mb-1">Paused</p>
          <p className="text-2xl sm:text-3xl font-semibold text-[var(--primary)]">
            {campaigns.filter((c) => c.status.toLowerCase() === "paused").length}
          </p>
        </div>
        <div className="rounded-2xl bg-[var(--card)] p-4 sm:p-6 border border-[var(--muted)]">
          <p className="text-sm text-[var(--text)] mb-1">Completed</p>
          <p className="text-2xl sm:text-3xl font-semibold text-[var(--secondary)]">
            {campaigns.filter((c) => c.status.toLowerCase() === "completed").length}
          </p>
        </div>
      </div>

      {/* Campaign Table */}
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
                <td className="px-4 py-2 sm:px-6 sm:py-4 capitalize">
                  <span
                    className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium text-white"
                    style={{
                      backgroundColor:
                        c.status.toLowerCase() === "active"
                          ? "var(--green-primary)"
                          : c.status.toLowerCase() === "paused"
                          ? "var(--orange-primary)"
                          : "var(--secondary)",
                    }}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-2 sm:px-6 sm:py-4">
                  {c.stats?.total_recipients || "-"}
                </td>
                <td className="px-4 py-2 sm:px-6 sm:py-4">
                  {c.stats?.delivery_rate
                    ? `${c.stats.delivery_rate}%`
                    : "N/A"}
                </td>
                <td className="px-4 py-2 sm:px-6 sm:py-4">
                  {new Date(c.started_at).toLocaleDateString()}
                </td>

                <td className="px-4 py-2 sm:px-6 sm:py-4 flex flex-wrap gap-2">
                  {/* Segment Dialog */}
                  <Dialog
                    onOpenChange={(open) =>
                      open && fetchSegmentDetails(c.segment_id?._id)
                    }
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-[var(--primary)] text-[var(--primary)]"
                      >
                        View Segment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>
                          {segmentDetails[c.segment_id?._id]?.name || "Loading..."} - Segment Details
                        </DialogTitle>
                      </DialogHeader>

                      {segmentLoading[c.segment_id?._id] ? (
                        <div className="flex justify-center items-center py-6">
                          <div className="w-10 h-10 border-4 border-[var(--muted)] border-t-[var(--primary)] rounded-full animate-spin"></div>
                        </div>
                      ) : segmentDetails[c.segment_id?._id] ? (
                        <div className="mt-2 space-y-2 text-sm text-[var(--text)]">
                          <p><strong>Description:</strong> {segmentDetails[c.segment_id?._id]?.description || "-"}</p>
                          <p><strong>Total People:</strong> {segmentDetails[c.segment_id?._id]?.estimated_count || "-"}</p>
                          <p><strong>Created At:</strong> {new Date(segmentDetails[c.segment_id?._id]?.created_at).toLocaleString()}</p>
                          <div>
                            <strong>Rules:</strong>
                            {segmentDetails[c.segment_id?._id]?.rules?.rules?.length > 0 ? (
                              <ul className="list-disc pl-6 mt-1">
                                {segmentDetails[c.segment_id?._id].rules.rules.map((rule, idx) => (
                                  <li key={idx}>
                                    {rule.field} {rule.operator} "{rule.value}"
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="mt-1 text-[var(--text-muted)]">No rules defined</p>
                            )}
                            <p className="mt-1"><strong>Condition:</strong> {segmentDetails[c.segment_id?._id]?.rules?.condition || "N/A"}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-[var(--text-muted)]">
                          No segment details found.
                        </p>
                      )}

                      <div className="mt-6 flex justify-between">
                        <DialogClose className="bg-[var(--muted)] text-[var(--text)] px-4 py-2 rounded">
                          Close
                        </DialogClose>

                        <Button asChild className="bg-[var(--primary)] text-white px-4 py-2 rounded">
                          <NavLink
                            to={`/segment-customers/${c.segment_id?._id}`}
                            state={{ segmentId: c.segment_id?._id }}
                          >
                            Analyse Customers
                          </NavLink>
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Communication Logs Dialog */}
                  <Dialog onOpenChange={(open) => open && fetchLogs(c._id)}>
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
                              <SelectItem value="sent">Sent</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </DialogHeader>

                      {logLoading[c._id] ? (
                        <div className="flex justify-center items-center py-6">
                          <div className="w-10 h-10 border-4 border-[var(--muted)] border-t-[var(--primary)] rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <div className="mt-4 overflow-x-auto">
                          <table className="min-w-full text-sm sm:text-base text-left">
                            <thead className="bg-[var(--muted)]/40">
                              <tr>
                                <th className="px-4 py-2 sm:px-6 sm:py-3 font-medium">Customer ID</th>
                                <th className="px-4 py-2 sm:px-6 sm:py-3 font-medium">Channel</th>
                                <th className="px-4 py-2 sm:px-6 sm:py-3 font-medium">Status</th>
                                <th className="px-4 py-2 sm:px-6 sm:py-3 font-medium">Sent At</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(logs[c._id] || [])
                                .filter((log) =>
                                  log.customer?.name
                                    ?.toLowerCase()
                                    .includes(search.toLowerCase())
                                )
                                .filter((log) =>
                                  statusFilter === "all" || !statusFilter
                                    ? true
                                    : log.status.toLowerCase() ===
                                      statusFilter.toLowerCase()
                                )
                                .map((log, idx) => (
                                  <tr
                                    key={idx}
                                    className="border-t border-[var(--muted)] hover:bg-[var(--muted)]/20 transition-colors"
                                  >
                                    <td className="px-4 py-2 sm:px-6 sm:py-4">
                                      {log.customer?.name || "-"}
                                    </td>
                                    <td className="px-4 py-2 sm:px-6 sm:py-4">
                                      {log.customer?.email || "-"}
                                    </td>
                                    <td className="px-4 py-2 sm:px-6 sm:py-4">
                                      {log.status}
                                    </td>
                                    <td className="px-4 py-2 sm:px-6 sm:py-4">
                                      {new Date(
                                        log.sent_at
                                      ).toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <DialogClose className="mt-4 bg-[var(--primary)] text-white px-4 py-2 rounded">
                        Close
                      </DialogClose>
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
