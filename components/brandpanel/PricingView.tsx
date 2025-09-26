import React, { useState, useEffect } from 'react';
import { ICONS } from '../../constants';

const PricingView = () => {
    const [expectedReels, setExpectedReels] = useState('');
    const [totalCost, setTotalCost] = useState(0);
    const [expectedViews, setExpectedViews] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    
    // Pricing constants
    const pricePerReel = 5; // fixed price per reel
    const avgViewsPerReel = 3000; // average views per reel
    const discountThresholds = [
        { reels: 50, discount: 0.05 }, // 5% discount for 50+ reels
        { reels: 100, discount: 0.10 }, // 10% discount for 100+ reels
        { reels: 200, discount: 0.15 }, // 15% discount for 200+ reels
    ];

    // Calculate cost and views when expectedReels changes
    useEffect(() => {
        const reels = parseFloat(expectedReels);
        if (isNaN(reels) || reels <= 0) {
            setTotalCost(0);
            setExpectedViews(0);
            return;
        }

        // Apply discount if applicable
        let discount = 0;
        for (let i = discountThresholds.length - 1; i >= 0; i--) {
            if (reels >= discountThresholds[i].reels) {
                discount = discountThresholds[i].discount;
                break;
            }
        }

        const baseCost = reels * pricePerReel;
        const discountedCost = baseCost * (1 - discount);
        const views = reels * avgViewsPerReel;

        setTotalCost(discountedCost);
        setExpectedViews(views);
        
        // Trigger animation
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
    }, [expectedReels]);

    const handleExpectedReelsChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d+$/.test(value)) {
            setExpectedReels(value);
        }
    };

    // Format numbers for display
    const formatCurrency = (amount) => {
        return `₹${amount.toFixed(2)}`;
    };

    const formatNumber = (number) => {
        return number.toLocaleString();
    };

    // Calculate discount information
    const getDiscountInfo = () => {
        const reels = parseFloat(expectedReels);
        if (isNaN(reels) || reels <= 0) return null;

        for (let i = discountThresholds.length - 1; i >= 0; i--) {
            if (reels >= discountThresholds[i].reels) {
                return {
                    percentage: discountThresholds[i].discount * 100,
                    amount: (reels * pricePerReel * discountThresholds[i].discount).toFixed(2)
                };
            }
        }
        return null;
    };

    const discountInfo = getDiscountInfo();

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    Campaign Pricing Calculator
                </h1>
                <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                    Calculate the estimated cost for your campaign based on the number of reels and see your expected views
                </p>
            </div>

            {/* Premium Features Section */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 mb-12 border border-yellow-200 shadow-lg">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-yellow-800 mb-4">
                        <span className="inline-block mr-2">{ICONS.sparkles}</span>
                        Premium Features
                    </h2>
                    <p className="text-yellow-700 text-lg">
                        Unlock premium features with your brand subscription
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        {
                            icon: ICONS.chart,
                            title: "Advanced Analytics",
                            description: "Detailed insights and performance metrics"
                        },
                        {
                            icon: ICONS.video,
                            title: "HD Video Quality",
                            description: "High-definition video production and editing"
                        },
                        {
                            icon: ICONS.bell,
                            title: "Priority Support",
                            description: "24/7 dedicated customer support"
                        },
                        {
                            icon: ICONS.settings,
                            title: "Custom Branding",
                            description: "Personalized branding and customization"
                        },
                        {
                            icon: ICONS.download,
                            title: "Bulk Export",
                            description: "Export multiple videos at once"
                        },
                        {
                            icon: ICONS.userCircle,
                            title: "Account Manager",
                            description: "Dedicated account manager for your brand"
                        }
                    ].map((feature, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                            <div className="flex items-center mb-3">
                                <span className="text-2xl mr-3">{feature.icon}</span>
                                <h3 className="font-bold text-yellow-800">{feature.title}</h3>
                            </div>
                            <p className="text-yellow-700 text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cost Calculator */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12 border border-blue-200 shadow-lg">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Input Section */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">
                            <span className="inline-block mr-2">{ICONS.money}</span>
                            Cost Calculator
                        </h2>
                        <p className="text-slate-600 mb-6">
                            Enter the number of reels you need for your campaign to calculate the total cost and expected views.
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Number of Reels
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={expectedReels}
                                    onChange={handleExpectedReelsChange}
                                    placeholder="Enter number of reels"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <span className="text-slate-400">{ICONS.video}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-sm text-slate-600 space-y-2">
                            <p className="flex items-center">
                                <span className="inline-block mr-2 text-green-500">{ICONS.check}</span>
                                Fixed price of ₹{pricePerReel} per reel
                            </p>
                            <p className="flex items-center">
                                <span className="inline-block mr-2 text-green-500">{ICONS.check}</span>
                                Average {formatNumber(avgViewsPerReel)} views per reel
                            </p>
                            <p className="flex items-center">
                                <span className="inline-block mr-2 text-green-500">{ICONS.check}</span>
                                Volume discounts available for large campaigns
                            </p>
                        </div>
                    </div>
                    
                    {/* Results Section */}
                    <div className="flex-1">
                        <div className={`bg-white rounded-lg p-6 border border-slate-200 shadow-sm transition-all duration-300 ${isAnimating ? 'transform scale-105' : ''}`}>
                            <h3 className="text-xl font-bold text-slate-800 mb-4">Your Estimate</h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-lg">
                                    <span className="text-slate-600">Base Price:</span>
                                    <span className="font-medium">{formatCurrency(parseFloat(expectedReels || 0) * pricePerReel)}</span>
                                </div>
                                
                                {discountInfo && (
                                    <div className="flex justify-between items-center text-lg text-green-600">
                                        <span>Volume Discount ({discountInfo.percentage}%):</span>
                                        <span>-{formatCurrency(parseFloat(discountInfo.amount))}</span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-center text-xl font-bold border-t border-slate-200 pt-4 mt-2">
                                    <span className="text-slate-800">Total Cost:</span>
                                    <span className="text-green-600">{formatCurrency(totalCost)}</span>
                                </div>
                                
                                <div className="flex justify-between items-center text-lg border-t border-slate-200 pt-4 mt-2">
                                    <span className="text-slate-800">Expected Views:</span>
                                    <span className="font-bold text-blue-600">{formatNumber(expectedViews)}</span>
                                </div>
                            </div>
                            
                            <div className="mt-6">
                                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-md">
                                    Get Started with This Plan
                                </button>
                            </div>
                        </div>
                        
                        {/* Volume Discount Info */}
                        <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-2">Volume Discounts</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                {discountThresholds.map((threshold, index) => (
                                    <li key={index} className="flex justify-between">
                                        <span>{threshold.reels}+ reels:</span>
                                        <span>{threshold.discount * 100}% discount</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Contact Section */}
            <div className="text-center mb-8">
                <p className="text-slate-600 mb-4">
                    Need a custom quote or have questions about our pricing?
                </p>
                <button className="bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors inline-flex items-center">
                    <span className="mr-2">{ICONS.message}</span>
                    Contact Sales Team
                </button>
            </div>
        </div>
    );
};

export default PricingView;