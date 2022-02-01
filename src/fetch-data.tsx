const FIREBASE_URL = "http://localhost:5001/figma-jira-plugin-function/us-central1/getIssue"

// Fetch ticket info from Jira (via Firebase function)
// If fetching fails for some reason, return a JSON file with error data
// Return a JSON array
export async function getTicketDataFromJira(issueIds, basicAuth, companyName) {
  var jsonArray
  console.log(basicAuth)
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
      // return response
      return response.json()
    })
    .then((data) => {
      // console.log("Arrived back: ", data)
      jsonArray = data
    })
    .catch((error: Error) => {
      console.error('Could not access Firebase.', error.message)
      jsonArray = issueIds
    })

  // console.log("JSON", jsonArray)
  return jsonArray
}

function fetchWithTimeout(url, options, timeout = 10000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: It took too long for the server to respond.')), timeout)
    )
  ]);
}




