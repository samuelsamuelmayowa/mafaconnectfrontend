const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
// const { User } = require("../models/user");
require("dotenv").config();
const cloudinary = require("../cloudinary");
const { Product, ProductImage, Location, ProductLocationStock } = require("../models");
const { sequelize } = require("../db");
// const sendEmail = require("../utils/sendEmail");
const OrderItem = require("../models/OrderItem");
// const Order = require("../models/Order");
const { Order, Notification } = require("../models/Order");
// const { } = require("../models/Order"); // if you need it too
const { LocationProductStock } = require("../models/LocationProductStock");
const crypto = require("crypto");
const Invoice = require("../models/Invoice");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { sendEmail } = require("../utils/sendEmail");
// const { Message, Conversation } = require("../models");
const { Conversation, Message, User } = require("../models");

exports.getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Message.count({
      where: {
        receiver_id: userId,
        is_read: false,
      },
    });

    return res.json({ success: true, count });
  } catch (err) {
    console.error("Unread count error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// exports.createConversation = async (req, res) => {
//   try {
//     const { subject, initialMessage } = req.body;
//     const userId = req.user.id;

//     const conversation = await Conversation.create({
//       subject,
//       created_by: userId,
//       status: "open",
//       assigned_to: null
//     });

//     if (initialMessage) {
//       await Message.create({
//         conversation_id: conversation.id,
//         sender_id: userId,
//         receiver_id: null,
//         content: initialMessage,
//       });
//     }

//     return res.status(201).json({
//       success: true,
//       message: "Conversation created",
//       data: conversation,
//     });
//   } catch (err) {
//     console.error("Create conversation error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// exports.sendMessage = async (req, res) => {
//   try {
//     const { conversation_id, content } = req.body;
//     const sender_id = req.user.id;
//     const sender_role = req.user.role;

//     const conversation = await Conversation.findByPk(conversation_id);

//     if (!conversation) {
//       return res.status(404).json({ success: false, message: "Conversation not found" });
//     }

//     // ✅ If admin/manager replies, auto-assign conversation
//     if ((sender_role === "admin" || sender_role === "manager") && !conversation.assigned_to) {
//       await conversation.update({ assigned_to: sender_id });
//     }

//     // ✅ Find receiver (who gets this message)
//     let receiver_id;

//     if (sender_role === "admin" || sender_role === "manager") {
//       receiver_id = conversation.created_by; // Send to customer
//     } else {
//       receiver_id = conversation.assigned_to; // Send to staff
//     }

//     const message = await Message.create({
//       conversation_id,
//       sender_id,
//       receiver_id,
//       content,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Message sent",
//       data: message,
//     });

//   } catch (err) {
//     console.error("Send message error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

exports.createConversation = async (req, res) => {
  try {
    const { subject, initialMessage } = req.body;
    const userId = req.user.id;

    const conversation = await Conversation.create({
      subject,
      created_by: userId,
      status: "open",
    });

    if (initialMessage) {
      await Message.create({
        conversation_id: conversation.id,
        sender_id: userId,
        receiver_id: null,  // ✅ Now allowed
        content: initialMessage,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Conversation created",
      data: conversation,
    });
  } catch (err) {
    console.error("Create conversation error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.sendMessage = async (req, res) => {
  try {
    const { conversation_id, content } = req.body;
    const user = req.user;

    const conversation = await Conversation.findByPk(conversation_id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    // ⚠️ Only BLOCK staff from replying if conversation is closed
    if (
      conversation.status === "closed" &&
      (user.role === "admin" || user.role === "manager")
    ) {
      return res.status(403).json({
        success: false,
        message: "Conversation is closed. Customers can still reply though.",
      });
    }

    // Detect receiver
    let receiver_id = null;

    if (user.role === "customer") {
      receiver_id = conversation.assigned_to || null;
    } else {
      receiver_id = conversation.created_by;
    }

    const message = await Message.create({
      conversation_id,
      sender_id: user.id,
      receiver_id,
      content
    });

    // Re-open convo if customer replies
    if (user.role === "customer" && conversation.status === "closed") {
      await conversation.update({ status: "open" });
    }

    res.status(201).json({
      success: true,
      message: "Message sent",
      data: message
    });

  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getLatestMessage = async (req, res) => {
  const { userId } = req.params;

  try {
    const message = await Message.findOne({
      where: { receiver_id: userId },
      order: [["createdAt", "DESC"]],
      include: [
        { model: User, as: "sender" },
        { model: Conversation, as: "conversation" }
      ]
    });

    if (!message) {
      return res.json({ message: null });
    }

    res.json({
      message,
      sender: message.sender,
      conversation: message.conversation,
    });
  } catch (err) {
    console.error("Latest message fetch error:", err);
    res.status(500).json({ error: "Failed to fetch message" });
  }
};



// exports.getUserConversations = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const role = req.user.role;

//     let whereClause = {};

//     if (role !== "admin" && role !== "manager") {
//       whereClause.created_by = userId;
//     }

//     const conversations = await Conversation.findAll({
//       where: whereClause,
//       include: [
//         { model: User, as: "creator", attributes: ["id", "name", "email"] },
//         { model: User, as: "assignee", attributes: ["id", "name"] },
//       ],
//       order: [["updatedAt", "DESC"]],
//     });

//     res.json({ success: true, data: conversations });
//   } catch (err) {
//     console.error("Fetch conversations error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let whereClause = {};

    if (role !== "admin" && role !== "manager") {
      whereClause.created_by = userId;
    }

    const conversations = await Conversation.findAll({
      where: whereClause,
      include: [
        { model: User, as: "creator", attributes: ["id", "name", "email"] },
        { model: User, as: "assignee", attributes: ["id", "name"] },
      ],
      order: [["updatedAt", "DESC"]],
    });

    res.json({
      success: true,
      data: conversations,
    });

  } catch (err) {
    console.error("Fetch conversations error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.getSingleConversation = async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findByPk(id, {
      include: [
        { model: User, as: "creator" },
        { model: User, as: "assignee" },
        {
          model: Message,
          as: "messages",
          include: [
            { model: User, as: "sender" },
            { model: User, as: "receiver" },
          ],
        },
      ],
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    res.json({ success: true, data: conversation });
  } catch (err) {
    console.error("Get conversation error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateConversationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const conversation = await Conversation.findByPk(id);
    if (!conversation) return res.status(404).json({ success: false, message: "Not found" });

    await conversation.update({ status });

    res.json({
      success: true,
      message: "Conversation status updated",
      data: conversation,
    });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.findAll({
      where: { conversation_id: conversationId },
      include: [
        { model: User, as: "sender" },
        { model: User, as: "receiver" },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.json({ success: true, data: messages });
  } catch (err) {
    console.error("Fetch messages error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    await Message.update(
      { is_read: true },
      {
        where: {
          conversation_id: conversationId,
          receiver_id: userId,
        },
      }
    );

    res.json({ success: true, message: "Messages marked as read" });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};