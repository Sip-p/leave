import User from "../models/User.js";
import Leave from "../models/Leave.js";
 

 //   APPLY LEAVE (EMPLOYEE)
 
export const applyLeave = async (req, res) => {
  const { userId, leaveType, startDate, endDate, reason } = req.body;

  if (!userId || !leaveType || !startDate || !endDate) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (end < start) {
      return res.status(400).json({
        message: "End date must be on or after start date",
      });
    }
    if (start < today) {
      return res.status(400).json({
        message: "Cannot apply for past dates",
      });
    }

    //   Find employee
    const employee = await User.findById(userId);
    if (!employee || employee.role !== "employee") {
      return res.status(403).json({ message: "Only employees can apply leave" });
    }

    //   Find employee's manager
    const manager = await User.findOne({
      email: employee.managerEmail,
      role: "manager",
    });

    if (!manager) {
      return res.status(400).json({ message: "Manager not found" });
    }

    //   Create leave linked to THIS manager only
    const newLeave = await Leave.create({
      requestedBy: userId,
      manager: manager._id,      
      leaveType,
      startDate,
      endDate,
      reason,
      status: "pending",
    });

    res.status(201).json({
      message: "Leave request sent to manager",
      leave: newLeave,
    });

  } catch (error) {
    console.log("❌ Apply Leave Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};





 //   MY LEAVES (EMPLOYEE)
 
export const getMyLeaves = async (req, res) => {
  const { userId } = req.params;

  try {
    const leaves = await Leave.find({ requestedBy: userId })
      .populate("requestedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(leaves);
  } catch (error) {
    console.log("❌ Get My Leaves Error:", error);
    res.status(500).json({ message: "Failed to fetch leaves" });
  }
};




 //   GET ALL PENDING LEAVES (MANAGER)
 
export const getPendingLeaves = async (req, res) => {
  const { managerId } = req.params;    
  try {
    const pending = await Leave.find({
      status: "pending",
      manager: managerId,   
    })
      .populate("requestedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(pending);
  } catch (error) {
    console.log("❌ Get Pending Leaves Error:", error);
    res.status(500).json({ message: "Failed to fetch pending leaves" });
  }
};





 //   MANAGER — APPROVE OR REJECT LEAVE
 
export const updateLeaveStatus = async (req, res) => {
  const { id } = req.params;
  const { status, managerId, rejectionReason } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    //  Ensure manager owns this leave
    const leave = await Leave.findOne({
      _id: id,
      manager: managerId,
    });

    if (!leave) {
      return res.status(403).json({
        message: "You are not authorized to update this leave",
      });
    }

    leave.status = status;
    leave.approvedBy = managerId;
    if (status === "rejected" && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }
    await leave.save();

    res.status(200).json({
      message: `Leave ${status} successfully`,
      leave,
    });

  } catch (error) {
    console.log("❌ Update Leave Status Error:", error);
    res.status(500).json({ message: "Failed to update leave status" });
  }
};





 //   LEAVE CALENDAR — ALL APPROVED LEAVES
 
export const getLeaveCalendar = async (req, res) => {
  const { managerId } = req.params;
  
  try {
    const approvedLeaves = await Leave.find({ status: "approved" ,manager:managerId})
      .populate("requestedBy", "name email")
      .sort({ startDate: 1 });

    res.status(200).json(approvedLeaves);
  } catch (error) {
    console.log("❌ Calendar Error:", error);
    res.status(500).json({ message: "Failed to fetch leave calendar" });
  }
};




 //   LEAVE BALANCE FOR EMPLOYEE
 
export const getLeaveBalance = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("leaveBalance name email");
    if (!user) return res.status(404).json({ message: "User not found" });

    const approvedLeaves = await Leave.find({
      requestedBy: userId,
      status: "approved",
    });

    const used = { casual: 0, sick: 0, earned: 0 };

    approvedLeaves.forEach((leave) => {
      if (!["casual", "sick", "earned"].includes(leave.leaveType)) return; // WFH doesn't deduct balance
      const days =
        (new Date(leave.endDate) - new Date(leave.startDate)) /
          (1000 * 60 * 60 * 24) +
        1;
      used[leave.leaveType] = (used[leave.leaveType] || 0) + days;
    });

    const remaining = {
      casual: user.leaveBalance.casual - used.casual,
      sick: user.leaveBalance.sick - used.sick,
      earned: user.leaveBalance.earned - used.earned,
    };

    
    const response = [
      {
        leave_type: "Casual Leave",
        yearly_quota: user.leaveBalance.casual,
        used_days: used.casual,
        remaining: remaining.casual,
      },
      {
        leave_type: "Sick Leave",
        yearly_quota: user.leaveBalance.sick,
        used_days: used.sick,
        remaining: remaining.sick,
      },
      {
        leave_type: "Earned Leave",
        yearly_quota: user.leaveBalance.earned,
        used_days: used.earned,
        remaining: remaining.earned,
      },
    ];

    res.status(200).json(response);

  } catch (error) {
    console.log("❌ Leave Balance Error:", error);
    res.status(500).json({ message: "Failed to fetch leave balance" });
  }
};





 //   MANAGER — ALL EMPLOYEE BALANCES (optionally filter by managerId)
 
export const getAllEmployeeBalances = async (req, res) => {
  try {
    let query = { role: "employee" };
    const { managerId } = req.query;
    if (managerId) {
      const manager = await User.findById(managerId);
      if (manager) query.managerEmail = manager.email;
    }
    const users = await User.find(query);

    const results = [];

    for (const user of users) {
      const approvedLeaves = await Leave.find({
        requestedBy: user._id,
        status: "approved",
      });

      const used = { casual: 0, sick: 0, earned: 0 };

      approvedLeaves.forEach((leave) => {
        if (!["casual", "sick", "earned"].includes(leave.leaveType)) return;
        const days =
          (new Date(leave.endDate) - new Date(leave.startDate)) /
            (1000 * 60 * 60 * 24) +
          1;
        used[leave.leaveType] = (used[leave.leaveType] || 0) + days;
      });

      const remaining = {
        casual: user.leaveBalance.casual - used.casual,
        sick: user.leaveBalance.sick - used.sick,
        earned: user.leaveBalance.earned - used.earned,
      };

      // PUSH 3 FLAT ROWS FOR REACT
      results.push(
        {
          employee_name: user.name,
          leave_type: "Casual Leave",
          yearly_quota: user.leaveBalance.casual,
          used_days: used.casual,
          remaining: remaining.casual,
        },
        {
          employee_name: user.name,
          leave_type: "Sick Leave",
          yearly_quota: user.leaveBalance.sick,
          used_days: used.sick,
          remaining: remaining.sick,
        },
        {
          employee_name: user.name,
          leave_type: "Earned Leave",
          yearly_quota: user.leaveBalance.earned,
          used_days: used.earned,
          remaining: remaining.earned,
        }
      );
    }

    // SEND ARRAY TO FRONTEND
    res.status(200).json(results);
  } catch (error) {
    console.log("❌ All Employee Balance Error:", error);
    res.status(500).json({ message: "Failed to fetch balances" });
  }
};

//   CANCEL LEAVE (EMPLOYEE — PENDING ONLY)
export const cancelLeave = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const leave = await Leave.findOne({ _id: id, requestedBy: userId });
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    if (leave.status !== "pending") {
      return res.status(400).json({ message: "Only pending leaves can be cancelled" });
    }
    await Leave.findByIdAndDelete(id);
    res.status(200).json({ message: "Leave cancelled successfully" });
  } catch (error) {
    console.log("❌ Cancel Leave Error:", error);
    res.status(500).json({ message: "Failed to cancel leave" });
  }
};

//   DASHBOARD STATS (EMPLOYEE)
export const getEmployeeStats = async (req, res) => {
  const { userId } = req.params;
  try {
    const [leaves, user] = await Promise.all([
      Leave.find({ requestedBy: userId }),
      User.findById(userId).select("leaveBalance"),
    ]);
    const pending = leaves.filter((l) => l.status === "pending").length;
    const approved = leaves.filter((l) => l.status === "approved").length;
    const rejected = leaves.filter((l) => l.status === "rejected").length;
    const approvedLeaves = leaves.filter((l) => l.status === "approved" && ["casual", "sick", "earned"].includes(l.leaveType));
    const used = { casual: 0, sick: 0, earned: 0 };
    approvedLeaves.forEach((leave) => {
      const days = Math.round((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
      used[leave.leaveType] += days;
    });
    const totalRemaining =
      (user?.leaveBalance?.casual || 0) - used.casual +
      (user?.leaveBalance?.sick || 0) - used.sick +
      (user?.leaveBalance?.earned || 0) - used.earned;
    res.status(200).json({
      pending,
      approved,
      rejected,
      totalLeaves: leaves.length,
      totalRemaining: Math.max(0, totalRemaining),
    });
  } catch (error) {
    console.log("❌ Employee Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

//   DASHBOARD STATS (MANAGER)
export const getManagerStats = async (req, res) => {
  const { managerId } = req.params;
  try {
    const manager = await User.findById(managerId);
    if (!manager) return res.status(404).json({ message: "Manager not found" });

    const [pendingCount, teamCount, approvedThisMonth] = await Promise.all([
      Leave.countDocuments({ status: "pending", manager: managerId }),
      User.countDocuments({ role: "employee", managerEmail: manager.email }),
      Leave.countDocuments({
        status: "approved",
        manager: managerId,
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      }),
    ]);
    res.status(200).json({
      pendingCount,
      teamCount,
      approvedThisMonth,
    });
  } catch (error) {
    console.log("❌ Manager Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

//   MANAGER — ALL LEAVE HISTORY (team)
export const getTeamLeaveHistory = async (req, res) => {
  const { managerId } = req.params;
  try {
    const leaves = await Leave.find({ manager: managerId })
      .populate("requestedBy", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (error) {
    console.log("❌ Team Leave History Error:", error);
    res.status(500).json({ message: "Failed to fetch history" });
  }
};

