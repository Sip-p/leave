import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { getStoredUser } from "../lib/api.js";
import toast from "react-hot-toast";
import DashboardLayout from "../components/DashboardLayout.jsx";
import {
  Clock,
  Users,
  CheckCircle,
  Calendar,
  MessageSquare,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Filter,
} from "lucide-react";

const ManagerDashboard = () => {
  const user = getStoredUser();
  const managerId = user?.id;

  const [pending, setPending] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [balances, setBalances] = useState([]);
  const [teamHistory, setTeamHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const fetchAllData = async () => {
    if (!managerId) return;
    setLoading(true);
    try {
      const [pendingRes, calendarRes, balanceRes, statsRes, historyRes] = await Promise.all([
        api.get(`/leave/pending/${managerId}`),
        api.get(`/leave/calendar/${managerId}`),
        api.get(`/leave/all-balances?managerId=${managerId}`),
        api.get(`/leave/manager-stats/${managerId}`),
        api.get(`/leave/team-history/${managerId}`),
      ]);
      setPending(pendingRes.data);
      setCalendar(calendarRes.data);
      setBalances(balanceRes.data);
      setStats(statsRes.data);
      setTeamHistory(historyRes.data);
    } catch (err) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [managerId]);

  const handleAction = async (id, status) => {
    const comment = comments[id] || "";
    try {
      await api.put(`/leave/update/${id}`, {
        status,
        managerId,
        rejectionReason: status === "rejected" ? comment : undefined,
      });
      toast.success(`Leave ${status}`);
      setComments((prev) => ({ ...prev, [id]: "" }));
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
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

  const filteredHistory = teamHistory.filter((item) => {
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    if (filterType !== "all" && item.leaveType !== filterType) return false;
    return true;
  });

  if (!managerId) return null;

  return (
    <DashboardLayout role="manager" title="Manager Dashboard">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-800">{stats.pendingCount}</p>
                    <p className="text-sm text-slate-500">Pending Requests</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-800">{stats.teamCount}</p>
                    <p className="text-sm text-slate-500">Team Members</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-800">{stats.approvedThisMonth}</p>
                    <p className="text-sm text-slate-500">Approved This Month</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Approval Panel */}
          <div id="approvals" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Leave Approval Panel</h2>
              {pending.length > 0 && (
                <span className="text-sm text-amber-600 font-medium">{pending.length} pending</span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["Employee", "Type", "From", "To", "Reason", "Comment", "Action"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-sm font-semibold text-slate-600">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pending.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500">
                        No pending requests
                      </td>
                    </tr>
                  ) : (
                    pending.map((req) => (
                      <tr key={req._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium">{req.requestedBy?.name}</td>
                        <td className="px-6 py-4 capitalize">{req.leaveType}</td>
                        <td className="px-6 py-4">{new Date(req.startDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{new Date(req.endDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">
                          {req.reason || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
                            <input
                              value={comments[req._id] || ""}
                              onChange={(e) =>
                                setComments((prev) => ({ ...prev, [req._id]: e.target.value }))
                              }
                              placeholder="Rejection reason (optional)"
                              className="w-40 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAction(req._id, "approved")}
                              className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(req._id, "rejected")}
                              className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                            >
                              <ThumbsDown className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Approved Leaves Calendar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                Team Leave Schedule
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["Employee", "Type", "From", "To"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-sm font-semibold text-slate-600">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calendar.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-slate-500">
                        No approved leaves
                      </td>
                    </tr>
                  ) : (
                    calendar.map((item) => (
                      <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium">{item.requestedBy?.name}</td>
                        <td className="px-6 py-4 capitalize">{item.leaveType}</td>
                        <td className="px-6 py-4">{new Date(item.startDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{new Date(item.endDate).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Employee Balances */}
          <div id="balances" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800">All Employee Leave Balances</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["Employee", "Type", "Total", "Used", "Remaining"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-sm font-semibold text-slate-600">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {balances.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-500">
                        No balance data
                      </td>
                    </tr>
                  ) : (
                    balances.map((b, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium">{b.employee_name}</td>
                        <td className="px-6 py-4">{b.leave_type}</td>
                        <td className="px-6 py-4">{b.yearly_quota}</td>
                        <td className="px-6 py-4 text-slate-600">{b.used_days}</td>
                        <td className="px-6 py-4 font-semibold text-teal-600">{b.remaining}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Team Leave History with Filters */}
          <div id="history" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-800">Team Leave History</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="all">All status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="all">All types</option>
                  <option value="casual">Casual</option>
                  <option value="sick">Sick</option>
                  <option value="earned">Earned</option>
                  <option value="WFH">WFH</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["Employee", "Type", "From", "To", "Status", "Reason"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-sm font-semibold text-slate-600">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500">
                        No leave history
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((item) => (
                      <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium">{item.requestedBy?.name}</td>
                        <td className="px-6 py-4 capitalize">{item.leaveType}</td>
                        <td className="px-6 py-4">{new Date(item.startDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{new Date(item.endDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusBadge(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">
                          {item.rejectionReason || item.reason || "—"}
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

export default ManagerDashboard;
