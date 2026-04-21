import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Member from '../models/Member.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads');

export const listMembers = async (req, res, next) => {
    try {
        const members = await Member.find().sort({ createdAt: -1 }).lean();
        res.status(200).json({ success: true, count: members.length, data: members });
    } catch (err) {
        next(err);
    }
};

export const getMember = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid member id' });
        }

        const member = await Member.findById(id).lean();
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        res.status(200).json({ success: true, data: member });
    } catch (err) {
        next(err);
    }
};

export const createMember = async (req, res, next) => {
    try {
        const { name, role, email, phone, bio } = req.body;

        if (!name || !role) {
            return res.status(400).json({ success: false, message: 'Name and role are required' });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Profile image is required' });
        }

        const member = await Member.create({
            name,
            role,
            email,
            phone,
            bio,
            profileImage: req.file.filename,
        });

        res.status(201).json({ success: true, data: member });
    } catch (err) {
        next(err);
    }
};

export const deleteMember = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid member id' });
        }

        const member = await Member.findByIdAndDelete(id);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        if (member.profileImage) {
            const filePath = path.join(uploadsDir, member.profileImage);
            fs.promises.unlink(filePath).catch(() => {});
        }

        res.status(200).json({ success: true, message: 'Member deleted' });
    } catch (err) {
        next(err);
    }
};