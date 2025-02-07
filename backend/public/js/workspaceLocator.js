document.getElementById('showWorkspaceFormLink').addEventListener('click', function(event) {
  event.preventDefault();
  const form = document.getElementById('workspaceForm');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('workspaceLocatorForm').addEventListener('submit', function(event) {
  event.preventDefault();  // Prevent default form submission

  const location = document.getElementById('location').value;
  const resultDiv = document.getElementById('workspaceResult');

  if (!location) {
    resultDiv.innerHTML = "<p>Please provide a location to search for workspaces.</p>";
    return;
  }

  resultDiv.innerHTML = "<p>Loading...</p>";  // Show loading message

  fetch(`/workspaces?location=${location}`)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        let resultHTML = `<h2>Workspaces in ${location}</h2><ul>`;
        data.forEach(workspace => {
          resultHTML += `<li><strong>${workspace.name}</strong><br>${workspace.formatted_address}</li>`;
        });
        resultHTML += "</ul>";
        resultDiv.innerHTML = resultHTML;
      } else {
        resultDiv.innerHTML = "<p>No workspaces found for this location.</p>";
      }
    })
    .catch(error => {
      console.error('Error:', error);
      resultDiv.innerHTML = "<p>Sorry, there was an error fetching the workspaces.</p>";
    });
});
