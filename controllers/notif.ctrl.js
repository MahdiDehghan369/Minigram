const { successResponse, errorResponse } = require("../utils/responses");
const Notif = require("./../models/notif.model");

const validatorObjetId = require("./../validators/validatorObjetId");

exports.getAllNotifs = async (req, res, next) => {
  try {
    const userId = req?.user?.id;
    const { type, isRead, page = 1, limit = 10 } = req.query;

    const filter = { user: userId };
    if (type !== undefined) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === "true";

    const skip = (page - 1) * limit;

    const notifs = await Notif.find(filter)
      .populate("sender", "username avatar")
      .populate({
        path: "item",
        populate: { path: "author", select: "username avatar" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Notif.countDocuments(filter);

    return successResponse(res, 200, "Successfully :)", {
      notifs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

exports.getNotif = async (req, res, next) => {
  try {
    const userId = req?.user?.id;

    const { notifId } = req.params;

    validatorObjetId(res, "Notif", notifId);

    const getNotifInfo = await Notif.findOne({ _id: notifId, user: userId })
      .populate("sender", "username avatar")
      .populate({
        path: "item",
        populate: { path: "author", select: "username avatar" },
      });

    if (!getNotifInfo) {
      return errorResponse(res, 404, "Notif not found :(");
    }

    getNotifInfo.isRead = true;

    await getNotifInfo.save();

    return successResponse(res, 200, "Successfully :)", {
      notif: getNotifInfo,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeNotif = async (req, res, next) => {
  try {
    const userId = req?.user?.id;

    const { notifId } = req.params;

    validatorObjetId(res, "Notif", notifId);

    const foundNotif = await Notif.findOneAndDelete({
      _id: notifId,
      user: userId,
    });

    if (!foundNotif) {
      return errorResponse(res, 404, "Notif not found :(");
    }

    return successResponse(res, 200, "Notif removed successfully :)");
  } catch (error) {
    next(error);
  }
};

exports.removeAllNotifs = async (req, res, next) => {
  try {
    const userId = req?.user?.id;

    const result = await Notif.deleteMany({ user: userId });

    if (result.deletedCount === 0) {
      return errorResponse(res, 400, "There is no notif :)");
    }

    return successResponse(res, 200, "All notifs removed successfully :)");
  } catch (error) {
    next(error);
  }
};

