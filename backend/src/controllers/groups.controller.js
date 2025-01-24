const Group = require('../models/group.model');

// Yeni grup oluştur
const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    const group = new Group({
      name,
      description,
      creator: req.user._id
    });

    await group.save();
    await group.populate('creator', 'username');
    await group.populate('members.user', 'username');

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: 'Grup oluşturulamadı' });
  }
};

// Kullanıcının gruplarını getir
const getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      'members.user': req.user._id,
      isActive: true
    })
      .populate('creator', 'username')
      .populate('members.user', 'username isOnline lastSeen');

    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Gruplar getirilemedi' });
  }
};

// Grup detaylarını getir
const getGroupDetails = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('creator', 'username')
      .populate('members.user', 'username isOnline lastSeen');

    if (!group) {
      return res.status(404).json({ error: 'Grup bulunamadı' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Grup detayları getirilemedi' });
  }
};

// Gruba üye ekle
const addMemberToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, role = 'member' } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Grup bulunamadı' });
    }

    // Kullanıcının yetkisi kontrol edilir
    const currentMember = group.members.find(
      member => member.user.toString() === req.user._id.toString()
    );
    if (!currentMember || currentMember.role !== 'admin') {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    // Kullanıcı zaten üye mi kontrol edilir
    const isMember = group.members.some(
      member => member.user.toString() === userId
    );
    if (isMember) {
      return res.status(400).json({ error: 'Kullanıcı zaten grup üyesi' });
    }

    group.members.push({
      user: userId,
      role,
      joinedAt: new Date()
    });

    await group.save();
    await group.populate('members.user', 'username');

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Üye eklenemedi' });
  }
};

// Gruptan üye çıkar
const removeMemberFromGroup = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Grup bulunamadı' });
    }

    // Kullanıcının yetkisi kontrol edilir
    const currentMember = group.members.find(
      member => member.user.toString() === req.user._id.toString()
    );
    if (!currentMember || currentMember.role !== 'admin') {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    // Grup yaratıcısı çıkarılamaz
    if (group.creator.toString() === userId) {
      return res.status(400).json({ error: 'Grup yaratıcısı çıkarılamaz' });
    }

    group.members = group.members.filter(
      member => member.user.toString() !== userId
    );

    await group.save();
    await group.populate('members.user', 'username');

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Üye çıkarılamadı' });
  }
};

// Grubu güncelle
const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Grup bulunamadı' });
    }

    // Sadece admin yetkisi olanlar grubu güncelleyebilir
    const currentMember = group.members.find(
      member => member.user.toString() === req.user._id.toString()
    );
    if (!currentMember || currentMember.role !== 'admin') {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    group.name = name || group.name;
    group.description = description || group.description;

    await group.save();
    await group.populate('members.user', 'username');

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Grup güncellenemedi' });
  }
};

// Grubu sil (soft delete)
const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Grup bulunamadı' });
    }

    // Sadece grup yaratıcısı grubu silebilir
    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    group.isActive = false;
    await group.save();

    res.json({ message: 'Grup başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Grup silinemedi' });
  }
};

module.exports = {
  createGroup,
  getUserGroups,
  getGroupDetails,
  addMemberToGroup,
  removeMemberFromGroup,
  updateGroup,
  deleteGroup
}; 