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
console.log("FETCH DATA FILE OPENED");
// Fetch ticket info from Jira (via Firebase function)
// If fetching fails for some reason, return a JSON file with error data
// Return a JSON array
export function getTicketDataFromJira(issueIds, username, password, companyName) {
    return __awaiter(this, void 0, void 0, function* () {
        var jsonArray;
        var basicAuth = 'Yml0dG5lci5sdWthc0BnbWFpbC5jb206YWRjR3VzQmRDTGdMWVFzcnRKQmYxQUNC';
        // var basicAuth = Buffer.from(username + ':' + password).toString('base64')
        console.log(basicAuth);
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
            // return response
            return response.json();
        })
            .then((data) => {
            // console.log("Arrived back: ", data)
            jsonArray = data;
        })
            .catch((error) => {
            console.error('Could not access Firebase.', error.message);
            jsonArray = issueIds;
        });
        // console.log("JSON", jsonArray)
        return jsonArray;
    });
}
// Called by the sandbox to make fetch Jira ticket data
window.onmessage = (event) => __awaiter(void 0, void 0, void 0, function* () {
    if (event.data.pluginMessage.type === 'getTicketData') {
        console.log("Fetch data!");
        // Fetch data and send to sandbox
        var issueIds = event.data.pluginMessage.issueIds;
        var nodeIds = event.data.pluginMessage.nodeIds;
        // console.log(issueIds, nodeIds)
        const username = 'bittner.lukas@gmail.com';
        const password = 'adcGusBdCLgLYQsrtJBf1ACB';
        const companyName = 'lukasbittner';
        var ticketDataArray = yield getTicketDataFromJira(issueIds, username, password, companyName);
        parent.postMessage({ pluginMessage: { nodeIds: nodeIds, data: ticketDataArray, type: 'ticketDataSent' } }, '*');
    }
});
function fetchWithTimeout(url, options, timeout = 10000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout: It took too long for the server to respond.')), timeout))
    ]);
}
