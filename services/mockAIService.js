/**
 * Mock AI Service for Video Quality Assessment
 * This replaces the Intello Labs API with a simulated service
 */

class MockAIService {
    constructor() {
        this.assessmentDelay = 2000; // 2 seconds delay to simulate API call
    }

    /**
     * Assess video quality and provide detailed feedback
     * @param {Object} videoData - Video metadata and content info
     * @returns {Promise<Object>} Assessment results
     */
    async assessVideoQuality(videoData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, this.assessmentDelay));

        const assessment = {
            overallScore: this.generateRandomScore(70, 95),
            issues: this.generateMockIssues(),
            suggestions: this.generateMockSuggestions(),
            technicalMetrics: this.generateTechnicalMetrics(),
            brandCompliance: this.generateBrandCompliance(),
            engagementPotential: this.generateEngagementPotential()
        };

        return assessment;
    }

    /**
     * Generate a random score between min and max
     */
    generateRandomScore(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Generate mock quality issues
     */
    generateMockIssues() {
        const possibleIssues = [
            { type: 'audio', severity: 'high', message: 'Audio levels are too low' },
            { type: 'visual', severity: 'medium', message: 'Video resolution could be higher' },
            { type: 'content', severity: 'low', message: 'Text overlay slightly off-center' },
            { type: 'brand', severity: 'high', message: 'Brand logo not visible in final frame' },
            { type: 'technical', severity: 'medium', message: 'Frame rate inconsistency detected' }
        ];

        // Randomly select 1-3 issues
        const numIssues = Math.floor(Math.random() * 3) + 1;
        const shuffled = possibleIssues.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numIssues);
    }

    /**
     * Generate mock improvement suggestions
     */
    generateMockSuggestions() {
        const suggestions = [
            'Increase audio volume by 2-3 dB for better clarity',
            'Add a subtle fade transition between scenes',
            'Consider adding background music to enhance engagement',
            'Optimize thumbnail for better click-through rate',
            'Add call-to-action text in the final 3 seconds',
            'Improve color grading for more vibrant visuals'
        ];

        // Return 2-4 random suggestions
        const numSuggestions = Math.floor(Math.random() * 3) + 2;
        const shuffled = suggestions.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numSuggestions);
    }

    /**
     * Generate technical metrics
     */
    generateTechnicalMetrics() {
        return {
            resolution: '1080x1920 (9:16)',
            frameRate: '30 fps',
            bitrate: '8 Mbps',
            duration: '15.2 seconds',
            fileSize: '24.5 MB',
            audioQuality: 'AAC 128kbps'
        };
    }

    /**
     * Generate brand compliance check
     */
    generateBrandCompliance() {
        const complianceItems = [
            { item: 'Logo visibility', status: 'fail', message: 'Logo not visible in last 3 seconds' },
            { item: 'Brand colors', status: 'pass', message: 'Primary colors match brand guidelines' },
            { item: 'Hashtag usage', status: 'pass', message: '#SummerGlow hashtag present' },
            { item: 'Product placement', status: 'pass', message: 'Product featured prominently' },
            { item: 'Voiceover script', status: 'warning', message: 'Minor deviation from approved script' }
        ];

        return complianceItems;
    }

    /**
     * Generate engagement potential score
     */
    generateEngagementPotential() {
        return {
            score: this.generateRandomScore(75, 95),
            factors: {
                hookStrength: this.generateRandomScore(70, 90),
                pacing: this.generateRandomScore(75, 95),
                visualAppeal: this.generateRandomScore(80, 100),
                contentRelevance: this.generateRandomScore(85, 95)
            }
        };
    }

    /**
     * Analyze video content for specific requirements
     * @param {Object} requirements - Brand/client requirements
     * @returns {Promise<Object>} Compliance analysis
     */
    async analyzeContentCompliance(requirements) {
        await new Promise(resolve => setTimeout(resolve, 1500));

        return {
            complianceScore: this.generateRandomScore(80, 100),
            missingElements: [],
            recommendations: [
                'Ensure product is visible for at least 5 seconds',
                'Include customer testimonial if available',
                'Add pricing information in the final frame'
            ]
        };
    }
}

// Export singleton instance
export default new MockAIService();
