import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true
        },
        answer: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: ['general', 'booking', 'payment', 'property', 'account', 'legal'],
            default: 'general'
        },
        audience: {
            type: String,
            enum: ['user', 'partner'],
            default: 'user'
        },
        active: {
            type: Boolean,
            default: true
        },
        order: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

const Faq = mongoose.model('Faq', faqSchema);
export default Faq;
