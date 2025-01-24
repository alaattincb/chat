const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// JWT token oluşturma fonksiyonu
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Kullanıcı kaydı
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Kullanıcı adı veya email kontrolü
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Bu kullanıcı adı veya email zaten kullanımda'
      });
    }

    // Yeni kullanıcı oluşturma
    const user = new User({
      username,
      email,
      password
    });

    await user.save();
    
    // Token oluşturma
    const token = generateToken(user._id);

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Kayıt işlemi başarısız oldu' });
  }
};

// Kullanıcı girişi
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' });
    }

    // Şifre kontrolü
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' });
    }

    // Kullanıcı durumunu güncelle
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Token oluştur
    const token = generateToken(user._id);

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Giriş işlemi başarısız oldu' });
  }
};

// Kullanıcı çıkışı
const logout = async (req, res) => {
  try {
    // Kullanıcı durumunu güncelle
    const user = await User.findById(req.user._id);
    user.isOnline = false;
    user.lastSeen = new Date();
    await user.save();

    res.json({ message: 'Başarıyla çıkış yapıldı' });
  } catch (error) {
    res.status(500).json({ error: 'Çıkış işlemi başarısız oldu' });
  }
};

// Mevcut kullanıcı bilgilerini getir
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcı bilgileri alınamadı' });
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser
}; 