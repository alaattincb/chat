const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['private', 'group'],
    required: true
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Mesaj ya özel ya da grup mesajı olmalı
messageSchema.pre('save', function(next) {
  if (this.type === 'private' && !this.receiver) {
    next(new Error('Özel mesajlar için alıcı gereklidir'));
  } else if (this.type === 'group' && !this.group) {
    next(new Error('Grup mesajları için grup gereklidir'));
  } else {
    next();
  }
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message; 