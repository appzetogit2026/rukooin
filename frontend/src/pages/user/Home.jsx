import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../../components/user/HeroSection';
import CategoryCircles from '../../components/user/CategoryCircles';
import QuickPicks from '../../components/user/QuickPicks';

import ExclusiveOffers from '../../components/user/ExclusiveOffers';
import AllHotelsList from '../../components/user/AllHotelsList';

const fadeInUp = {
    initial: { y: 30, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const Home = () => {
    return (
        <main className="min-h-screen bg-gradient-to-b from-[#ACDCD9]/50 to-transparent pb-24 overflow-hidden max-w-md mx-auto md:max-w-full shadow-2xl md:shadow-none min-h-screen">

            <HeroSection />

            {/* 1. Categories */}
            <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeInUp}
            >
                <CategoryCircles />
            </motion.div>

            {/* 2. Horizontal Scroll "Quick Picks" */}
            <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeInUp}
                className="mt-0 text-surface"
            >
                <QuickPicks />
            </motion.div>

            {/* 3. Deals / Offers Carousel */}
            <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeInUp}
                className="mt-0"
            >
                <ExclusiveOffers />
            </motion.div>

            {/* 4. Vertical Feed "All Hotels" */}
            <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.1 }}
                variants={fadeInUp}
                className="mt-4 bg-gray-50 rounded-t-[30px] pt-2 min-h-[500px]"
            >
                <AllHotelsList />
            </motion.div>

        </main>
    );
};

export default Home;
