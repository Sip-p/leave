import React from "react";
import Navbar from "../components/Navbar.jsx";
import HeroIllustration from "../components/HeroIllustration.jsx";
import { Calendar, CheckCircle, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const features = [
    {
      icon: Calendar,
      title: "Apply & Track Leave",
      desc: "Submit leave requests and track approval status in real-time.",
    },
    {
      icon: CheckCircle,
      title: "Manager Approvals",
      desc: "Managers review and approve or reject requests with comments.",
    },
    {
      icon: Users,
      title: "Team Visibility",
      desc: "View team leave balances and schedules at a glance.",
    },
    {
      icon: Zap,
      title: "Fast & Simple",
      desc: "Streamlined workflow for employees and managers.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-white space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Employee Leave
              <span className="block text-cyan-200">Management System</span>
            </h1>
            <p className="text-lg text-slate-200 max-w-xl leading-relaxed">
              A modern platform for employees to request leave and for managers to approve or reject efficiently. Track balances, view calendars, and stay in sync.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-900 font-semibold rounded-xl hover:bg-cyan-50 transition shadow-lg"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/60 text-white font-semibold rounded-xl hover:bg-white/10 transition"
              >
                Create Account
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <HeroIllustration className="drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-slate-800 mb-10 text-center">Why E-Leave?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition animate-fade-in"
              style={{ animationDelay: `${0.05 * i}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
