const Message = require('../models/message.model');

// Özel mesaj gönder
const sendPrivateMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    
    const message = new Message({
      sender: req.user._id,
      receiver: receiverId,
      content,
      type: 'private'
    });

    await message.save();

    // Populate sender bilgileri
    await message.populate('sender', 'username');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Mesaj gönderilemedi' });
  }
};

// Grup mesajı gönder
const sendGroupMessage = async (req, res) => {
  try {
    const { groupId, content } = req.body;
    
    const message = new Message({
      sender: req.user._id,
      group: groupId,
      content,
      type: 'group'
    });

    await message.save();

    // Populate sender ve group bilgileri
    await message.populate('sender', 'username');
    await message.populate('group', 'name');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Mesaj gönderilemedi' });
  }
};

// Özel mesaj geçmişini getir
const getPrivateMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const messages = await Message.find({
      type: 'private',
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'username')
      .populate('receiver', 'username');

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Mesaj geçmişi getirilemedi' });
  }
};

// Grup mesaj geçmişini getir
const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const messages = await Message.find({
      type: 'group',
      group: groupId
    })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'username')
      .populate('group', 'name');

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Grup mesaj geçmişi getirilemedi' });
  }
};

// Mesajı okundu olarak işaretle
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Mesaj bulunamadı' });
    }

    // Kullanıcı zaten mesajı okuduysa
    const alreadyRead = message.readBy.some(read => 
      read.user.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      message.readBy.push({
        user: req.user._id,
        readAt: new Date()
      });
      await message.save();
    }

    res.json({ message: 'Mesaj okundu olarak işaretlendi' });
  } catch (error) {
    res.status(500).json({ error: 'Mesaj durumu güncellenemedi' });
  }
};

module.exports = {
  sendPrivateMessage,
  sendGroupMessage,
  getPrivateMessages,
  getGroupMessages,
  markMessageAsRead
}; 