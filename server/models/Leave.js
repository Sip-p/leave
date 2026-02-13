import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  leaveType: {
    type: String,
    enum: ["casual", "sick", "earned","WFH"],
    required: true,
  },

  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  reason: { type: String },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  rejectionReason: {
    type: String,
    default: null,
  },

}, { timestamps: true });

export default mongoose.model("Leave", leaveSchema);
