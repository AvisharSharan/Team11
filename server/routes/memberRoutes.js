const express = require('express');
const {
    listMembers,
    getMember,
    createMember,
    deleteMember,
} = require('../controllers/memberController');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.get('/', listMembers);
router.get('/:id', getMember);
router.post('/', upload.single('profileImage'), createMember);
router.delete('/:id', deleteMember);

module.exports = router;