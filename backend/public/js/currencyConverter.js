// Show the form when the "Currency Converter" link is clicked
document.getElementById('showCurrencyFormLink').addEventListener('click', function (event) {
  event.preventDefault();
  const form = document.getElementById('currencyForm');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('currencyConverterForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent default form submission

  const fromCurrency = document.getElementById('from').value.trim();
  const toCurrency = document.getElementById('to').value.trim();
  const amount = document.getElementById('amount').value.trim();
  const resultDiv = document.getElementById('result');

  // Reset the result div and hide it initially
  resultDiv.style.display = 'none';
  resultDiv.innerHTML = "";

  // Input validation
  if (!fromCurrency || !toCurrency || !amount || isNaN(amount)) {
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = "<p style='color:red;'>Please provide valid inputs for all fields.</p>";
    return;
  }

  // Show a loading message
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = "<p>Loading...</p>";

  // Fetch the conversion result
  fetch(`/currency?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`)
    .then(response => response.json())
    .then(data => {
      if (data && data.convertedAmount) {
        resultDiv.innerHTML = `
          <h2>Conversion Result</h2>
          <p><strong>${amount} ${fromCurrency}</strong> equals <strong>${data.convertedAmount} ${toCurrency}</strong>.</p>
        `;
      } else {
        resultDiv.innerHTML = "<p style='color:red;'>Sorry, no conversion result was found.</p>";
      }
    })
    .catch(error => {
      console.error('Error fetching conversion:', error);
      resultDiv.innerHTML = "<p style='color:red;'>An error occurred. Please try again later.</p>";
    });
});
