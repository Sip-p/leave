import { useState, useEffect } from "react";
import { api } from "../lib/api.js";
import { getStoredUser } from "../lib/api.js";
import toast from "react-hot-toast";
import DashboardLayout from "../components/DashboardLayout.jsx";
import {
  Calendar,
  TrendingUp,
  Clock,
  XCircle,
  Plus,
  Trash2,
  Loader2,
  FileText,
} from "lucide-react";

const API = api;

const EmployeeDashboard = () => {
  const user = getStoredUser();
  const userId = user?.id;

  const [leaveData, setLeaveData] = useState([]);
  const [balance, setBalance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const fetchData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [leavesRes, balanceRes, statsRes] = await Promise.all([
        API.get(`/leave/my-leaves/${userId}`),
        API.get(`/leave/balance/${userId}`),
        API.get(`/leave/stats/${userId}`),
      ]);
      setLeaveData(leavesRes.data);
      setBalance(balanceRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/leave/apply", { ...form, userId });
      toast.success("Leave applied successfully");
      setForm({ leaveType: "", startDate: "", endDate: "", reason: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply leave");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Cancel this leave request?")) return;
    setCancelling(id);
    try {
      await API.delete(`/leave/cancel/${id}`, { data: { userId } });
      toast.success("Leave cancelled");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel");
    } finally {
      setCancelling(null);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      approved: "bg-emerald-100 text-emerald-700",
      rejected: "bg-red-100 text-red-700",
      pending: "bg-amber-100 text-amber-700",
    };
    return styles[status] || "bg-slate-100 text-slate-700";
  };

  if (!userId) return null;

  return (
    <DashboardLayout role="employee" title="Employee Dashboard">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
                    <p className="text-sm text-slate-500">Pending</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stats.approved}</p>
                    <p className="text-sm text-slate-500">Approved</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stats.rejected}</p>
                    <p className="text-sm text-slate-500">Rejected</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stats.totalRemaining}</p>
                    <p className="text-sm text-slate-500">Days Left</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Apply Leave Form */}
            <div id="apply" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-teal-600" />
                  Apply for Leave
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
                  <select
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    value={form.leaveType}
                    required
                    onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                  >
                    <option value="">Select type</option>
                    <option value="sick">Sick Leave</option>
                    <option value="casual">Casual Leave</option>
                    <option value="earned">Earned Leave</option>
                    <option value="WFH">WFH</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                      value={form.startDate}
                      required
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                      value={form.endDate}
                      required
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                  <textarea
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                    placeholder="Optional"
                    rows={3}
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ leaveType: "", startDate: "", endDate: "", reason: "" })}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* Leave Balance */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h2 className="text-lg font-semibold text-slate-800">My Leave Balance</h2>
              </div>
              <div className="p-6">
                {balance.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No balance data</p>
                ) : (
                  <div className="space-y-3">
                    {balance.map((b, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <span className="font-medium text-slate-700">{b.leave_type}</span>
                        <div className="flex gap-4 text-sm">
                          <span className="text-slate-500">
                            {b.used_days}/{b.yearly_quota} used
                          </span>
                          <span className="font-semibold text-teal-600">{b.remaining} left</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* My Leave Requests */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                My Leave Requests
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Type</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">From</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">To</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Status</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-500">
                        No leave requests yet
                      </td>
                    </tr>
                  ) : (
                    leaveData.map((leave) => (
                      <tr key={leave._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4 capitalize">{leave.leaveType}</td>
                        <td className="px-6 py-4">{new Date(leave.startDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{new Date(leave.endDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusBadge(
                              leave.status
                            )}`}
                          >
                            {leave.status}
                          </span>
                          {leave.rejectionReason && leave.status === "rejected" && (
                            <p className="text-xs text-slate-500 mt-1">{leave.rejectionReason}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {leave.status === "pending" && (
                            <button
                              onClick={() => handleCancel(leave._id)}
                              disabled={cancelling === leave._id}
                              className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
                            >
                              {cancelling === leave._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
