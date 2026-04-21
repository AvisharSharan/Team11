const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Member = require('../models/Member');

const uploadsDir = path.join(__dirname, '..', 'uploads');

const normalizeMember = (member) => {
    if (!member) return member;

    const profileImage = member.profileImage || member.photoUrl || '';
    const rollNo = member.rollNo || member.rollNumber || '';

    return {
        ...member,
        rollNo,
        rollNumber: member.rollNumber || rollNo,
        profileImage,
        photoUrl: member.photoUrl || profileImage,
        teamName: member.teamName || 'Team 11',
    };
};

const listMembers = async (req, res, next) => {
    try {
        const members = await Member.find().sort({ createdAt: -1 }).lean();
        res.status(200).json({
            success: true,
            count: members.length,
            data: members.map(normalizeMember),
        });
    } catch (err) {
        next(err);
    }
};

const getMember = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid member id' });
        }

        const member = await Member.findById(id).lean();
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        res.status(200).json({ success: true, data: normalizeMember(member) });
    } catch (err) {
        next(err);
    }
};

const createMember = async (req, res, next) => {
    try {
        const { name, rollNo, rollNumber, role, email, teamName } = req.body;
        const resolvedRollNo = rollNo || rollNumber;

        if (!name || !email || !resolvedRollNo || !role) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, roll no, and role are required',
            });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Profile image is required' });
        }

        const member = await Member.create({
            name,
            email,
            rollNo: resolvedRollNo,
            role,
            profileImage: `/uploads/${req.file.filename}`,
            teamName: teamName || 'Team 11',
        });

        res.status(201).json({ success: true, data: normalizeMember(member.toObject()) });
    } catch (err) {
        next(err);
    }
};

const deleteMember = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid member id' });
        }

        const member = await Member.findByIdAndDelete(id);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        const storedImage = member.profileImage || member.photoUrl;
        if (storedImage) {
            const fileName = path.basename(storedImage);
            const filePath = path.join(uploadsDir, fileName);
            fs.promises.unlink(filePath).catch(() => {});
        }

        res.status(200).json({ success: true, message: 'Member deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    listMembers,
    getMember,
    createMember,
    deleteMember,
};