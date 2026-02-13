import express from "express";
import {
  applyLeave,
  getMyLeaves,
  getPendingLeaves,
  updateLeaveStatus,
  getLeaveBalance,
  getLeaveCalendar,
  getAllEmployeeBalances,
  cancelLeave,
  getEmployeeStats,
  getManagerStats,
  getTeamLeaveHistory,
} from "../controllers/leaveController.js";

const router = express.Router();

//  EMPLOYEE ROUTES
router.post("/apply", applyLeave);
router.get("/my-leaves/:userId", getMyLeaves);
router.get("/balance/:userId", getLeaveBalance);
router.get("/calendar/:managerId", getLeaveCalendar);
router.get("/stats/:userId", getEmployeeStats);
router.delete("/cancel/:id", cancelLeave);

//  MANAGER ROUTES
router.get("/pending/:managerId", getPendingLeaves);
router.put("/update/:id", updateLeaveStatus);
router.get("/all-balances", getAllEmployeeBalances);
router.get("/manager-stats/:managerId", getManagerStats);
router.get("/team-history/:managerId", getTeamLeaveHistory);

export default router;
