import express from 'express';
import {
    listMembers,
    getMember,
    createMember,
    deleteMember,
} from '../controllers/memberController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', listMembers);
router.get('/:id', getMember);
router.post('/', upload.single('profileImage'), createMember);
router.delete('/:id', deleteMember);

export default router;