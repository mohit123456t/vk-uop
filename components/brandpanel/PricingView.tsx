import React, { useState } from 'react';
import { ICONS } from '../../constants';

const PricingView = () => {
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [expectedReels, setExpectedReels] = useState('');
    const pricePerReel = 5; // fixed price per reel
    const avgViewsPerReel = 3000; // average views per reel

    const pricingPackages = [];

    const handleExpectedReelsChange = (e) => {
        setExpectedReels(e.target.value);
    };

    const calculateCost = () => {
        const reels = parseFloat(expectedReels);
        if (isNaN(reels) || reels <= 0) return 0;
        return (reels * pricePerReel).toFixed(2);
    };

    const calculateExpectedViews = () => {
        const reels = parseFloat(expectedReels);
        if (isNaN(reels) || reels <= 0) return 0;
        return (reels * avgViewsPerReel).toLocaleString();
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    Campaign Pricing
                </h1>
                <p className="text-slate-600 text-lg">
                    Calculate the estimated cost for your campaign based on number of reels and expected views
                </p>
            </div>

            {/* Cost Calculator */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12 border border-blue-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Cost Calculator</h2>
                <p className="text-slate-600 text-center mb-6">
                    Enter the number of reels to calculate the total cost and expected views
                </p>
                <div className="max-w-md mx-auto">
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Number of Reels
                        </label>
                        <input
                            type="number"
                            value={expectedReels}
                            onChange={handleExpectedReelsChange}
                            placeholder="Enter number of reels (e.g., 10)"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            min="0"
                        />
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center text-lg border-t border-slate-200 pt-2 mt-2">
                            <span className="font-semibold text-slate-800">Estimated Cost:</span>
                            <span className="font-bold text-green-600">₹{calculateCost()}</span>
                        </div>
                        <div className="flex justify-between items-center text-lg border-t border-slate-200 pt-2 mt-2">
                            <span className="font-semibold text-slate-800">Expected Views:</span>
                            <span className="font-bold text-blue-600">{calculateExpectedViews()}</span>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                        * Fixed price of ₹5 per reel. Actual costs may vary based on campaign complexity and requirements.
                    </p>
                </div>
            </div>

            {/* Pricing Cards */}
            {/* Removed pricing cards as per user request to keep only calculator */}

            {/* Removed custom package and FAQ sections as per user request to keep only calculator */}
        </div>
    );
};

export default PricingView;
