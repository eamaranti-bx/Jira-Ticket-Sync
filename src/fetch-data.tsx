const FIREBASE_URL_GET_ISSUES = "http://localhost:5001/figma-jira-plugin-function/us-central1/getIssue"
const FIREBASE_URL_POST_LINK = "http://localhost:5001/figma-jira-plugin-function/us-central1/postLinkToIssue"

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

  await fetchWithTimeout(FIREBASE_URL_GET_ISSUES, config)
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
      jsonArray = responseError
    })
  return jsonArray
}

// Add a link of the Figma node into the Jira issue
export async function postLinkToIssue(issueId, link, basicAuth, companyName) {

  var bodyData = {
    "object": {
      "url": link,
      "title": "Design Reference",
      "icon": {
        "url16x16": "https://static.figma.com/app/icon/1/favicon.png"
      }
    }
  }
  var config = {
    method: 'POST',
    body: JSON.stringify({
      basicAuth: basicAuth,
      companyName: companyName,
      issueId: issueId,
      bodyData: bodyData
    })
  };
  var response
  await fetchWithTimeout(FIREBASE_URL_POST_LINK, config)
    .then((response: Response) => {
      return response.json()
    })
    .then((data) => {
      response = data
    })
    .catch((error: Error) => {
      response = error
    })
  return await response
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





