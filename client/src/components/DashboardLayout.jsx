import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard, Calendar, Users, BarChart3 } from "lucide-react";

const DashboardLayout = ({ children, role, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const empLinks = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/employee" },
    { label: "Apply Leave", icon: Calendar, path: null, scroll: "apply" },
  ];
  const mgrLinks = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/manager" },
    { label: "Approvals", icon: Calendar, path: null, scroll: "approvals" },
    { label: "Team Balances", icon: Users, path: null, scroll: "balances" },
    { label: "Leave History", icon: BarChart3, path: null, scroll: "history" },
  ];
  const links = role === "manager" ? mgrLinks : empLinks;

  const handleNav = (link) => {
    if (link.path) navigate(link.path);
    if (link.scroll) {
      const el = document.getElementById(link.scroll);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 text-white fixed inset-y-0 left-0 z-30">
        <div className="p-6 border-b border-slate-700">
          <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            E-Leave
          </span>
          <p className="text-slate-400 text-sm mt-1 capitalize">{role} Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNav(link)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="px-4 py-2 text-sm text-slate-400 truncate">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-50 transform transition lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex justify-between items-center border-b border-slate-700">
          <span className="font-bold text-teal-400">E-Leave</span>
          <button onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNav(link)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="hidden sm:inline">{user?.name}</span>
            <span className="bg-slate-100 px-2 py-1 rounded capitalize text-xs">{user?.role}</span>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
