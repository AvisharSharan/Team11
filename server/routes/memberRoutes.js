import { upload } from '../middleware/upload.js';
import { createMember } from '../controllers/memberController.js';

router.post('/', upload.single('profileImage'), createMember);