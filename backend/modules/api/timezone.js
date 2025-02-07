const axios = require("axios");

exports.getTimezone = async (lat, lng, timestamp) => {
    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${process.env.TIMEZONE_API_KEY}`;

    try {
        console.log("Fetching timezone data from:", url); 
        const response = await axios.get(url);

        console.log("API Response:", response.data); 

        if (response.data.status === "OK") {
            return {
                timeZoneId: response.data.timeZoneId,
                timeZoneName: response.data.timeZoneName,
                dstOffset: response.data.dstOffset,
                rawOffset: response.data.rawOffset
            };
        } else {
            console.error("Timezone API Error:", response.data);
            throw new Error(response.data.errorMessage || "Failed to fetch timezone data.");
        }
    } catch (error) {
        console.error("Error fetching timezone data:", error.message);
        throw new Error("Error fetching timezone data.");
    }
};
