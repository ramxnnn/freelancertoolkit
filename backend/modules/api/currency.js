const axios = require("axios");

exports.getExchangeRates = async (from, to, amount = 1) => {
    const url = `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_API_KEY}/pair/${from}/${to}`;
    try {
        const response = await axios.get(url);

        if (response.data.result === "success") {
            const rate = response.data.conversion_rate;
            console.log(`Conversion rate for ${from} to ${to}: ${rate}`);
            const convertedAmount = (rate * amount).toFixed(2);  // Round to 2 decimal places
            return convertedAmount;  // Return the converted amount as a string
        } else {
            throw new Error(response.data["error-type"] || "Unknown error occurred.");
        }
    } catch (error) {
        console.error("Error fetching exchange rates:", error.message);
        throw new Error("Unable to fetch exchange rates. Please check your input or try again later.");
    }
};
