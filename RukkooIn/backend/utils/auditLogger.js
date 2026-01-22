import AuditLog from '../models/AuditLog.js';

/**
 * Log an administrative action
 * @param {Object} params
 * @param {string} params.adminId - ID of the admin performing the action
 * @param {string} params.action - Action type (from AuditLog enum)
 * @param {string} params.description - Human readable description
 * @param {string} [params.targetType] - Type of entity affected
 * @param {string} [params.targetId] - ID of entity affected
 * @param {Object} [params.req] - Express request object for IP and User Agent
 * @param {Object} [params.metadata] - Additional JSON data
 */
export const logAuditAction = async ({
    adminId,
    action,
    description,
    targetType,
    targetId,
    req,
    metadata
}) => {
    try {
        const logData = {
            admin: adminId,
            action,
            description,
            targetType,
            targetId,
            metadata
        };

        if (req) {
            logData.ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            logData.userAgent = req.headers['user-agent'];
        }

        await AuditLog.create(logData);
    } catch (error) {
        console.error('Audit Log Error:', error);
        // We don't throw error here to avoid breaking the main operation if logging fails
    }
};
