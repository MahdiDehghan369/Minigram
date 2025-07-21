const Comment = require("./../models/comment.model");
const Like = require("./../models/like.model");

const buildCommentTree = async (topLevelComments, userId) => {
  const parentIds = topLevelComments.map((c) => c._id);

  const replies = await Comment.find({ parent: { $in: parentIds } })
    .populate("author", "username avatar")
    .lean();

  const allCommentIds = [
    ...topLevelComments.map((c) => c._id),
    ...replies.map((r) => r._id),
  ];


  const likesByUser = await Like.find({
    item: { $in: allCommentIds },
    itemType: "comment",
    user: userId,
  }).lean();

  

  const likeMap = new Map();
  likesByUser.forEach((like) => {
    likeMap.set(like.item.toString(), like.status);
  });


  const likeCounts = await Like.aggregate([
    {
      $match: {
        item: { $in: allCommentIds },
        itemType: "comment",
      },
    },
    {
      $group: {
        _id: { item: "$item", status: "$status" },
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map();
  likeCounts.forEach((entry) => {
    const key = `${entry._id.item}_${entry._id.status}`;
    countMap.set(key, entry.count);
  });

  const repliesMap = new Map();
  for (let reply of replies) {
    const parentId = reply.parent.toString();
    if (!repliesMap.has(parentId)) repliesMap.set(parentId, []);
    reply.likeStatus = likeMap.get(reply._id.toString()) || null;
    reply.countLikes = countMap.get(`${reply._id}_like`) || 0;
    reply.countDislikes = countMap.get(`${reply._id}_dislike`) || 0;
    repliesMap.get(parentId).push(reply);
  }

  for (let comment of topLevelComments) {
    const id = comment._id.toString();
    comment.replies = repliesMap.get(id) || [];
    comment.likeStatus = likeMap.get(id) || null;
    comment.countLikes = countMap.get(`${id}_like`) || 0;
    comment.countDislikes = countMap.get(`${id}_dislike`) || 0;
  }

  return topLevelComments;
};

module.exports = buildCommentTree;
