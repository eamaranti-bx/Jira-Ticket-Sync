const FIREBASE_URL = "http://localhost:5001/figma-jira-plugin-function/us-central1/getIssue"

// Fetch ticket info from Jira (via Firebase function)
// If fetching fails for some reason, return a JSON file with error data
// Returns a JSON array
export async function getTicketDataFromJira(issueIds, basicAuth, companyName) {
  
  var jsonArray
  var config = {
    method: 'POST',
    body: JSON.stringify({
      basicAuth: basicAuth,
      companyName: companyName,
      issueIds: issueIds
    })
  };

  await fetchWithTimeout(FIREBASE_URL, config)
    .then((response: Response) => {
      return response.json()
    })
    .then((data) => {
      jsonArray = data
    })
    .catch((error: Error) => {
      console.error('Could not access Firebase.', error.message)
      const responseError = {
        type: 'Error',
        message: error.message || 'Something went wrong',
      };
      console.log(responseError)
      // jsonArray = issueIds
      jsonArray = responseError
    })
  return jsonArray
}

// Adds a timeout to the fetch operation
function fetchWithTimeout(url, options, timeout = 10000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: It took too long for the server to respond.')), timeout)
    )
  ]);
}




