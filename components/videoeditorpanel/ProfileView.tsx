import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import authService from '../../services/authService';

const ProfileView = () => {
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((state) => {
      if (state.isAuthenticated && state.userProfile) {
        setUserProfile(state.userProfile);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!userProfile) {
    return (
      <div className="text-center py-8">
        <span className="text-4xl">⏳</span>
        <h3 className="text-lg font-semibold mt-4">Loading Profile...</h3>
      </div>
    );
  }

  // 🌀 Animation Variants — एनिमेशन के लिए प्री-डिफाइन्ड स्टेट्स
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const dotVariants = {
    hover: {
      scale: 1.3, // थोड़ा ज्यादा स्केल
      rotate: 45, // 90° से कम रोटेशन — ज्यादा नेचुरल लगेगा
      backgroundColor: "#6366f1", // होवर पर कलर चेंज
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
  };

  return (
    <motion.div
      className="max-w-lg mx-auto p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >


      {/* 🧾 Profile Info Card — Clean & Modern Design */}
      <div className="space-y-5 bg-white p-7 rounded-2xl shadow-md border border-slate-200 hover:shadow-lg transition-shadow duration-300">
        <motion.div variants={itemVariants} className="flex justify-between items-center pb-4 border-b border-slate-100">
          <span className="font-semibold text-slate-700 text-sm">👤 Editor Name</span>
          <span className="text-slate-900 font-medium">{userProfile.name || 'N/A'}</span>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-between items-center pb-4 border-b border-slate-100">
          <span className="font-semibold text-slate-700 text-sm">📧 Gmail</span>
          <span className="text-slate-900 font-medium break-all">{userProfile.email || 'N/A'}</span>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-between items-center pb-4 border-b border-slate-100">
          <span className="font-semibold text-slate-700 text-sm">🕒 Last Login</span>
          <span className="text-slate-900 font-medium">{userProfile.lastLoginAt ? new Date(userProfile.lastLoginAt).toLocaleString() : 'N/A'}</span>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-between items-center">
          <span className="font-semibold text-slate-700 text-sm">🆔 Editor ID</span>
          <span className="text-slate-900 font-mono bg-indigo-50 px-3 py-1.5 rounded-lg font-semibold tracking-wide">
            EDR{userProfile.uid ? userProfile.uid.slice(-4).padStart(4, '0') : '0000'}
          </span>
        </motion.div>
      </div>

      {/* ⚙️ Four Dots / Quick Options — Interactive & Animated */}
      <div className="flex justify-center space-x-3 pt-5">
        {[1, 2, 3, 4].map((dot) => (
          <motion.div
            key={dot}
            variants={dotVariants}
            whileHover="hover"
            className="w-3.5 h-3.5 bg-slate-400 rounded-full cursor-pointer hover:bg-indigo-500 transition-colors duration-200"
            title={`Option ${dot}`}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default ProfileView;
