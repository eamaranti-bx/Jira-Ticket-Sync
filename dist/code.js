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
const WINDOW_HEIGHT_BIG = 670;
const WINDOW_HEIGHT_SMALL = 308;
const COMPANY_NAME_KEY = "COMPANY_NAME";
const PROJECT_ID_KEY = "PROJECT_ID";
const USERNAME_KEY = "USERNAME";
const PASSWORD_KEY = "PASSWORD";
const ISSUE_ID_KEY = "ISSUE_ID";
const CREATE_LINK_KEY = "CREATE_LINK";
var company_name; // Saved publicly with setPluginData
var project_id; // Saved publicly with setPluginData
var username;
var password;
var issueId;
var createLink;
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
        company_name = yield getAuthorizationInfo(COMPANY_NAME_KEY, true);
        project_id = yield getAuthorizationInfo(PROJECT_ID_KEY, true);
        username = yield getAuthorizationInfo(USERNAME_KEY, false);
        password = yield getAuthorizationInfo(PASSWORD_KEY, false);
        issueId = yield getAuthorizationInfo(ISSUE_ID_KEY, false);
        createLink = yield getAuthorizationInfo(CREATE_LINK_KEY, false);
        if (createLink === "")
            createLink = true;
        figma.ui.postMessage({ company_name: company_name, project_id: project_id, username: username, password: password, issueId: issueId, createLink: createLink, type: 'setAuthorizationVariables' });
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
        let ticketInstance = yield createTicketInstance(msg);
        if (msg.createLink && msg.data[0].key && project_id != "") {
            let projectName = encodeURIComponent(figma.root.name);
            let nodeId = encodeURIComponent(ticketInstance.id);
            let link = `https://www.figma.com/file/${project_id}/${projectName}?node-id=${nodeId}`;
            figma.ui.postMessage({ issueId: msg.issueIds[0], link: link, type: 'post-link-to-jira-issue' });
        }
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
        setAuthorizationInfo(msg.key, msg.data, msg.save_public);
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
function setAuthorizationInfo(key, value, savePublic = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (savePublic) {
            DOCUMENT_NODE.setPluginData(key, value);
        }
        else {
            yield figma.clientStorage.setAsync(key, value);
        }
        // Make sure that variable gets updated
        if (key === COMPANY_NAME_KEY)
            company_name = value;
        else if (key === PROJECT_ID_KEY)
            project_id = value;
        else if (key === USERNAME_KEY)
            username = value;
        else if (key === PASSWORD_KEY)
            password = value;
        else if (key === ISSUE_ID_KEY)
            issueId = value;
        else if (key === CREATE_LINK_KEY)
            createLink = value;
    });
}
// Get authorization details from client storage
function getAuthorizationInfo(key, savedPublic = false) {
    return __awaiter(this, void 0, void 0, function* () {
        var valueSaved;
        if (savedPublic) {
            valueSaved = DOCUMENT_NODE.getPluginData(key);
        }
        else {
            valueSaved = yield figma.clientStorage.getAsync(key);
        }
        if (!valueSaved && valueSaved != false)
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
        nextTicketOffset = (nextTicketOffset + 10) % 70;
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
        return ticketInstance;
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
        figma.notify("Company domain name does not exist. See 'Project Settings'.");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDLG1DQUFtQztBQUNwRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrREFBK0QsUUFBUTtBQUN2RSxzQ0FBc0MsUUFBUTtBQUM5QztBQUNBO0FBQ0E7QUFDQSwrREFBK0QsUUFBUTtBQUN2RSxzQ0FBc0MsUUFBUTtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7Ozs7Ozs7O1VFaG9CQTtVQUNBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2VicGFjay1yZWFjdC8uL3NyYy9jb2RlLnRzIiwid2VicGFjazovL3dlYnBhY2stcmVhY3Qvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly93ZWJwYWNrLXJlYWN0L3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly93ZWJwYWNrLXJlYWN0L3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbmNvbnN0IERPQ1VNRU5UX05PREUgPSBmaWdtYS5jdXJyZW50UGFnZS5wYXJlbnQ7XG4vLyBTZXQgdGhlIHJlbGF1bmNoIGJ1dHRvbiBmb3IgdGhlIHdob2xlIGRvY3VtZW50XG5ET0NVTUVOVF9OT0RFLnNldFJlbGF1bmNoRGF0YSh7IHVwZGF0ZV9wYWdlOiAnJywgdXBkYXRlX2FsbDogJycgfSk7XG5jb25zdCBXSU5ET1dfV0lEVEggPSAyNTA7XG5jb25zdCBXSU5ET1dfSEVJR0hUX0JJRyA9IDY3MDtcbmNvbnN0IFdJTkRPV19IRUlHSFRfU01BTEwgPSAzMDg7XG5jb25zdCBDT01QQU5ZX05BTUVfS0VZID0gXCJDT01QQU5ZX05BTUVcIjtcbmNvbnN0IFBST0pFQ1RfSURfS0VZID0gXCJQUk9KRUNUX0lEXCI7XG5jb25zdCBVU0VSTkFNRV9LRVkgPSBcIlVTRVJOQU1FXCI7XG5jb25zdCBQQVNTV09SRF9LRVkgPSBcIlBBU1NXT1JEXCI7XG5jb25zdCBJU1NVRV9JRF9LRVkgPSBcIklTU1VFX0lEXCI7XG5jb25zdCBDUkVBVEVfTElOS19LRVkgPSBcIkNSRUFURV9MSU5LXCI7XG52YXIgY29tcGFueV9uYW1lOyAvLyBTYXZlZCBwdWJsaWNseSB3aXRoIHNldFBsdWdpbkRhdGFcbnZhciBwcm9qZWN0X2lkOyAvLyBTYXZlZCBwdWJsaWNseSB3aXRoIHNldFBsdWdpbkRhdGFcbnZhciB1c2VybmFtZTtcbnZhciBwYXNzd29yZDtcbnZhciBpc3N1ZUlkO1xudmFyIGNyZWF0ZUxpbms7XG5jb25zdCBGT05UX1JFRyA9IHsgZmFtaWx5OiBcIldvcmsgU2Fuc1wiLCBzdHlsZTogXCJSZWd1bGFyXCIgfTtcbmNvbnN0IEZPTlRfTUVEID0geyBmYW1pbHk6IFwiV29yayBTYW5zXCIsIHN0eWxlOiBcIk1lZGl1bVwiIH07XG5jb25zdCBGT05UX0JPTEQgPSB7IGZhbWlseTogXCJXb3JrIFNhbnNcIiwgc3R5bGU6IFwiQm9sZFwiIH07XG5mdW5jdGlvbiBnZXRTdGF0dXMoZGF0YSkgeyByZXR1cm4gZGF0YS5maWVsZHMuc3RhdHVzLm5hbWU7IH1cbmZ1bmN0aW9uIGdldFRpdGxlKGRhdGEpIHsgcmV0dXJuIGRhdGEuZmllbGRzLnN1bW1hcnk7IH1cbmZ1bmN0aW9uIGdldElzc3VlSWQoZGF0YSkgeyByZXR1cm4gZGF0YS5rZXk7IH1cbmZ1bmN0aW9uIGdldENoYW5nZURhdGUoZGF0YSkgeyByZXR1cm4gZGF0YS5maWVsZHMuc3RhdHVzY2F0ZWdvcnljaGFuZ2VkYXRlOyB9XG5mdW5jdGlvbiBnZXRBc3NpZ25lZShkYXRhKSB7IHJldHVybiBkYXRhLmZpZWxkcy5hc3NpZ25lZS5kaXNwbGF5TmFtZTsgfVxudmFyIG5leHRUaWNrZXRPZmZzZXQgPSAwO1xuLy8gdGlja2V0ZGF0YS5maWVsZHMuYXNzaWduZWUuYXZhdGFyVXJsc1xuLy8gdGlja2V0ZGF0YS5maWVsZHMuc3RhdHVzLm5hbWVcbi8vIHRpY2tldGRhdGEuZmllbGRzLnN0YXR1cy5zdGF0dXNDYXRlZ29yeS5uYW1lXG5jb25zdCBJU1NVRV9JRF9OQU1FID0gXCJUaWNrZXQgSURcIjtcbmNvbnN0IElTU1VFX1RJVExFX05BTUUgPSBcIlRpY2tldCBUaXRsZVwiO1xuY29uc3QgSVNTVUVfQ0hBTkdFX0RBVEVfTkFNRSA9IFwiRGF0ZSBvZiBTdGF0dXMgQ2hhbmdlXCI7XG5jb25zdCBBU1NJR05FRV9OQU1FID0gXCJBc3NpZ25lZVwiO1xuY29uc3QgQ09NUE9ORU5UX1NFVF9OQU1FID0gXCJKaXJhIFRpY2tldFwiO1xuY29uc3QgQ09NUE9ORU5UX1NFVF9QUk9QRVJUWV9OQU1FID0gXCJTdGF0dXM9XCI7XG5jb25zdCBWQVJJQU5UX05BTUVfMSA9IFwiVG8gRG9cIjtcbmNvbnN0IFZBUklBTlRfQ09MT1JfMSA9IGhleFRvUmdiKCdFRUVFRUUnKTtcbmNvbnN0IFZBUklBTlRfTkFNRV8yID0gXCJDb25jZXB0aW5nXCI7XG5jb25zdCBWQVJJQU5UX0NPTE9SXzIgPSBoZXhUb1JnYignRkZFREMwJyk7XG5jb25zdCBWQVJJQU5UX05BTUVfMyA9IFwiRGVzaWduXCI7XG5jb25zdCBWQVJJQU5UX0NPTE9SXzMgPSBoZXhUb1JnYignRDdFMEZGJyk7XG5jb25zdCBWQVJJQU5UX05BTUVfNCA9IFwiVGVzdGluZ1wiO1xuY29uc3QgVkFSSUFOVF9DT0xPUl80ID0gaGV4VG9SZ2IoJ0Q3RTBGRicpO1xuY29uc3QgVkFSSUFOVF9OQU1FX0RPTkUgPSBcIkxhdW5jaFwiO1xuY29uc3QgVkFSSUFOVF9DT0xPUl9ET05FID0gaGV4VG9SZ2IoJ0QzRkZEMicpO1xuY29uc3QgVkFSSUFOVF9OQU1FX0RFRkFVTFQgPSBcIkRlZmF1bHRcIjtcbmNvbnN0IFZBUklBTlRfQ09MT1JfREVGQVVMVCA9IGhleFRvUmdiKCdCOUI5QjknKTtcbmNvbnN0IFZBUklBTlRfTkFNRV9FUlJPUiA9IFwiRXJyb3JcIjtcbmNvbnN0IFZBUklBTlRfQ09MT1JfRVJST1IgPSBoZXhUb1JnYignRkZEOUQ5Jyk7XG52YXIgdGlja2V0Q29tcG9uZW50O1xuLy8gRG9uJ3Qgc2hvdyBVSSBpZiByZWxhdW5jaCBidXR0b25zIGFyZSBydW5cbmlmIChmaWdtYS5jb21tYW5kID09PSAndXBkYXRlJykge1xuICAgIHVwZGF0ZVdpdGhvdXRVSShcInNlbGVjdGlvblwiKTtcbn1cbmVsc2UgaWYgKGZpZ21hLmNvbW1hbmQgPT09ICd1cGRhdGVfYWxsJykge1xuICAgIHVwZGF0ZVdpdGhvdXRVSShcImFsbFwiKTtcbn1cbmVsc2UgaWYgKGZpZ21hLmNvbW1hbmQgPT09ICd1cGRhdGVfcGFnZScpIHtcbiAgICB1cGRhdGVXaXRob3V0VUkoXCJwYWdlXCIpO1xufVxuZWxzZSB7XG4gICAgLy8gT3RoZXJ3aXNlIHNob3cgVUlcbiAgICBmaWdtYS5zaG93VUkoX19odG1sX18sIHsgd2lkdGg6IFdJTkRPV19XSURUSCwgaGVpZ2h0OiBXSU5ET1dfSEVJR0hUX1NNQUxMIH0pO1xuICAgIHNlbmREYXRhKCk7XG59XG4vLyBNYWtlIHN1cmUgdGhlIG1haW4gY29tcG9uZW50IGlzIHJlZmVyZW5jZWRcbnJlZmVyZW5jZVRpY2tldENvbXBvbmVudFNldCgpO1xuLy8gU3RhcnQgcGx1Z2luIHdpdGhvdXQgdmlzaWJsZSBVSSBhbmQgdXBkYXRlIHRpY2tldHNcbmZ1bmN0aW9uIHVwZGF0ZVdpdGhvdXRVSSh0eXBlKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgZmlnbWEuc2hvd1VJKF9faHRtbF9fLCB7IHZpc2libGU6IGZhbHNlIH0pO1xuICAgICAgICB5aWVsZCBzZW5kRGF0YSgpO1xuICAgICAgICB2YXIgaGFzRmFpbGVkID0gcmVxdWVzdFVwZGF0ZUZvclRpY2tldHModHlwZSk7XG4gICAgICAgIGlmIChoYXNGYWlsZWQgJiYgKHR5cGUgPT09IFwiYWxsXCIgfHwgdHlwZSA9PT0gXCJwYWdlXCIpKSB7XG4gICAgICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4vLyBTZW5kIHRoZSBzdG9yZWQgYXV0aG9yaXphdGlvbiBkYXRhIHRvIHRoZSBVSVxuZnVuY3Rpb24gc2VuZERhdGEoKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgY29tcGFueV9uYW1lID0geWllbGQgZ2V0QXV0aG9yaXphdGlvbkluZm8oQ09NUEFOWV9OQU1FX0tFWSwgdHJ1ZSk7XG4gICAgICAgIHByb2plY3RfaWQgPSB5aWVsZCBnZXRBdXRob3JpemF0aW9uSW5mbyhQUk9KRUNUX0lEX0tFWSwgdHJ1ZSk7XG4gICAgICAgIHVzZXJuYW1lID0geWllbGQgZ2V0QXV0aG9yaXphdGlvbkluZm8oVVNFUk5BTUVfS0VZLCBmYWxzZSk7XG4gICAgICAgIHBhc3N3b3JkID0geWllbGQgZ2V0QXV0aG9yaXphdGlvbkluZm8oUEFTU1dPUkRfS0VZLCBmYWxzZSk7XG4gICAgICAgIGlzc3VlSWQgPSB5aWVsZCBnZXRBdXRob3JpemF0aW9uSW5mbyhJU1NVRV9JRF9LRVksIGZhbHNlKTtcbiAgICAgICAgY3JlYXRlTGluayA9IHlpZWxkIGdldEF1dGhvcml6YXRpb25JbmZvKENSRUFURV9MSU5LX0tFWSwgZmFsc2UpO1xuICAgICAgICBpZiAoY3JlYXRlTGluayA9PT0gXCJcIilcbiAgICAgICAgICAgIGNyZWF0ZUxpbmsgPSB0cnVlO1xuICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7IGNvbXBhbnlfbmFtZTogY29tcGFueV9uYW1lLCBwcm9qZWN0X2lkOiBwcm9qZWN0X2lkLCB1c2VybmFtZTogdXNlcm5hbWUsIHBhc3N3b3JkOiBwYXNzd29yZCwgaXNzdWVJZDogaXNzdWVJZCwgY3JlYXRlTGluazogY3JlYXRlTGluaywgdHlwZTogJ3NldEF1dGhvcml6YXRpb25WYXJpYWJsZXMnIH0pO1xuICAgIH0pO1xufVxuLy8gQWxsIHRoZSBmdW5jdGlvbnMgdGhhdCBjYW4gYmUgc3RhcnRlZCBmcm9tIHRoZSBVSVxuZmlnbWEudWkub25tZXNzYWdlID0gKG1zZykgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgIC8vIENhbGxlZCB0byBjcmVhdGUgYSBuZXcgbWFpbiBjb21wb25lbnQgYW5kIHNhdmUgaXRzIElEXG4gICAgaWYgKG1zZy50eXBlID09PSAnY3JlYXRlLWNvbXBvbmVudCcpIHtcbiAgICAgICAgdGlja2V0Q29tcG9uZW50ID0geWllbGQgY3JlYXRlVGlja2V0Q29tcG9uZW50U2V0KCk7XG4gICAgICAgIERPQ1VNRU5UX05PREUuc2V0UGx1Z2luRGF0YSgndGlja2V0Q29tcG9uZW50SUQnLCB0aWNrZXRDb21wb25lbnQuaWQpO1xuICAgIH1cbiAgICAvLyBDYWxsZWQgdG8gY3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIGEgY29tcG9uZW50IChiYXNlZCBvbiB0aGUgaXNzdWVJZCBlbnRlcmVkIGluIHRoZSBVSSlcbiAgICBpZiAobXNnLnR5cGUgPT09ICdjcmVhdGUtbmV3LXRpY2tldCcgJiYgY2hlY2tGZXRjaFN1Y2Nlc3MobXNnLmRhdGEpKSB7XG4gICAgICAgIGxldCB0aWNrZXRJbnN0YW5jZSA9IHlpZWxkIGNyZWF0ZVRpY2tldEluc3RhbmNlKG1zZyk7XG4gICAgICAgIGlmIChtc2cuY3JlYXRlTGluayAmJiBtc2cuZGF0YVswXS5rZXkgJiYgcHJvamVjdF9pZCAhPSBcIlwiKSB7XG4gICAgICAgICAgICBsZXQgcHJvamVjdE5hbWUgPSBlbmNvZGVVUklDb21wb25lbnQoZmlnbWEucm9vdC5uYW1lKTtcbiAgICAgICAgICAgIGxldCBub2RlSWQgPSBlbmNvZGVVUklDb21wb25lbnQodGlja2V0SW5zdGFuY2UuaWQpO1xuICAgICAgICAgICAgbGV0IGxpbmsgPSBgaHR0cHM6Ly93d3cuZmlnbWEuY29tL2ZpbGUvJHtwcm9qZWN0X2lkfS8ke3Byb2plY3ROYW1lfT9ub2RlLWlkPSR7bm9kZUlkfWA7XG4gICAgICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7IGlzc3VlSWQ6IG1zZy5pc3N1ZUlkc1swXSwgbGluazogbGluaywgdHlwZTogJ3Bvc3QtbGluay10by1qaXJhLWlzc3VlJyB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBDYWxsZWQgdG8gZ2V0IGFsbCBKaXJhIFRpY2tlciBIZWFkZXIgaW5zdGFuY2VzIGFuZCB1cGRhdGUgdGhlbSBvbmUgYnkgb25lLiBcbiAgICBpZiAobXNnLnR5cGUgPT09ICd1cGRhdGUtYWxsJykge1xuICAgICAgICByZXF1ZXN0VXBkYXRlRm9yVGlja2V0cyhcImFsbFwiKTtcbiAgICB9XG4gICAgLy8gQ2FsbGVkIHRvIGdldCBKaXJhIFRpY2tlciBIZWFkZXIgaW5zdGFuY2VzIG9uIHRoaXMgcGFnZSBhbmQgdXBkYXRlIHRoZW0gb25lIGJ5IG9uZS4gXG4gICAgaWYgKG1zZy50eXBlID09PSAndXBkYXRlLXBhZ2UnKSB7XG4gICAgICAgIHJlcXVlc3RVcGRhdGVGb3JUaWNrZXRzKFwicGFnZVwiKTtcbiAgICB9XG4gICAgLy8gQ2FsbGVkIHRvIGdldCBzZWxlY3RlZCBKaXJhIFRpY2tlciBIZWFkZXIgaW5zdGFuY2VzIGFuZCB1cGRhdGUgdGhlbSBvbmUgYnkgb25lLiBcbiAgICBpZiAobXNnLnR5cGUgPT09ICd1cGRhdGUtc2VsZWN0ZWQnKSB7XG4gICAgICAgIHJlcXVlc3RVcGRhdGVGb3JUaWNrZXRzKFwic2VsZWN0aW9uXCIpO1xuICAgIH1cbiAgICAvLyBTYXZlIG5ldyBhdXRob3JpemF0aW9uIGluZm9cbiAgICBpZiAobXNnLnR5cGUgPT09ICdhdXRob3JpemF0aW9uLWRldGFpbC1jaGFuZ2VkJykge1xuICAgICAgICBzZXRBdXRob3JpemF0aW9uSW5mbyhtc2cua2V5LCBtc2cuZGF0YSwgbXNnLnNhdmVfcHVibGljKTtcbiAgICB9XG4gICAgLy8gUmVzaXplIHRoZSBVSVxuICAgIGlmIChtc2cudHlwZSA9PT0gJ3Jlc2l6ZS11aScpIHtcbiAgICAgICAgbXNnLmJpZ19zaXplID8gZmlnbWEudWkucmVzaXplKFdJTkRPV19XSURUSCwgV0lORE9XX0hFSUdIVF9CSUcpIDogZmlnbWEudWkucmVzaXplKFdJTkRPV19XSURUSCwgV0lORE9XX0hFSUdIVF9TTUFMTCk7XG4gICAgfVxuICAgIC8vIEFsbG93cyB0aGUgVUkgdG8gY3JlYXRlIG5vdGlmaWNhdGlvbnNcbiAgICBpZiAobXNnLnR5cGUgPT09ICdjcmVhdGUtdmlzdWFsLWJlbGwnKSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeShtc2cubWVzc2FnZSk7XG4gICAgfVxuICAgIC8vIFVwZGF0ZXMgaW5zdGFuY2VzIGJhc2VkIG9uIHRoZSByZWNlaXZlZCB0aWNrZXQgZGF0YS5cbiAgICBpZiAobXNnLnR5cGUgPT09ICd0aWNrZXREYXRhU2VudCcgJiYgY2hlY2tGZXRjaFN1Y2Nlc3MobXNnLmRhdGEpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVGlja2V0IGRhdGE6XCIsIG1zZy5kYXRhKTtcbiAgICAgICAgdmFyIG5vZGVJZHMgPSBtc2cubm9kZUlkcztcbiAgICAgICAgdmFyIG5vZGVzID0gbm9kZUlkcy5tYXAoaWQgPT4gZmlnbWEuZ2V0Tm9kZUJ5SWQoaWQpKTtcbiAgICAgICAgeWllbGQgdXBkYXRlVGlja2V0cyhub2RlcywgbXNnKTtcbiAgICB9XG59KTtcbi8vIFNhdmVzIGF1dGhvcml6YXRpb24gZGV0YWlscyBpbiBjbGllbnQgc3RvcmFnZVxuZnVuY3Rpb24gc2V0QXV0aG9yaXphdGlvbkluZm8oa2V5LCB2YWx1ZSwgc2F2ZVB1YmxpYyA9IGZhbHNlKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgaWYgKHNhdmVQdWJsaWMpIHtcbiAgICAgICAgICAgIERPQ1VNRU5UX05PREUuc2V0UGx1Z2luRGF0YShrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHlpZWxkIGZpZ21hLmNsaWVudFN0b3JhZ2Uuc2V0QXN5bmMoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgdmFyaWFibGUgZ2V0cyB1cGRhdGVkXG4gICAgICAgIGlmIChrZXkgPT09IENPTVBBTllfTkFNRV9LRVkpXG4gICAgICAgICAgICBjb21wYW55X25hbWUgPSB2YWx1ZTtcbiAgICAgICAgZWxzZSBpZiAoa2V5ID09PSBQUk9KRUNUX0lEX0tFWSlcbiAgICAgICAgICAgIHByb2plY3RfaWQgPSB2YWx1ZTtcbiAgICAgICAgZWxzZSBpZiAoa2V5ID09PSBVU0VSTkFNRV9LRVkpXG4gICAgICAgICAgICB1c2VybmFtZSA9IHZhbHVlO1xuICAgICAgICBlbHNlIGlmIChrZXkgPT09IFBBU1NXT1JEX0tFWSlcbiAgICAgICAgICAgIHBhc3N3b3JkID0gdmFsdWU7XG4gICAgICAgIGVsc2UgaWYgKGtleSA9PT0gSVNTVUVfSURfS0VZKVxuICAgICAgICAgICAgaXNzdWVJZCA9IHZhbHVlO1xuICAgICAgICBlbHNlIGlmIChrZXkgPT09IENSRUFURV9MSU5LX0tFWSlcbiAgICAgICAgICAgIGNyZWF0ZUxpbmsgPSB2YWx1ZTtcbiAgICB9KTtcbn1cbi8vIEdldCBhdXRob3JpemF0aW9uIGRldGFpbHMgZnJvbSBjbGllbnQgc3RvcmFnZVxuZnVuY3Rpb24gZ2V0QXV0aG9yaXphdGlvbkluZm8oa2V5LCBzYXZlZFB1YmxpYyA9IGZhbHNlKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgdmFyIHZhbHVlU2F2ZWQ7XG4gICAgICAgIGlmIChzYXZlZFB1YmxpYykge1xuICAgICAgICAgICAgdmFsdWVTYXZlZCA9IERPQ1VNRU5UX05PREUuZ2V0UGx1Z2luRGF0YShrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFsdWVTYXZlZCA9IHlpZWxkIGZpZ21hLmNsaWVudFN0b3JhZ2UuZ2V0QXN5bmMoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZhbHVlU2F2ZWQgJiYgdmFsdWVTYXZlZCAhPSBmYWxzZSlcbiAgICAgICAgICAgIHZhbHVlU2F2ZWQgPSBcIlwiO1xuICAgICAgICByZXR1cm4gdmFsdWVTYXZlZDtcbiAgICB9KTtcbn1cbi8qKlxuICogR2V0IHN1YnNldCBvZiB0aWNrZXRzIGluIGRvY3VtZW50IGFuZCBzdGFydCB1cGRhdGUgcHJvY2Vzc1xuICogQHBhcmFtIHN1YnNldCBBIHN1YnNldCBvZiB0aWNrZXQgaW5zdGFuY2VzIGluIHRoZSBkb2N1bWVudFxuICogQHJldHVybnMgQm9vbGVhbiBpZiB0aGUgc3Vic2V0IGNvdWxkIGJlIHVwZGF0ZWRcbiAqL1xuZnVuY3Rpb24gcmVxdWVzdFVwZGF0ZUZvclRpY2tldHMoc3Vic2V0KSB7XG4gICAgbGV0IG5vZGVzO1xuICAgIC8vIEFsbCBpbiBkb2N1bWVudFxuICAgIGlmIChzdWJzZXQgPT0gXCJhbGxcIikge1xuICAgICAgICBub2RlcyA9IERPQ1VNRU5UX05PREUuZmluZEFsbFdpdGhDcml0ZXJpYSh7XG4gICAgICAgICAgICB0eXBlczogWydJTlNUQU5DRSddXG4gICAgICAgIH0pO1xuICAgICAgICBub2RlcyA9IG5vZGVzLmZpbHRlcihub2RlID0+IG5vZGUubmFtZSA9PT0gQ09NUE9ORU5UX1NFVF9OQU1FKTtcbiAgICAgICAgaWYgKG5vZGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICBmaWdtYS5ub3RpZnkoYE5vIGluc3RhbmNlcyBuYW1lZCAnJHtDT01QT05FTlRfU0VUX05BTUV9JyBmb3VuZCBpbiBkb2N1bWVudC5gKTtcbiAgICAgICAgICAgIGxldCBpc0ZhaWxlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gaXNGYWlsZWQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBnZXREYXRhRm9yVGlja2V0cyhub2Rlcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gQWxsIG9uIHBhZ2VcbiAgICBlbHNlIGlmIChzdWJzZXQgPT0gXCJwYWdlXCIpIHtcbiAgICAgICAgbm9kZXMgPSBmaWdtYS5jdXJyZW50UGFnZS5maW5kQWxsV2l0aENyaXRlcmlhKHtcbiAgICAgICAgICAgIHR5cGVzOiBbJ0lOU1RBTkNFJ11cbiAgICAgICAgfSk7XG4gICAgICAgIG5vZGVzID0gbm9kZXMuZmlsdGVyKG5vZGUgPT4gbm9kZS5uYW1lID09PSBDT01QT05FTlRfU0VUX05BTUUpO1xuICAgICAgICBpZiAobm9kZXMubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIGZpZ21hLm5vdGlmeShgTm8gaW5zdGFuY2VzIG5hbWVkICcke0NPTVBPTkVOVF9TRVRfTkFNRX0nIGZvdW5kIG9uIHBhZ2UuYCk7XG4gICAgICAgICAgICBsZXQgaXNGYWlsZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGlzRmFpbGVkO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZ2V0RGF0YUZvclRpY2tldHMobm9kZXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIFNlbGVjdGVkIGVsZW1lbnRzXG4gICAgZWxzZSBpZiAoc3Vic2V0ID09IFwic2VsZWN0aW9uXCIpIHtcbiAgICAgICAgbm9kZXMgPSBmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb247XG4gICAgICAgIGlmIChub2Rlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgZmlnbWEubm90aWZ5KGBOb3RoaW5nIHNlbGVjdGVkLmApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZ2V0RGF0YUZvclRpY2tldHMobm9kZXMpO1xuICAgICAgICB9XG4gICAgfVxufVxuLyoqXG4gKiBTZW5kcyBhIHJlcXVlc3QgdG8gdGhlIFVJIHRvIGZldGNoIGRhdGEgZm9yIGFuIGFycmF5IG9mIHRpY2tldHNcbiAqIEBwYXJhbSBpbnN0YW5jZXNcbiAqL1xuZnVuY3Rpb24gZ2V0RGF0YUZvclRpY2tldHMoaW5zdGFuY2VzKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgdmFyIG5vZGVJZHMgPSBbXTtcbiAgICAgICAgdmFyIGlzc3VlSWRzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5zdGFuY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gaW5zdGFuY2VzW2ldO1xuICAgICAgICAgICAgaWYgKG5vZGUudHlwZSAhPT0gXCJJTlNUQU5DRVwiKSB7XG4gICAgICAgICAgICAgICAgZmlnbWEubm90aWZ5KFwiVGhlIGVsZW1lbnQgbmVlZHMgdG8gYmUgYW4gaW5zdGFuY2Ugb2YgXCIgKyBDT01QT05FTlRfU0VUX05BTUUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGlzc3VlSWROb2RlID0gbm9kZS5maW5kT25lKG4gPT4gbi50eXBlID09PSBcIlRFWFRcIiAmJiBuLm5hbWUgPT09IElTU1VFX0lEX05BTUUpO1xuICAgICAgICAgICAgICAgIGlmICghaXNzdWVJZE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlnbWEubm90aWZ5KGBBdCBsZWFzdCBvbmUgaW5zdGFuY2UgaXMgbWlzc2luZyB0aGUgdGV4dCBlbGVtZW50ICcke0lTU1VFX0lEX05BTUV9Jy4gQ291bGQgbm90IHVwZGF0ZS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlzc3VlSWRzLnB1c2goaXNzdWVJZE5vZGUuY2hhcmFjdGVycyk7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVJZHMucHVzaChub2RlLmlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2UoeyBub2RlSWRzOiBub2RlSWRzLCBpc3N1ZUlkczogaXNzdWVJZHMsIHR5cGU6ICdnZXRUaWNrZXREYXRhJyB9KTtcbiAgICB9KTtcbn1cbi8qKlxuICogVXBkYXRlcyBhIHNldCBvZiB0aWNrZXRzIGJhc2VkIG9uIHRoZWlyIHN0YXR1cy5cbiAqIElzIGNhbGxlZCBhZnRlciB0aGUgZGF0YSBpcyBmZXRjaGVkLlxuICogQHBhcmFtIHRpY2tldEluc3RhbmNlcyBBIHNldCBvZiB0aWNrZXQgaW5zdGFuY2VzXG4gKiBAcGFyYW0gbXNnIEEgbWVzc2FnZSBzZW50IGZyb20gdGhlIFVJXG4gKiBAcGFyYW0gaXNDcmVhdGVOZXcgV2V0aGVyIHRoZSBmdW5jdGlvbiBjYWxsIGlzIGNvbWluZyBmcm9tIGFuIGFjdHVhbCB0aWNrZXQgdXBkYXRlIG9yIGZyb20gY3JlYXRpbmcgYSBuZXcgdGlja2V0XG4gKiBAcmV0dXJucyBVcGRhdGVkIHRpY2tldCBpbnN0YW5jZXNcbiAqL1xuZnVuY3Rpb24gdXBkYXRlVGlja2V0cyh0aWNrZXRJbnN0YW5jZXMsIG1zZywgaXNDcmVhdGVOZXcgPSBmYWxzZSkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIHZhciB0aWNrZXREYXRhQXJyYXkgPSBtc2cuZGF0YTtcbiAgICAgICAgdmFyIGlzc3VlSWRzID0gbXNnLmlzc3VlSWRzO1xuICAgICAgICB2YXIgbnVtYmVyT2ZOb2RlcyA9IHRpY2tldEluc3RhbmNlcy5sZW5ndGg7XG4gICAgICAgIHZhciBpbnZhbGlkSWRzID0gW107XG4gICAgICAgIHZhciBudW1iZXJPZk1pc3NpbmdUaXRsZXMgPSAwO1xuICAgICAgICB2YXIgbnVtYmVyT2ZNaXNzaW5nRGF0ZXMgPSAwO1xuICAgICAgICB2YXIgbnVtYmVyT2ZNaXNzaW5nQXNzaWduZWVzID0gMDtcbiAgICAgICAgdmFyIG1pc3NpbmdWYXJpYW50cyA9IFtdO1xuICAgICAgICAvLyBHbyB0aHJvdWdoIGFsbCBub2RlcyBhbmQgdXBkYXRlIHRoZWlyIGNvbnRlbnRcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1iZXJPZk5vZGVzOyBpKyspIHtcbiAgICAgICAgICAgIGxldCB0aWNrZXRJbnN0YW5jZSA9IHRpY2tldEluc3RhbmNlc1tpXTtcbiAgICAgICAgICAgIGxldCB0aWNrZXREYXRhID0gY2hlY2tUaWNrZXREYXRhUmVwb25zZSh0aWNrZXREYXRhQXJyYXlbaV0sIGlzc3VlSWRzW2ldKTtcbiAgICAgICAgICAgIGxldCB0aWNrZXRTdGF0dXMgPSBnZXRTdGF0dXModGlja2V0RGF0YSk7XG4gICAgICAgICAgICBpZiAodGlja2V0U3RhdHVzID09PSAnRXJyb3InKVxuICAgICAgICAgICAgICAgIGludmFsaWRJZHMucHVzaChpc3N1ZUlkc1tpXSk7XG4gICAgICAgICAgICAvLyBHZXQgdGhlIHZhcmlhbnQgYmFzZWQgb24gdGhlIHRpY2tldCBzdGF0dXMgYW5kIHN3YXAgaXQgd2l0aCB0aGUgY3VycmVudFxuICAgICAgICAgICAgbGV0IG5ld1ZhcmlhbnQgPSB0aWNrZXRDb21wb25lbnQuZmluZENoaWxkKG4gPT4gbi5uYW1lID09PSBDT01QT05FTlRfU0VUX1BST1BFUlRZX05BTUUgKyB0aWNrZXRTdGF0dXMpO1xuICAgICAgICAgICAgaWYgKCFuZXdWYXJpYW50KSB7IC8vIElmIHRoZSBzdGF0dXMgZG9lc24ndCBtYXRjaCBhbnkgb2YgdGhlIHZhcmlhbnRzLCB1c2UgZGVmYXVsdFxuICAgICAgICAgICAgICAgIG5ld1ZhcmlhbnQgPSB0aWNrZXRDb21wb25lbnQuZGVmYXVsdFZhcmlhbnQ7XG4gICAgICAgICAgICAgICAgbWlzc2luZ1ZhcmlhbnRzLnB1c2godGlja2V0U3RhdHVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aXRsZVxuICAgICAgICAgICAgbGV0IHRpdGxlVHh0ID0gdGlja2V0SW5zdGFuY2UuZmluZE9uZShuID0+IG4udHlwZSA9PT0gXCJURVhUXCIgJiYgbi5uYW1lID09PSBJU1NVRV9USVRMRV9OQU1FKTtcbiAgICAgICAgICAgIGlmICh0aXRsZVR4dCkge1xuICAgICAgICAgICAgICAgIHlpZWxkIGZpZ21hLmxvYWRGb250QXN5bmModGl0bGVUeHQuZm9udE5hbWUpO1xuICAgICAgICAgICAgICAgIHRpdGxlVHh0LmNoYXJhY3RlcnMgPSBnZXRUaXRsZSh0aWNrZXREYXRhKTtcbiAgICAgICAgICAgICAgICB0aXRsZVR4dC5oeXBlcmxpbmsgPSB7IHR5cGU6IFwiVVJMXCIsIHZhbHVlOiBgaHR0cHM6Ly8ke2NvbXBhbnlfbmFtZX0uYXRsYXNzaWFuLm5ldC9icm93c2UvJHt0aWNrZXREYXRhLmtleX1gIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBudW1iZXJPZk1pc3NpbmdUaXRsZXMgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFVwZGF0ZSBkYXRlXG4gICAgICAgICAgICBsZXQgY2hhbmdlRGF0ZVR4dCA9IHRpY2tldEluc3RhbmNlLmZpbmRPbmUobiA9PiBuLnR5cGUgPT09IFwiVEVYVFwiICYmIG4ubmFtZSA9PT0gSVNTVUVfQ0hBTkdFX0RBVEVfTkFNRSk7XG4gICAgICAgICAgICBpZiAoY2hhbmdlRGF0ZVR4dCkge1xuICAgICAgICAgICAgICAgIHlpZWxkIGZpZ21hLmxvYWRGb250QXN5bmMoY2hhbmdlRGF0ZVR4dC5mb250TmFtZSk7XG4gICAgICAgICAgICAgICAgLy8gRmlsdGVycyBvdXQgdGhlIGRhdGEgdG8gYSBzaW1wbGV0IGZvcm1hdCAoTW1tIEREIFlZWVkpXG4gICAgICAgICAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShnZXRDaGFuZ2VEYXRlKHRpY2tldERhdGEpLnJlcGxhY2UoL1tUXSsuKi8sIFwiXCIpKTtcbiAgICAgICAgICAgICAgICBjaGFuZ2VEYXRlVHh0LmNoYXJhY3RlcnMgPSBkYXRlLnRvRGF0ZVN0cmluZygpO1xuICAgICAgICAgICAgICAgIC8vIGNoYW5nZURhdGVUeHQuY2hhcmFjdGVycyA9IGRhdGUudG9EYXRlU3RyaW5nKCkucmVwbGFjZSgvXihbQS1aYS16XSopLi8sXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBudW1iZXJPZk1pc3NpbmdEYXRlcyArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVXBkYXRlIGFzc2lnbmVlXG4gICAgICAgICAgICBsZXQgYXNzaWduZWVUeHQgPSB0aWNrZXRJbnN0YW5jZS5maW5kT25lKG4gPT4gbi50eXBlID09PSBcIlRFWFRcIiAmJiBuLm5hbWUgPT09IEFTU0lHTkVFX05BTUUpO1xuICAgICAgICAgICAgaWYgKGFzc2lnbmVlVHh0KSB7XG4gICAgICAgICAgICAgICAgeWllbGQgZmlnbWEubG9hZEZvbnRBc3luYyhhc3NpZ25lZVR4dC5mb250TmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKHRpY2tldERhdGEuZmllbGRzLmFzc2lnbmVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBhc3NpZ25lZSA9IGdldEFzc2lnbmVlKHRpY2tldERhdGEpO1xuICAgICAgICAgICAgICAgICAgICBhc3NpZ25lZVR4dC5jaGFyYWN0ZXJzID0gYXNzaWduZWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhc3NpZ25lZVR4dC5jaGFyYWN0ZXJzID0gXCJOb3QgYXNzaWduZWRcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBudW1iZXJPZk1pc3NpbmdBc3NpZ25lZXMgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEFkZCB0aGUgcmVsYXVuY2ggYnV0dG9uXG4gICAgICAgICAgICB0aWNrZXRJbnN0YW5jZS5zd2FwQ29tcG9uZW50KG5ld1ZhcmlhbnQpO1xuICAgICAgICAgICAgdGlja2V0SW5zdGFuY2Uuc2V0UmVsYXVuY2hEYXRhKHsgdXBkYXRlOiAnJyB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBOb3RpZnkgYWJvdXQgZXJyb3JzIChtaXNzaW5nIHRleHQgZmllbGRzKVxuICAgICAgICBpZiAobWlzc2luZ1ZhcmlhbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIG1pc3NpbmdWYXJpYW50cyA9IFsuLi5uZXcgU2V0KG1pc3NpbmdWYXJpYW50cyldO1xuICAgICAgICAgICAgbGV0IHZhcmlhbnRTdHJpbmcgPSBtaXNzaW5nVmFyaWFudHMuam9pbihcIicsICdcIik7XG4gICAgICAgICAgICBmaWdtYS5ub3RpZnkoYFN0YXR1cyAnJHt2YXJpYW50U3RyaW5nfScgbm90IGV4aXN0aW5nLiBZb3UgY2FuIGFkZCBpdCBhcyBuZXcgdmFyaWFudCB0byB0aGUgbWFpbiBjb21wb25lbnQuYCwgeyB0aW1lb3V0OiA2MDAwIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChudW1iZXJPZk1pc3NpbmdUaXRsZXMgPiAwKVxuICAgICAgICAgICAgZmlnbWEubm90aWZ5KGAke251bWJlck9mTWlzc2luZ1RpdGxlc30gdGlja2V0cyBhcmUgbWlzc2luZyB0ZXh0IGVsZW1lbnQgJyR7SVNTVUVfVElUTEVfTkFNRX0nLmApO1xuICAgICAgICBpZiAobnVtYmVyT2ZNaXNzaW5nRGF0ZXMgPiAwKVxuICAgICAgICAgICAgZmlnbWEubm90aWZ5KGAke251bWJlck9mTWlzc2luZ0RhdGVzfSB0aWNrZXRzIGFyZSBtaXNzaW5nIHRleHQgZWxlbWVudCAnJHtJU1NVRV9DSEFOR0VfREFURV9OQU1FfScuYCk7XG4gICAgICAgIGlmIChudW1iZXJPZk1pc3NpbmdBc3NpZ25lZXMgPiAwKVxuICAgICAgICAgICAgZmlnbWEubm90aWZ5KGAke251bWJlck9mTWlzc2luZ0Fzc2lnbmVlc30gdGlja2V0cyBhcmUgbWlzc2luZyB0ZXh0IGVsZW1lbnQgJyR7QVNTSUdORUVfTkFNRX0nLmApO1xuICAgICAgICAvLyBTdWNjZXNzIG1lc3NhZ2VcbiAgICAgICAgdmFyIG1lc3NhZ2U7XG4gICAgICAgIHZhciBudW1iZXJPZkludmFsaWRJZHMgPSBpbnZhbGlkSWRzLmxlbmd0aDtcbiAgICAgICAgaWYgKG51bWJlck9mSW52YWxpZElkcyA9PSBudW1iZXJPZk5vZGVzKSB7XG4gICAgICAgICAgICAvLyBBbGwgaW52YWxpZFxuICAgICAgICAgICAgbWVzc2FnZSA9IChudW1iZXJPZk5vZGVzID09IDEpID8gXCJJbnZhbGlkIElELlwiIDogYCR7bnVtYmVyT2ZJbnZhbGlkSWRzfSBvZiAke251bWJlck9mTm9kZXN9IElEcyBhcmUgaW52YWxpZCBvciBkbyBub3QgZXhpc3QuYDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChudW1iZXJPZkludmFsaWRJZHMgPT0gMCkge1xuICAgICAgICAgICAgLy8gQWxsIHZhbGlkXG4gICAgICAgICAgICBtZXNzYWdlID0gKG51bWJlck9mTm9kZXMgPT0gMSkgPyBcIlVwZGF0ZWQuXCIgOiBgJHtudW1iZXJPZk5vZGVzfSBvZiAke251bWJlck9mTm9kZXN9IGhlYWRlcihzKSB1cGRhdGVkIWA7XG4gICAgICAgICAgICBpZiAoaXNDcmVhdGVOZXcpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBTb21lIHZhbGlkXG4gICAgICAgICAgICBsZXQgZmlyc3RTZW50ZW5jZSA9IGAke251bWJlck9mTm9kZXMgLSBudW1iZXJPZkludmFsaWRJZHN9IG9mICR7bnVtYmVyT2ZOb2Rlc30gc3VjY2Vzc2Z1bGx5IHVwZGF0ZWQuIGA7XG4gICAgICAgICAgICBsZXQgc2Vjb25kU2VudGVuY2UgPSAobnVtYmVyT2ZJbnZhbGlkSWRzID09IDEpID8gXCIxIElEIGlzIGludmFsaWQgb3IgZG9lcyBub3QgZXhpc3QuXCIgOiBgJHtudW1iZXJPZkludmFsaWRJZHN9IElEcyBhcmUgaW52YWxpZCBvciBkbyBub3QgZXhpc3QuYDtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBmaXJzdFNlbnRlbmNlICsgc2Vjb25kU2VudGVuY2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgY2FsbGVkIHZpYSB0aGUgcmVsYXVuY2ggYnV0dG9uLCBjbG9zZSBwbHVnaW4gYWZ0ZXIgdXBkYXRpbmcgdGhlIHRpY2tldHNcbiAgICAgICAgaWYgKGZpZ21hLmNvbW1hbmQgPT09ICd1cGRhdGVfcGFnZScgfHwgZmlnbWEuY29tbWFuZCA9PT0gJ3VwZGF0ZV9hbGwnKSB7XG4gICAgICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbihtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZpZ21hLm5vdGlmeShtZXNzYWdlLCB7IHRpbWVvdXQ6IDIwMDAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRpY2tldEluc3RhbmNlcztcbiAgICB9KTtcbn1cbi8qKlxuICogQ3JlYXRlIGluc3RhbmNlcyBvZiB0aGUgbWFpbiB0aWNrZXQgY29tcG9uZW50IGFuZCByZXBsYWNlcyB0aGUgY29udGVudCB3aXRoIGRhdGEgb2YgdGhlIGFjdHVhbCBKaXJhIHRpY2tldFxuICogQHBhcmFtIG1zZyBKU09OIHdpdGggaW5mbyBzZW50IGZyb20gVUlcbiAqL1xuZnVuY3Rpb24gY3JlYXRlVGlja2V0SW5zdGFuY2UobXNnKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgLy8gQ3JlYXRlIGFuIGluc3RhbmNlIGFuZCB1cGRhdGUgaXQgdG8gdGhlIGNvcnJlY3Qgc3RhdHVzXG4gICAgICAgIGxldCB0aWNrZXRWYXJpYW50ID0gdGlja2V0Q29tcG9uZW50LmRlZmF1bHRWYXJpYW50O1xuICAgICAgICBsZXQgdGlja2V0SW5zdGFuY2UgPSB0aWNrZXRWYXJpYW50LmNyZWF0ZUluc3RhbmNlKCk7XG4gICAgICAgIHRpY2tldEluc3RhbmNlLnggPSAoZmlnbWEudmlld3BvcnQuY2VudGVyLnggLSB0aWNrZXRJbnN0YW5jZS53aWR0aCAvIDIpICsgbmV4dFRpY2tldE9mZnNldDtcbiAgICAgICAgdGlja2V0SW5zdGFuY2UueSA9IChmaWdtYS52aWV3cG9ydC5jZW50ZXIueSAtIHRpY2tldEluc3RhbmNlLmhlaWdodCAvIDIpICsgbmV4dFRpY2tldE9mZnNldDtcbiAgICAgICAgbmV4dFRpY2tldE9mZnNldCA9IChuZXh0VGlja2V0T2Zmc2V0ICsgMTApICUgNzA7XG4gICAgICAgIGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbiA9IFt0aWNrZXRJbnN0YW5jZV07XG4gICAgICAgIGxldCB0aWNrZXREYXRhID0gY2hlY2tUaWNrZXREYXRhUmVwb25zZShtc2cuZGF0YVswXSwgbXNnLmlzc3VlSWRzWzBdKTtcbiAgICAgICAgbGV0IHRpY2tldEluc3RhbmNlcyA9IHlpZWxkIHVwZGF0ZVRpY2tldHMoW3RpY2tldEluc3RhbmNlXSwgbXNnLCB0cnVlKTtcbiAgICAgICAgdGlja2V0SW5zdGFuY2UgPSB0aWNrZXRJbnN0YW5jZXNbMF07XG4gICAgICAgIC8vIEFkZCBJRFxuICAgICAgICBsZXQgaXNzdWVJRFR4dCA9IHRpY2tldEluc3RhbmNlLmZpbmRPbmUobiA9PiBuLnR5cGUgPT09IFwiVEVYVFwiICYmIG4ubmFtZSA9PT0gSVNTVUVfSURfTkFNRSk7XG4gICAgICAgIGlmIChpc3N1ZUlEVHh0KSB7XG4gICAgICAgICAgICB5aWVsZCBmaWdtYS5sb2FkRm9udEFzeW5jKGlzc3VlSURUeHQuZm9udE5hbWUpO1xuICAgICAgICAgICAgaXNzdWVJRFR4dC5jaGFyYWN0ZXJzID0gZ2V0SXNzdWVJZCh0aWNrZXREYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZpZ21hLm5vdGlmeShcIkNvdWxkIG5vdCBmaW5kIHRleHQgZWxlbWVudCBuYW1lZCAnXCIgKyBJU1NVRV9JRF9OQU1FICsgXCInLlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGlja2V0SW5zdGFuY2U7XG4gICAgfSk7XG59XG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgY29tcG9uZW50IHRoYXQgcmVwcmVzZW50cyBhIHRpY2tldCBzdGF0dXNcbiAqIEBwYXJhbSBzdGF0dXNDb2xvciBSR0IgdmFsdWUgZm9yIHN0YXR1cyBjb2xvclxuICogQHBhcmFtIHN0YXR1c05hbWUgTmFtZSBvZiBzdGF0dXNcbiAqIEByZXR1cm5zIEEgY29tcG9uZW50IHRoYXQgcmVwcmVzZW50IGEgdGlja2V0XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVRpY2tldFZhcmlhbnQoc3RhdHVzQ29sb3IsIHN0YXR1c05hbWUpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAvLyBDcmVhdGUgdGhlIG1haW4gZnJhbWVcbiAgICAgICAgdmFyIHRpY2tldFZhcmlhbnQgPSBmaWdtYS5jcmVhdGVDb21wb25lbnQoKTtcbiAgICAgICAgbGV0IHBhZGRpbmcgPSAyNDtcbiAgICAgICAgdGlja2V0VmFyaWFudC5uYW1lID0gc3RhdHVzTmFtZTtcbiAgICAgICAgdGlja2V0VmFyaWFudC5sYXlvdXRNb2RlID0gXCJWRVJUSUNBTFwiO1xuICAgICAgICB0aWNrZXRWYXJpYW50LnJlc2l6ZSg2MDAsIDIwMCk7XG4gICAgICAgIHRpY2tldFZhcmlhbnQuY291bnRlckF4aXNTaXppbmdNb2RlID0gXCJGSVhFRFwiO1xuICAgICAgICB0aWNrZXRWYXJpYW50LnByaW1hcnlBeGlzU2l6aW5nTW9kZSA9IFwiQVVUT1wiO1xuICAgICAgICB0aWNrZXRWYXJpYW50LnBhZGRpbmdUb3AgPSBwYWRkaW5nO1xuICAgICAgICB0aWNrZXRWYXJpYW50LnBhZGRpbmdSaWdodCA9IHBhZGRpbmc7XG4gICAgICAgIHRpY2tldFZhcmlhbnQucGFkZGluZ0JvdHRvbSA9IHBhZGRpbmc7XG4gICAgICAgIHRpY2tldFZhcmlhbnQucGFkZGluZ0xlZnQgPSBwYWRkaW5nO1xuICAgICAgICB0aWNrZXRWYXJpYW50Lml0ZW1TcGFjaW5nID0gMTY7XG4gICAgICAgIHRpY2tldFZhcmlhbnQuY29ybmVyUmFkaXVzID0gNDtcbiAgICAgICAgdGlja2V0VmFyaWFudC5maWxscyA9IFt7IHR5cGU6ICdTT0xJRCcsIGNvbG9yOiBzdGF0dXNDb2xvciB9XTtcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBoZWFkZXIgZnJhbWVcbiAgICAgICAgdmFyIGhlYWRlckZyYW1lID0gZmlnbWEuY3JlYXRlRnJhbWUoKTtcbiAgICAgICAgaGVhZGVyRnJhbWUubmFtZSA9IFwiSGVhZGVyXCI7XG4gICAgICAgIGhlYWRlckZyYW1lLmxheW91dE1vZGUgPSBcIkhPUklaT05UQUxcIjtcbiAgICAgICAgaGVhZGVyRnJhbWUuY291bnRlckF4aXNTaXppbmdNb2RlID0gXCJBVVRPXCI7XG4gICAgICAgIGhlYWRlckZyYW1lLmxheW91dEFsaWduID0gXCJTVFJFVENIXCI7XG4gICAgICAgIGhlYWRlckZyYW1lLml0ZW1TcGFjaW5nID0gNDA7XG4gICAgICAgIGhlYWRlckZyYW1lLmZpbGxzID0gW107XG4gICAgICAgIC8vIENyZWF0ZSB0aGUgaGVhZGVyIGZyYW1lXG4gICAgICAgIHZhciBkZXRhaWxzRnJhbWUgPSBmaWdtYS5jcmVhdGVGcmFtZSgpO1xuICAgICAgICBkZXRhaWxzRnJhbWUubmFtZSA9IFwiSGVhZGVyXCI7XG4gICAgICAgIGRldGFpbHNGcmFtZS5sYXlvdXRNb2RlID0gXCJIT1JJWk9OVEFMXCI7XG4gICAgICAgIGRldGFpbHNGcmFtZS5jb3VudGVyQXhpc1NpemluZ01vZGUgPSBcIkFVVE9cIjtcbiAgICAgICAgZGV0YWlsc0ZyYW1lLmxheW91dEFsaWduID0gXCJTVFJFVENIXCI7XG4gICAgICAgIGRldGFpbHNGcmFtZS5pdGVtU3BhY2luZyA9IDMyO1xuICAgICAgICBkZXRhaWxzRnJhbWUuZmlsbHMgPSBbXTtcbiAgICAgICAgbG9hZEZvbnRzKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBBZGQgdGhlIHRpY2tldCB0ZXh0IGZpZWxkc1xuICAgICAgICAgICAgY29uc3QgdGl0bGVUeHQgPSBmaWdtYS5jcmVhdGVUZXh0KCk7XG4gICAgICAgICAgICB0aXRsZVR4dC5mb250TmFtZSA9IEZPTlRfUkVHO1xuICAgICAgICAgICAgdGl0bGVUeHQuZm9udFNpemUgPSAzMjtcbiAgICAgICAgICAgIHRpdGxlVHh0LnRleHREZWNvcmF0aW9uID0gXCJVTkRFUkxJTkVcIjtcbiAgICAgICAgICAgIHRpdGxlVHh0LmF1dG9SZW5hbWUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRpdGxlVHh0LmNoYXJhY3RlcnMgPSBcIlRpY2tldCB0aXRsZVwiO1xuICAgICAgICAgICAgdGl0bGVUeHQubmFtZSA9IElTU1VFX1RJVExFX05BTUU7XG4gICAgICAgICAgICBjb25zdCBpc3N1ZUlkVHh0ID0gZmlnbWEuY3JlYXRlVGV4dCgpO1xuICAgICAgICAgICAgaXNzdWVJZFR4dC5mb250TmFtZSA9IEZPTlRfTUVEO1xuICAgICAgICAgICAgaXNzdWVJZFR4dC5mb250U2l6ZSA9IDMyO1xuICAgICAgICAgICAgaXNzdWVJZFR4dC5hdXRvUmVuYW1lID0gZmFsc2U7XG4gICAgICAgICAgICBpc3N1ZUlkVHh0LmNoYXJhY3RlcnMgPSBcIklELTFcIjtcbiAgICAgICAgICAgIGlzc3VlSWRUeHQubmFtZSA9IElTU1VFX0lEX05BTUU7XG4gICAgICAgICAgICBjb25zdCBjaGFuZ2VEYXRlVHh0ID0gZmlnbWEuY3JlYXRlVGV4dCgpO1xuICAgICAgICAgICAgY2hhbmdlRGF0ZVR4dC5mb250TmFtZSA9IEZPTlRfUkVHO1xuICAgICAgICAgICAgY2hhbmdlRGF0ZVR4dC5mb250U2l6ZSA9IDI0O1xuICAgICAgICAgICAgY2hhbmdlRGF0ZVR4dC5hdXRvUmVuYW1lID0gZmFsc2U7XG4gICAgICAgICAgICBjaGFuZ2VEYXRlVHh0LmNoYXJhY3RlcnMgPSBcIk1NIEREIFlZWVlcIjtcbiAgICAgICAgICAgIGNoYW5nZURhdGVUeHQubmFtZSA9IElTU1VFX0NIQU5HRV9EQVRFX05BTUU7XG4gICAgICAgICAgICBjb25zdCBhc3NpZ25lZVR4dCA9IGZpZ21hLmNyZWF0ZVRleHQoKTtcbiAgICAgICAgICAgIGFzc2lnbmVlVHh0LmZvbnROYW1lID0gRk9OVF9SRUc7XG4gICAgICAgICAgICBhc3NpZ25lZVR4dC5mb250U2l6ZSA9IDI0O1xuICAgICAgICAgICAgYXNzaWduZWVUeHQuYXV0b1JlbmFtZSA9IGZhbHNlO1xuICAgICAgICAgICAgYXNzaWduZWVUeHQuY2hhcmFjdGVycyA9IFwiTmFtZSBvZiBhc3NpZ25lZVwiO1xuICAgICAgICAgICAgYXNzaWduZWVUeHQubmFtZSA9IEFTU0lHTkVFX05BTUU7XG4gICAgICAgICAgICB0aWNrZXRWYXJpYW50LmFwcGVuZENoaWxkKGhlYWRlckZyYW1lKTtcbiAgICAgICAgICAgIHRpY2tldFZhcmlhbnQuYXBwZW5kQ2hpbGQoZGV0YWlsc0ZyYW1lKTtcbiAgICAgICAgICAgIGhlYWRlckZyYW1lLmFwcGVuZENoaWxkKGlzc3VlSWRUeHQpO1xuICAgICAgICAgICAgaGVhZGVyRnJhbWUuYXBwZW5kQ2hpbGQodGl0bGVUeHQpO1xuICAgICAgICAgICAgZGV0YWlsc0ZyYW1lLmFwcGVuZENoaWxkKGFzc2lnbmVlVHh0KTtcbiAgICAgICAgICAgIGRldGFpbHNGcmFtZS5hcHBlbmRDaGlsZChjaGFuZ2VEYXRlVHh0KTtcbiAgICAgICAgICAgIHRpdGxlVHh0LmxheW91dEdyb3cgPSAxO1xuICAgICAgICAgICAgYXNzaWduZWVUeHQubGF5b3V0R3JvdyA9IDE7XG4gICAgICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgIGZpZ21hLm5vdGlmeShcIkZvbnQgJ1wiICsgRk9OVF9SRUcuZmFtaWx5ICsgXCInIGNvdWxkIG5vdCBiZSBsb2FkZWQuIFBsZWFzZSBpbnN0YWxsIHRoZSBmb250LlwiKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIEZpeGVzIGEgd2VpcmQgYnVnIGluIHdoaWNoIHRoZSAnc3RyZXRjaCcgZG9lc250IHdvcmsgcHJvcGVybHlcbiAgICAgICAgaGVhZGVyRnJhbWUucHJpbWFyeUF4aXNTaXppbmdNb2RlID0gXCJGSVhFRFwiO1xuICAgICAgICBoZWFkZXJGcmFtZS5sYXlvdXRBbGlnbiA9IFwiU1RSRVRDSFwiO1xuICAgICAgICBkZXRhaWxzRnJhbWUucHJpbWFyeUF4aXNTaXppbmdNb2RlID0gXCJGSVhFRFwiO1xuICAgICAgICBkZXRhaWxzRnJhbWUubGF5b3V0QWxpZ24gPSBcIlNUUkVUQ0hcIjtcbiAgICAgICAgcmV0dXJuIHRpY2tldFZhcmlhbnQ7XG4gICAgfSk7XG59XG4vKipcbiAqIENyZWF0ZXMgdGhlIG1haW4gY29tcG9uZW50IGZvciB0aGUgdGlja2V0c1xuICogQHJldHVybnMgVGhlIG1haW4gY29tcG9uZW50XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVRpY2tldENvbXBvbmVudFNldCgpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICBsZXQgdGlja2V0Q29tcG9uZW50O1xuICAgICAgICAvLyBDcmVhdGUgdmFyaWFudHMgKG9uZSBmb3IgZWFjaCBzdGF0dXMpXG4gICAgICAgIGxldCB2YXJEZWZhdWx0ID0geWllbGQgY3JlYXRlVGlja2V0VmFyaWFudChWQVJJQU5UX0NPTE9SX0RFRkFVTFQsIENPTVBPTkVOVF9TRVRfUFJPUEVSVFlfTkFNRSArIFZBUklBTlRfTkFNRV9ERUZBVUxUKTtcbiAgICAgICAgbGV0IHZhcjEgPSB5aWVsZCBjcmVhdGVUaWNrZXRWYXJpYW50KFZBUklBTlRfQ09MT1JfMSwgQ09NUE9ORU5UX1NFVF9QUk9QRVJUWV9OQU1FICsgVkFSSUFOVF9OQU1FXzEpO1xuICAgICAgICBsZXQgdmFyMiA9IHlpZWxkIGNyZWF0ZVRpY2tldFZhcmlhbnQoVkFSSUFOVF9DT0xPUl8yLCBDT01QT05FTlRfU0VUX1BST1BFUlRZX05BTUUgKyBWQVJJQU5UX05BTUVfMik7XG4gICAgICAgIGxldCB2YXIzID0geWllbGQgY3JlYXRlVGlja2V0VmFyaWFudChWQVJJQU5UX0NPTE9SXzMsIENPTVBPTkVOVF9TRVRfUFJPUEVSVFlfTkFNRSArIFZBUklBTlRfTkFNRV8zKTtcbiAgICAgICAgbGV0IHZhcjQgPSB5aWVsZCBjcmVhdGVUaWNrZXRWYXJpYW50KFZBUklBTlRfQ09MT1JfNCwgQ09NUE9ORU5UX1NFVF9QUk9QRVJUWV9OQU1FICsgVkFSSUFOVF9OQU1FXzQpO1xuICAgICAgICBsZXQgdmFyNSA9IHlpZWxkIGNyZWF0ZVRpY2tldFZhcmlhbnQoVkFSSUFOVF9DT0xPUl9ET05FLCBDT01QT05FTlRfU0VUX1BST1BFUlRZX05BTUUgKyBWQVJJQU5UX05BTUVfRE9ORSk7XG4gICAgICAgIGxldCB2YXJFcnJvciA9IHlpZWxkIGNyZWF0ZVRpY2tldFZhcmlhbnQoVkFSSUFOVF9DT0xPUl9FUlJPUiwgQ09NUE9ORU5UX1NFVF9QUk9QRVJUWV9OQU1FICsgVkFSSUFOVF9OQU1FX0VSUk9SKTtcbiAgICAgICAgY29uc3QgdmFyaWFudHMgPSBbdmFyRGVmYXVsdCwgdmFyMSwgdmFyMiwgdmFyMywgdmFyNCwgdmFyNSwgdmFyRXJyb3JdO1xuICAgICAgICAvLyBDcmVhdGUgYSBjb21wb25lbnQgb3V0IG9mIGFsbCB0aGVzZSB2YXJpYW50c1xuICAgICAgICB0aWNrZXRDb21wb25lbnQgPSBmaWdtYS5jb21iaW5lQXNWYXJpYW50cyh2YXJpYW50cywgZmlnbWEuY3VycmVudFBhZ2UpO1xuICAgICAgICBsZXQgcGFkZGluZyA9IDE2O1xuICAgICAgICB0aWNrZXRDb21wb25lbnQubmFtZSA9IENPTVBPTkVOVF9TRVRfTkFNRTtcbiAgICAgICAgdGlja2V0Q29tcG9uZW50LmxheW91dE1vZGUgPSBcIlZFUlRJQ0FMXCI7XG4gICAgICAgIHRpY2tldENvbXBvbmVudC5jb3VudGVyQXhpc1NpemluZ01vZGUgPSBcIkFVVE9cIjtcbiAgICAgICAgdGlja2V0Q29tcG9uZW50LnByaW1hcnlBeGlzU2l6aW5nTW9kZSA9IFwiQVVUT1wiO1xuICAgICAgICB0aWNrZXRDb21wb25lbnQucGFkZGluZ1RvcCA9IHBhZGRpbmc7XG4gICAgICAgIHRpY2tldENvbXBvbmVudC5wYWRkaW5nUmlnaHQgPSBwYWRkaW5nO1xuICAgICAgICB0aWNrZXRDb21wb25lbnQucGFkZGluZ0JvdHRvbSA9IHBhZGRpbmc7XG4gICAgICAgIHRpY2tldENvbXBvbmVudC5wYWRkaW5nTGVmdCA9IHBhZGRpbmc7XG4gICAgICAgIHRpY2tldENvbXBvbmVudC5pdGVtU3BhY2luZyA9IDI0O1xuICAgICAgICB0aWNrZXRDb21wb25lbnQuY29ybmVyUmFkaXVzID0gNDtcbiAgICAgICAgLy8gU2F2ZSBjb21wb25lbnQgSUQgZm9yIGxhdGVyIHJlZmVyZW5jZVxuICAgICAgICBET0NVTUVOVF9OT0RFLnNldFBsdWdpbkRhdGEoJ3RpY2tldENvbXBvbmVudElEJywgdGlja2V0Q29tcG9uZW50LmlkKTtcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBjb21wb25lbnQgaXMgdmlzaWJsZSB3aGVyZSB3ZSdyZSBjdXJyZW50bHkgbG9va2luZ1xuICAgICAgICB0aWNrZXRDb21wb25lbnQueCA9IGZpZ21hLnZpZXdwb3J0LmNlbnRlci54IC0gKHRpY2tldENvbXBvbmVudC53aWR0aCAvIDIpO1xuICAgICAgICB0aWNrZXRDb21wb25lbnQueSA9IGZpZ21hLnZpZXdwb3J0LmNlbnRlci55IC0gKHRpY2tldENvbXBvbmVudC5oZWlnaHQgLyAyKTtcbiAgICAgICAgcmV0dXJuIHRpY2tldENvbXBvbmVudDtcbiAgICB9KTtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBtYWluIHRpY2tldCBjb21wb25lbnQgb3IgZ2V0cyB0aGUgcmVmZXJlbmNlIHRvIHRoZSBleGlzdGluZyBvbmVcbiAqL1xuZnVuY3Rpb24gcmVmZXJlbmNlVGlja2V0Q29tcG9uZW50U2V0KCkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIHRoZSB0aWNrZXQgY29tcG9uZW50IGlzIGFscmVhZHkgc2F2ZWQgaW4gdGhlIHZhcmlhYmxlXG4gICAgICAgIGlmICghdGlja2V0Q29tcG9uZW50KSB7XG4gICAgICAgICAgICAvLyBJZiBubywgdHJ5IHRoZSBnZXQgdGhlIHRpY2tldCBjb21wb25lbnQgYnkgaXRzIElEXG4gICAgICAgICAgICB2YXIgdGlja2V0Q29tcG9uZW50SWQgPSBET0NVTUVOVF9OT0RFLmdldFBsdWdpbkRhdGEoJ3RpY2tldENvbXBvbmVudElEJyk7XG4gICAgICAgICAgICBsZXQgbm9kZTtcbiAgICAgICAgICAgIGlmICh0aWNrZXRDb21wb25lbnRJZCAmJiAobm9kZSA9IGZpZ21hLmdldE5vZGVCeUlkKHRpY2tldENvbXBvbmVudElkKSkpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBhbiBJRCBzYXZlZCwgYWNjZXNzIHRoZSB0aWNrZXQgY29tcG9uZW50XG4gICAgICAgICAgICAgICAgdGlja2V0Q29tcG9uZW50ID0gbm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIG5vIElELCBjcmVhdGUgYSBuZXcgY29tcG9uZW50XG4gICAgICAgICAgICAgICAgdGlja2V0Q29tcG9uZW50ID0geWllbGQgY3JlYXRlVGlja2V0Q29tcG9uZW50U2V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbi8vIENoZWNrcyBpZiBmZXRjaGluZyBkYXRhIHdhcyBzdWNjZXNzZnVsIGF0IGFsbCBcbmZ1bmN0aW9uIGNoZWNrRmV0Y2hTdWNjZXNzKGRhdGEpIHtcbiAgICB2YXIgaXNTdWNjZXNzID0gZmFsc2U7XG4gICAgLy8gQ2FuIHRoaXMgZXZlbiBoYXBwZW4/XG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeShcIlNvbWV0aGluZyB3ZW50IHdyb25nLlwiKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU29tZXRoaW5nIHdlbnQgd3JvbmcuXCIgKyBkYXRhKTtcbiAgICB9XG4gICAgLy8gTm8gY29ubmVjdGlvbiB0byBGaXJlYmFzZVxuICAgIGVsc2UgaWYgKGRhdGEudHlwZSA9PSBcIkVycm9yXCIpIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KFwiQ291bGQgbm90IGdldCBkYXRhLiBUaGVyZSBzZWVtcyB0byBiZSBubyBjb25uZWN0aW9uIHRvIHRoZSBzZXJ2ZXIuXCIpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YS5tZXNzYWdlKTtcbiAgICB9XG4gICAgLy8gV3JvbmcgZS1tYWlsXG4gICAgZWxzZSBpZiAoZGF0YVswXS5tZXNzYWdlID09IFwiQ2xpZW50IG11c3QgYmUgYXV0aGVudGljYXRlZCB0byBhY2Nlc3MgdGhpcyByZXNvdXJjZS5cIikge1xuICAgICAgICBmaWdtYS5ub3RpZnkoXCJZb3UgaGF2ZSBlbnRlcmVkIGFuIGludmFsaWQgZS1tYWlsLiBTZWUgJ0F1dGhvcml6YXRpb24nIHNldHRpbmdzLlwiKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGRhdGEubWVzc2FnZSk7XG4gICAgfVxuICAgIC8vIFdyb25nIGNvbXBhbnkgbmFtZVxuICAgIGVsc2UgaWYgKGRhdGFbMF0uZXJyb3JNZXNzYWdlID09IFwiU2l0ZSB0ZW1wb3JhcmlseSB1bmF2YWlsYWJsZVwiKSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeShcIkNvbXBhbnkgZG9tYWluIG5hbWUgZG9lcyBub3QgZXhpc3QuIFNlZSAnUHJvamVjdCBTZXR0aW5ncycuXCIpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YVswXS5lcnJvck1lc3NhZ2UpO1xuICAgIH1cbiAgICAvLyBXcm9uZyBwYXNzd29yZFxuICAgIGVsc2UgaWYgKGRhdGFbMF1bMF0pIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KFwiQ291bGQgbm90IGFjY2VzcyBkYXRhLiBZb3VyIEppcmEgQVBJIFRva2VuIHNlZW1zIHRvIGJlIGludmFsaWQuIFNlZSAnQXV0aG9yaXphdGlvbicgc2V0dGluZ3MuXCIpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YVswXVswXSk7XG4gICAgfVxuICAgIC8vIEVsc2UsIGl0IHdhcyBwcm9iYWJseSBzdWNjZXNzZnVsXG4gICAgZWxzZSB7XG4gICAgICAgIGlzU3VjY2VzcyA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBpc1N1Y2Nlc3M7XG59XG4vLyBDaGVja3MgaWYgcGVyIHJlY2VpdmVkIHRpY2tldCBkYXRhIGlmIHRoZSBmZXRjaGluZyB3YXMgc3VjY2Vzc2Z1bFxuZnVuY3Rpb24gY2hlY2tUaWNrZXREYXRhUmVwb25zZSh0aWNrZXREYXRhLCBpc3N1ZUlkKSB7XG4gICAgdmFyIGNoZWNrZWREYXRhO1xuICAgIC8vIElmIHRoZSBKU09OIGhhcyBhIGtleSBmaWVsZCwgdGhlIGRhdGEgaXMgdmFsaWRcbiAgICBpZiAodGlja2V0RGF0YSAmJiB0aWNrZXREYXRhLmtleSkge1xuICAgICAgICBjaGVja2VkRGF0YSA9IHRpY2tldERhdGE7XG4gICAgfVxuICAgIC8vIElEIGRvZXMgbm90IGV4aXN0XG4gICAgZWxzZSBpZiAodGlja2V0RGF0YS5lcnJvck1lc3NhZ2VzID09IFwiVGhlIGlzc3VlIG5vIGxvbmdlciBleGlzdHMuXCIpIHtcbiAgICAgICAgY2hlY2tlZERhdGEgPSBjcmVhdGVFcnJvckRhdGFKU09OKGBFcnJvcjogVGlja2V0IElEICcke2lzc3VlSWR9JyBkb2VzIG5vdCBleGlzdC5gLCBpc3N1ZUlkKTtcbiAgICAgICAgLy8gZmlnbWEubm90aWZ5KGBUaWNrZXQgSUQgJyR7aXNzdWVJZH0nIGRvZXMgbm90IGV4aXN0LmApXG4gICAgfVxuICAgIC8vIElEIGhhcyBpbnZhbGlkIGZvcm1hdFxuICAgIGVsc2UgaWYgKHRpY2tldERhdGEuZXJyb3JNZXNzYWdlcyA9PSBcIklzc3VlIGtleSBpcyBpbiBhbiBpbnZhbGlkIGZvcm1hdC5cIikge1xuICAgICAgICBjaGVja2VkRGF0YSA9IGNyZWF0ZUVycm9yRGF0YUpTT04oYEVycm9yOiBUaWNrZXQgSUQgJyR7aXNzdWVJZH0nIGlzIGluIGFuIGludmFsaWQgZm9ybWF0LmAsIGlzc3VlSWQpO1xuICAgICAgICAvLyBmaWdtYS5ub3RpZnkoYFRpY2tldCBJRCAnJHtpc3N1ZUlkfScgaXMgaW4gYW4gaW52YWxpZCBmb3JtYXQuYClcbiAgICB9XG4gICAgLy8gT3RoZXJcbiAgICBlbHNlIHtcbiAgICAgICAgY2hlY2tlZERhdGEgPSBjcmVhdGVFcnJvckRhdGFKU09OKFwiRXJyb3I6IEFuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJlZC5cIiwgaXNzdWVJZCk7XG4gICAgICAgIGZpZ21hLm5vdGlmeShcIlVuZXhwZWN0ZWQgZXJyb3IuXCIpO1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiVW5leHBlY3RlZCBlcnJvci5cIiwgdGlja2V0RGF0YSk7XG4gICAgICAgIC8vIHRocm93IG5ldyBFcnJvcih0aWNrZXREYXRhLm1lc3NhZ2UpXG4gICAgfVxuICAgIHJldHVybiBjaGVja2VkRGF0YTtcbn1cbi8vIENyZWF0ZSBhIGVycm9yIHZhcmlhYmxlIHRoYXQgaGFzIHRoZSBzYW1lIG1haW4gZmllbGRzIGFzIHRoZSBKaXJhIFRpY2tldCB2YXJpYWJsZS4gXG4vLyBUaGlzIHdpbGwgYmUgdXNlZCB0aGUgZmlsbCB0aGUgdGlja2V0IGRhdGEgd2l0aCB0aGUgZXJyb3IgbWVzc2FnZS5cbmZ1bmN0aW9uIGNyZWF0ZUVycm9yRGF0YUpTT04obWVzc2FnZSwgaXNzdWVJZCkge1xuICAgIHZhciB0b2RheSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICB2YXIgZXJyb3JEYXRhID0ge1xuICAgICAgICBcImtleVwiOiBpc3N1ZUlkLFxuICAgICAgICBcImZpZWxkc1wiOiB7XG4gICAgICAgICAgICBcInN1bW1hcnlcIjogbWVzc2FnZSxcbiAgICAgICAgICAgIFwic3RhdHVzXCI6IHtcbiAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJFcnJvclwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJzdGF0dXNjYXRlZ29yeWNoYW5nZWRhdGVcIjogdG9kYXlcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGVycm9yRGF0YTtcbn1cbi8vIEZ1bmN0aW9uIGZvciBsb2FkaW5nIGFsbCB0aGUgZm9udHMgZm9yIHRoZSBtYWluIGNvbXBvbmVudFxuZnVuY3Rpb24gbG9hZEZvbnRzKCkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIHlpZWxkIGZpZ21hLmxvYWRGb250QXN5bmMoRk9OVF9SRUcpO1xuICAgICAgICB5aWVsZCBmaWdtYS5sb2FkRm9udEFzeW5jKEZPTlRfTUVEKTtcbiAgICAgICAgeWllbGQgZmlnbWEubG9hZEZvbnRBc3luYyhGT05UX0JPTEQpO1xuICAgIH0pO1xufVxuLy8gRm9ybWF0cyBhIGhleCB2YWx1ZSB0byBSR0JcbmZ1bmN0aW9uIGhleFRvUmdiKGhleCkge1xuICAgIHZhciBiaWdpbnQgPSBwYXJzZUludChoZXgsIDE2KTtcbiAgICB2YXIgciA9IChiaWdpbnQgPj4gMTYpICYgMjU1O1xuICAgIHZhciBnID0gKGJpZ2ludCA+PiA4KSAmIDI1NTtcbiAgICB2YXIgYiA9IGJpZ2ludCAmIDI1NTtcbiAgICByZXR1cm4geyByOiByIC8gMjU1LCBnOiBnIC8gMjU1LCBiOiBiIC8gMjU1IH07XG59XG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IHt9O1xuX193ZWJwYWNrX21vZHVsZXNfX1tcIi4vc3JjL2NvZGUudHNcIl0oKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==