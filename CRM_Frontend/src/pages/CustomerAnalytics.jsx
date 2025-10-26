import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import api from "@/utils/axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from "recharts";
import { Upload, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

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
import { Progress } from "@/components/ui/progress";

export default function CustomerAnalytics() {
  const [customers, setCustomers] = useState([]);
  const [q, setQ] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const fileInputRef = useRef(null);


  // Fetch enriched customers
  const fetchedOnce = useRef(false);
  useEffect(() => {
    if(fetchedOnce.current) return;
    fetchedOnce.current = true;
    const fetchEnrichedCustomers = async () => {
     toast.promise(
      api.post("/api/enrich/analyse-all"),
      {
        loading: "Fetching customer data...",
        success: (res) => {
          if (res.data && res.data.data) {
            setCustomers(res.data.data);
            return `Fetched ${res.data.data.length} customers successfully!`;
          }
          return "No customers found";
        },
        error: "Failed to fetch enriched customers",
      }
    );
    };
    fetchEnrichedCustomers();
  }, []);

  // Refs for charts
  const barChartRef = useRef(null);
  const areaChartRef = useRef(null);
  const pieChartRef = useRef(null);

  const [barKey, setBarKey] = useState(0);
  const [areaKey, setAreaKey] = useState(0);
  const [pieKey, setPieKey] = useState(0);

  const isBarChartInView = useInView(barChartRef, { once: false, amount: 0.7 });
  const isAreaChartInView = useInView(areaChartRef, { once: false, amount: 0.7 });
  const isPieChartInView = useInView(pieChartRef, { once: false, amount: 0.7 });

  useEffect(() => { if (isBarChartInView) setBarKey(prev => prev + 1); }, [isBarChartInView]);
  useEffect(() => { if (isAreaChartInView) setAreaKey(prev => prev + 1); }, [isAreaChartInView]);
  useEffect(() => { if (isPieChartInView) setPieKey(prev => prev + 1); }, [isPieChartInView]);

  // CSV upload
const handleFileUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setUploading(true);
  setUploadProgress(0);
  setUploadResult(null);

  try {
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/api/customer/insert-customers", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    clearInterval(progressInterval);
    setUploadProgress(100);

    if (res.data.success) {
      const inserted = res.data.data?.inserted || [];
      const duplicates = res.data.data?.duplicates || [];
      
      setUploadResult({
        success: res.data.success,
        uploaded: inserted,
        duplicates: duplicates,
        failed: res.data.data?.failed || [],
        uploadedCount: inserted.length,
        duplicateCount: duplicates.length,
        failedCount: (res.data.data?.failed || []).length
      });
      // Refresh customer list
      const refreshed = await api.post("/api/enrich/analyse-all");
      if (refreshed.data && refreshed.data.data) setCustomers(refreshed.data.data);

      setShowUploadDialog(true);
    } else {
      setUploadResult({
        success: false,
        error: res.data.message || "Failed to insert customers"
      });
      setShowUploadDialog(true);
    }
  } catch (err) {
    console.error("CSV upload error:", err);
    setUploadResult({
      success: false,
      error: err.response?.data?.message || "Failed to upload CSV"
    });
    setShowUploadDialog(true);
  } finally {
    setUploading(false);
    setTimeout(() => setUploadProgress(0), 1000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }
};


  // Derived metrics
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.is_active).length;
    const totalSpent = customers.reduce((s, c) => s + (c.stats?.total_spent || 0), 0);
    const avgSpend = total ? Math.round(totalSpent / total) : 0;
    const avgOrders = total ? (customers.reduce((s, c) => s + (c.stats?.order_count || 0), 0) / total).toFixed(1) : 0;
    const avgChurn = total ? (customers.reduce((s, c) => s + (c.churn_probability || 0), 0) / total) : 0;
    return { total, active, totalSpent, avgSpend, avgOrders, avgChurn: Number(avgChurn.toFixed(2)) };
  }, [customers]);

  const tagDistribution = useMemo(() => {
    const map = {};
    customers.forEach((c) => (c.tags || []).forEach((t) => { map[t] = (map[t] || 0) + 1; }));
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [customers]);

  const spendData = useMemo(() => customers.map((c) => ({
    name: c.name,
    spent: c.stats?.total_spent || 0,
    orders: c.stats?.order_count || 0,
  })), [customers]);

  const timelineData = useMemo(() => {
    const monthMap = {};
    customers.forEach((c) => {
      const d = c.stats?.last_purchase ? new Date(c.stats.last_purchase) : null;
      const key = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` : "No Purchase";
      monthMap[key] = (monthMap[key] || 0) + (c.stats?.total_spent || 0);
    });
    const arr = Object.entries(monthMap).map(([k, v]) => ({ month: k, total: v }));
    arr.sort((a, b) => (a.month > b.month ? 1 : -1));
    if (arr.length === 0) return [{ month: "2025-01", total: 0 }, { month: "2025-02", total: 0 }, { month: "2025-03", total: 0 }];
    return arr;
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(qq) ||
        (c.email || "").toLowerCase().includes(qq) ||
        (c.phone || "").toLowerCase().includes(qq)
    );
  }, [q, customers]);

  const smallCard = "rounded-2xl p-4 sm:p-6 border border-[var(--muted)] bg-[var(--card)]";

  return (
    <main className="flex-1 p-4 sm:p-6 bg-[var(--background)] text-[var(--text)] transition-colors duration-300">
      {/* Header + CSV upload */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Customer Analytics</h1>
          <p className="text-sm text-[var(--text)] mt-1">Overview of customer health, segmentation and recommendations</p>
        </div>
        <div className="flex items-center gap-3">
          <Input placeholder="Search customers..." value={q} onChange={(e) => setQ(e.target.value)}/>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" style={{ display: 'none' }}/>
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2">
            <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload CSV'}
          </Button>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {uploading && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl bg-[var(--card)] border border-[var(--muted)] p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text)]">Uploading CSV...</span>
            <span className="text-sm font-medium text-[var(--text)]">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </motion.div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div whileHover={{ y: -4 }} className={smallCard}>
          <CardHeader className="p-0"><CardTitle className="text-sm text-[var(--text)]">Total Customers</CardTitle></CardHeader>
          <CardContent className="p-0 mt-2">
            <div className="text-2xl sm:text-3xl font-semibold">{stats.total}</div>
            <div className="text-xs text-[var(--text)] mt-1">Active: {stats.active}</div>
          </CardContent>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className={smallCard}>
          <CardHeader className="p-0"><CardTitle className="text-sm text-[var(--text)]">Avg Spend</CardTitle></CardHeader>
          <CardContent className="p-0 mt-2">
            <div className="text-2xl sm:text-3xl font-semibold">₹{stats.avgSpend.toLocaleString()}</div>
            <div className="text-xs text-[var(--text)] mt-1">Total: ₹{stats.totalSpent.toLocaleString()}</div>
          </CardContent>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className={smallCard}>
          <CardHeader className="p-0"><CardTitle className="text-sm text-[var(--text)]">Avg Orders</CardTitle></CardHeader>
          <CardContent className="p-0 mt-2">
            <div className="text-2xl sm:text-3xl font-semibold">{stats.avgOrders}</div>
            <div className="text-xs text-[var(--text)] mt-1">Per customer</div>
          </CardContent>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className={smallCard}>
          <CardHeader className="p-0"><CardTitle className="text-sm text-[var(--text)]">Avg Churn Probability</CardTitle></CardHeader>
          <CardContent className="p-0 mt-2">
            <div className="text-2xl sm:text-3xl font-semibold">{Math.round(stats.avgChurn * 100)}%</div>
            <div className="text-xs text-[var(--text)] mt-1">Lower is better</div>
          </CardContent>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: spend bar + area timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div ref={barChartRef}>
            <Card className="rounded-2xl bg-[var(--card)] border border-[var(--muted)] overflow-hidden shadow-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm text-[var(--text)] opacity-70">Spend by Customer</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 text-[var(--text)]">
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%" key={barKey}>
                    <BarChart data={spendData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }} barGap={8}>
                      <defs>
                        <linearGradient id="spentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                          <stop offset="100%" stopColor="var(--purple-secondary)" stopOpacity={0.8} />
                        </linearGradient>
                        <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--blue-primary)" stopOpacity={1} />
                          <stop offset="100%" stopColor="var(--blue-secondary)" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" opacity={0.15} vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: "var(--text)", fontSize: 12 }} 
                        axisLine={{ stroke: "var(--muted)", strokeWidth: 1 }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: "var(--text)", fontSize: 12 }} 
                        axisLine={{ stroke: "var(--muted)", strokeWidth: 1 }}
                        tickLine={false}
                      />
                      <Tooltip 
                        cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                        contentStyle={{ 
                          background: "var(--card)", 
                          border: "1px solid var(--muted)",
                          borderRadius: "8px",
                          color: "var(--text)",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                        }}
                        labelStyle={{ color: "var(--text)", fontWeight: "600", marginBottom: "4px" }}
                        itemStyle={{ color: "var(--text)", padding: "2px 0" }}
                      />
                      <Legend 
                        wrapperStyle={{ color: "var(--text)", paddingTop: "10px" }} 
                        iconType="circle"
                      />
                      <Bar 
                        dataKey="spent" 
                        fill="url(#spentGradient)" 
                        radius={[8, 8, 0, 0]} 
                        name="Total Spent (₹)"
                        maxBarSize={60}
                        animationBegin={0}
                        animationDuration={800}
                        isAnimationActive={true}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div ref={areaChartRef}>
            <Card className="rounded-2xl bg-[var(--card)] border border-[var(--muted)] overflow-hidden">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm text-[var(--text)]">Purchase Timeline</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 text-[var(--text)]">
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%" key={areaKey}>
                    <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--green-primary)" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="var(--green-primary)" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{ fill: "var(--text)" }} />
                      <YAxis tick={{ fill: "var(--text)" }} />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--muted)" }} />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke="var(--green-primary)" 
                        fill="url(#colorTotal)"
                        animationBegin={0}
                        animationDuration={1000}
                        isAnimationActive={true}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right column: Pie (tags) + recommendations + customers table snippet */}
        <aside className="space-y-6">
          <div ref={pieChartRef}>
            <Card className="rounded-2xl bg-[var(--card)] border border-[var(--muted)] overflow-hidden">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm text-[var(--text)]">Tag Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%" key={pieKey}>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={tagDistribution}
                        innerRadius={48}
                        outerRadius={80}
                        paddingAngle={4}
                        label
                        animationBegin={0}
                        animationDuration={800}
                        isAnimationActive={true}
                      >
                        {tagDistribution.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={idx % 2 === 0 ? "var(--primary)" : "var(--secondary)"} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: "var(--card)", 
                          border: "1px solid var(--muted)",
                          borderRadius: "8px",
                          color: "var(--text)",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          padding: "8px 12px"
                        }}
                        itemStyle={{ color: "var(--text)", fontWeight: "500" }}
                      />
                      <Legend verticalAlign="bottom" wrapperStyle={{ color: "var(--muted)" }} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl bg-[var(--card)] border border-[var(--muted)]">
            <CardHeader className="p-4 sm:p-6 ">
              <CardTitle className="text-sm text-[var(--text)]">Top Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 text-[var(--text)]">
              {Array.from(
                new Set(customers.flatMap((c) => c.recommendations || ["No recommendations."]))
              ).map((rec, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-lg p-3 bg-[var(--background)]/30 border border-[var(--muted)]"
                >
                  <div className="text-sm">{rec}</div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-[var(--card)] border border-[var(--muted)] overflow-hidden">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm text-[var(--text)]">Recent Customers</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 text-[var(--text)]">
              <div className="flex flex-col gap-3">
                {customers.slice(0, 4).map((c) => (
                  <motion.button
                    key={c._id}
                    onClick={() => setSelectedCustomer(c)}
                    whileHover={{ x: 4 }}
                    className="text-left w-full rounded-md p-3 bg-[var(--background)]/20 border border-[var(--muted)]"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-[var(--text)]">{c.email}</div>
                      </div>
                      <div className="text-xs text-[var(--text)]">{c.stats?.total_spent ? `₹${c.stats.total_spent}` : "—"}</div>
                    </div>
                  </motion.button>
                ))}
                <Button variant="ghost" onClick={() => setSelectedCustomer(null)}>View All</Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Customers Table */}
      <div className="mt-6 rounded-2xl bg-[var(--card)] border border-[var(--muted)] overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-[var(--muted)]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-[var(--text)]">All Customers</h3>
            <div className="text-xs text-[var(--text)]">Showing {filteredCustomers.length} results</div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm sm:text-base">
            <thead className="bg-[var(--muted)]/20">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">City</th>
                <th className="px-4 py-3 text-left">Orders</th>
                <th className="px-4 py-3 text-left">Spent</th>
                <th className="px-4 py-3 text-left">Churn %</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c._id} className="border-t border-[var(--muted)] hover:bg-[var(--muted)]/10 transition-colors">
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3">{c.address?.city || "—"}</td>
                  <td className="px-4 py-3">{c.stats?.order_count ?? 0}</td>
                  <td className="px-4 py-3">₹{(c.stats?.total_spent || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">{Math.round((c.churn_probability || 0) * 100)}%</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="border-[var(--muted)] text-[var(--text)]">View</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg bg-[var(--card)] border border-[var(--muted)]">
                          <DialogHeader>
                            <DialogTitle className="text-[var(--text)]">{c.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2 text-[var(--text)]">
                            <div><strong>Email:</strong> {c.email}</div>
                            <div><strong>Phone:</strong> {c.phone}</div>
                            <div><strong>City:</strong> {c.address?.city}</div>
                            <div><strong>Occupation:</strong> {c.demographics?.occupation}</div>
                            <div><strong>Orders:</strong> {c.stats?.order_count}</div>
                            <div><strong>Total Spent:</strong> ₹{c.stats?.total_spent}</div>
                            <div><strong>Churn Prob:</strong> {Math.round((c.churn_probability || 0) * 100)}%</div>
                            <div><strong>Recommendations:</strong>
                              <ul className="list-disc pl-5">
                                {(c.recommendations || []).map((r, i) => <li key={i}>{r}</li>)}
                              </ul>
                            </div>
                          </div>
                          <DialogClose className="mt-4 bg-[var(--primary)] text-white px-4 py-2 rounded hover:bg-[var(--primary)]/90">Close</DialogClose>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected customer quick drawer */}
      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-md bg-[var(--card)] border border-[var(--muted)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--text)]">{selectedCustomer?.name || "Customer"}</DialogTitle>
          </DialogHeader>
          {selectedCustomer ? (
            <div className="space-y-3 text-[var(--text)]">
              <div><strong>Email:</strong> {selectedCustomer.email}</div>
              <div><strong>Phone:</strong> {selectedCustomer.phone}</div>
              <div><strong>City:</strong> {selectedCustomer.address?.city}</div>
              <div><strong>Tags:</strong> {(selectedCustomer.tags || []).join(", ")}</div>
              <div><strong>Churn Prob:</strong> {Math.round((selectedCustomer.churn_probability || 0) * 100)}%</div>
              <div><strong>Recommendations:</strong>
                <ul className="list-disc pl-5">
                  {(selectedCustomer.recommendations || []).map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-[var(--text)]">No customer selected</div>
          )}
          <DialogClose className="mt-4 bg-[var(--primary)] text-white px-4 py-2 rounded hover:bg-[var(--primary)]/90">Close</DialogClose>
        </DialogContent>
      </Dialog>

      {/* Upload Result Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto bg-[var(--card)] border border-[var(--muted)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[var(--text)]">
              {uploadResult?.success ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Upload Complete
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Upload Failed
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {uploadResult?.success ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg p-4 bg-green-500/10 border border-green-500/20">
                  <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
                    {uploadResult.uploadedCount}
                  </div>
                  <div className="text-sm text-[var(--text)] mt-1">Successfully Uploaded</div>
                </div>
                <div className="rounded-lg p-4 bg-yellow-500/10 border border-yellow-500/20">
                  <div className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                    {uploadResult.duplicateCount}
                  </div>
                  <div className="text-sm text-[var(--text)] mt-1">Duplicates Skipped</div>
                </div>
                <div className="rounded-lg p-4 bg-red-500/10 border border-red-500/20">
                  <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
                    {uploadResult.failedCount}
                  </div>
                  <div className="text-sm text-[var(--text)] mt-1">Failed</div>
                </div>
              </div>

              {/* Uploaded Customers */}
              {uploadResult.uploaded.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Uploaded Customers ({uploadResult.uploadedCount})
                  </h3>
                  <div className="rounded-lg border border-[var(--muted)] overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[var(--muted)]/20 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-[var(--text)]">Name</th>
                            <th className="px-3 py-2 text-left text-[var(--text)]">Email</th>
                            <th className="px-3 py-2 text-left text-[var(--text)]">Phone</th>
                            <th className="px-3 py-2 text-left text-[var(--text)]">City</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadResult.uploaded.map((customer, idx) => (
                            <tr key={idx} className="border-t border-[var(--muted)] hover:bg-[var(--muted)]/10">
                              <td className="px-3 py-2 text-[var(--text)]">{customer.name}</td>
                              <td className="px-3 py-2 text-[var(--text)]">{customer.email}</td>
                              <td className="px-3 py-2 text-[var(--text)]">{customer.phone || '—'}</td>
                              <td className="px-3 py-2 text-[var(--text)]">{customer.address?.city || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Duplicate Customers */}
              {uploadResult.duplicates.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    Duplicate Customers - Skipped ({uploadResult.duplicateCount})
                  </h3>
                  <div className="rounded-lg border border-[var(--muted)] overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[var(--muted)]/20 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-[var(--text)]">Name</th>
                            <th className="px-3 py-2 text-left text-[var(--text)]">Email</th>
                            <th className="px-3 py-2 text-left text-[var(--text)]">Phone</th>
                            <th className="px-3 py-2 text-left text-[var(--text)]">Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadResult.duplicates.map((dup, idx) => (
                            <tr key={idx} className="border-t border-[var(--muted)] hover:bg-[var(--muted)]/10">
                              <td className="px-3 py-2 text-[var(--text)]">{dup.name}</td>
                              <td className="px-3 py-2 text-[var(--text)]">{dup.email}</td>
                              <td className="px-3 py-2 text-[var(--text)]">{dup.phone || '—'}</td>
                              <td className="px-3 py-2 text-yellow-600 dark:text-yellow-400 text-xs">
                                {dup.reason || 'Already exists'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Failed Customers */}
              {uploadResult.failed.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Failed Uploads ({uploadResult.failedCount})
                  </h3>
                  <div className="rounded-lg border border-[var(--muted)] overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[var(--muted)]/20 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-[var(--text)]">Name</th>
                            <th className="px-3 py-2 text-left text-[var(--text)]">Email</th>
                            <th className="px-3 py-2 text-left text-[var(--text)]">Phone</th>
                            <th className="px-3 py-2 text-left text-[var(--text)]">Error</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadResult.failed.map((fail, idx) => (
                            <tr key={idx} className="border-t border-[var(--muted)] hover:bg-[var(--muted)]/10">
                              <td className="px-3 py-2 text-[var(--text)]">{fail.name}</td>
                              <td className="px-3 py-2 text-[var(--text)]">{fail.email}</td>
                              <td className="px-3 py-2 text-[var(--text)]">{fail.phone || '—'}</td>
                              <td className="px-3 py-2 text-red-600 dark:text-red-400 text-xs">
                                {fail.error || 'Validation failed'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-[var(--text)] text-lg font-medium mb-2">Upload Failed</p>
              <p className="text-[var(--text)] opacity-70">{uploadResult?.error || 'An error occurred during upload'}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--muted)]">
            <Button 
              onClick={() => setShowUploadDialog(false)}
              className="bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}