import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false // If null, it could be a broadcast
        },
        recipientRole: {
            type: String,
            enum: ['user', 'partner', 'all'],
            default: 'all'
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        body: {
            type: String,
            required: true
        },
        image: {
            type: String
        },
        type: {
            type: String,
            enum: ['broadcast', 'booking', 'system', 'promotion', 'kyc'],
            default: 'system'
        },
        status: {
            type: String,
            enum: ['sent', 'failed', 'scheduled'],
            default: 'sent'
        },
        actionUrl: {
            type: String
        },
        metadata: {
            type: Object
        },
        readBy: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                readAt: { type: Date, default: Date.now }
            }
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' // Admin who sent it
        }
    },
    { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
