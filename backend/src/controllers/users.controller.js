const User = require('../models/user.model');

// Tüm kullanıcıları getir
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('-password')
      .sort('-isOnline -lastSeen');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcılar getirilemedi' });
  }
};

// Kullanıcı ara
const searchUsers = async (req, res) => {
  try {
    const searchTerm = req.query.q;
    if (!searchTerm) {
      return res.status(400).json({ error: 'Arama terimi gerekli' });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        {
          $or: [
            { username: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } }
          ]
        }
      ]
    }).select('-password');

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Arama yapılırken bir hata oluştu' });
  }
};

// Kullanıcı profili getir
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcı profili getirilemedi' });
  }
};

// Kullanıcı durumunu güncelle
const updateUserStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    
    const user = await User.findById(req.user._id);
    user.isOnline = isOnline;
    user.lastSeen = new Date();
    await user.save();

    res.json({ message: 'Kullanıcı durumu güncellendi' });
  } catch (error) {
    res.status(500).json({ error: 'Durum güncellenemedi' });
  }
};

module.exports = {
  getAllUsers,
  searchUsers,
  getUserProfile,
  updateUserStatus
}; 