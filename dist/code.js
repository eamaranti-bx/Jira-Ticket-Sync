/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/code.ts":
/*!*********************!*\
  !*** ./src/code.ts ***!
  \*********************/
/***/ (function() {

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const DOCUMENT_NODE = figma.currentPage.parent;
// Set the relaunch button for the whole document
DOCUMENT_NODE.setRelaunchData({ update_page: '', update_all: '' });
const WINDOW_WIDTH = 250;
const WINDOW_HEIGHT_BIG = 466;
const WINDOW_HEIGHT_SMALL = 276;
const COMPANY_NAME_KEY = "COMPANY_NAME";
const USERNAME_KEY = "USERNAME";
const PASSWORD_KEY = "PASSWORD";
const ISSUE_ID_KEY = "ISSUE_ID";
var company_name;
var username;
var password;
var issueId;
const FONT_REG = { family: "Work Sans", style: "Regular" };
const FONT_MED = { family: "Work Sans", style: "Medium" };
const FONT_BOLD = { family: "Work Sans", style: "Bold" };
function getStatus(data) { return data.fields.status.name; }
function getTitle(data) { return data.fields.summary; }
function getIssueId(data) { return data.key; }
function getChangeDate(data) { return data.fields.statuscategorychangedate; }
function getAssignee(data) { return data.fields.assignee.displayName; }
var nextTicketOffset = 0;
// ticketdata.fields.assignee.avatarUrls
// ticketdata.fields.status.name
// ticketdata.fields.status.statusCategory.name
const ISSUE_ID_NAME = "Ticket ID";
const ISSUE_TITLE_NAME = "Ticket Title";
const ISSUE_CHANGE_DATE_NAME = "Date of Status Change";
const ASSIGNEE_NAME = "Assignee";
const COMPONENT_SET_NAME = "Jira Ticket";
const COMPONENT_SET_PROPERTY_NAME = "Status=";
const VARIANT_NAME_1 = "To Do";
const VARIANT_COLOR_1 = hexToRgb('EEEEEE');
const VARIANT_NAME_2 = "Concepting";
const VARIANT_COLOR_2 = hexToRgb('FFEDC0');
const VARIANT_NAME_3 = "Design";
const VARIANT_COLOR_3 = hexToRgb('D7E0FF');
const VARIANT_NAME_4 = "Testing";
const VARIANT_COLOR_4 = hexToRgb('D7E0FF');
const VARIANT_NAME_DONE = "Launch";
const VARIANT_COLOR_DONE = hexToRgb('D3FFD2');
const VARIANT_NAME_DEFAULT = "Default";
const VARIANT_COLOR_DEFAULT = hexToRgb('B9B9B9');
const VARIANT_NAME_ERROR = "Error";
const VARIANT_COLOR_ERROR = hexToRgb('FFD9D9');
var ticketComponent;
// Don't show UI if relaunch buttons are run
if (figma.command === 'update') {
    updateWithoutUI("selection");
}
else if (figma.command === 'update_all') {
    updateWithoutUI("all");
}
else if (figma.command === 'update_page') {
    updateWithoutUI("page");
}
else {
    // Otherwise show UI
    figma.showUI(__html__, { width: WINDOW_WIDTH, height: WINDOW_HEIGHT_SMALL });
    sendData();
}
// Make sure the main component is referenced
referenceTicketComponentSet();
// Start plugin without visible UI and update tickets
function updateWithoutUI(type) {
    return __awaiter(this, void 0, void 0, function* () {
        figma.showUI(__html__, { visible: false });
        yield sendData();
        var hasFailed = requestUpdateForTickets(type);
        if (hasFailed && (type === "all" || type === "page")) {
            figma.closePlugin();
        }
    });
}
// Send the stored authorization data to the UI
function sendData() {
    return __awaiter(this, void 0, void 0, function* () {
        company_name = yield getAuthorizationInfo(COMPANY_NAME_KEY);
        username = yield getAuthorizationInfo(USERNAME_KEY);
        password = yield getAuthorizationInfo(PASSWORD_KEY);
        issueId = yield getAuthorizationInfo(ISSUE_ID_KEY);
        figma.ui.postMessage({ company_name: company_name, username: username, password: password, issueId: issueId, type: 'setAuthorizationVariables' });
    });
}
// All the functions that can be started from the UI
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    // Called to create a new main component and save its ID
    if (msg.type === 'create-component') {
        ticketComponent = yield createTicketComponentSet();
        DOCUMENT_NODE.setPluginData('ticketComponentID', ticketComponent.id);
    }
    // Called to create a new instance of a component (based on the issueId entered in the UI)
    if (msg.type === 'create-new-ticket' && checkFetchSuccess(msg.data)) {
        yield createTicketInstance(msg);
    }
    // Called to get all Jira Ticker Header instances and update them one by one. 
    if (msg.type === 'update-all') {
        requestUpdateForTickets("all");
    }
    // Called to get Jira Ticker Header instances on this page and update them one by one. 
    if (msg.type === 'update-page') {
        requestUpdateForTickets("page");
    }
    // Called to get selected Jira Ticker Header instances and update them one by one. 
    if (msg.type === 'update-selected') {
        requestUpdateForTickets("selection");
    }
    // Save new authorization info
    if (msg.type === 'authorization-detail-changed') {
        setAuthorizationInfo(msg.key, msg.data);
    }
    // Resize the UI
    if (msg.type === 'resize-ui') {
        msg.big_size ? figma.ui.resize(WINDOW_WIDTH, WINDOW_HEIGHT_BIG) : figma.ui.resize(WINDOW_WIDTH, WINDOW_HEIGHT_SMALL);
    }
    // Allows the UI to create notifications
    if (msg.type === 'create-visual-bell') {
        figma.notify(msg.message);
    }
    // Updates instances based on the received ticket data.
    if (msg.type === 'ticketDataSent' && checkFetchSuccess(msg.data)) {
        console.log("Ticket data:", msg.data);
        var nodeIds = msg.nodeIds;
        var nodes = nodeIds.map(id => figma.getNodeById(id));
        yield updateTickets(nodes, msg);
    }
});
// Saves authorization details in client storage
function setAuthorizationInfo(key, value) {
    return __awaiter(this, void 0, void 0, function* () {
        yield figma.clientStorage.setAsync(key, value);
    });
}
// Get authorization details from client storage
function getAuthorizationInfo(key) {
    return __awaiter(this, void 0, void 0, function* () {
        var valueSaved = yield figma.clientStorage.getAsync(key);
        if (!valueSaved)
            valueSaved = "";
        return valueSaved;
    });
}
/**
 * Get subset of tickets in document and start update process
 * @param subset A subset of ticket instances in the document
 * @returns Boolean if the subset could be updated
 */
function requestUpdateForTickets(subset) {
    let nodes;
    // All in document
    if (subset == "all") {
        console.log(1);
        nodes = DOCUMENT_NODE.findAllWithCriteria({
            types: ['INSTANCE']
        });
        nodes = nodes.filter(node => node.name === COMPONENT_SET_NAME);
        if (nodes.length == 0) {
            figma.notify(`No instances named '${COMPONENT_SET_NAME}' found in document.`);
            let isFailed = true;
            return isFailed;
        }
        else {
            getDataForTickets(nodes);
        }
    }
    // All on page
    else if (subset == "page") {
        nodes = figma.currentPage.findAllWithCriteria({
            types: ['INSTANCE']
        });
        nodes = nodes.filter(node => node.name === COMPONENT_SET_NAME);
        if (nodes.length == 0) {
            figma.notify(`No instances named '${COMPONENT_SET_NAME}' found on page.`);
            let isFailed = true;
            return isFailed;
        }
        else {
            getDataForTickets(nodes);
        }
    }
    // Selected elements
    else if (subset == "selection") {
        nodes = figma.currentPage.selection;
        if (nodes.length == 0) {
            figma.notify(`Nothing selected.`);
        }
        else {
            getDataForTickets(nodes);
        }
    }
}
/**
 * Sends a request to the UI to fetch data for an array of tickets
 * @param instances
 */
function getDataForTickets(instances) {
    return __awaiter(this, void 0, void 0, function* () {
        var nodeIds = [];
        var issueIds = [];
        for (let i = 0; i < instances.length; i++) {
            const node = instances[i];
            if (node.type !== "INSTANCE") {
                figma.notify("The element needs to be an instance of " + COMPONENT_SET_NAME);
            }
            else {
                let issueIdNode = node.findOne(n => n.type === "TEXT" && n.name === ISSUE_ID_NAME);
                if (!issueIdNode) {
                    figma.notify(`At least one instance is missing the text element '${ISSUE_ID_NAME}'. Could not update.`);
                }
                else {
                    issueIds.push(issueIdNode.characters);
                    nodeIds.push(node.id);
                }
            }
        }
        figma.ui.postMessage({ nodeIds: nodeIds, issueIds: issueIds, type: 'getTicketData' });
    });
}
/**
 * Updates a set of tickets based on their status.
 * Is called after the data is fetched.
 * @param ticketInstances A set of ticket instances
 * @param msg A message sent from the UI
 * @param isCreateNew Wether the function call is coming from an actual ticket update or from creating a new ticket
 * @returns Updated ticket instances
 */
function updateTickets(ticketInstances, msg, isCreateNew = false) {
    return __awaiter(this, void 0, void 0, function* () {
        var ticketDataArray = msg.data;
        var issueIds = msg.issueIds;
        var numberOfNodes = ticketInstances.length;
        var invalidIds = [];
        var numberOfMissingTitles = 0;
        var numberOfMissingDates = 0;
        var numberOfMissingAssignees = 0;
        var missingVariants = [];
        // Go through all nodes and update their content
        for (let i = 0; i < numberOfNodes; i++) {
            let ticketInstance = ticketInstances[i];
            let ticketData = checkTicketDataReponse(ticketDataArray[i], issueIds[i]);
            let ticketStatus = getStatus(ticketData);
            if (ticketStatus === 'Error')
                invalidIds.push(issueIds[i]);
            // Get the variant based on the ticket status and swap it with the current
            let newVariant = ticketComponent.findChild(n => n.name === COMPONENT_SET_PROPERTY_NAME + ticketStatus);
            if (!newVariant) { // If the status doesn't match any of the variants, use default
                newVariant = ticketComponent.defaultVariant;
                missingVariants.push(ticketStatus);
            }
            // Update title
            let titleTxt = ticketInstance.findOne(n => n.type === "TEXT" && n.name === ISSUE_TITLE_NAME);
            if (titleTxt) {
                yield figma.loadFontAsync(titleTxt.fontName);
                titleTxt.characters = getTitle(ticketData);
                titleTxt.hyperlink = { type: "URL", value: `https://${company_name}.atlassian.net/browse/${ticketData.key}` };
            }
            else {
                numberOfMissingTitles += 1;
            }
            // Update date
            let changeDateTxt = ticketInstance.findOne(n => n.type === "TEXT" && n.name === ISSUE_CHANGE_DATE_NAME);
            if (changeDateTxt) {
                yield figma.loadFontAsync(changeDateTxt.fontName);
                // Filters out the data to a simplet format (Mmm DD YYYY)
                var date = new Date(getChangeDate(ticketData).replace(/[T]+.*/, ""));
                changeDateTxt.characters = date.toDateString();
                // changeDateTxt.characters = date.toDateString().replace(/^([A-Za-z]*)./,"");
            }
            else {
                numberOfMissingDates += 1;
            }
            // Update assignee
            let assigneeTxt = ticketInstance.findOne(n => n.type === "TEXT" && n.name === ASSIGNEE_NAME);
            if (assigneeTxt) {
                yield figma.loadFontAsync(assigneeTxt.fontName);
                if (ticketData.fields.assignee) {
                    let assignee = getAssignee(ticketData);
                    console.log("assignee", assignee);
                    assigneeTxt.characters = assignee;
                }
                else {
                    assigneeTxt.characters = "Not assigned";
                }
            }
            else {
                numberOfMissingAssignees += 1;
            }
            // Add the relaunch button
            ticketInstance.swapComponent(newVariant);
            ticketInstance.setRelaunchData({ update: '' });
        }
        // Notify about errors (missing text fields)
        if (missingVariants.length > 0) {
            missingVariants = [...new Set(missingVariants)];
            let variantString = missingVariants.join("', '");
            figma.notify(`Status '${variantString}' not existing. You can add it as new variant to the main component.`, { timeout: 6000 });
        }
        if (numberOfMissingTitles > 0)
            figma.notify(`${numberOfMissingTitles} tickets are missing text element '${ISSUE_TITLE_NAME}'.`);
        if (numberOfMissingDates > 0)
            figma.notify(`${numberOfMissingDates} tickets are missing text element '${ISSUE_CHANGE_DATE_NAME}'.`);
        if (numberOfMissingAssignees > 0)
            figma.notify(`${numberOfMissingAssignees} tickets are missing text element '${ASSIGNEE_NAME}'.`);
        // Success message
        var message;
        var numberOfInvalidIds = invalidIds.length;
        if (numberOfInvalidIds == numberOfNodes) {
            // All invalid
            message = (numberOfNodes == 1) ? "Invalid ID." : `${numberOfInvalidIds} of ${numberOfNodes} IDs are invalid or do not exist.`;
        }
        else if (numberOfInvalidIds == 0) {
            // All valid
            message = (numberOfNodes == 1) ? "Updated." : `${numberOfNodes} of ${numberOfNodes} header(s) updated!`;
            if (isCreateNew)
                message = "";
        }
        else {
            // Some valid
            let firstSentence = `${numberOfNodes - numberOfInvalidIds} of ${numberOfNodes} successfully updated. `;
            let secondSentence = (numberOfInvalidIds == 1) ? "1 ID is invalid or does not exist." : `${numberOfInvalidIds} IDs are invalid or do not exist.`;
            message = firstSentence + secondSentence;
        }
        // If called via the relaunch button, close plugin after updating the tickets
        if (figma.command === 'update_page' || figma.command === 'update_all') {
            figma.closePlugin(message);
        }
        else {
            figma.notify(message, { timeout: 2000 });
        }
        return ticketInstances;
    });
}
/**
 * Create instances of the main ticket component and replaces the content with data of the actual Jira ticket
 * @param msg JSON with info sent from UI
 */
function createTicketInstance(msg) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create an instance and update it to the correct status
        let ticketVariant = ticketComponent.defaultVariant;
        let ticketInstance = ticketVariant.createInstance();
        ticketInstance.x = (figma.viewport.center.x - ticketInstance.width / 2) + nextTicketOffset;
        ticketInstance.y = (figma.viewport.center.y - ticketInstance.height / 2) + nextTicketOffset;
        nextTicketOffset = nextTicketOffset + 10 % 70;
        figma.currentPage.selection = [ticketInstance];
        let ticketData = checkTicketDataReponse(msg.data[0], msg.issueIds[0]);
        let ticketInstances = yield updateTickets([ticketInstance], msg, true);
        ticketInstance = ticketInstances[0];
        // Add ID
        let issueIDTxt = ticketInstance.findOne(n => n.type === "TEXT" && n.name === ISSUE_ID_NAME);
        if (issueIDTxt) {
            yield figma.loadFontAsync(issueIDTxt.fontName);
            issueIDTxt.characters = getIssueId(ticketData);
        }
        else {
            figma.notify("Could not find text element named '" + ISSUE_ID_NAME + "'.");
        }
    });
}
/**
 * Creates a new component that represents a ticket status
 * @param statusColor RGB value for status color
 * @param statusName Name of status
 * @returns A component that represent a ticket
 */
function createTicketVariant(statusColor, statusName) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create the main frame
        var ticketVariant = figma.createComponent();
        let padding = 24;
        ticketVariant.name = statusName;
        ticketVariant.layoutMode = "VERTICAL";
        ticketVariant.resize(600, 200);
        ticketVariant.counterAxisSizingMode = "FIXED";
        ticketVariant.primaryAxisSizingMode = "AUTO";
        ticketVariant.paddingTop = padding;
        ticketVariant.paddingRight = padding;
        ticketVariant.paddingBottom = padding;
        ticketVariant.paddingLeft = padding;
        ticketVariant.itemSpacing = 16;
        ticketVariant.cornerRadius = 4;
        ticketVariant.fills = [{ type: 'SOLID', color: statusColor }];
        // Create the header frame
        var headerFrame = figma.createFrame();
        headerFrame.name = "Header";
        headerFrame.layoutMode = "HORIZONTAL";
        headerFrame.counterAxisSizingMode = "AUTO";
        headerFrame.layoutAlign = "STRETCH";
        headerFrame.itemSpacing = 40;
        headerFrame.fills = [];
        // Create the header frame
        var detailsFrame = figma.createFrame();
        detailsFrame.name = "Header";
        detailsFrame.layoutMode = "HORIZONTAL";
        detailsFrame.counterAxisSizingMode = "AUTO";
        detailsFrame.layoutAlign = "STRETCH";
        detailsFrame.itemSpacing = 32;
        detailsFrame.fills = [];
        loadFonts().then(() => {
            // Add the ticket text fields
            const titleTxt = figma.createText();
            titleTxt.fontName = FONT_REG;
            titleTxt.fontSize = 32;
            titleTxt.textDecoration = "UNDERLINE";
            titleTxt.autoRename = false;
            titleTxt.characters = "Ticket title";
            titleTxt.name = ISSUE_TITLE_NAME;
            const issueIdTxt = figma.createText();
            issueIdTxt.fontName = FONT_MED;
            issueIdTxt.fontSize = 32;
            issueIdTxt.autoRename = false;
            issueIdTxt.characters = "ID-1";
            issueIdTxt.name = ISSUE_ID_NAME;
            const changeDateTxt = figma.createText();
            changeDateTxt.fontName = FONT_REG;
            changeDateTxt.fontSize = 24;
            changeDateTxt.autoRename = false;
            changeDateTxt.characters = "MM DD YYYY";
            changeDateTxt.name = ISSUE_CHANGE_DATE_NAME;
            const assigneeTxt = figma.createText();
            assigneeTxt.fontName = FONT_REG;
            assigneeTxt.fontSize = 24;
            assigneeTxt.autoRename = false;
            assigneeTxt.characters = "Name of assignee";
            assigneeTxt.name = ASSIGNEE_NAME;
            ticketVariant.appendChild(headerFrame);
            ticketVariant.appendChild(detailsFrame);
            headerFrame.appendChild(issueIdTxt);
            headerFrame.appendChild(titleTxt);
            detailsFrame.appendChild(assigneeTxt);
            detailsFrame.appendChild(changeDateTxt);
            titleTxt.layoutGrow = 1;
            assigneeTxt.layoutGrow = 1;
        }).catch(() => {
            figma.notify("Font '" + FONT_REG.family + "' could not be loaded. Please install the font.");
        });
        // Fixes a weird bug in which the 'stretch' doesnt work properly
        headerFrame.primaryAxisSizingMode = "FIXED";
        headerFrame.layoutAlign = "STRETCH";
        detailsFrame.primaryAxisSizingMode = "FIXED";
        detailsFrame.layoutAlign = "STRETCH";
        return ticketVariant;
    });
}
/**
 * Creates the main component for the tickets
 * @returns The main component
 */
function createTicketComponentSet() {
    return __awaiter(this, void 0, void 0, function* () {
        let ticketComponent;
        // Create variants (one for each status)
        let varDefault = yield createTicketVariant(VARIANT_COLOR_DEFAULT, COMPONENT_SET_PROPERTY_NAME + VARIANT_NAME_DEFAULT);
        let var1 = yield createTicketVariant(VARIANT_COLOR_1, COMPONENT_SET_PROPERTY_NAME + VARIANT_NAME_1);
        let var2 = yield createTicketVariant(VARIANT_COLOR_2, COMPONENT_SET_PROPERTY_NAME + VARIANT_NAME_2);
        let var3 = yield createTicketVariant(VARIANT_COLOR_3, COMPONENT_SET_PROPERTY_NAME + VARIANT_NAME_3);
        let var4 = yield createTicketVariant(VARIANT_COLOR_4, COMPONENT_SET_PROPERTY_NAME + VARIANT_NAME_4);
        let var5 = yield createTicketVariant(VARIANT_COLOR_DONE, COMPONENT_SET_PROPERTY_NAME + VARIANT_NAME_DONE);
        let varError = yield createTicketVariant(VARIANT_COLOR_ERROR, COMPONENT_SET_PROPERTY_NAME + VARIANT_NAME_ERROR);
        const variants = [varDefault, var1, var2, var3, var4, var5, varError];
        // Create a component out of all these variants
        ticketComponent = figma.combineAsVariants(variants, figma.currentPage);
        let padding = 16;
        ticketComponent.name = COMPONENT_SET_NAME;
        ticketComponent.layoutMode = "VERTICAL";
        ticketComponent.counterAxisSizingMode = "AUTO";
        ticketComponent.primaryAxisSizingMode = "AUTO";
        ticketComponent.paddingTop = padding;
        ticketComponent.paddingRight = padding;
        ticketComponent.paddingBottom = padding;
        ticketComponent.paddingLeft = padding;
        ticketComponent.itemSpacing = 24;
        ticketComponent.cornerRadius = 4;
        // Save component ID for later reference
        DOCUMENT_NODE.setPluginData('ticketComponentID', ticketComponent.id);
        // Make sure the component is visible where we're currently looking
        ticketComponent.x = figma.viewport.center.x - (ticketComponent.width / 2);
        ticketComponent.y = figma.viewport.center.y - (ticketComponent.height / 2);
        return ticketComponent;
    });
}
/**
 * Creates a new main ticket component or gets the reference to the existing one
 */
function referenceTicketComponentSet() {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if the ticket component is already saved in the variable
        if (!ticketComponent) {
            // If no, try the get the ticket component by its ID
            var ticketComponentId = DOCUMENT_NODE.getPluginData('ticketComponentID');
            let node;
            if (ticketComponentId && (node = figma.getNodeById(ticketComponentId))) {
                // If there is an ID saved, access the ticket component
                ticketComponent = node;
            }
            else {
                // If there is no ID, create a new component
                ticketComponent = yield createTicketComponentSet();
            }
        }
    });
}
// Checks if fetching data was successful at all 
function checkFetchSuccess(data) {
    var isSuccess = false;
    // Can this even happen?
    if (!data) {
        figma.notify("Something went wrong.");
        throw new Error("Something went wrong." + data);
    }
    // No connection to Firebase
    else if (data.type == "Error") {
        figma.notify("Could not get data. There seems to be no connection to the server.");
        throw new Error(data.message);
    }
    // Wrong e-mail
    else if (data[0].message == "Client must be authenticated to access this resource.") {
        figma.notify("You have entered an invalid e-mail. See 'Authorization' settings.");
        throw new Error(data.message);
    }
    // Wrong company name
    else if (data[0].errorMessage == "Site temporarily unavailable") {
        figma.notify("Company domain name does not exist. See 'Authorization' settings.");
        throw new Error(data[0].errorMessage);
    }
    // Wrong password
    else if (data[0][0]) {
        figma.notify("Could not access data. Your Jira API Token seems to be invalid. See 'Authorization' settings.");
        throw new Error(data[0][0]);
    }
    // Else, it was probably successful
    else {
        isSuccess = true;
    }
    return isSuccess;
}
// Checks if per received ticket data if the fetching was successful
function checkTicketDataReponse(ticketData, issueId) {
    var checkedData;
    // If the JSON has a key field, the data is valid
    if (ticketData && ticketData.key) {
        checkedData = ticketData;
    }
    // ID does not exist
    else if (ticketData.errorMessages == "The issue no longer exists.") {
        checkedData = createErrorDataJSON(`Error: Ticket ID '${issueId}' does not exist.`, issueId);
        // figma.notify(`Ticket ID '${issueId}' does not exist.`)
    }
    // ID has invalid format
    else if (ticketData.errorMessages == "Issue key is in an invalid format.") {
        checkedData = createErrorDataJSON(`Error: Ticket ID '${issueId}' is in an invalid format.`, issueId);
        // figma.notify(`Ticket ID '${issueId}' is in an invalid format.`)
    }
    // Other
    else {
        checkedData = createErrorDataJSON("Error: An unexpected error occured.", issueId);
        figma.notify("Unexpected error.");
        console.error("Unexpected error.", ticketData);
        // throw new Error(ticketData.message)
    }
    return checkedData;
}
// Create a error variable that has the same main fields as the Jira Ticket variable. 
// This will be used the fill the ticket data with the error message.
function createErrorDataJSON(message, issueId) {
    var today = new Date().toISOString();
    var errorData = {
        "key": issueId,
        "fields": {
            "summary": message,
            "status": {
                "name": "Error"
            },
            "statuscategorychangedate": today
        }
    };
    return errorData;
}
// Function for loading all the fonts for the main component
function loadFonts() {
    return __awaiter(this, void 0, void 0, function* () {
        yield figma.loadFontAsync(FONT_REG);
        yield figma.loadFontAsync(FONT_MED);
        yield figma.loadFontAsync(FONT_BOLD);
    });
}
// Formats a hex value to RGB
function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return { r: r / 255, g: g / 255, b: b / 255 };
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/code.ts"]();
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrREFBK0QsUUFBUTtBQUN2RSxzQ0FBc0MsUUFBUTtBQUM5QztBQUNBO0FBQ0E7QUFDQSwrREFBK0QsUUFBUTtBQUN2RSxzQ0FBc0MsUUFBUTtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7Ozs7Ozs7O1VFM2xCQTtVQUNBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2VicGFjay1yZWFjdC8uL3NyYy9jb2RlLnRzIiwid2VicGFjazovL3dlYnBhY2stcmVhY3Qvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly93ZWJwYWNrLXJlYWN0L3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly93ZWJwYWNrLXJlYWN0L3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbmNvbnN0IERPQ1VNRU5UX05PREUgPSBmaWdtYS5jdXJyZW50UGFnZS5wYXJlbnQ7XG4vLyBTZXQgdGhlIHJlbGF1bmNoIGJ1dHRvbiBmb3IgdGhlIHdob2xlIGRvY3VtZW50XG5ET0NVTUVOVF9OT0RFLnNldFJlbGF1bmNoRGF0YSh7IHVwZGF0ZV9wYWdlOiAnJywgdXBkYXRlX2FsbDogJycgfSk7XG5jb25zdCBXSU5ET1dfV0lEVEggPSAyNTA7XG5jb25zdCBXSU5ET1dfSEVJR0hUX0JJRyA9IDQ2NjtcbmNvbnN0IFdJTkRPV19IRUlHSFRfU01BTEwgPSAyNzY7XG5jb25zdCBDT01QQU5ZX05BTUVfS0VZID0gXCJDT01QQU5ZX05BTUVcIjtcbmNvbnN0IFVTRVJOQU1FX0tFWSA9IFwiVVNFUk5BTUVcIjtcbmNvbnN0IFBBU1NXT1JEX0tFWSA9IFwiUEFTU1dPUkRcIjtcbmNvbnN0IElTU1VFX0lEX0tFWSA9IFwiSVNTVUVfSURcIjtcbnZhciBjb21wYW55X25hbWU7XG52YXIgdXNlcm5hbWU7XG52YXIgcGFzc3dvcmQ7XG52YXIgaXNzdWVJZDtcbmNvbnN0IEZPTlRfUkVHID0geyBmYW1pbHk6IFwiV29yayBTYW5zXCIsIHN0eWxlOiBcIlJlZ3VsYXJcIiB9O1xuY29uc3QgRk9OVF9NRUQgPSB7IGZhbWlseTogXCJXb3JrIFNhbnNcIiwgc3R5bGU6IFwiTWVkaXVtXCIgfTtcbmNvbnN0IEZPTlRfQk9MRCA9IHsgZmFtaWx5OiBcIldvcmsgU2Fuc1wiLCBzdHlsZTogXCJCb2xkXCIgfTtcbmZ1bmN0aW9uIGdldFN0YXR1cyhkYXRhKSB7IHJldHVybiBkYXRhLmZpZWxkcy5zdGF0dXMubmFtZTsgfVxuZnVuY3Rpb24gZ2V0VGl0bGUoZGF0YSkgeyByZXR1cm4gZGF0YS5maWVsZHMuc3VtbWFyeTsgfVxuZnVuY3Rpb24gZ2V0SXNzdWVJZChkYXRhKSB7IHJldHVybiBkYXRhLmtleTsgfVxuZnVuY3Rpb24gZ2V0Q2hhbmdlRGF0ZShkYXRhKSB7IHJldHVybiBkYXRhLmZpZWxkcy5zdGF0dXNjYXRlZ29yeWNoYW5nZWRhdGU7IH1cbmZ1bmN0aW9uIGdldEFzc2lnbmVlKGRhdGEpIHsgcmV0dXJuIGRhdGEuZmllbGRzLmFzc2lnbmVlLmRpc3BsYXlOYW1lOyB9XG52YXIgbmV4dFRpY2tldE9mZnNldCA9IDA7XG4vLyB0aWNrZXRkYXRhLmZpZWxkcy5hc3NpZ25lZS5hdmF0YXJVcmxzXG4vLyB0aWNrZXRkYXRhLmZpZWxkcy5zdGF0dXMubmFtZVxuLy8gdGlja2V0ZGF0YS5maWVsZHMuc3RhdHVzLnN0YXR1c0NhdGVnb3J5Lm5hbWVcbmNvbnN0IElTU1VFX0lEX05BTUUgPSBcIlRpY2tldCBJRFwiO1xuY29uc3QgSVNTVUVfVElUTEVfTkFNRSA9IFwiVGlja2V0IFRpdGxlXCI7XG5jb25zdCBJU1NVRV9DSEFOR0VfREFURV9OQU1FID0gXCJEYXRlIG9mIFN0YXR1cyBDaGFuZ2VcIjtcbmNvbnN0IEFTU0lHTkVFX05BTUUgPSBcIkFzc2lnbmVlXCI7XG5jb25zdCBDT01QT05FTlRfU0VUX05BTUUgPSBcIkppcmEgVGlja2V0XCI7XG5jb25zdCBDT01QT05FTlRfU0VUX1BST1BFUlRZX05BTUUgPSBcIlN0YXR1cz1cIjtcbmNvbnN0IFZBUklBTlRfTkFNRV8xID0gXCJUbyBEb1wiO1xuY29uc3QgVkFSSUFOVF9DT0xPUl8xID0gaGV4VG9SZ2IoJ0VFRUVFRScpO1xuY29uc3QgVkFSSUFOVF9OQU1FXzIgPSBcIkNvbmNlcHRpbmdcIjtcbmNvbnN0IFZBUklBTlRfQ09MT1JfMiA9IGhleFRvUmdiKCdGRkVEQzAnKTtcbmNvbnN0IFZBUklBTlRfTkFNRV8zID0gXCJEZXNpZ25cIjtcbmNvbnN0IFZBUklBTlRfQ09MT1JfMyA9IGhleFRvUmdiKCdEN0UwRkYnKTtcbmNvbnN0IFZBUklBTlRfTkFNRV80ID0gXCJUZXN0aW5nXCI7XG5jb25zdCBWQVJJQU5UX0NPTE9SXzQgPSBoZXhUb1JnYignRDdFMEZGJyk7XG5jb25zdCBWQVJJQU5UX05BTUVfRE9ORSA9IFwiTGF1bmNoXCI7XG5jb25zdCBWQVJJQU5UX0NPTE9SX0RPTkUgPSBoZXhUb1JnYignRDNGRkQyJyk7XG5jb25zdCBWQVJJQU5UX05BTUVfREVGQVVMVCA9IFwiRGVmYXVsdFwiO1xuY29uc3QgVkFSSUFOVF9DT0xPUl9ERUZBVUxUID0gaGV4VG9SZ2IoJ0I5QjlCOScpO1xuY29uc3QgVkFSSUFOVF9OQU1FX0VSUk9SID0gXCJFcnJvclwiO1xuY29uc3QgVkFSSUFOVF9DT0xPUl9FUlJPUiA9IGhleFRvUmdiKCdGRkQ5RDknKTtcbnZhciB0aWNrZXRDb21wb25lbnQ7XG4vLyBEb24ndCBzaG93IFVJIGlmIHJlbGF1bmNoIGJ1dHRvbnMgYXJlIHJ1blxuaWYgKGZpZ21hLmNvbW1hbmQgPT09ICd1cGRhdGUnKSB7XG4gICAgdXBkYXRlV2l0aG91dFVJKFwic2VsZWN0aW9uXCIpO1xufVxuZWxzZSBpZiAoZmlnbWEuY29tbWFuZCA9PT0gJ3VwZGF0ZV9hbGwnKSB7XG4gICAgdXBkYXRlV2l0aG91dFVJKFwiYWxsXCIpO1xufVxuZWxzZSBpZiAoZmlnbWEuY29tbWFuZCA9PT0gJ3VwZGF0ZV9wYWdlJykge1xuICAgIHVwZGF0ZVdpdGhvdXRVSShcInBhZ2VcIik7XG59XG5lbHNlIHtcbiAgICAvLyBPdGhlcndpc2Ugc2hvdyBVSVxuICAgIGZpZ21hLnNob3dVSShfX2h0bWxfXywgeyB3aWR0aDogV0lORE9XX1dJRFRILCBoZWlnaHQ6IFdJTkRPV19IRUlHSFRfU01BTEwgfSk7XG4gICAgc2VuZERhdGEoKTtcbn1cbi8vIE1ha2Ugc3VyZSB0aGUgbWFpbiBjb21wb25lbnQgaXMgcmVmZXJlbmNlZFxucmVmZXJlbmNlVGlja2V0Q29tcG9uZW50U2V0KCk7XG4vLyBTdGFydCBwbHVnaW4gd2l0aG91dCB2aXNpYmxlIFVJIGFuZCB1cGRhdGUgdGlja2V0c1xuZnVuY3Rpb24gdXBkYXRlV2l0aG91dFVJKHR5cGUpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICBmaWdtYS5zaG93VUkoX19odG1sX18sIHsgdmlzaWJsZTogZmFsc2UgfSk7XG4gICAgICAgIHlpZWxkIHNlbmREYXRhKCk7XG4gICAgICAgIHZhciBoYXNGYWlsZWQgPSByZXF1ZXN0VXBkYXRlRm9yVGlja2V0cyh0eXBlKTtcbiAgICAgICAgaWYgKGhhc0ZhaWxlZCAmJiAodHlwZSA9PT0gXCJhbGxcIiB8fCB0eXBlID09PSBcInBhZ2VcIikpIHtcbiAgICAgICAgICAgIGZpZ21hLmNsb3NlUGx1Z2luKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbi8vIFNlbmQgdGhlIHN0b3JlZCBhdXRob3JpemF0aW9uIGRhdGEgdG8gdGhlIFVJXG5mdW5jdGlvbiBzZW5kRGF0YSgpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICBjb21wYW55X25hbWUgPSB5aWVsZCBnZXRBdXRob3JpemF0aW9uSW5mbyhDT01QQU5ZX05BTUVfS0VZKTtcbiAgICAgICAgdXNlcm5hbWUgPSB5aWVsZCBnZXRBdXRob3JpemF0aW9uSW5mbyhVU0VSTkFNRV9LRVkpO1xuICAgICAgICBwYXNzd29yZCA9IHlpZWxkIGdldEF1dGhvcml6YXRpb25JbmZvKFBBU1NXT1JEX0tFWSk7XG4gICAgICAgIGlzc3VlSWQgPSB5aWVsZCBnZXRBdXRob3JpemF0aW9uSW5mbyhJU1NVRV9JRF9LRVkpO1xuICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7IGNvbXBhbnlfbmFtZTogY29tcGFueV9uYW1lLCB1c2VybmFtZTogdXNlcm5hbWUsIHBhc3N3b3JkOiBwYXNzd29yZCwgaXNzdWVJZDogaXNzdWVJZCwgdHlwZTogJ3NldEF1dGhvcml6YXRpb25WYXJpYWJsZXMnIH0pO1xuICAgIH0pO1xufVxuLy8gQWxsIHRoZSBmdW5jdGlvbnMgdGhhdCBjYW4gYmUgc3RhcnRlZCBmcm9tIHRoZSBVSVxuZmlnbWEudWkub25tZXNzYWdlID0gKG1zZykgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgIC8vIENhbGxlZCB0byBjcmVhdGUgYSBuZXcgbWFpbiBjb21wb25lbnQgYW5kIHNhdmUgaXRzIElEXG4gICAgaWYgKG1zZy50eXBlID09PSAnY3JlYXRlLWNvbXBvbmVudCcpIHtcbiAgICAgICAgdGlja2V0Q29tcG9uZW50ID0geWllbGQgY3JlYXRlVGlja2V0Q29tcG9uZW50U2V0KCk7XG4gICAgICAgIERPQ1VNRU5UX05PREUuc2V0UGx1Z2luRGF0YSgndGlja2V0Q29tcG9uZW50SUQnLCB0aWNrZXRDb21wb25lbnQuaWQpO1xuICAgIH1cbiAgICAvLyBDYWxsZWQgdG8gY3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIGEgY29tcG9uZW50IChiYXNlZCBvbiB0aGUgaXNzdWVJZCBlbnRlcmVkIGluIHRoZSBVSSlcbiAgICBpZiAobXNnLnR5cGUgPT09ICdjcmVhdGUtbmV3LXRpY2tldCcgJiYgY2hlY2tGZXRjaFN1Y2Nlc3MobXNnLmRhdGEpKSB7XG4gICAgICAgIHlpZWxkIGNyZWF0ZVRpY2tldEluc3RhbmNlKG1zZyk7XG4gICAgfVxuICAgIC8vIENhbGxlZCB0byBnZXQgYWxsIEppcmEgVGlja2VyIEhlYWRlciBpbnN0YW5jZXMgYW5kIHVwZGF0ZSB0aGVtIG9uZSBieSBvbmUuIFxuICAgIGlmIChtc2cudHlwZSA9PT0gJ3VwZGF0ZS1hbGwnKSB7XG4gICAgICAgIHJlcXVlc3RVcGRhdGVGb3JUaWNrZXRzKFwiYWxsXCIpO1xuICAgIH1cbiAgICAvLyBDYWxsZWQgdG8gZ2V0IEppcmEgVGlja2VyIEhlYWRlciBpbnN0YW5jZXMgb24gdGhpcyBwYWdlIGFuZCB1cGRhdGUgdGhlbSBvbmUgYnkgb25lLiBcbiAgICBpZiAobXNnLnR5cGUgPT09ICd1cGRhdGUtcGFnZScpIHtcbiAgICAgICAgcmVxdWVzdFVwZGF0ZUZvclRpY2tldHMoXCJwYWdlXCIpO1xuICAgIH1cbiAgICAvLyBDYWxsZWQgdG8gZ2V0IHNlbGVjdGVkIEppcmEgVGlja2VyIEhlYWRlciBpbnN0YW5jZXMgYW5kIHVwZGF0ZSB0aGVtIG9uZSBieSBvbmUuIFxuICAgIGlmIChtc2cudHlwZSA9PT0gJ3VwZGF0ZS1zZWxlY3RlZCcpIHtcbiAgICAgICAgcmVxdWVzdFVwZGF0ZUZvclRpY2tldHMoXCJzZWxlY3Rpb25cIik7XG4gICAgfVxuICAgIC8vIFNhdmUgbmV3IGF1dGhvcml6YXRpb24gaW5mb1xuICAgIGlmIChtc2cudHlwZSA9PT0gJ2F1dGhvcml6YXRpb24tZGV0YWlsLWNoYW5nZWQnKSB7XG4gICAgICAgIHNldEF1dGhvcml6YXRpb25JbmZvKG1zZy5rZXksIG1zZy5kYXRhKTtcbiAgICB9XG4gICAgLy8gUmVzaXplIHRoZSBVSVxuICAgIGlmIChtc2cudHlwZSA9PT0gJ3Jlc2l6ZS11aScpIHtcbiAgICAgICAgbXNnLmJpZ19zaXplID8gZmlnbWEudWkucmVzaXplKFdJTkRPV19XSURUSCwgV0lORE9XX0hFSUdIVF9CSUcpIDogZmlnbWEudWkucmVzaXplKFdJTkRPV19XSURUSCwgV0lORE9XX0hFSUdIVF9TTUFMTCk7XG4gICAgfVxuICAgIC8vIEFsbG93cyB0aGUgVUkgdG8gY3JlYXRlIG5vdGlmaWNhdGlvbnNcbiAgICBpZiAobXNnLnR5cGUgPT09ICdjcmVhdGUtdmlzdWFsLWJlbGwnKSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeShtc2cubWVzc2FnZSk7XG4gICAgfVxuICAgIC8vIFVwZGF0ZXMgaW5zdGFuY2VzIGJhc2VkIG9uIHRoZSByZWNlaXZlZCB0aWNrZXQgZGF0YS5cbiAgICBpZiAobXNnLnR5cGUgPT09ICd0aWNrZXREYXRhU2VudCcgJiYgY2hlY2tGZXRjaFN1Y2Nlc3MobXNnLmRhdGEpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVGlja2V0IGRhdGE6XCIsIG1zZy5kYXRhKTtcbiAgICAgICAgdmFyIG5vZGVJZHMgPSBtc2cubm9kZUlkcztcbiAgICAgICAgdmFyIG5vZGVzID0gbm9kZUlkcy5tYXAoaWQgPT4gZmlnbWEuZ2V0Tm9kZUJ5SWQoaWQpKTtcbiAgICAgICAgeWllbGQgdXBkYXRlVGlja2V0cyhub2RlcywgbXNnKTtcbiAgICB9XG59KTtcbi8vIFNhdmVzIGF1dGhvcml6YXRpb24gZGV0YWlscyBpbiBjbGllbnQgc3RvcmFnZVxuZnVuY3Rpb24gc2V0QXV0aG9yaXphdGlvbkluZm8oa2V5LCB2YWx1ZSkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIHlpZWxkIGZpZ21hLmNsaWVudFN0b3JhZ2Uuc2V0QXN5bmMoa2V5LCB2YWx1ZSk7XG4gICAgfSk7XG59XG4vLyBHZXQgYXV0aG9yaXphdGlvbiBkZXRhaWxzIGZyb20gY2xpZW50IHN0b3JhZ2VcbmZ1bmN0aW9uIGdldEF1dGhvcml6YXRpb25JbmZvKGtleSkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIHZhciB2YWx1ZVNhdmVkID0geWllbGQgZmlnbWEuY2xpZW50U3RvcmFnZS5nZXRBc3luYyhrZXkpO1xuICAgICAgICBpZiAoIXZhbHVlU2F2ZWQpXG4gICAgICAgICAgICB2YWx1ZVNhdmVkID0gXCJcIjtcbiAgICAgICAgcmV0dXJuIHZhbHVlU2F2ZWQ7XG4gICAgfSk7XG59XG4vKipcbiAqIEdldCBzdWJzZXQgb2YgdGlja2V0cyBpbiBkb2N1bWVudCBhbmQgc3RhcnQgdXBkYXRlIHByb2Nlc3NcbiAqIEBwYXJhbSBzdWJzZXQgQSBzdWJzZXQgb2YgdGlja2V0IGluc3RhbmNlcyBpbiB0aGUgZG9jdW1lbnRcbiAqIEByZXR1cm5zIEJvb2xlYW4gaWYgdGhlIHN1YnNldCBjb3VsZCBiZSB1cGRhdGVkXG4gKi9cbmZ1bmN0aW9uIHJlcXVlc3RVcGRhdGVGb3JUaWNrZXRzKHN1YnNldCkge1xuICAgIGxldCBub2RlcztcbiAgICAvLyBBbGwgaW4gZG9jdW1lbnRcbiAgICBpZiAoc3Vic2V0ID09IFwiYWxsXCIpIHtcbiAgICAgICAgY29uc29sZS5sb2coMSk7XG4gICAgICAgIG5vZGVzID0gRE9DVU1FTlRfTk9ERS5maW5kQWxsV2l0aENyaXRlcmlhKHtcbiAgICAgICAgICAgIHR5cGVzOiBbJ0lOU1RBTkNFJ11cbiAgICAgICAgfSk7XG4gICAgICAgIG5vZGVzID0gbm9kZXMuZmlsdGVyKG5vZGUgPT4gbm9kZS5uYW1lID09PSBDT01QT05FTlRfU0VUX05BTUUpO1xuICAgICAgICBpZiAobm9kZXMubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIGZpZ21hLm5vdGlmeShgTm8gaW5zdGFuY2VzIG5hbWVkICcke0NPTVBPTkVOVF9TRVRfTkFNRX0nIGZvdW5kIGluIGRvY3VtZW50LmApO1xuICAgICAgICAgICAgbGV0IGlzRmFpbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBpc0ZhaWxlZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGdldERhdGFGb3JUaWNrZXRzKG5vZGVzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBBbGwgb24gcGFnZVxuICAgIGVsc2UgaWYgKHN1YnNldCA9PSBcInBhZ2VcIikge1xuICAgICAgICBub2RlcyA9IGZpZ21hLmN1cnJlbnRQYWdlLmZpbmRBbGxXaXRoQ3JpdGVyaWEoe1xuICAgICAgICAgICAgdHlwZXM6IFsnSU5TVEFOQ0UnXVxuICAgICAgICB9KTtcbiAgICAgICAgbm9kZXMgPSBub2Rlcy5maWx0ZXIobm9kZSA9PiBub2RlLm5hbWUgPT09IENPTVBPTkVOVF9TRVRfTkFNRSk7XG4gICAgICAgIGlmIChub2Rlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgZmlnbWEubm90aWZ5KGBObyBpbnN0YW5jZXMgbmFtZWQgJyR7Q09NUE9ORU5UX1NFVF9OQU1FfScgZm91bmQgb24gcGFnZS5gKTtcbiAgICAgICAgICAgIGxldCBpc0ZhaWxlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gaXNGYWlsZWQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBnZXREYXRhRm9yVGlja2V0cyhub2Rlcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gU2VsZWN0ZWQgZWxlbWVudHNcbiAgICBlbHNlIGlmIChzdWJzZXQgPT0gXCJzZWxlY3Rpb25cIikge1xuICAgICAgICBub2RlcyA9IGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbjtcbiAgICAgICAgaWYgKG5vZGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICBmaWdtYS5ub3RpZnkoYE5vdGhpbmcgc2VsZWN0ZWQuYCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBnZXREYXRhRm9yVGlja2V0cyhub2Rlcyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIFNlbmRzIGEgcmVxdWVzdCB0byB0aGUgVUkgdG8gZmV0Y2ggZGF0YSBmb3IgYW4gYXJyYXkgb2YgdGlja2V0c1xuICogQHBhcmFtIGluc3RhbmNlc1xuICovXG5mdW5jdGlvbiBnZXREYXRhRm9yVGlja2V0cyhpbnN0YW5jZXMpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICB2YXIgbm9kZUlkcyA9IFtdO1xuICAgICAgICB2YXIgaXNzdWVJZHMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnN0YW5jZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBpbnN0YW5jZXNbaV07XG4gICAgICAgICAgICBpZiAobm9kZS50eXBlICE9PSBcIklOU1RBTkNFXCIpIHtcbiAgICAgICAgICAgICAgICBmaWdtYS5ub3RpZnkoXCJUaGUgZWxlbWVudCBuZWVkcyB0byBiZSBhbiBpbnN0YW5jZSBvZiBcIiArIENPTVBPTkVOVF9TRVRfTkFNRSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgaXNzdWVJZE5vZGUgPSBub2RlLmZpbmRPbmUobiA9PiBuLnR5cGUgPT09IFwiVEVYVFwiICYmIG4ubmFtZSA9PT0gSVNTVUVfSURfTkFNRSk7XG4gICAgICAgICAgICAgICAgaWYgKCFpc3N1ZUlkTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBmaWdtYS5ub3RpZnkoYEF0IGxlYXN0IG9uZSBpbnN0YW5jZSBpcyBtaXNzaW5nIHRoZSB0ZXh0IGVsZW1lbnQgJyR7SVNTVUVfSURfTkFNRX0nLiBDb3VsZCBub3QgdXBkYXRlLmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXNzdWVJZHMucHVzaChpc3N1ZUlkTm9kZS5jaGFyYWN0ZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZUlkcy5wdXNoKG5vZGUuaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7IG5vZGVJZHM6IG5vZGVJZHMsIGlzc3VlSWRzOiBpc3N1ZUlkcywgdHlwZTogJ2dldFRpY2tldERhdGEnIH0pO1xuICAgIH0pO1xufVxuLyoqXG4gKiBVcGRhdGVzIGEgc2V0IG9mIHRpY2tldHMgYmFzZWQgb24gdGhlaXIgc3RhdHVzLlxuICogSXMgY2FsbGVkIGFmdGVyIHRoZSBkYXRhIGlzIGZldGNoZWQuXG4gKiBAcGFyYW0gdGlja2V0SW5zdGFuY2VzIEEgc2V0IG9mIHRpY2tldCBpbnN0YW5jZXNcbiAqIEBwYXJhbSBtc2cgQSBtZXNzYWdlIHNlbnQgZnJvbSB0aGUgVUlcbiAqIEBwYXJhbSBpc0NyZWF0ZU5ldyBXZXRoZXIgdGhlIGZ1bmN0aW9uIGNhbGwgaXMgY29taW5nIGZyb20gYW4gYWN0dWFsIHRpY2tldCB1cGRhdGUgb3IgZnJvbSBjcmVhdGluZyBhIG5ldyB0aWNrZXRcbiAqIEByZXR1cm5zIFVwZGF0ZWQgdGlja2V0IGluc3RhbmNlc1xuICovXG5mdW5jdGlvbiB1cGRhdGVUaWNrZXRzKHRpY2tldEluc3RhbmNlcywgbXNnLCBpc0NyZWF0ZU5ldyA9IGZhbHNlKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgdmFyIHRpY2tldERhdGFBcnJheSA9IG1zZy5kYXRhO1xuICAgICAgICB2YXIgaXNzdWVJZHMgPSBtc2cuaXNzdWVJZHM7XG4gICAgICAgIHZhciBudW1iZXJPZk5vZGVzID0gdGlja2V0SW5zdGFuY2VzLmxlbmd0aDtcbiAgICAgICAgdmFyIGludmFsaWRJZHMgPSBbXTtcbiAgICAgICAgdmFyIG51bWJlck9mTWlzc2luZ1RpdGxlcyA9IDA7XG4gICAgICAgIHZhciBudW1iZXJPZk1pc3NpbmdEYXRlcyA9IDA7XG4gICAgICAgIHZhciBudW1iZXJPZk1pc3NpbmdBc3NpZ25lZXMgPSAwO1xuICAgICAgICB2YXIgbWlzc2luZ1ZhcmlhbnRzID0gW107XG4gICAgICAgIC8vIEdvIHRocm91Z2ggYWxsIG5vZGVzIGFuZCB1cGRhdGUgdGhlaXIgY29udGVudFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlck9mTm9kZXM7IGkrKykge1xuICAgICAgICAgICAgbGV0IHRpY2tldEluc3RhbmNlID0gdGlja2V0SW5zdGFuY2VzW2ldO1xuICAgICAgICAgICAgbGV0IHRpY2tldERhdGEgPSBjaGVja1RpY2tldERhdGFSZXBvbnNlKHRpY2tldERhdGFBcnJheVtpXSwgaXNzdWVJZHNbaV0pO1xuICAgICAgICAgICAgbGV0IHRpY2tldFN0YXR1cyA9IGdldFN0YXR1cyh0aWNrZXREYXRhKTtcbiAgICAgICAgICAgIGlmICh0aWNrZXRTdGF0dXMgPT09ICdFcnJvcicpXG4gICAgICAgICAgICAgICAgaW52YWxpZElkcy5wdXNoKGlzc3VlSWRzW2ldKTtcbiAgICAgICAgICAgIC8vIEdldCB0aGUgdmFyaWFudCBiYXNlZCBvbiB0aGUgdGlja2V0IHN0YXR1cyBhbmQgc3dhcCBpdCB3aXRoIHRoZSBjdXJyZW50XG4gICAgICAgICAgICBsZXQgbmV3VmFyaWFudCA9IHRpY2tldENvbXBvbmVudC5maW5kQ2hpbGQobiA9PiBuLm5hbWUgPT09IENPTVBPTkVOVF9TRVRfUFJPUEVSVFlfTkFNRSArIHRpY2tldFN0YXR1cyk7XG4gICAgICAgICAgICBpZiAoIW5ld1ZhcmlhbnQpIHsgLy8gSWYgdGhlIHN0YXR1cyBkb2Vzbid0IG1hdGNoIGFueSBvZiB0aGUgdmFyaWFudHMsIHVzZSBkZWZhdWx0XG4gICAgICAgICAgICAgICAgbmV3VmFyaWFudCA9IHRpY2tldENvbXBvbmVudC5kZWZhdWx0VmFyaWFudDtcbiAgICAgICAgICAgICAgICBtaXNzaW5nVmFyaWFudHMucHVzaCh0aWNrZXRTdGF0dXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVXBkYXRlIHRpdGxlXG4gICAgICAgICAgICBsZXQgdGl0bGVUeHQgPSB0aWNrZXRJbnN0YW5jZS5maW5kT25lKG4gPT4gbi50eXBlID09PSBcIlRFWFRcIiAmJiBuLm5hbWUgPT09IElTU1VFX1RJVExFX05BTUUpO1xuICAgICAgICAgICAgaWYgKHRpdGxlVHh0KSB7XG4gICAgICAgICAgICAgICAgeWllbGQgZmlnbWEubG9hZEZvbnRBc3luYyh0aXRsZVR4dC5mb250TmFtZSk7XG4gICAgICAgICAgICAgICAgdGl0bGVUeHQuY2hhcmFjdGVycyA9IGdldFRpdGxlKHRpY2tldERhdGEpO1xuICAgICAgICAgICAgICAgIHRpdGxlVHh0Lmh5cGVybGluayA9IHsgdHlwZTogXCJVUkxcIiwgdmFsdWU6IGBodHRwczovLyR7Y29tcGFueV9uYW1lfS5hdGxhc3NpYW4ubmV0L2Jyb3dzZS8ke3RpY2tldERhdGEua2V5fWAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG51bWJlck9mTWlzc2luZ1RpdGxlcyArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVXBkYXRlIGRhdGVcbiAgICAgICAgICAgIGxldCBjaGFuZ2VEYXRlVHh0ID0gdGlja2V0SW5zdGFuY2UuZmluZE9uZShuID0+IG4udHlwZSA9PT0gXCJURVhUXCIgJiYgbi5uYW1lID09PSBJU1NVRV9DSEFOR0VfREFURV9OQU1FKTtcbiAgICAgICAgICAgIGlmIChjaGFuZ2VEYXRlVHh0KSB7XG4gICAgICAgICAgICAgICAgeWllbGQgZmlnbWEubG9hZEZvbnRBc3luYyhjaGFuZ2VEYXRlVHh0LmZvbnROYW1lKTtcbiAgICAgICAgICAgICAgICAvLyBGaWx0ZXJzIG91dCB0aGUgZGF0YSB0byBhIHNpbXBsZXQgZm9ybWF0IChNbW0gREQgWVlZWSlcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKGdldENoYW5nZURhdGUodGlja2V0RGF0YSkucmVwbGFjZSgvW1RdKy4qLywgXCJcIikpO1xuICAgICAgICAgICAgICAgIGNoYW5nZURhdGVUeHQuY2hhcmFjdGVycyA9IGRhdGUudG9EYXRlU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgLy8gY2hhbmdlRGF0ZVR4dC5jaGFyYWN0ZXJzID0gZGF0ZS50b0RhdGVTdHJpbmcoKS5yZXBsYWNlKC9eKFtBLVphLXpdKikuLyxcIlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG51bWJlck9mTWlzc2luZ0RhdGVzICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBVcGRhdGUgYXNzaWduZWVcbiAgICAgICAgICAgIGxldCBhc3NpZ25lZVR4dCA9IHRpY2tldEluc3RhbmNlLmZpbmRPbmUobiA9PiBuLnR5cGUgPT09IFwiVEVYVFwiICYmIG4ubmFtZSA9PT0gQVNTSUdORUVfTkFNRSk7XG4gICAgICAgICAgICBpZiAoYXNzaWduZWVUeHQpIHtcbiAgICAgICAgICAgICAgICB5aWVsZCBmaWdtYS5sb2FkRm9udEFzeW5jKGFzc2lnbmVlVHh0LmZvbnROYW1lKTtcbiAgICAgICAgICAgICAgICBpZiAodGlja2V0RGF0YS5maWVsZHMuYXNzaWduZWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFzc2lnbmVlID0gZ2V0QXNzaWduZWUodGlja2V0RGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYXNzaWduZWVcIiwgYXNzaWduZWUpO1xuICAgICAgICAgICAgICAgICAgICBhc3NpZ25lZVR4dC5jaGFyYWN0ZXJzID0gYXNzaWduZWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhc3NpZ25lZVR4dC5jaGFyYWN0ZXJzID0gXCJOb3QgYXNzaWduZWRcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBudW1iZXJPZk1pc3NpbmdBc3NpZ25lZXMgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEFkZCB0aGUgcmVsYXVuY2ggYnV0dG9uXG4gICAgICAgICAgICB0aWNrZXRJbnN0YW5jZS5zd2FwQ29tcG9uZW50KG5ld1ZhcmlhbnQpO1xuICAgICAgICAgICAgdGlja2V0SW5zdGFuY2Uuc2V0UmVsYXVuY2hEYXRhKHsgdXBkYXRlOiAnJyB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBOb3RpZnkgYWJvdXQgZXJyb3JzIChtaXNzaW5nIHRleHQgZmllbGRzKVxuICAgICAgICBpZiAobWlzc2luZ1ZhcmlhbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIG1pc3NpbmdWYXJpYW50cyA9IFsuLi5uZXcgU2V0KG1pc3NpbmdWYXJpYW50cyldO1xuICAgICAgICAgICAgbGV0IHZhcmlhbnRTdHJpbmcgPSBtaXNzaW5nVmFyaWFudHMuam9pbihcIicsICdcIik7XG4gICAgICAgICAgICBmaWdtYS5ub3RpZnkoYFN0YXR1cyAnJHt2YXJpYW50U3RyaW5nfScgbm90IGV4aXN0aW5nLiBZb3UgY2FuIGFkZCBpdCBhcyBuZXcgdmFyaWFudCB0byB0aGUgbWFpbiBjb21wb25lbnQuYCwgeyB0aW1lb3V0OiA2MDAwIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChudW1iZXJPZk1pc3NpbmdUaXRsZXMgPiAwKVxuICAgICAgICAgICAgZmlnbWEubm90aWZ5KGAke251bWJlck9mTWlzc2luZ1RpdGxlc30gdGlja2V0cyBhcmUgbWlzc2luZyB0ZXh0IGVsZW1lbnQgJyR7SVNTVUVfVElUTEVfTkFNRX0nLmApO1xuICAgICAgICBpZiAobnVtYmVyT2ZNaXNzaW5nRGF0ZXMgPiAwKVxuICAgICAgICAgICAgZmlnbWEubm90aWZ5KGAke251bWJlck9mTWlzc2luZ0RhdGVzfSB0aWNrZXRzIGFyZSBtaXNzaW5nIHRleHQgZWxlbWVudCAnJHtJU1NVRV9DSEFOR0VfREFURV9OQU1FfScuYCk7XG4gICAgICAgIGlmIChudW1iZXJPZk1pc3NpbmdBc3NpZ25lZXMgPiAwKVxuICAgICAgICAgICAgZmlnbWEubm90aWZ5KGAke251bWJlck9mTWlzc2luZ0Fzc2lnbmVlc30gdGlja2V0cyBhcmUgbWlzc2luZyB0ZXh0IGVsZW1lbnQgJyR7QVNTSUdORUVfTkFNRX0nLmApO1xuICAgICAgICAvLyBTdWNjZXNzIG1lc3NhZ2VcbiAgICAgICAgdmFyIG1lc3NhZ2U7XG4gICAgICAgIHZhciBudW1iZXJPZkludmFsaWRJZHMgPSBpbnZhbGlkSWRzLmxlbmd0aDtcbiAgICAgICAgaWYgKG51bWJlck9mSW52YWxpZElkcyA9PSBudW1iZXJPZk5vZGVzKSB7XG4gICAgICAgICAgICAvLyBBbGwgaW52YWxpZFxuICAgICAgICAgICAgbWVzc2FnZSA9IChudW1iZXJPZk5vZGVzID09IDEpID8gXCJJbnZhbGlkIElELlwiIDogYCR7bnVtYmVyT2ZJbnZhbGlkSWRzfSBvZiAke251bWJlck9mTm9kZXN9IElEcyBhcmUgaW52YWxpZCBvciBkbyBub3QgZXhpc3QuYDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChudW1iZXJPZkludmFsaWRJZHMgPT0gMCkge1xuICAgICAgICAgICAgLy8gQWxsIHZhbGlkXG4gICAgICAgICAgICBtZXNzYWdlID0gKG51bWJlck9mTm9kZXMgPT0gMSkgPyBcIlVwZGF0ZWQuXCIgOiBgJHtudW1iZXJPZk5vZGVzfSBvZiAke251bWJlck9mTm9kZXN9IGhlYWRlcihzKSB1cGRhdGVkIWA7XG4gICAgICAgICAgICBpZiAoaXNDcmVhdGVOZXcpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBTb21lIHZhbGlkXG4gICAgICAgICAgICBsZXQgZmlyc3RTZW50ZW5jZSA9IGAke251bWJlck9mTm9kZXMgLSBudW1iZXJPZkludmFsaWRJZHN9IG9mICR7bnVtYmVyT2ZOb2Rlc30gc3VjY2Vzc2Z1bGx5IHVwZGF0ZWQuIGA7XG4gICAgICAgICAgICBsZXQgc2Vjb25kU2VudGVuY2UgPSAobnVtYmVyT2ZJbnZhbGlkSWRzID09IDEpID8gXCIxIElEIGlzIGludmFsaWQgb3IgZG9lcyBub3QgZXhpc3QuXCIgOiBgJHtudW1iZXJPZkludmFsaWRJZHN9IElEcyBhcmUgaW52YWxpZCBvciBkbyBub3QgZXhpc3QuYDtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBmaXJzdFNlbnRlbmNlICsgc2Vjb25kU2VudGVuY2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgY2FsbGVkIHZpYSB0aGUgcmVsYXVuY2ggYnV0dG9uLCBjbG9zZSBwbHVnaW4gYWZ0ZXIgdXBkYXRpbmcgdGhlIHRpY2tldHNcbiAgICAgICAgaWYgKGZpZ21hLmNvbW1hbmQgPT09ICd1cGRhdGVfcGFnZScgfHwgZmlnbWEuY29tbWFuZCA9PT0gJ3VwZGF0ZV9hbGwnKSB7XG4gICAgICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbihtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZpZ21hLm5vdGlmeShtZXNzYWdlLCB7IHRpbWVvdXQ6IDIwMDAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRpY2tldEluc3RhbmNlcztcbiAgICB9KTtcbn1cbi8qKlxuICogQ3JlYXRlIGluc3RhbmNlcyBvZiB0aGUgbWFpbiB0aWNrZXQgY29tcG9uZW50IGFuZCByZXBsYWNlcyB0aGUgY29udGVudCB3aXRoIGRhdGEgb2YgdGhlIGFjdHVhbCBKaXJhIHRpY2tldFxuICogQHBhcmFtIG1zZyBKU09OIHdpdGggaW5mbyBzZW50IGZyb20gVUlcbiAqL1xuZnVuY3Rpb24gY3JlYXRlVGlja2V0SW5zdGFuY2UobXNnKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgLy8gQ3JlYXRlIGFuIGluc3RhbmNlIGFuZCB1cGRhdGUgaXQgdG8gdGhlIGNvcnJlY3Qgc3RhdHVzXG4gICAgICAgIGxldCB0aWNrZXRWYXJpYW50ID0gdGlja2V0Q29tcG9uZW50LmRlZmF1bHRWYXJpYW50O1xuICAgICAgICBsZXQgdGlja2V0SW5zdGFuY2UgPSB0aWNrZXRWYXJpYW50LmNyZWF0ZUluc3RhbmNlKCk7XG4gICAgICAgIHRpY2tldEluc3RhbmNlLnggPSAoZmlnbWEudmlld3BvcnQuY2VudGVyLnggLSB0aWNrZXRJbnN0YW5jZS53aWR0aCAvIDIpICsgbmV4dFRpY2tldE9mZnNldDtcbiAgICAgICAgdGlja2V0SW5zdGFuY2UueSA9IChmaWdtYS52aWV3cG9ydC5jZW50ZXIueSAtIHRpY2tldEluc3RhbmNlLmhlaWdodCAvIDIpICsgbmV4dFRpY2tldE9mZnNldDtcbiAgICAgICAgbmV4dFRpY2tldE9mZnNldCA9IG5leHRUaWNrZXRPZmZzZXQgKyAxMCAlIDcwO1xuICAgICAgICBmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb24gPSBbdGlja2V0SW5zdGFuY2VdO1xuICAgICAgICBsZXQgdGlja2V0RGF0YSA9IGNoZWNrVGlja2V0RGF0YVJlcG9uc2UobXNnLmRhdGFbMF0sIG1zZy5pc3N1ZUlkc1swXSk7XG4gICAgICAgIGxldCB0aWNrZXRJbnN0YW5jZXMgPSB5aWVsZCB1cGRhdGVUaWNrZXRzKFt0aWNrZXRJbnN0YW5jZV0sIG1zZywgdHJ1ZSk7XG4gICAgICAgIHRpY2tldEluc3RhbmNlID0gdGlja2V0SW5zdGFuY2VzWzBdO1xuICAgICAgICAvLyBBZGQgSURcbiAgICAgICAgbGV0IGlzc3VlSURUeHQgPSB0aWNrZXRJbnN0YW5jZS5maW5kT25lKG4gPT4gbi50eXBlID09PSBcIlRFWFRcIiAmJiBuLm5hbWUgPT09IElTU1VFX0lEX05BTUUpO1xuICAgICAgICBpZiAoaXNzdWVJRFR4dCkge1xuICAgICAgICAgICAgeWllbGQgZmlnbWEubG9hZEZvbnRBc3luYyhpc3N1ZUlEVHh0LmZvbnROYW1lKTtcbiAgICAgICAgICAgIGlzc3VlSURUeHQuY2hhcmFjdGVycyA9IGdldElzc3VlSWQodGlja2V0RGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmaWdtYS5ub3RpZnkoXCJDb3VsZCBub3QgZmluZCB0ZXh0IGVsZW1lbnQgbmFtZWQgJ1wiICsgSVNTVUVfSURfTkFNRSArIFwiJy5cIik7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBjb21wb25lbnQgdGhhdCByZXByZXNlbnRzIGEgdGlja2V0IHN0YXR1c1xuICogQHBhcmFtIHN0YXR1c0NvbG9yIFJHQiB2YWx1ZSBmb3Igc3RhdHVzIGNvbG9yXG4gKiBAcGFyYW0gc3RhdHVzTmFtZSBOYW1lIG9mIHN0YXR1c1xuICogQHJldHVybnMgQSBjb21wb25lbnQgdGhhdCByZXByZXNlbnQgYSB0aWNrZXRcbiAqL1xuZnVuY3Rpb24gY3JlYXRlVGlja2V0VmFyaWFudChzdGF0dXNDb2xvciwgc3RhdHVzTmFtZSkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIC8vIENyZWF0ZSB0aGUgbWFpbiBmcmFtZVxuICAgICAgICB2YXIgdGlja2V0VmFyaWFudCA9IGZpZ21hLmNyZWF0ZUNvbXBvbmVudCgpO1xuICAgICAgICBsZXQgcGFkZGluZyA9IDI0O1xuICAgICAgICB0aWNrZXRWYXJpYW50Lm5hbWUgPSBzdGF0dXNOYW1lO1xuICAgICAgICB0aWNrZXRWYXJpYW50LmxheW91dE1vZGUgPSBcIlZFUlRJQ0FMXCI7XG4gICAgICAgIHRpY2tldFZhcmlhbnQucmVzaXplKDYwMCwgMjAwKTtcbiAgICAgICAgdGlja2V0VmFyaWFudC5jb3VudGVyQXhpc1NpemluZ01vZGUgPSBcIkZJWEVEXCI7XG4gICAgICAgIHRpY2tldFZhcmlhbnQucHJpbWFyeUF4aXNTaXppbmdNb2RlID0gXCJBVVRPXCI7XG4gICAgICAgIHRpY2tldFZhcmlhbnQucGFkZGluZ1RvcCA9IHBhZGRpbmc7XG4gICAgICAgIHRpY2tldFZhcmlhbnQucGFkZGluZ1JpZ2h0ID0gcGFkZGluZztcbiAgICAgICAgdGlja2V0VmFyaWFudC5wYWRkaW5nQm90dG9tID0gcGFkZGluZztcbiAgICAgICAgdGlja2V0VmFyaWFudC5wYWRkaW5nTGVmdCA9IHBhZGRpbmc7XG4gICAgICAgIHRpY2tldFZhcmlhbnQuaXRlbVNwYWNpbmcgPSAxNjtcbiAgICAgICAgdGlja2V0VmFyaWFudC5jb3JuZXJSYWRpdXMgPSA0O1xuICAgICAgICB0aWNrZXRWYXJpYW50LmZpbGxzID0gW3sgdHlwZTogJ1NPTElEJywgY29sb3I6IHN0YXR1c0NvbG9yIH1dO1xuICAgICAgICAvLyBDcmVhdGUgdGhlIGhlYWRlciBmcmFtZVxuICAgICAgICB2YXIgaGVhZGVyRnJhbWUgPSBmaWdtYS5jcmVhdGVGcmFtZSgpO1xuICAgICAgICBoZWFkZXJGcmFtZS5uYW1lID0gXCJIZWFkZXJcIjtcbiAgICAgICAgaGVhZGVyRnJhbWUubGF5b3V0TW9kZSA9IFwiSE9SSVpPTlRBTFwiO1xuICAgICAgICBoZWFkZXJGcmFtZS5jb3VudGVyQXhpc1NpemluZ01vZGUgPSBcIkFVVE9cIjtcbiAgICAgICAgaGVhZGVyRnJhbWUubGF5b3V0QWxpZ24gPSBcIlNUUkVUQ0hcIjtcbiAgICAgICAgaGVhZGVyRnJhbWUuaXRlbVNwYWNpbmcgPSA0MDtcbiAgICAgICAgaGVhZGVyRnJhbWUuZmlsbHMgPSBbXTtcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBoZWFkZXIgZnJhbWVcbiAgICAgICAgdmFyIGRldGFpbHNGcmFtZSA9IGZpZ21hLmNyZWF0ZUZyYW1lKCk7XG4gICAgICAgIGRldGFpbHNGcmFtZS5uYW1lID0gXCJIZWFkZXJcIjtcbiAgICAgICAgZGV0YWlsc0ZyYW1lLmxheW91dE1vZGUgPSBcIkhPUklaT05UQUxcIjtcbiAgICAgICAgZGV0YWlsc0ZyYW1lLmNvdW50ZXJBeGlzU2l6aW5nTW9kZSA9IFwiQVVUT1wiO1xuICAgICAgICBkZXRhaWxzRnJhbWUubGF5b3V0QWxpZ24gPSBcIlNUUkVUQ0hcIjtcbiAgICAgICAgZGV0YWlsc0ZyYW1lLml0ZW1TcGFjaW5nID0gMzI7XG4gICAgICAgIGRldGFpbHNGcmFtZS5maWxscyA9IFtdO1xuICAgICAgICBsb2FkRm9udHMoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgdGlja2V0IHRleHQgZmllbGRzXG4gICAgICAgICAgICBjb25zdCB0aXRsZVR4dCA9IGZpZ21hLmNyZWF0ZVRleHQoKTtcbiAgICAgICAgICAgIHRpdGxlVHh0LmZvbnROYW1lID0gRk9OVF9SRUc7XG4gICAgICAgICAgICB0aXRsZVR4dC5mb250U2l6ZSA9IDMyO1xuICAgICAgICAgICAgdGl0bGVUeHQudGV4dERlY29yYXRpb24gPSBcIlVOREVSTElORVwiO1xuICAgICAgICAgICAgdGl0bGVUeHQuYXV0b1JlbmFtZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGl0bGVUeHQuY2hhcmFjdGVycyA9IFwiVGlja2V0IHRpdGxlXCI7XG4gICAgICAgICAgICB0aXRsZVR4dC5uYW1lID0gSVNTVUVfVElUTEVfTkFNRTtcbiAgICAgICAgICAgIGNvbnN0IGlzc3VlSWRUeHQgPSBmaWdtYS5jcmVhdGVUZXh0KCk7XG4gICAgICAgICAgICBpc3N1ZUlkVHh0LmZvbnROYW1lID0gRk9OVF9NRUQ7XG4gICAgICAgICAgICBpc3N1ZUlkVHh0LmZvbnRTaXplID0gMzI7XG4gICAgICAgICAgICBpc3N1ZUlkVHh0LmF1dG9SZW5hbWUgPSBmYWxzZTtcbiAgICAgICAgICAgIGlzc3VlSWRUeHQuY2hhcmFjdGVycyA9IFwiSUQtMVwiO1xuICAgICAgICAgICAgaXNzdWVJZFR4dC5uYW1lID0gSVNTVUVfSURfTkFNRTtcbiAgICAgICAgICAgIGNvbnN0IGNoYW5nZURhdGVUeHQgPSBmaWdtYS5jcmVhdGVUZXh0KCk7XG4gICAgICAgICAgICBjaGFuZ2VEYXRlVHh0LmZvbnROYW1lID0gRk9OVF9SRUc7XG4gICAgICAgICAgICBjaGFuZ2VEYXRlVHh0LmZvbnRTaXplID0gMjQ7XG4gICAgICAgICAgICBjaGFuZ2VEYXRlVHh0LmF1dG9SZW5hbWUgPSBmYWxzZTtcbiAgICAgICAgICAgIGNoYW5nZURhdGVUeHQuY2hhcmFjdGVycyA9IFwiTU0gREQgWVlZWVwiO1xuICAgICAgICAgICAgY2hhbmdlRGF0ZVR4dC5uYW1lID0gSVNTVUVfQ0hBTkdFX0RBVEVfTkFNRTtcbiAgICAgICAgICAgIGNvbnN0IGFzc2lnbmVlVHh0ID0gZmlnbWEuY3JlYXRlVGV4dCgpO1xuICAgICAgICAgICAgYXNzaWduZWVUeHQuZm9udE5hbWUgPSBGT05UX1JFRztcbiAgICAgICAgICAgIGFzc2lnbmVlVHh0LmZvbnRTaXplID0gMjQ7XG4gICAgICAgICAgICBhc3NpZ25lZVR4dC5hdXRvUmVuYW1lID0gZmFsc2U7XG4gICAgICAgICAgICBhc3NpZ25lZVR4dC5jaGFyYWN0ZXJzID0gXCJOYW1lIG9mIGFzc2lnbmVlXCI7XG4gICAgICAgICAgICBhc3NpZ25lZVR4dC5uYW1lID0gQVNTSUdORUVfTkFNRTtcbiAgICAgICAgICAgIHRpY2tldFZhcmlhbnQuYXBwZW5kQ2hpbGQoaGVhZGVyRnJhbWUpO1xuICAgICAgICAgICAgdGlja2V0VmFyaWFudC5hcHBlbmRDaGlsZChkZXRhaWxzRnJhbWUpO1xuICAgICAgICAgICAgaGVhZGVyRnJhbWUuYXBwZW5kQ2hpbGQoaXNzdWVJZFR4dCk7XG4gICAgICAgICAgICBoZWFkZXJGcmFtZS5hcHBlbmRDaGlsZCh0aXRsZVR4dCk7XG4gICAgICAgICAgICBkZXRhaWxzRnJhbWUuYXBwZW5kQ2hpbGQoYXNzaWduZWVUeHQpO1xuICAgICAgICAgICAgZGV0YWlsc0ZyYW1lLmFwcGVuZENoaWxkKGNoYW5nZURhdGVUeHQpO1xuICAgICAgICAgICAgdGl0bGVUeHQubGF5b3V0R3JvdyA9IDE7XG4gICAgICAgICAgICBhc3NpZ25lZVR4dC5sYXlvdXRHcm93ID0gMTtcbiAgICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgZmlnbWEubm90aWZ5KFwiRm9udCAnXCIgKyBGT05UX1JFRy5mYW1pbHkgKyBcIicgY291bGQgbm90IGJlIGxvYWRlZC4gUGxlYXNlIGluc3RhbGwgdGhlIGZvbnQuXCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gRml4ZXMgYSB3ZWlyZCBidWcgaW4gd2hpY2ggdGhlICdzdHJldGNoJyBkb2VzbnQgd29yayBwcm9wZXJseVxuICAgICAgICBoZWFkZXJGcmFtZS5wcmltYXJ5QXhpc1NpemluZ01vZGUgPSBcIkZJWEVEXCI7XG4gICAgICAgIGhlYWRlckZyYW1lLmxheW91dEFsaWduID0gXCJTVFJFVENIXCI7XG4gICAgICAgIGRldGFpbHNGcmFtZS5wcmltYXJ5QXhpc1NpemluZ01vZGUgPSBcIkZJWEVEXCI7XG4gICAgICAgIGRldGFpbHNGcmFtZS5sYXlvdXRBbGlnbiA9IFwiU1RSRVRDSFwiO1xuICAgICAgICByZXR1cm4gdGlja2V0VmFyaWFudDtcbiAgICB9KTtcbn1cbi8qKlxuICogQ3JlYXRlcyB0aGUgbWFpbiBjb21wb25lbnQgZm9yIHRoZSB0aWNrZXRzXG4gKiBAcmV0dXJucyBUaGUgbWFpbiBjb21wb25lbnRcbiAqL1xuZnVuY3Rpb24gY3JlYXRlVGlja2V0Q29tcG9uZW50U2V0KCkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGxldCB0aWNrZXRDb21wb25lbnQ7XG4gICAgICAgIC8vIENyZWF0ZSB2YXJpYW50cyAob25lIGZvciBlYWNoIHN0YXR1cylcbiAgICAgICAgbGV0IHZhckRlZmF1bHQgPSB5aWVsZCBjcmVhdGVUaWNrZXRWYXJpYW50KFZBUklBTlRfQ09MT1JfREVGQVVMVCwgQ09NUE9ORU5UX1NFVF9QUk9QRVJUWV9OQU1FICsgVkFSSUFOVF9OQU1FX0RFRkFVTFQpO1xuICAgICAgICBsZXQgdmFyMSA9IHlpZWxkIGNyZWF0ZVRpY2tldFZhcmlhbnQoVkFSSUFOVF9DT0xPUl8xLCBDT01QT05FTlRfU0VUX1BST1BFUlRZX05BTUUgKyBWQVJJQU5UX05BTUVfMSk7XG4gICAgICAgIGxldCB2YXIyID0geWllbGQgY3JlYXRlVGlja2V0VmFyaWFudChWQVJJQU5UX0NPTE9SXzIsIENPTVBPTkVOVF9TRVRfUFJPUEVSVFlfTkFNRSArIFZBUklBTlRfTkFNRV8yKTtcbiAgICAgICAgbGV0IHZhcjMgPSB5aWVsZCBjcmVhdGVUaWNrZXRWYXJpYW50KFZBUklBTlRfQ09MT1JfMywgQ09NUE9ORU5UX1NFVF9QUk9QRVJUWV9OQU1FICsgVkFSSUFOVF9OQU1FXzMpO1xuICAgICAgICBsZXQgdmFyNCA9IHlpZWxkIGNyZWF0ZVRpY2tldFZhcmlhbnQoVkFSSUFOVF9DT0xPUl80LCBDT01QT05FTlRfU0VUX1BST1BFUlRZX05BTUUgKyBWQVJJQU5UX05BTUVfNCk7XG4gICAgICAgIGxldCB2YXI1ID0geWllbGQgY3JlYXRlVGlja2V0VmFyaWFudChWQVJJQU5UX0NPTE9SX0RPTkUsIENPTVBPTkVOVF9TRVRfUFJPUEVSVFlfTkFNRSArIFZBUklBTlRfTkFNRV9ET05FKTtcbiAgICAgICAgbGV0IHZhckVycm9yID0geWllbGQgY3JlYXRlVGlja2V0VmFyaWFudChWQVJJQU5UX0NPTE9SX0VSUk9SLCBDT01QT05FTlRfU0VUX1BST1BFUlRZX05BTUUgKyBWQVJJQU5UX05BTUVfRVJST1IpO1xuICAgICAgICBjb25zdCB2YXJpYW50cyA9IFt2YXJEZWZhdWx0LCB2YXIxLCB2YXIyLCB2YXIzLCB2YXI0LCB2YXI1LCB2YXJFcnJvcl07XG4gICAgICAgIC8vIENyZWF0ZSBhIGNvbXBvbmVudCBvdXQgb2YgYWxsIHRoZXNlIHZhcmlhbnRzXG4gICAgICAgIHRpY2tldENvbXBvbmVudCA9IGZpZ21hLmNvbWJpbmVBc1ZhcmlhbnRzKHZhcmlhbnRzLCBmaWdtYS5jdXJyZW50UGFnZSk7XG4gICAgICAgIGxldCBwYWRkaW5nID0gMTY7XG4gICAgICAgIHRpY2tldENvbXBvbmVudC5uYW1lID0gQ09NUE9ORU5UX1NFVF9OQU1FO1xuICAgICAgICB0aWNrZXRDb21wb25lbnQubGF5b3V0TW9kZSA9IFwiVkVSVElDQUxcIjtcbiAgICAgICAgdGlja2V0Q29tcG9uZW50LmNvdW50ZXJBeGlzU2l6aW5nTW9kZSA9IFwiQVVUT1wiO1xuICAgICAgICB0aWNrZXRDb21wb25lbnQucHJpbWFyeUF4aXNTaXppbmdNb2RlID0gXCJBVVRPXCI7XG4gICAgICAgIHRpY2tldENvbXBvbmVudC5wYWRkaW5nVG9wID0gcGFkZGluZztcbiAgICAgICAgdGlja2V0Q29tcG9uZW50LnBhZGRpbmdSaWdodCA9IHBhZGRpbmc7XG4gICAgICAgIHRpY2tldENvbXBvbmVudC5wYWRkaW5nQm90dG9tID0gcGFkZGluZztcbiAgICAgICAgdGlja2V0Q29tcG9uZW50LnBhZGRpbmdMZWZ0ID0gcGFkZGluZztcbiAgICAgICAgdGlja2V0Q29tcG9uZW50Lml0ZW1TcGFjaW5nID0gMjQ7XG4gICAgICAgIHRpY2tldENvbXBvbmVudC5jb3JuZXJSYWRpdXMgPSA0O1xuICAgICAgICAvLyBTYXZlIGNvbXBvbmVudCBJRCBmb3IgbGF0ZXIgcmVmZXJlbmNlXG4gICAgICAgIERPQ1VNRU5UX05PREUuc2V0UGx1Z2luRGF0YSgndGlja2V0Q29tcG9uZW50SUQnLCB0aWNrZXRDb21wb25lbnQuaWQpO1xuICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIGNvbXBvbmVudCBpcyB2aXNpYmxlIHdoZXJlIHdlJ3JlIGN1cnJlbnRseSBsb29raW5nXG4gICAgICAgIHRpY2tldENvbXBvbmVudC54ID0gZmlnbWEudmlld3BvcnQuY2VudGVyLnggLSAodGlja2V0Q29tcG9uZW50LndpZHRoIC8gMik7XG4gICAgICAgIHRpY2tldENvbXBvbmVudC55ID0gZmlnbWEudmlld3BvcnQuY2VudGVyLnkgLSAodGlja2V0Q29tcG9uZW50LmhlaWdodCAvIDIpO1xuICAgICAgICByZXR1cm4gdGlja2V0Q29tcG9uZW50O1xuICAgIH0pO1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG1haW4gdGlja2V0IGNvbXBvbmVudCBvciBnZXRzIHRoZSByZWZlcmVuY2UgdG8gdGhlIGV4aXN0aW5nIG9uZVxuICovXG5mdW5jdGlvbiByZWZlcmVuY2VUaWNrZXRDb21wb25lbnRTZXQoKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHRpY2tldCBjb21wb25lbnQgaXMgYWxyZWFkeSBzYXZlZCBpbiB0aGUgdmFyaWFibGVcbiAgICAgICAgaWYgKCF0aWNrZXRDb21wb25lbnQpIHtcbiAgICAgICAgICAgIC8vIElmIG5vLCB0cnkgdGhlIGdldCB0aGUgdGlja2V0IGNvbXBvbmVudCBieSBpdHMgSURcbiAgICAgICAgICAgIHZhciB0aWNrZXRDb21wb25lbnRJZCA9IERPQ1VNRU5UX05PREUuZ2V0UGx1Z2luRGF0YSgndGlja2V0Q29tcG9uZW50SUQnKTtcbiAgICAgICAgICAgIGxldCBub2RlO1xuICAgICAgICAgICAgaWYgKHRpY2tldENvbXBvbmVudElkICYmIChub2RlID0gZmlnbWEuZ2V0Tm9kZUJ5SWQodGlja2V0Q29tcG9uZW50SWQpKSkge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIGFuIElEIHNhdmVkLCBhY2Nlc3MgdGhlIHRpY2tldCBjb21wb25lbnRcbiAgICAgICAgICAgICAgICB0aWNrZXRDb21wb25lbnQgPSBub2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gSUQsIGNyZWF0ZSBhIG5ldyBjb21wb25lbnRcbiAgICAgICAgICAgICAgICB0aWNrZXRDb21wb25lbnQgPSB5aWVsZCBjcmVhdGVUaWNrZXRDb21wb25lbnRTZXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufVxuLy8gQ2hlY2tzIGlmIGZldGNoaW5nIGRhdGEgd2FzIHN1Y2Nlc3NmdWwgYXQgYWxsIFxuZnVuY3Rpb24gY2hlY2tGZXRjaFN1Y2Nlc3MoZGF0YSkge1xuICAgIHZhciBpc1N1Y2Nlc3MgPSBmYWxzZTtcbiAgICAvLyBDYW4gdGhpcyBldmVuIGhhcHBlbj9cbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KFwiU29tZXRoaW5nIHdlbnQgd3JvbmcuXCIpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb21ldGhpbmcgd2VudCB3cm9uZy5cIiArIGRhdGEpO1xuICAgIH1cbiAgICAvLyBObyBjb25uZWN0aW9uIHRvIEZpcmViYXNlXG4gICAgZWxzZSBpZiAoZGF0YS50eXBlID09IFwiRXJyb3JcIikge1xuICAgICAgICBmaWdtYS5ub3RpZnkoXCJDb3VsZCBub3QgZ2V0IGRhdGEuIFRoZXJlIHNlZW1zIHRvIGJlIG5vIGNvbm5lY3Rpb24gdG8gdGhlIHNlcnZlci5cIik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihkYXRhLm1lc3NhZ2UpO1xuICAgIH1cbiAgICAvLyBXcm9uZyBlLW1haWxcbiAgICBlbHNlIGlmIChkYXRhWzBdLm1lc3NhZ2UgPT0gXCJDbGllbnQgbXVzdCBiZSBhdXRoZW50aWNhdGVkIHRvIGFjY2VzcyB0aGlzIHJlc291cmNlLlwiKSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeShcIllvdSBoYXZlIGVudGVyZWQgYW4gaW52YWxpZCBlLW1haWwuIFNlZSAnQXV0aG9yaXphdGlvbicgc2V0dGluZ3MuXCIpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YS5tZXNzYWdlKTtcbiAgICB9XG4gICAgLy8gV3JvbmcgY29tcGFueSBuYW1lXG4gICAgZWxzZSBpZiAoZGF0YVswXS5lcnJvck1lc3NhZ2UgPT0gXCJTaXRlIHRlbXBvcmFyaWx5IHVuYXZhaWxhYmxlXCIpIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KFwiQ29tcGFueSBkb21haW4gbmFtZSBkb2VzIG5vdCBleGlzdC4gU2VlICdBdXRob3JpemF0aW9uJyBzZXR0aW5ncy5cIik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihkYXRhWzBdLmVycm9yTWVzc2FnZSk7XG4gICAgfVxuICAgIC8vIFdyb25nIHBhc3N3b3JkXG4gICAgZWxzZSBpZiAoZGF0YVswXVswXSkge1xuICAgICAgICBmaWdtYS5ub3RpZnkoXCJDb3VsZCBub3QgYWNjZXNzIGRhdGEuIFlvdXIgSmlyYSBBUEkgVG9rZW4gc2VlbXMgdG8gYmUgaW52YWxpZC4gU2VlICdBdXRob3JpemF0aW9uJyBzZXR0aW5ncy5cIik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihkYXRhWzBdWzBdKTtcbiAgICB9XG4gICAgLy8gRWxzZSwgaXQgd2FzIHByb2JhYmx5IHN1Y2Nlc3NmdWxcbiAgICBlbHNlIHtcbiAgICAgICAgaXNTdWNjZXNzID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGlzU3VjY2Vzcztcbn1cbi8vIENoZWNrcyBpZiBwZXIgcmVjZWl2ZWQgdGlja2V0IGRhdGEgaWYgdGhlIGZldGNoaW5nIHdhcyBzdWNjZXNzZnVsXG5mdW5jdGlvbiBjaGVja1RpY2tldERhdGFSZXBvbnNlKHRpY2tldERhdGEsIGlzc3VlSWQpIHtcbiAgICB2YXIgY2hlY2tlZERhdGE7XG4gICAgLy8gSWYgdGhlIEpTT04gaGFzIGEga2V5IGZpZWxkLCB0aGUgZGF0YSBpcyB2YWxpZFxuICAgIGlmICh0aWNrZXREYXRhICYmIHRpY2tldERhdGEua2V5KSB7XG4gICAgICAgIGNoZWNrZWREYXRhID0gdGlja2V0RGF0YTtcbiAgICB9XG4gICAgLy8gSUQgZG9lcyBub3QgZXhpc3RcbiAgICBlbHNlIGlmICh0aWNrZXREYXRhLmVycm9yTWVzc2FnZXMgPT0gXCJUaGUgaXNzdWUgbm8gbG9uZ2VyIGV4aXN0cy5cIikge1xuICAgICAgICBjaGVja2VkRGF0YSA9IGNyZWF0ZUVycm9yRGF0YUpTT04oYEVycm9yOiBUaWNrZXQgSUQgJyR7aXNzdWVJZH0nIGRvZXMgbm90IGV4aXN0LmAsIGlzc3VlSWQpO1xuICAgICAgICAvLyBmaWdtYS5ub3RpZnkoYFRpY2tldCBJRCAnJHtpc3N1ZUlkfScgZG9lcyBub3QgZXhpc3QuYClcbiAgICB9XG4gICAgLy8gSUQgaGFzIGludmFsaWQgZm9ybWF0XG4gICAgZWxzZSBpZiAodGlja2V0RGF0YS5lcnJvck1lc3NhZ2VzID09IFwiSXNzdWUga2V5IGlzIGluIGFuIGludmFsaWQgZm9ybWF0LlwiKSB7XG4gICAgICAgIGNoZWNrZWREYXRhID0gY3JlYXRlRXJyb3JEYXRhSlNPTihgRXJyb3I6IFRpY2tldCBJRCAnJHtpc3N1ZUlkfScgaXMgaW4gYW4gaW52YWxpZCBmb3JtYXQuYCwgaXNzdWVJZCk7XG4gICAgICAgIC8vIGZpZ21hLm5vdGlmeShgVGlja2V0IElEICcke2lzc3VlSWR9JyBpcyBpbiBhbiBpbnZhbGlkIGZvcm1hdC5gKVxuICAgIH1cbiAgICAvLyBPdGhlclxuICAgIGVsc2Uge1xuICAgICAgICBjaGVja2VkRGF0YSA9IGNyZWF0ZUVycm9yRGF0YUpTT04oXCJFcnJvcjogQW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cmVkLlwiLCBpc3N1ZUlkKTtcbiAgICAgICAgZmlnbWEubm90aWZ5KFwiVW5leHBlY3RlZCBlcnJvci5cIik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJVbmV4cGVjdGVkIGVycm9yLlwiLCB0aWNrZXREYXRhKTtcbiAgICAgICAgLy8gdGhyb3cgbmV3IEVycm9yKHRpY2tldERhdGEubWVzc2FnZSlcbiAgICB9XG4gICAgcmV0dXJuIGNoZWNrZWREYXRhO1xufVxuLy8gQ3JlYXRlIGEgZXJyb3IgdmFyaWFibGUgdGhhdCBoYXMgdGhlIHNhbWUgbWFpbiBmaWVsZHMgYXMgdGhlIEppcmEgVGlja2V0IHZhcmlhYmxlLiBcbi8vIFRoaXMgd2lsbCBiZSB1c2VkIHRoZSBmaWxsIHRoZSB0aWNrZXQgZGF0YSB3aXRoIHRoZSBlcnJvciBtZXNzYWdlLlxuZnVuY3Rpb24gY3JlYXRlRXJyb3JEYXRhSlNPTihtZXNzYWdlLCBpc3N1ZUlkKSB7XG4gICAgdmFyIHRvZGF5ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgIHZhciBlcnJvckRhdGEgPSB7XG4gICAgICAgIFwia2V5XCI6IGlzc3VlSWQsXG4gICAgICAgIFwiZmllbGRzXCI6IHtcbiAgICAgICAgICAgIFwic3VtbWFyeVwiOiBtZXNzYWdlLFxuICAgICAgICAgICAgXCJzdGF0dXNcIjoge1xuICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcIkVycm9yXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInN0YXR1c2NhdGVnb3J5Y2hhbmdlZGF0ZVwiOiB0b2RheVxuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gZXJyb3JEYXRhO1xufVxuLy8gRnVuY3Rpb24gZm9yIGxvYWRpbmcgYWxsIHRoZSBmb250cyBmb3IgdGhlIG1haW4gY29tcG9uZW50XG5mdW5jdGlvbiBsb2FkRm9udHMoKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgeWllbGQgZmlnbWEubG9hZEZvbnRBc3luYyhGT05UX1JFRyk7XG4gICAgICAgIHlpZWxkIGZpZ21hLmxvYWRGb250QXN5bmMoRk9OVF9NRUQpO1xuICAgICAgICB5aWVsZCBmaWdtYS5sb2FkRm9udEFzeW5jKEZPTlRfQk9MRCk7XG4gICAgfSk7XG59XG4vLyBGb3JtYXRzIGEgaGV4IHZhbHVlIHRvIFJHQlxuZnVuY3Rpb24gaGV4VG9SZ2IoaGV4KSB7XG4gICAgdmFyIGJpZ2ludCA9IHBhcnNlSW50KGhleCwgMTYpO1xuICAgIHZhciByID0gKGJpZ2ludCA+PiAxNikgJiAyNTU7XG4gICAgdmFyIGcgPSAoYmlnaW50ID4+IDgpICYgMjU1O1xuICAgIHZhciBiID0gYmlnaW50ICYgMjU1O1xuICAgIHJldHVybiB7IHI6IHIgLyAyNTUsIGc6IGcgLyAyNTUsIGI6IGIgLyAyNTUgfTtcbn1cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0ge307XG5fX3dlYnBhY2tfbW9kdWxlc19fW1wiLi9zcmMvY29kZS50c1wiXSgpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9