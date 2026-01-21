import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    audience: {
      type: String,
      enum: ['user', 'partner'],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    ticketId: {
      type: String,
      unique: true
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'resolved', 'closed'],
      default: 'new'
    },
    internalNotes: [
      {
        note: String,
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    replies: [
      {
        message: String,
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        sentAt: { type: Date, default: Date.now }
      }
    ],
    meta: {
      type: Object
    }
  },
  { timestamps: true }
);

// Generate ticket ID
contactMessageSchema.pre('save', async function (next) {
  if (!this.ticketId) {
    const prefix = this.audience === 'user' ? 'USR' : 'PRT';
    this.ticketId = prefix + Math.floor(100000 + Math.random() * 900000);
  }
  next();
});

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
export default ContactMessage;

