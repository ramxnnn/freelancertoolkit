const axios = require("axios");

exports.findWorkspaces = async (location) => {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=workspaces+in+${location}&key=${process.env.PLACES_API_KEY}`;
    try {
        const response = await axios.get(url);
        return response.data.results;
    } catch (error) {
        throw new Error("Error fetching workspace data.");
    }
};
