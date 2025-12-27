import React, { useRef, useState } from 'react';
import { HelpCircle, ChevronDown, Mail, Phone, MessageSquare } from 'lucide-react';
import gsap from 'gsap';
import PartnerHeader from '../components/PartnerHeader';

const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    const contentRef = useRef(null);

    const toggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            gsap.to(contentRef.current, { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' });
        } else {
            gsap.to(contentRef.current, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in' });
        }
    };

    return (
        <div className="border border-gray-200 rounded-2xl mb-3 bg-white overflow-hidden transition-all hover:border-gray-300">
            <button
                onClick={toggle}
                className="w-full flex items-center justify-between p-4 text-left"
            >
                <span className="font-bold text-sm text-gray-900">{question}</span>
                <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div ref={contentRef} className="h-0 opacity-0 overflow-hidden px-4">
                <p className="text-xs text-gray-500 leading-relaxed pb-4 pt-0">
                    {answer}
                </p>
            </div>
        </div>
    );
};

const PartnerSupport = () => {
    const faqs = [
        { q: "How do I update my room pricing?", a: "You can update pricing directly from the 'My Properties' section. Select the property, click Edit, and navigate to the Pricing step (Coming Soon)." },
        { q: "When will I receive my payout?", a: "Payouts are processed weekly every Wednesday for all bookings completed in the previous week." },
        { q: "How can I verify my property?", a: "Go to the KYC section and upload your business registration and ownership proofs. Our team will verify them within 48 hours." },
        { q: "Can I temporarily close my listing?", a: "Yes, you can toggle your property status to 'Offline' in the Property Settings." }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <PartnerHeader title="Support Center" subtitle="We are here to help" />

            <div className="max-w-3xl mx-auto px-4 pt-6">

                {/* Contact Options */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <button className="bg-black text-white p-5 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                        <MessageSquare size={24} />
                        <span className="text-sm font-bold">Live Chat</span>
                    </button>
                    <button className="bg-white border border-gray-200 text-gray-900 p-5 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                        <Phone size={24} />
                        <span className="text-sm font-bold">Call Support</span>
                    </button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <HelpCircle size={18} className="text-gray-400" />
                    <h3 className="font-black text-gray-900">Frequently Asked Questions</h3>
                </div>

                <div>
                    {faqs.map((faq, i) => (
                        <FaqItem key={i} question={faq.q} answer={faq.a} />
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400 mb-2">Still have questions?</p>
                    <a href="mailto:partners@rokkooin.com" className="inline-flex items-center gap-2 text-sm font-bold text-black border-b border-black/20 pb-0.5 hover:border-black transition-colors">
                        <Mail size={14} /> Email us at partners@rokkooin.com
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PartnerSupport;
