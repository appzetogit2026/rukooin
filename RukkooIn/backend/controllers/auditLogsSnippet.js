
// --- Security & Audit ---
export const getAuditLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.action) query.action = req.query.action;
        if (req.query.targetType) query.targetType = req.query.targetType;
        if (req.query.adminId) query.admin = req.query.adminId;

        const logs = await AuditLog.find(query)
            .populate('admin', 'name email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AuditLog.countDocuments(query);

        res.status(200).json({
            success: true,
            logs,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching audit logs' });
    }
};
