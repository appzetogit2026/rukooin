import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true
        },
        action: {
            type: String,
            required: true,
            enum: [
                'LOGIN',
                'LOGOUT',
                'PROPERTY_APPROVED',
                'PROPERTY_REJECTED',
                'STAFF_CREATED',
                'STAFF_DELETED',
                'STAFF_STATUS_CHANGE',
                'SETTINGS_UPDATED',
                'OFFER_CREATED',
                'OFFER_DELETED',
                'BANNER_UPDATED',
                'NOTIFICATION_SENT',
                'PAYOUT_RELEASED',
                'MANUAL_TRANSACTION'
            ]
        },
        targetType: {
            type: String,
            enum: ['Property', 'Admin', 'Offer', 'Banner', 'Notification', 'Settings', 'Transaction', 'User']
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId
        },
        description: {
            type: String,
            required: true
        },
        ip: String,
        userAgent: String,
        metadata: {
            type: mongoose.Schema.Types.Map,
            of: mongoose.Schema.Types.Mixed
        }
    },
    { timestamps: true }
);

// Indexing for faster lookups
auditLogSchema.index({ admin: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
