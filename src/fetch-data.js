var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const FIREBASE_URL = "http://localhost:5001/figma-jira-plugin-function/us-central1/getIssue";
// Fetch ticket info from Jira (via Firebase function)
// If fetching fails for some reason, return a JSON file with error data
// Returns a JSON array
export function getTicketDataFromJira(issueIds, basicAuth, companyName) {
    return __awaiter(this, void 0, void 0, function* () {
        var jsonArray;
        var config = {
            method: 'POST',
            body: JSON.stringify({
                basicAuth: basicAuth,
                companyName: companyName,
                issueIds: issueIds
            })
        };
        yield fetchWithTimeout(FIREBASE_URL, config)
            .then((response) => {
            return response.json();
        })
            .then((data) => {
            jsonArray = data;
        })
            .catch((error) => {
            console.error('Could not access Firebase.', error.message);
            const responseError = {
                type: 'Error',
                message: error.message || 'Something went wrong',
            };
            console.log(responseError);
            // jsonArray = issueIds
            jsonArray = responseError;
        });
        return jsonArray;
    });
}
// Adds a timeout to the fetch operation
function fetchWithTimeout(url, options, timeout = 10000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout: It took too long for the server to respond.')), timeout))
    ]);
}
