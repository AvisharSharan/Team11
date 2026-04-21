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