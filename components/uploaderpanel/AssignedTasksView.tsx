import React, { useState } from 'react';
import { ICONS } from '../../constants';
import ReelUploadView from './ReelUploadView';

const AssignedTaskCard = ({ reel, onClick }) => {
    return (
        <div
            onClick={() => onClick(reel)}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 hover:shadow-lg hover:border-slate-300 transition-all duration-300 cursor-pointer"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Reel ID: {reel.id}</h3>
                    <p className="text-sm text-slate-600">Duration: {reel.duration}</p>
                </div>
                <div className="text-slate-400">{ICONS.video}</div>
            </div>

            <div className="flex gap-3">
                <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Upload Reel
                </button>
                <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    Preview
                </button>
            </div>
        </div>
    );
};

const AssignedTasksView = () => {
    const [selectedReel, setSelectedReel] = useState(null);

    const assignedReels = [
        {
            id: "R001",
            duration: "45 sec",
            script: "Get ready to glow this summer! 🌞✨ Start with our Summer Glow foundation for that perfect base. Apply the highlighter on cheekbones, nose bridge, and cupid's bow. Finish with our setting spray for all-day shine! 💄 Who's ready for summer? #SummerGlow #MakeupTutorial #BeautyTips",
            hashtags: ["#SummerGlow", "#MakeupTutorial", "#BeautyTips", "#SummerMakeup", "#GlowUp"]
        },
        {
            id: "R002",
            duration: "30 sec",
            script: "☔ Monsoon season is here and so are the DEALS! 💦 Get up to 50% off on all beauty products. Perfect time to stock up on your favorites! Limited time offer - don't miss out! 🛍️💄 #MonsoonSale #BeautyDeals #LimitedOffer",
            hashtags: ["#MonsoonSale", "#BeautyDeals", "#LimitedOffer", "#SaleAlert", "#BeautyProducts"]
        },
        {
            id: "R003",
            duration: "60 sec",
            script: "Introducing our Q3 collection! 🔥 New arrivals that you'll love. From bold lip colors to long-lasting foundations - we've got everything you need for the perfect look. Available now! 🛒✨ #NewCollection #BeautyProducts #MakeupLovers",
            hashtags: ["#NewCollection", "#BeautyProducts", "#MakeupLovers", "#Q3Launch", "#BeautyEssentials"]
        }
    ];

    const handleReelClick = (reel) => {
        setSelectedReel(reel);
    };

    const handleBack = () => {
        setSelectedReel(null);
    };

    if (selectedReel) {
        return <ReelUploadView reel={selectedReel} onBack={handleBack} />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Assigned Tasks</h1>
                <p className="text-slate-600">Click on any reel to upload to Instagram</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {assignedReels.map(reel => (
                    <AssignedTaskCard
                        key={reel.id}
                        reel={reel}
                        onClick={handleReelClick}
                    />
                ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <div className="text-blue-600">{ICONS.bell}</div>
                    <div>
                        <h3 className="font-medium text-blue-900 mb-1">Upload Instructions</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Click on any reel to open upload options</li>
                            <li>• Choose between Auto Upload or Manual Upload</li>
                            <li>• Auto Upload will post directly to Instagram</li>
                            <li>• Manual Upload opens Instagram for manual posting</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignedTasksView;
