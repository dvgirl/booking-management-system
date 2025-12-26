const Process = require("../models/ProcessTracker");
const Log = require("../models/ProcessLog");

exports.createProcess = async (req, res) => {
    try {
        const payload = {
            ...req.body,
            processType: req.body.type,
            createdBy: req.user.id
        };

        // remove empty bookingId
        if (!payload.bookingId) delete payload.bookingId;

        // remove empty assignedTo
        if (!payload.assignedTo) delete payload.assignedTo;

        const process = await Process.create(payload);

        await Log.create({
            processId: process._id,
            action: "CREATED",
            newStatus: process.status,
            performedBy: req.user.id
        });

        res.json(process);
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: error.message
        });
    }
};

exports.assignProcess = async (req, res) => {
    const process = await Process.findByIdAndUpdate(
        req.params.id,
        {
            assignedTo: req.body.assignedTo,
            status: "ASSIGNED"
        },
        { new: true }
    );

    await Log.create({
        processId: process._id,
        action: "ASSIGNED",
        newStatus: "ASSIGNED",
        performedBy: req.user.id
    });

    res.json(process);
};

exports.updateStatus = async (req, res) => {
    const process = await Process.findById(req.params.id);

    await Log.create({
        processId: process._id,
        action: "STATUS_UPDATED",
        oldStatus: process.status,
        newStatus: req.body.status,
        performedBy: req.user.id
    });

    process.status = req.body.status;
    await process.save();

    res.json(process);
};

exports.closeProcess = async (req, res) => {
    const process = await Process.findById(req.params.id);

    process.status = "CLOSED";
    process.closedBy = req.user.id;
    process.resolutionNote = req.body.resolutionNote;

    await process.save();

    await Log.create({
        processId: process._id,
        action: "CLOSED",
        newStatus: "CLOSED",
        performedBy: req.user.id
    });

    res.json({ message: "Process closed" });
};

// controllers/process.controller.js
exports.getProcessStats = async (req, res) => {
    try {
        const stats = await Process.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = {
            open: 0,
            inProgress: 0,
            completed: 0,
            cancelled: 0
        };

        stats.forEach(item => {
            if (item._id === "OPEN") result.open = item.count;
            if (item._id === "IN_PROGRESS") result.inProgress = item.count;
            if (item._id === "COMPLETED") result.completed = item.count;
            if (item._id === "CANCELLED") result.cancelled = item.count;
        });

        res.json(result);
    } catch (error) {
        console.error("Error getting process stats:", error);
        res.status(500).json({ message: "Failed to get stats" });
    }
};

exports.getProcessList = async (req, res) => {
    try {
      const { status } = req.query; // 👈 status filter
  
      const filter = {};
      if (status) {
        filter.status = status;
      }
  
      const processes = await Process.find(filter)
        .populate("assignedTo", "phone")
        .sort({ createdAt: -1 });
  
      res.json(processes);
    } catch (error) {
      console.error("Error fetching processes:", error);
      res.status(500).json({ message: "Failed to fetch processes" });
    }
  };

exports.getProcessDetails = async (req, res) => {
    const process = await Process.findById(req.params.id)
        .populate("createdBy assignedTo closedBy")
        .lean();
    const logs = await Log.find({ processId: req.params.id })
        .populate("performedBy")
        .sort({ createdAt: -1 });
    res.json({ process, logs });
}
