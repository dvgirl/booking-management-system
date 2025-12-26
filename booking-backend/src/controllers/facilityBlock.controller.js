const FacilityBlock = require("../models/FacilityBlock");

exports.blockFacility = async (req, res) => {
  const { roomId, fromDate, toDate, reason } = req.body;

  const block = await FacilityBlock.create({
    roomId,
    fromDate,
    toDate,
    reason,
    virtualAccountId: req.user.virtualAccountId
  });

  res.json({
    message: "Facility blocked",
    block
  });
};
