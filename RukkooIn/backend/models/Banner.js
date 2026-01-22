import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        image: {
            type: String,
            required: true
        },
        link: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            enum: ['home_hero', 'offer_banner', 'featured_property'],
            default: 'home_hero'
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
        },
        startDate: Date,
        endDate: Date
    },
    { timestamps: true }
);

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
