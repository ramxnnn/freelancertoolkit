document.addEventListener("DOMContentLoaded", () => {
    const timezoneForm = document.getElementById("timezoneForm");
    const timezoneFinderForm = document.getElementById("timezoneFinderForm");
    const timezoneResult = document.getElementById("timezoneResult");
    const showTimezoneFormLink = document.getElementById("showTimezoneFormLink");
  
    // Show the Time Zone Finder form
    showTimezoneFormLink.addEventListener("click", (e) => {
      e.preventDefault();
      timezoneForm.style.display = "block";
    });
  
    // Handle form submission
    timezoneFinderForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const location = document.getElementById("timezoneLocation").value;
      timezoneResult.innerHTML = "Fetching time zone data...";
  
      try {
        const response = await fetch(`/api/timezones?location=${encodeURIComponent(location)}`);
        const data = await response.json();
  
        if (data.error) {
          timezoneResult.innerHTML = `<p style="color:red;">Error: ${data.error}</p>`;
        } else {
          timezoneResult.innerHTML = `
            <p><strong>Time Zone ID:</strong> ${data.timeZoneId}</p>
            <p><strong>Time Zone Name:</strong> ${data.timeZoneName}</p>
            <p><strong>DST Offset:</strong> ${data.dstOffset} seconds</p>
            <p><strong>Raw Offset:</strong> ${data.rawOffset} seconds</p>
          `;
        }
      } catch (error) {
        timezoneResult.innerHTML = `<p style="color:red;">Failed to fetch time zone data.</p>`;
      }
    });
  });
  