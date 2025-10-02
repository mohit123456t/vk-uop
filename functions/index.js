const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

// Automatically allow cross-origin requests from any origin
app.use(cors({ origin: true }));

/**
 * A robust endpoint to proxy video downloads.
 * It takes a `url` query parameter, fetches the video from that URL,
 * and streams it back to the client, handling potential errors.
 */
app.get("/downloadProxy", async (req, res) => {
    const videoUrl = req.query.url;

    // 1. Validate the input URL
    if (!videoUrl || typeof videoUrl !== "string") {
        functions.logger.error("Validation Error: 'url' query parameter is missing or invalid.");
        return res.status(400).send("Please provide a valid 'url' query parameter.");
    }

    try {
        functions.logger.log(`Attempting to proxy video from: ${videoUrl}`);

        // 2. Fetch the external video using axios with streaming
        const response = await axios({
            method: "get",
            url: videoUrl,
            responseType: "stream", // Crucial for handling large files
        });

        // 3. Check for successful response from the source
        if (response.status !== 200) {
            functions.logger.error(`Upstream Error: Failed to fetch video from ${videoUrl}. Status: ${response.status}`);
            return res.status(response.status).send(`Failed to fetch video from the source.`);
        }

        // 4. Pipe the video stream directly to the client's response
        // This avoids loading the entire video into memory
        res.setHeader("Content-Type", response.headers["content-type"]);
        res.setHeader("Content-Length", response.headers["content-length"]);
        response.data.pipe(res);

        functions.logger.log(`Successfully started streaming video from: ${videoUrl}`);

    } catch (error) {
        // 5. Handle any errors during the process
        functions.logger.error("Proxy Error: An error occurred while trying to stream the video.", { 
            videoUrl: videoUrl, 
            errorMessage: error.message,
            // Check if error response from axios is available
            axiosError: error.response ? { status: error.response.status, data: error.response.data } : 'No axios response'
        });
        
        // Send a generic but informative error message to the client
        res.status(500).send("An internal error occurred while trying to process the video. Please check the function logs for details.");
    }
});

// Expose the Express API as a single Cloud Function named 'api'.
// This means all routes defined on the `app` will be available under `/api`
// e.g., https://<region>-<project-id>.cloudfunctions.net/api/downloadProxy
exports.api = functions.https.onRequest(app);
