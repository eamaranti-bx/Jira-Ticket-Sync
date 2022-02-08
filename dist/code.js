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
const WINDOW_HEIGHT_BIG = 650;
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
if (figma.command === 'update_selection') {
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
        console.log(1);
        var hasFailed = requestUpdateForTickets(type);
        console.log(2);
        if (hasFailed && (type === "all" || type === "page" || type === "selection")) {
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
        // console.log("Ticket data:", msg.data)
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
    let isFailed = false;
    // All in document
    if (subset == "all") {
        nodes = DOCUMENT_NODE.findAllWithCriteria({
            types: ['INSTANCE']
        });
        nodes = nodes.filter(node => node.name === COMPONENT_SET_NAME);
        if (nodes.length == 0) {
            figma.notify(`No instances named '${COMPONENT_SET_NAME}' found in document.`);
            isFailed = true;
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
            isFailed = true;
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
            isFailed = true;
        }
        else {
            getDataForTickets(nodes);
        }
    }
    return isFailed;
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
            ticketInstance.setRelaunchData({ update_selection: '' });
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
        if (figma.command === 'update_page' || figma.command === 'update_all' || figma.command === 'update_selection') {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsbUNBQW1DO0FBQ3BFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtEQUErRCxRQUFRO0FBQ3ZFLHNDQUFzQyxRQUFRO0FBQzlDO0FBQ0E7QUFDQTtBQUNBLCtEQUErRCxRQUFRO0FBQ3ZFLHNDQUFzQyxRQUFRO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7Ozs7Ozs7VUVub0JBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWJwYWNrLXJlYWN0Ly4vc3JjL2NvZGUudHMiLCJ3ZWJwYWNrOi8vd2VicGFjay1yZWFjdC93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3dlYnBhY2stcmVhY3Qvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3dlYnBhY2stcmVhY3Qvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuY29uc3QgRE9DVU1FTlRfTk9ERSA9IGZpZ21hLmN1cnJlbnRQYWdlLnBhcmVudDtcbi8vIFNldCB0aGUgcmVsYXVuY2ggYnV0dG9uIGZvciB0aGUgd2hvbGUgZG9jdW1lbnRcbkRPQ1VNRU5UX05PREUuc2V0UmVsYXVuY2hEYXRhKHsgdXBkYXRlX3BhZ2U6ICcnLCB1cGRhdGVfYWxsOiAnJyB9KTtcbmNvbnN0IFdJTkRPV19XSURUSCA9IDI1MDtcbmNvbnN0IFdJTkRPV19IRUlHSFRfQklHID0gNjUwO1xuY29uc3QgV0lORE9XX0hFSUdIVF9TTUFMTCA9IDMwODtcbmNvbnN0IENPTVBBTllfTkFNRV9LRVkgPSBcIkNPTVBBTllfTkFNRVwiO1xuY29uc3QgUFJPSkVDVF9JRF9LRVkgPSBcIlBST0pFQ1RfSURcIjtcbmNvbnN0IFVTRVJOQU1FX0tFWSA9IFwiVVNFUk5BTUVcIjtcbmNvbnN0IFBBU1NXT1JEX0tFWSA9IFwiUEFTU1dPUkRcIjtcbmNvbnN0IElTU1VFX0lEX0tFWSA9IFwiSVNTVUVfSURcIjtcbmNvbnN0IENSRUFURV9MSU5LX0tFWSA9IFwiQ1JFQVRFX0xJTktcIjtcbnZhciBjb21wYW55X25hbWU7IC8vIFNhdmVkIHB1YmxpY2x5IHdpdGggc2V0UGx1Z2luRGF0YVxudmFyIHByb2plY3RfaWQ7IC8vIFNhdmVkIHB1YmxpY2x5IHdpdGggc2V0UGx1Z2luRGF0YVxudmFyIHVzZXJuYW1lO1xudmFyIHBhc3N3b3JkO1xudmFyIGlzc3VlSWQ7XG52YXIgY3JlYXRlTGluaztcbmNvbnN0IEZPTlRfUkVHID0geyBmYW1pbHk6IFwiV29yayBTYW5zXCIsIHN0eWxlOiBcIlJlZ3VsYXJcIiB9O1xuY29uc3QgRk9OVF9NRUQgPSB7IGZhbWlseTogXCJXb3JrIFNhbnNcIiwgc3R5bGU6IFwiTWVkaXVtXCIgfTtcbmNvbnN0IEZPTlRfQk9MRCA9IHsgZmFtaWx5OiBcIldvcmsgU2Fuc1wiLCBzdHlsZTogXCJCb2xkXCIgfTtcbmZ1bmN0aW9uIGdldFN0YXR1cyhkYXRhKSB7IHJldHVybiBkYXRhLmZpZWxkcy5zdGF0dXMubmFtZTsgfVxuZnVuY3Rpb24gZ2V0VGl0bGUoZGF0YSkgeyByZXR1cm4gZGF0YS5maWVsZHMuc3VtbWFyeTsgfVxuZnVuY3Rpb24gZ2V0SXNzdWVJZChkYXRhKSB7IHJldHVybiBkYXRhLmtleTsgfVxuZnVuY3Rpb24gZ2V0Q2hhbmdlRGF0ZShkYXRhKSB7IHJldHVybiBkYXRhLmZpZWxkcy5zdGF0dXNjYXRlZ29yeWNoYW5nZWRhdGU7IH1cbmZ1bmN0aW9uIGdldEFzc2lnbmVlKGRhdGEpIHsgcmV0dXJuIGRhdGEuZmllbGRzLmFzc2lnbmVlLmRpc3BsYXlOYW1lOyB9XG52YXIgbmV4dFRpY2tldE9mZnNldCA9IDA7XG4vLyB0aWNrZXRkYXRhLmZpZWxkcy5hc3NpZ25lZS5hdmF0YXJVcmxzXG4vLyB0aWNrZXRkYXRhLmZpZWxkcy5zdGF0dXMubmFtZVxuLy8gdGlja2V0ZGF0YS5maWVsZHMuc3RhdHVzLnN0YXR1c0NhdGVnb3J5Lm5hbWVcbmNvbnN0IElTU1VFX0lEX05BTUUgPSBcIlRpY2tldCBJRFwiO1xuY29uc3QgSVNTVUVfVElUTEVfTkFNRSA9IFwiVGlja2V0IFRpdGxlXCI7XG5jb25zdCBJU1NVRV9DSEFOR0VfREFURV9OQU1FID0gXCJEYXRlIG9mIFN0YXR1cyBDaGFuZ2VcIjtcbmNvbnN0IEFTU0lHTkVFX05BTUUgPSBcIkFzc2lnbmVlXCI7XG5jb25zdCBDT01QT05FTlRfU0VUX05BTUUgPSBcIkppcmEgVGlja2V0XCI7XG5jb25zdCBDT01QT05FTlRfU0VUX1BST1BFUlRZX05BTUUgPSBcIlN0YXR1cz1cIjtcbmNvbnN0IFZBUklBTlRfTkFNRV8xID0gXCJUbyBEb1wiO1xuY29uc3QgVkFSSUFOVF9DT0xPUl8xID0gaGV4VG9SZ2IoJ0VFRUVFRScpO1xuY29uc3QgVkFSSUFOVF9OQU1FXzIgPSBcIkNvbmNlcHRpbmdcIjtcbmNvbnN0IFZBUklBTlRfQ09MT1JfMiA9IGhleFRvUmdiKCdGRkVEQzAnKTtcbmNvbnN0IFZBUklBTlRfTkFNRV8zID0gXCJEZXNpZ25cIjtcbmNvbnN0IFZBUklBTlRfQ09MT1JfMyA9IGhleFRvUmdiKCdEN0UwRkYnKTtcbmNvbnN0IFZBUklBTlRfTkFNRV80ID0gXCJUZXN0aW5nXCI7XG5jb25zdCBWQVJJQU5UX0NPTE9SXzQgPSBoZXhUb1JnYignRDdFMEZGJyk7XG5jb25zdCBWQVJJQU5UX05BTUVfRE9ORSA9IFwiTGF1bmNoXCI7XG5jb25zdCBWQVJJQU5UX0NPTE9SX0RPTkUgPSBoZXhUb1JnYignRDNGRkQyJyk7XG5jb25zdCBWQVJJQU5UX05BTUVfREVGQVVMVCA9IFwiRGVmYXVsdFwiO1xuY29uc3QgVkFSSUFOVF9DT0xPUl9ERUZBVUxUID0gaGV4VG9SZ2IoJ0I5QjlCOScpO1xuY29uc3QgVkFSSUFOVF9OQU1FX0VSUk9SID0gXCJFcnJvclwiO1xuY29uc3QgVkFSSUFOVF9DT0xPUl9FUlJPUiA9IGhleFRvUmdiKCdGRkQ5RDknKTtcbnZhciB0aWNrZXRDb21wb25lbnQ7XG4vLyBEb24ndCBzaG93IFVJIGlmIHJlbGF1bmNoIGJ1dHRvbnMgYXJlIHJ1blxuaWYgKGZpZ21hLmNvbW1hbmQgPT09ICd1cGRhdGVfc2VsZWN0aW9uJykge1xuICAgIHVwZGF0ZVdpdGhvdXRVSShcInNlbGVjdGlvblwiKTtcbn1cbmVsc2UgaWYgKGZpZ21hLmNvbW1hbmQgPT09ICd1cGRhdGVfYWxsJykge1xuICAgIHVwZGF0ZVdpdGhvdXRVSShcImFsbFwiKTtcbn1cbmVsc2UgaWYgKGZpZ21hLmNvbW1hbmQgPT09ICd1cGRhdGVfcGFnZScpIHtcbiAgICB1cGRhdGVXaXRob3V0VUkoXCJwYWdlXCIpO1xufVxuZWxzZSB7XG4gICAgLy8gT3RoZXJ3aXNlIHNob3cgVUlcbiAgICBmaWdtYS5zaG93VUkoX19odG1sX18sIHsgd2lkdGg6IFdJTkRPV19XSURUSCwgaGVpZ2h0OiBXSU5ET1dfSEVJR0hUX1NNQUxMIH0pO1xuICAgIHNlbmREYXRhKCk7XG59XG4vLyBNYWtlIHN1cmUgdGhlIG1haW4gY29tcG9uZW50IGlzIHJlZmVyZW5jZWRcbnJlZmVyZW5jZVRpY2tldENvbXBvbmVudFNldCgpO1xuLy8gU3RhcnQgcGx1Z2luIHdpdGhvdXQgdmlzaWJsZSBVSSBhbmQgdXBkYXRlIHRpY2tldHNcbmZ1bmN0aW9uIHVwZGF0ZVdpdGhvdXRVSSh0eXBlKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgZmlnbWEuc2hvd1VJKF9faHRtbF9fLCB7IHZpc2libGU6IGZhbHNlIH0pO1xuICAgICAgICB5aWVsZCBzZW5kRGF0YSgpO1xuICAgICAgICBjb25zb2xlLmxvZygxKTtcbiAgICAgICAgdmFyIGhhc0ZhaWxlZCA9IHJlcXVlc3RVcGRhdGVGb3JUaWNrZXRzKHR5cGUpO1xuICAgICAgICBjb25zb2xlLmxvZygyKTtcbiAgICAgICAgaWYgKGhhc0ZhaWxlZCAmJiAodHlwZSA9PT0gXCJhbGxcIiB8fCB0eXBlID09PSBcInBhZ2VcIiB8fCB0eXBlID09PSBcInNlbGVjdGlvblwiKSkge1xuICAgICAgICAgICAgZmlnbWEuY2xvc2VQbHVnaW4oKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuLy8gU2VuZCB0aGUgc3RvcmVkIGF1dGhvcml6YXRpb24gZGF0YSB0byB0aGUgVUlcbmZ1bmN0aW9uIHNlbmREYXRhKCkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGNvbXBhbnlfbmFtZSA9IHlpZWxkIGdldEF1dGhvcml6YXRpb25JbmZvKENPTVBBTllfTkFNRV9LRVksIHRydWUpO1xuICAgICAgICBwcm9qZWN0X2lkID0geWllbGQgZ2V0QXV0aG9yaXphdGlvbkluZm8oUFJPSkVDVF9JRF9LRVksIHRydWUpO1xuICAgICAgICB1c2VybmFtZSA9IHlpZWxkIGdldEF1dGhvcml6YXRpb25JbmZvKFVTRVJOQU1FX0tFWSwgZmFsc2UpO1xuICAgICAgICBwYXNzd29yZCA9IHlpZWxkIGdldEF1dGhvcml6YXRpb25JbmZvKFBBU1NXT1JEX0tFWSwgZmFsc2UpO1xuICAgICAgICBpc3N1ZUlkID0geWllbGQgZ2V0QXV0aG9yaXphdGlvbkluZm8oSVNTVUVfSURfS0VZLCBmYWxzZSk7XG4gICAgICAgIGNyZWF0ZUxpbmsgPSB5aWVsZCBnZXRBdXRob3JpemF0aW9uSW5mbyhDUkVBVEVfTElOS19LRVksIGZhbHNlKTtcbiAgICAgICAgaWYgKGNyZWF0ZUxpbmsgPT09IFwiXCIpXG4gICAgICAgICAgICBjcmVhdGVMaW5rID0gdHJ1ZTtcbiAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2UoeyBjb21wYW55X25hbWU6IGNvbXBhbnlfbmFtZSwgcHJvamVjdF9pZDogcHJvamVjdF9pZCwgdXNlcm5hbWU6IHVzZXJuYW1lLCBwYXNzd29yZDogcGFzc3dvcmQsIGlzc3VlSWQ6IGlzc3VlSWQsIGNyZWF0ZUxpbms6IGNyZWF0ZUxpbmssIHR5cGU6ICdzZXRBdXRob3JpemF0aW9uVmFyaWFibGVzJyB9KTtcbiAgICB9KTtcbn1cbi8vIEFsbCB0aGUgZnVuY3Rpb25zIHRoYXQgY2FuIGJlIHN0YXJ0ZWQgZnJvbSB0aGUgVUlcbmZpZ21hLnVpLm9ubWVzc2FnZSA9IChtc2cpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAvLyBDYWxsZWQgdG8gY3JlYXRlIGEgbmV3IG1haW4gY29tcG9uZW50IGFuZCBzYXZlIGl0cyBJRFxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2NyZWF0ZS1jb21wb25lbnQnKSB7XG4gICAgICAgIHRpY2tldENvbXBvbmVudCA9IHlpZWxkIGNyZWF0ZVRpY2tldENvbXBvbmVudFNldCgpO1xuICAgICAgICBET0NVTUVOVF9OT0RFLnNldFBsdWdpbkRhdGEoJ3RpY2tldENvbXBvbmVudElEJywgdGlja2V0Q29tcG9uZW50LmlkKTtcbiAgICB9XG4gICAgLy8gQ2FsbGVkIHRvIGNyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBhIGNvbXBvbmVudCAoYmFzZWQgb24gdGhlIGlzc3VlSWQgZW50ZXJlZCBpbiB0aGUgVUkpXG4gICAgaWYgKG1zZy50eXBlID09PSAnY3JlYXRlLW5ldy10aWNrZXQnICYmIGNoZWNrRmV0Y2hTdWNjZXNzKG1zZy5kYXRhKSkge1xuICAgICAgICBsZXQgdGlja2V0SW5zdGFuY2UgPSB5aWVsZCBjcmVhdGVUaWNrZXRJbnN0YW5jZShtc2cpO1xuICAgICAgICBpZiAobXNnLmNyZWF0ZUxpbmsgJiYgbXNnLmRhdGFbMF0ua2V5ICYmIHByb2plY3RfaWQgIT0gXCJcIikge1xuICAgICAgICAgICAgbGV0IHByb2plY3ROYW1lID0gZW5jb2RlVVJJQ29tcG9uZW50KGZpZ21hLnJvb3QubmFtZSk7XG4gICAgICAgICAgICBsZXQgbm9kZUlkID0gZW5jb2RlVVJJQ29tcG9uZW50KHRpY2tldEluc3RhbmNlLmlkKTtcbiAgICAgICAgICAgIGxldCBsaW5rID0gYGh0dHBzOi8vd3d3LmZpZ21hLmNvbS9maWxlLyR7cHJvamVjdF9pZH0vJHtwcm9qZWN0TmFtZX0/bm9kZS1pZD0ke25vZGVJZH1gO1xuICAgICAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2UoeyBpc3N1ZUlkOiBtc2cuaXNzdWVJZHNbMF0sIGxpbms6IGxpbmssIHR5cGU6ICdwb3N0LWxpbmstdG8tamlyYS1pc3N1ZScgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gQ2FsbGVkIHRvIGdldCBhbGwgSmlyYSBUaWNrZXIgSGVhZGVyIGluc3RhbmNlcyBhbmQgdXBkYXRlIHRoZW0gb25lIGJ5IG9uZS4gXG4gICAgaWYgKG1zZy50eXBlID09PSAndXBkYXRlLWFsbCcpIHtcbiAgICAgICAgcmVxdWVzdFVwZGF0ZUZvclRpY2tldHMoXCJhbGxcIik7XG4gICAgfVxuICAgIC8vIENhbGxlZCB0byBnZXQgSmlyYSBUaWNrZXIgSGVhZGVyIGluc3RhbmNlcyBvbiB0aGlzIHBhZ2UgYW5kIHVwZGF0ZSB0aGVtIG9uZSBieSBvbmUuIFxuICAgIGlmIChtc2cudHlwZSA9PT0gJ3VwZGF0ZS1wYWdlJykge1xuICAgICAgICByZXF1ZXN0VXBkYXRlRm9yVGlja2V0cyhcInBhZ2VcIik7XG4gICAgfVxuICAgIC8vIENhbGxlZCB0byBnZXQgc2VsZWN0ZWQgSmlyYSBUaWNrZXIgSGVhZGVyIGluc3RhbmNlcyBhbmQgdXBkYXRlIHRoZW0gb25lIGJ5IG9uZS4gXG4gICAgaWYgKG1zZy50eXBlID09PSAndXBkYXRlLXNlbGVjdGVkJykge1xuICAgICAgICByZXF1ZXN0VXBkYXRlRm9yVGlja2V0cyhcInNlbGVjdGlvblwiKTtcbiAgICB9XG4gICAgLy8gU2F2ZSBuZXcgYXV0aG9yaXphdGlvbiBpbmZvXG4gICAgaWYgKG1zZy50eXBlID09PSAnYXV0aG9yaXphdGlvbi1kZXRhaWwtY2hhbmdlZCcpIHtcbiAgICAgICAgc2V0QXV0aG9yaXphdGlvbkluZm8obXNnLmtleSwgbXNnLmRhdGEsIG1zZy5zYXZlX3B1YmxpYyk7XG4gICAgfVxuICAgIC8vIFJlc2l6ZSB0aGUgVUlcbiAgICBpZiAobXNnLnR5cGUgPT09ICdyZXNpemUtdWknKSB7XG4gICAgICAgIG1zZy5iaWdfc2l6ZSA/IGZpZ21hLnVpLnJlc2l6ZShXSU5ET1dfV0lEVEgsIFdJTkRPV19IRUlHSFRfQklHKSA6IGZpZ21hLnVpLnJlc2l6ZShXSU5ET1dfV0lEVEgsIFdJTkRPV19IRUlHSFRfU01BTEwpO1xuICAgIH1cbiAgICAvLyBBbGxvd3MgdGhlIFVJIHRvIGNyZWF0ZSBub3RpZmljYXRpb25zXG4gICAgaWYgKG1zZy50eXBlID09PSAnY3JlYXRlLXZpc3VhbC1iZWxsJykge1xuICAgICAgICBmaWdtYS5ub3RpZnkobXNnLm1lc3NhZ2UpO1xuICAgIH1cbiAgICAvLyBVcGRhdGVzIGluc3RhbmNlcyBiYXNlZCBvbiB0aGUgcmVjZWl2ZWQgdGlja2V0IGRhdGEuXG4gICAgaWYgKG1zZy50eXBlID09PSAndGlja2V0RGF0YVNlbnQnICYmIGNoZWNrRmV0Y2hTdWNjZXNzKG1zZy5kYXRhKSkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIlRpY2tldCBkYXRhOlwiLCBtc2cuZGF0YSlcbiAgICAgICAgdmFyIG5vZGVJZHMgPSBtc2cubm9kZUlkcztcbiAgICAgICAgdmFyIG5vZGVzID0gbm9kZUlkcy5tYXAoaWQgPT4gZmlnbWEuZ2V0Tm9kZUJ5SWQoaWQpKTtcbiAgICAgICAgeWllbGQgdXBkYXRlVGlja2V0cyhub2RlcywgbXNnKTtcbiAgICB9XG59KTtcbi8vIFNhdmVzIGF1dGhvcml6YXRpb24gZGV0YWlscyBpbiBjbGllbnQgc3RvcmFnZVxuZnVuY3Rpb24gc2V0QXV0aG9yaXphdGlvbkluZm8oa2V5LCB2YWx1ZSwgc2F2ZVB1YmxpYyA9IGZhbHNlKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgaWYgKHNhdmVQdWJsaWMpIHtcbiAgICAgICAgICAgIERPQ1VNRU5UX05PREUuc2V0UGx1Z2luRGF0YShrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHlpZWxkIGZpZ21hLmNsaWVudFN0b3JhZ2Uuc2V0QXN5bmMoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgdmFyaWFibGUgZ2V0cyB1cGRhdGVkXG4gICAgICAgIGlmIChrZXkgPT09IENPTVBBTllfTkFNRV9LRVkpXG4gICAgICAgICAgICBjb21wYW55X25hbWUgPSB2YWx1ZTtcbiAgICAgICAgZWxzZSBpZiAoa2V5ID09PSBQUk9KRUNUX0lEX0tFWSlcbiAgICAgICAgICAgIHByb2plY3RfaWQgPSB2YWx1ZTtcbiAgICAgICAgZWxzZSBpZiAoa2V5ID09PSBVU0VSTkFNRV9LRVkpXG4gICAgICAgICAgICB1c2VybmFtZSA9IHZhbHVlO1xuICAgICAgICBlbHNlIGlmIChrZXkgPT09IFBBU1NXT1JEX0tFWSlcbiAgICAgICAgICAgIHBhc3N3b3JkID0gdmFsdWU7XG4gICAgICAgIGVsc2UgaWYgKGtleSA9PT0gSVNTVUVfSURfS0VZKVxuICAgICAgICAgICAgaXNzdWVJZCA9IHZhbHVlO1xuICAgICAgICBlbHNlIGlmIChrZXkgPT09IENSRUFURV9MSU5LX0tFWSlcbiAgICAgICAgICAgIGNyZWF0ZUxpbmsgPSB2YWx1ZTtcbiAgICB9KTtcbn1cbi8vIEdldCBhdXRob3JpemF0aW9uIGRldGFpbHMgZnJvbSBjbGllbnQgc3RvcmFnZVxuZnVuY3Rpb24gZ2V0QXV0aG9yaXphdGlvbkluZm8oa2V5LCBzYXZlZFB1YmxpYyA9IGZhbHNlKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgdmFyIHZhbHVlU2F2ZWQ7XG4gICAgICAgIGlmIChzYXZlZFB1YmxpYykge1xuICAgICAgICAgICAgdmFsdWVTYXZlZCA9IERPQ1VNRU5UX05PREUuZ2V0UGx1Z2luRGF0YShrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFsdWVTYXZlZCA9IHlpZWxkIGZpZ21hLmNsaWVudFN0b3JhZ2UuZ2V0QXN5bmMoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZhbHVlU2F2ZWQgJiYgdmFsdWVTYXZlZCAhPSBmYWxzZSlcbiAgICAgICAgICAgIHZhbHVlU2F2ZWQgPSBcIlwiO1xuICAgICAgICByZXR1cm4gdmFsdWVTYXZlZDtcbiAgICB9KTtcbn1cbi8qKlxuICogR2V0IHN1YnNldCBvZiB0aWNrZXRzIGluIGRvY3VtZW50IGFuZCBzdGFydCB1cGRhdGUgcHJvY2Vzc1xuICogQHBhcmFtIHN1YnNldCBBIHN1YnNldCBvZiB0aWNrZXQgaW5zdGFuY2VzIGluIHRoZSBkb2N1bWVudFxuICogQHJldHVybnMgQm9vbGVhbiBpZiB0aGUgc3Vic2V0IGNvdWxkIGJlIHVwZGF0ZWRcbiAqL1xuZnVuY3Rpb24gcmVxdWVzdFVwZGF0ZUZvclRpY2tldHMoc3Vic2V0KSB7XG4gICAgbGV0IG5vZGVzO1xuICAgIGxldCBpc0ZhaWxlZCA9IGZhbHNlO1xuICAgIC8vIEFsbCBpbiBkb2N1bWVudFxuICAgIGlmIChzdWJzZXQgPT0gXCJhbGxcIikge1xuICAgICAgICBub2RlcyA9IERPQ1VNRU5UX05PREUuZmluZEFsbFdpdGhDcml0ZXJpYSh7XG4gICAgICAgICAgICB0eXBlczogWydJTlNUQU5DRSddXG4gICAgICAgIH0pO1xuICAgICAgICBub2RlcyA9IG5vZGVzLmZpbHRlcihub2RlID0+IG5vZGUubmFtZSA9PT0gQ09NUE9ORU5UX1NFVF9OQU1FKTtcbiAgICAgICAgaWYgKG5vZGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICBmaWdtYS5ub3RpZnkoYE5vIGluc3RhbmNlcyBuYW1lZCAnJHtDT01QT05FTlRfU0VUX05BTUV9JyBmb3VuZCBpbiBkb2N1bWVudC5gKTtcbiAgICAgICAgICAgIGlzRmFpbGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGdldERhdGFGb3JUaWNrZXRzKG5vZGVzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBBbGwgb24gcGFnZVxuICAgIGVsc2UgaWYgKHN1YnNldCA9PSBcInBhZ2VcIikge1xuICAgICAgICBub2RlcyA9IGZpZ21hLmN1cnJlbnRQYWdlLmZpbmRBbGxXaXRoQ3JpdGVyaWEoe1xuICAgICAgICAgICAgdHlwZXM6IFsnSU5TVEFOQ0UnXVxuICAgICAgICB9KTtcbiAgICAgICAgbm9kZXMgPSBub2Rlcy5maWx0ZXIobm9kZSA9PiBub2RlLm5hbWUgPT09IENPTVBPTkVOVF9TRVRfTkFNRSk7XG4gICAgICAgIGlmIChub2Rlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgZmlnbWEubm90aWZ5KGBObyBpbnN0YW5jZXMgbmFtZWQgJyR7Q09NUE9ORU5UX1NFVF9OQU1FfScgZm91bmQgb24gcGFnZS5gKTtcbiAgICAgICAgICAgIGlzRmFpbGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGdldERhdGFGb3JUaWNrZXRzKG5vZGVzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBTZWxlY3RlZCBlbGVtZW50c1xuICAgIGVsc2UgaWYgKHN1YnNldCA9PSBcInNlbGVjdGlvblwiKSB7XG4gICAgICAgIG5vZGVzID0gZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uO1xuICAgICAgICBpZiAobm9kZXMubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIGZpZ21hLm5vdGlmeShgTm90aGluZyBzZWxlY3RlZC5gKTtcbiAgICAgICAgICAgIGlzRmFpbGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGdldERhdGFGb3JUaWNrZXRzKG5vZGVzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaXNGYWlsZWQ7XG59XG4vKipcbiAqIFNlbmRzIGEgcmVxdWVzdCB0byB0aGUgVUkgdG8gZmV0Y2ggZGF0YSBmb3IgYW4gYXJyYXkgb2YgdGlja2V0c1xuICogQHBhcmFtIGluc3RhbmNlc1xuICovXG5mdW5jdGlvbiBnZXREYXRhRm9yVGlja2V0cyhpbnN0YW5jZXMpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICB2YXIgbm9kZUlkcyA9IFtdO1xuICAgICAgICB2YXIgaXNzdWVJZHMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnN0YW5jZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBpbnN0YW5jZXNbaV07XG4gICAgICAgICAgICBpZiAobm9kZS50eXBlICE9PSBcIklOU1RBTkNFXCIpIHtcbiAgICAgICAgICAgICAgICBmaWdtYS5ub3RpZnkoXCJUaGUgZWxlbWVudCBuZWVkcyB0byBiZSBhbiBpbnN0YW5jZSBvZiBcIiArIENPTVBPTkVOVF9TRVRfTkFNRSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgaXNzdWVJZE5vZGUgPSBub2RlLmZpbmRPbmUobiA9PiBuLnR5cGUgPT09IFwiVEVYVFwiICYmIG4ubmFtZSA9PT0gSVNTVUVfSURfTkFNRSk7XG4gICAgICAgICAgICAgICAgaWYgKCFpc3N1ZUlkTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBmaWdtYS5ub3RpZnkoYEF0IGxlYXN0IG9uZSBpbnN0YW5jZSBpcyBtaXNzaW5nIHRoZSB0ZXh0IGVsZW1lbnQgJyR7SVNTVUVfSURfTkFNRX0nLiBDb3VsZCBub3QgdXBkYXRlLmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXNzdWVJZHMucHVzaChpc3N1ZUlkTm9kZS5jaGFyYWN0ZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZUlkcy5wdXNoKG5vZGUuaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7IG5vZGVJZHM6IG5vZGVJZHMsIGlzc3VlSWRzOiBpc3N1ZUlkcywgdHlwZTogJ2dldFRpY2tldERhdGEnIH0pO1xuICAgIH0pO1xufVxuLyoqXG4gKiBVcGRhdGVzIGEgc2V0IG9mIHRpY2tldHMgYmFzZWQgb24gdGhlaXIgc3RhdHVzLlxuICogSXMgY2FsbGVkIGFmdGVyIHRoZSBkYXRhIGlzIGZldGNoZWQuXG4gKiBAcGFyYW0gdGlja2V0SW5zdGFuY2VzIEEgc2V0IG9mIHRpY2tldCBpbnN0YW5jZXNcbiAqIEBwYXJhbSBtc2cgQSBtZXNzYWdlIHNlbnQgZnJvbSB0aGUgVUlcbiAqIEBwYXJhbSBpc0NyZWF0ZU5ldyBXZXRoZXIgdGhlIGZ1bmN0aW9uIGNhbGwgaXMgY29taW5nIGZyb20gYW4gYWN0dWFsIHRpY2tldCB1cGRhdGUgb3IgZnJvbSBjcmVhdGluZyBhIG5ldyB0aWNrZXRcbiAqIEByZXR1cm5zIFVwZGF0ZWQgdGlja2V0IGluc3RhbmNlc1xuICovXG5mdW5jdGlvbiB1cGRhdGVUaWNrZXRzKHRpY2tldEluc3RhbmNlcywgbXNnLCBpc0NyZWF0ZU5ldyA9IGZhbHNlKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgdmFyIHRpY2tldERhdGFBcnJheSA9IG1zZy5kYXRhO1xuICAgICAgICB2YXIgaXNzdWVJZHMgPSBtc2cuaXNzdWVJZHM7XG4gICAgICAgIHZhciBudW1iZXJPZk5vZGVzID0gdGlja2V0SW5zdGFuY2VzLmxlbmd0aDtcbiAgICAgICAgdmFyIGludmFsaWRJZHMgPSBbXTtcbiAgICAgICAgdmFyIG51bWJlck9mTWlzc2luZ1RpdGxlcyA9IDA7XG4gICAgICAgIHZhciBudW1iZXJPZk1pc3NpbmdEYXRlcyA9IDA7XG4gICAgICAgIHZhciBudW1iZXJPZk1pc3NpbmdBc3NpZ25lZXMgPSAwO1xuICAgICAgICB2YXIgbWlzc2luZ1ZhcmlhbnRzID0gW107XG4gICAgICAgIC8vIEdvIHRocm91Z2ggYWxsIG5vZGVzIGFuZCB1cGRhdGUgdGhlaXIgY29udGVudFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlck9mTm9kZXM7IGkrKykge1xuICAgICAgICAgICAgbGV0IHRpY2tldEluc3RhbmNlID0gdGlja2V0SW5zdGFuY2VzW2ldO1xuICAgICAgICAgICAgbGV0IHRpY2tldERhdGEgPSBjaGVja1RpY2tldERhdGFSZXBvbnNlKHRpY2tldERhdGFBcnJheVtpXSwgaXNzdWVJZHNbaV0pO1xuICAgICAgICAgICAgbGV0IHRpY2tldFN0YXR1cyA9IGdldFN0YXR1cyh0aWNrZXREYXRhKTtcbiAgICAgICAgICAgIGlmICh0aWNrZXRTdGF0dXMgPT09ICdFcnJvcicpXG4gICAgICAgICAgICAgICAgaW52YWxpZElkcy5wdXNoKGlzc3VlSWRzW2ldKTtcbiAgICAgICAgICAgIC8vIEdldCB0aGUgdmFyaWFudCBiYXNlZCBvbiB0aGUgdGlja2V0IHN0YXR1cyBhbmQgc3dhcCBpdCB3aXRoIHRoZSBjdXJyZW50XG4gICAgICAgICAgICBsZXQgbmV3VmFyaWFudCA9IHRpY2tldENvbXBvbmVudC5maW5kQ2hpbGQobiA9PiBuLm5hbWUgPT09IENPTVBPTkVOVF9TRVRfUFJPUEVSVFlfTkFNRSArIHRpY2tldFN0YXR1cyk7XG4gICAgICAgICAgICBpZiAoIW5ld1ZhcmlhbnQpIHsgLy8gSWYgdGhlIHN0YXR1cyBkb2Vzbid0IG1hdGNoIGFueSBvZiB0aGUgdmFyaWFudHMsIHVzZSBkZWZhdWx0XG4gICAgICAgICAgICAgICAgbmV3VmFyaWFudCA9IHRpY2tldENvbXBvbmVudC5kZWZhdWx0VmFyaWFudDtcbiAgICAgICAgICAgICAgICBtaXNzaW5nVmFyaWFudHMucHVzaCh0aWNrZXRTdGF0dXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVXBkYXRlIHRpdGxlXG4gICAgICAgICAgICBsZXQgdGl0bGVUeHQgPSB0aWNrZXRJbnN0YW5jZS5maW5kT25lKG4gPT4gbi50eXBlID09PSBcIlRFWFRcIiAmJiBuLm5hbWUgPT09IElTU1VFX1RJVExFX05BTUUpO1xuICAgICAgICAgICAgaWYgKHRpdGxlVHh0KSB7XG4gICAgICAgICAgICAgICAgeWllbGQgZmlnbWEubG9hZEZvbnRBc3luYyh0aXRsZVR4dC5mb250TmFtZSk7XG4gICAgICAgICAgICAgICAgdGl0bGVUeHQuY2hhcmFjdGVycyA9IGdldFRpdGxlKHRpY2tldERhdGEpO1xuICAgICAgICAgICAgICAgIHRpdGxlVHh0Lmh5cGVybGluayA9IHsgdHlwZTogXCJVUkxcIiwgdmFsdWU6IGBodHRwczovLyR7Y29tcGFueV9uYW1lfS5hdGxhc3NpYW4ubmV0L2Jyb3dzZS8ke3RpY2tldERhdGEua2V5fWAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG51bWJlck9mTWlzc2luZ1RpdGxlcyArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVXBkYXRlIGRhdGVcbiAgICAgICAgICAgIGxldCBjaGFuZ2VEYXRlVHh0ID0gdGlja2V0SW5zdGFuY2UuZmluZE9uZShuID0+IG4udHlwZSA9PT0gXCJURVhUXCIgJiYgbi5uYW1lID09PSBJU1NVRV9DSEFOR0VfREFURV9OQU1FKTtcbiAgICAgICAgICAgIGlmIChjaGFuZ2VEYXRlVHh0KSB7XG4gICAgICAgICAgICAgICAgeWllbGQgZmlnbWEubG9hZEZvbnRBc3luYyhjaGFuZ2VEYXRlVHh0LmZvbnROYW1lKTtcbiAgICAgICAgICAgICAgICAvLyBGaWx0ZXJzIG91dCB0aGUgZGF0YSB0byBhIHNpbXBsZXQgZm9ybWF0IChNbW0gREQgWVlZWSlcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKGdldENoYW5nZURhdGUodGlja2V0RGF0YSkucmVwbGFjZSgvW1RdKy4qLywgXCJcIikpO1xuICAgICAgICAgICAgICAgIGNoYW5nZURhdGVUeHQuY2hhcmFjdGVycyA9IGRhdGUudG9EYXRlU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgLy8gY2hhbmdlRGF0ZVR4dC5jaGFyYWN0ZXJzID0gZGF0ZS50b0RhdGVTdHJpbmcoKS5yZXBsYWNlKC9eKFtBLVphLXpdKikuLyxcIlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG51bWJlck9mTWlzc2luZ0RhdGVzICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBVcGRhdGUgYXNzaWduZWVcbiAgICAgICAgICAgIGxldCBhc3NpZ25lZVR4dCA9IHRpY2tldEluc3RhbmNlLmZpbmRPbmUobiA9PiBuLnR5cGUgPT09IFwiVEVYVFwiICYmIG4ubmFtZSA9PT0gQVNTSUdORUVfTkFNRSk7XG4gICAgICAgICAgICBpZiAoYXNzaWduZWVUeHQpIHtcbiAgICAgICAgICAgICAgICB5aWVsZCBmaWdtYS5sb2FkRm9udEFzeW5jKGFzc2lnbmVlVHh0LmZvbnROYW1lKTtcbiAgICAgICAgICAgICAgICBpZiAodGlja2V0RGF0YS5maWVsZHMuYXNzaWduZWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFzc2lnbmVlID0gZ2V0QXNzaWduZWUodGlja2V0RGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGFzc2lnbmVlVHh0LmNoYXJhY3RlcnMgPSBhc3NpZ25lZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGFzc2lnbmVlVHh0LmNoYXJhY3RlcnMgPSBcIk5vdCBhc3NpZ25lZFwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG51bWJlck9mTWlzc2luZ0Fzc2lnbmVlcyArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQWRkIHRoZSByZWxhdW5jaCBidXR0b25cbiAgICAgICAgICAgIHRpY2tldEluc3RhbmNlLnN3YXBDb21wb25lbnQobmV3VmFyaWFudCk7XG4gICAgICAgICAgICB0aWNrZXRJbnN0YW5jZS5zZXRSZWxhdW5jaERhdGEoeyB1cGRhdGVfc2VsZWN0aW9uOiAnJyB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBOb3RpZnkgYWJvdXQgZXJyb3JzIChtaXNzaW5nIHRleHQgZmllbGRzKVxuICAgICAgICBpZiAobWlzc2luZ1ZhcmlhbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIG1pc3NpbmdWYXJpYW50cyA9IFsuLi5uZXcgU2V0KG1pc3NpbmdWYXJpYW50cyldO1xuICAgICAgICAgICAgbGV0IHZhcmlhbnRTdHJpbmcgPSBtaXNzaW5nVmFyaWFudHMuam9pbihcIicsICdcIik7XG4gICAgICAgICAgICBmaWdtYS5ub3RpZnkoYFN0YXR1cyAnJHt2YXJpYW50U3RyaW5nfScgbm90IGV4aXN0aW5nLiBZb3UgY2FuIGFkZCBpdCBhcyBuZXcgdmFyaWFudCB0byB0aGUgbWFpbiBjb21wb25lbnQuYCwgeyB0aW1lb3V0OiA2MDAwIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChudW1iZXJPZk1pc3NpbmdUaXRsZXMgPiAwKVxuICAgICAgICAgICAgZmlnbWEubm90aWZ5KGAke251bWJlck9mTWlzc2luZ1RpdGxlc30gdGlja2V0cyBhcmUgbWlzc2luZyB0ZXh0IGVsZW1lbnQgJyR7SVNTVUVfVElUTEVfTkFNRX0nLmApO1xuICAgICAgICBpZiAobnVtYmVyT2ZNaXNzaW5nRGF0ZXMgPiAwKVxuICAgICAgICAgICAgZmlnbWEubm90aWZ5KGAke251bWJlck9mTWlzc2luZ0RhdGVzfSB0aWNrZXRzIGFyZSBtaXNzaW5nIHRleHQgZWxlbWVudCAnJHtJU1NVRV9DSEFOR0VfREFURV9OQU1FfScuYCk7XG4gICAgICAgIGlmIChudW1iZXJPZk1pc3NpbmdBc3NpZ25lZXMgPiAwKVxuICAgICAgICAgICAgZmlnbWEubm90aWZ5KGAke251bWJlck9mTWlzc2luZ0Fzc2lnbmVlc30gdGlja2V0cyBhcmUgbWlzc2luZyB0ZXh0IGVsZW1lbnQgJyR7QVNTSUdORUVfTkFNRX0nLmApO1xuICAgICAgICAvLyBTdWNjZXNzIG1lc3NhZ2VcbiAgICAgICAgdmFyIG1lc3NhZ2U7XG4gICAgICAgIHZhciBudW1iZXJPZkludmFsaWRJZHMgPSBpbnZhbGlkSWRzLmxlbmd0aDtcbiAgICAgICAgaWYgKG51bWJlck9mSW52YWxpZElkcyA9PSBudW1iZXJPZk5vZGVzKSB7XG4gICAgICAgICAgICAvLyBBbGwgaW52YWxpZFxuICAgICAgICAgICAgbWVzc2FnZSA9IChudW1iZXJPZk5vZGVzID09IDEpID8gXCJJbnZhbGlkIElELlwiIDogYCR7bnVtYmVyT2ZJbnZhbGlkSWRzfSBvZiAke251bWJlck9mTm9kZXN9IElEcyBhcmUgaW52YWxpZCBvciBkbyBub3QgZXhpc3QuYDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChudW1iZXJPZkludmFsaWRJZHMgPT0gMCkge1xuICAgICAgICAgICAgLy8gQWxsIHZhbGlkXG4gICAgICAgICAgICBtZXNzYWdlID0gKG51bWJlck9mTm9kZXMgPT0gMSkgPyBcIlVwZGF0ZWQuXCIgOiBgJHtudW1iZXJPZk5vZGVzfSBvZiAke251bWJlck9mTm9kZXN9IGhlYWRlcihzKSB1cGRhdGVkIWA7XG4gICAgICAgICAgICBpZiAoaXNDcmVhdGVOZXcpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBTb21lIHZhbGlkXG4gICAgICAgICAgICBsZXQgZmlyc3RTZW50ZW5jZSA9IGAke251bWJlck9mTm9kZXMgLSBudW1iZXJPZkludmFsaWRJZHN9IG9mICR7bnVtYmVyT2ZOb2Rlc30gc3VjY2Vzc2Z1bGx5IHVwZGF0ZWQuIGA7XG4gICAgICAgICAgICBsZXQgc2Vjb25kU2VudGVuY2UgPSAobnVtYmVyT2ZJbnZhbGlkSWRzID09IDEpID8gXCIxIElEIGlzIGludmFsaWQgb3IgZG9lcyBub3QgZXhpc3QuXCIgOiBgJHtudW1iZXJPZkludmFsaWRJZHN9IElEcyBhcmUgaW52YWxpZCBvciBkbyBub3QgZXhpc3QuYDtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBmaXJzdFNlbnRlbmNlICsgc2Vjb25kU2VudGVuY2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgY2FsbGVkIHZpYSB0aGUgcmVsYXVuY2ggYnV0dG9uLCBjbG9zZSBwbHVnaW4gYWZ0ZXIgdXBkYXRpbmcgdGhlIHRpY2tldHNcbiAgICAgICAgaWYgKGZpZ21hLmNvbW1hbmQgPT09ICd1cGRhdGVfcGFnZScgfHwgZmlnbWEuY29tbWFuZCA9PT0gJ3VwZGF0ZV9hbGwnIHx8IGZpZ21hLmNvbW1hbmQgPT09ICd1cGRhdGVfc2VsZWN0aW9uJykge1xuICAgICAgICAgICAgZmlnbWEuY2xvc2VQbHVnaW4obWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmaWdtYS5ub3RpZnkobWVzc2FnZSwgeyB0aW1lb3V0OiAyMDAwIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aWNrZXRJbnN0YW5jZXM7XG4gICAgfSk7XG59XG4vKipcbiAqIENyZWF0ZSBpbnN0YW5jZXMgb2YgdGhlIG1haW4gdGlja2V0IGNvbXBvbmVudCBhbmQgcmVwbGFjZXMgdGhlIGNvbnRlbnQgd2l0aCBkYXRhIG9mIHRoZSBhY3R1YWwgSmlyYSB0aWNrZXRcbiAqIEBwYXJhbSBtc2cgSlNPTiB3aXRoIGluZm8gc2VudCBmcm9tIFVJXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVRpY2tldEluc3RhbmNlKG1zZykge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIC8vIENyZWF0ZSBhbiBpbnN0YW5jZSBhbmQgdXBkYXRlIGl0IHRvIHRoZSBjb3JyZWN0IHN0YXR1c1xuICAgICAgICBsZXQgdGlja2V0VmFyaWFudCA9IHRpY2tldENvbXBvbmVudC5kZWZhdWx0VmFyaWFudDtcbiAgICAgICAgbGV0IHRpY2tldEluc3RhbmNlID0gdGlja2V0VmFyaWFudC5jcmVhdGVJbnN0YW5jZSgpO1xuICAgICAgICB0aWNrZXRJbnN0YW5jZS54ID0gKGZpZ21hLnZpZXdwb3J0LmNlbnRlci54IC0gdGlja2V0SW5zdGFuY2Uud2lkdGggLyAyKSArIG5leHRUaWNrZXRPZmZzZXQ7XG4gICAgICAgIHRpY2tldEluc3RhbmNlLnkgPSAoZmlnbWEudmlld3BvcnQuY2VudGVyLnkgLSB0aWNrZXRJbnN0YW5jZS5oZWlnaHQgLyAyKSArIG5leHRUaWNrZXRPZmZzZXQ7XG4gICAgICAgIG5leHRUaWNrZXRPZmZzZXQgPSAobmV4dFRpY2tldE9mZnNldCArIDEwKSAlIDcwO1xuICAgICAgICBmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb24gPSBbdGlja2V0SW5zdGFuY2VdO1xuICAgICAgICBsZXQgdGlja2V0RGF0YSA9IGNoZWNrVGlja2V0RGF0YVJlcG9uc2UobXNnLmRhdGFbMF0sIG1zZy5pc3N1ZUlkc1swXSk7XG4gICAgICAgIGxldCB0aWNrZXRJbnN0YW5jZXMgPSB5aWVsZCB1cGRhdGVUaWNrZXRzKFt0aWNrZXRJbnN0YW5jZV0sIG1zZywgdHJ1ZSk7XG4gICAgICAgIHRpY2tldEluc3RhbmNlID0gdGlja2V0SW5zdGFuY2VzWzBdO1xuICAgICAgICAvLyBBZGQgSURcbiAgICAgICAgbGV0IGlzc3VlSURUeHQgPSB0aWNrZXRJbnN0YW5jZS5maW5kT25lKG4gPT4gbi50eXBlID09PSBcIlRFWFRcIiAmJiBuLm5hbWUgPT09IElTU1VFX0lEX05BTUUpO1xuICAgICAgICBpZiAoaXNzdWVJRFR4dCkge1xuICAgICAgICAgICAgeWllbGQgZmlnbWEubG9hZEZvbnRBc3luYyhpc3N1ZUlEVHh0LmZvbnROYW1lKTtcbiAgICAgICAgICAgIGlzc3VlSURUeHQuY2hhcmFjdGVycyA9IGdldElzc3VlSWQodGlja2V0RGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmaWdtYS5ub3RpZnkoXCJDb3VsZCBub3QgZmluZCB0ZXh0IGVsZW1lbnQgbmFtZWQgJ1wiICsgSVNTVUVfSURfTkFNRSArIFwiJy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRpY2tldEluc3RhbmNlO1xuICAgIH0pO1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGNvbXBvbmVudCB0aGF0IHJlcHJlc2VudHMgYSB0aWNrZXQgc3RhdHVzXG4gKiBAcGFyYW0gc3RhdHVzQ29sb3IgUkdCIHZhbHVlIGZvciBzdGF0dXMgY29sb3JcbiAqIEBwYXJhbSBzdGF0dXNOYW1lIE5hbWUgb2Ygc3RhdHVzXG4gKiBAcmV0dXJucyBBIGNvbXBvbmVudCB0aGF0IHJlcHJlc2VudCBhIHRpY2tldFxuICovXG5mdW5jdGlvbiBjcmVhdGVUaWNrZXRWYXJpYW50KHN0YXR1c0NvbG9yLCBzdGF0dXNOYW1lKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBtYWluIGZyYW1lXG4gICAgICAgIHZhciB0aWNrZXRWYXJpYW50ID0gZmlnbWEuY3JlYXRlQ29tcG9uZW50KCk7XG4gICAgICAgIGxldCBwYWRkaW5nID0gMjQ7XG4gICAgICAgIHRpY2tldFZhcmlhbnQubmFtZSA9IHN0YXR1c05hbWU7XG4gICAgICAgIHRpY2tldFZhcmlhbnQubGF5b3V0TW9kZSA9IFwiVkVSVElDQUxcIjtcbiAgICAgICAgdGlja2V0VmFyaWFudC5yZXNpemUoNjAwLCAyMDApO1xuICAgICAgICB0aWNrZXRWYXJpYW50LmNvdW50ZXJBeGlzU2l6aW5nTW9kZSA9IFwiRklYRURcIjtcbiAgICAgICAgdGlja2V0VmFyaWFudC5wcmltYXJ5QXhpc1NpemluZ01vZGUgPSBcIkFVVE9cIjtcbiAgICAgICAgdGlja2V0VmFyaWFudC5wYWRkaW5nVG9wID0gcGFkZGluZztcbiAgICAgICAgdGlja2V0VmFyaWFudC5wYWRkaW5nUmlnaHQgPSBwYWRkaW5nO1xuICAgICAgICB0aWNrZXRWYXJpYW50LnBhZGRpbmdCb3R0b20gPSBwYWRkaW5nO1xuICAgICAgICB0aWNrZXRWYXJpYW50LnBhZGRpbmdMZWZ0ID0gcGFkZGluZztcbiAgICAgICAgdGlja2V0VmFyaWFudC5pdGVtU3BhY2luZyA9IDE2O1xuICAgICAgICB0aWNrZXRWYXJpYW50LmNvcm5lclJhZGl1cyA9IDQ7XG4gICAgICAgIHRpY2tldFZhcmlhbnQuZmlsbHMgPSBbeyB0eXBlOiAnU09MSUQnLCBjb2xvcjogc3RhdHVzQ29sb3IgfV07XG4gICAgICAgIC8vIENyZWF0ZSB0aGUgaGVhZGVyIGZyYW1lXG4gICAgICAgIHZhciBoZWFkZXJGcmFtZSA9IGZpZ21hLmNyZWF0ZUZyYW1lKCk7XG4gICAgICAgIGhlYWRlckZyYW1lLm5hbWUgPSBcIkhlYWRlclwiO1xuICAgICAgICBoZWFkZXJGcmFtZS5sYXlvdXRNb2RlID0gXCJIT1JJWk9OVEFMXCI7XG4gICAgICAgIGhlYWRlckZyYW1lLmNvdW50ZXJBeGlzU2l6aW5nTW9kZSA9IFwiQVVUT1wiO1xuICAgICAgICBoZWFkZXJGcmFtZS5sYXlvdXRBbGlnbiA9IFwiU1RSRVRDSFwiO1xuICAgICAgICBoZWFkZXJGcmFtZS5pdGVtU3BhY2luZyA9IDQwO1xuICAgICAgICBoZWFkZXJGcmFtZS5maWxscyA9IFtdO1xuICAgICAgICAvLyBDcmVhdGUgdGhlIGhlYWRlciBmcmFtZVxuICAgICAgICB2YXIgZGV0YWlsc0ZyYW1lID0gZmlnbWEuY3JlYXRlRnJhbWUoKTtcbiAgICAgICAgZGV0YWlsc0ZyYW1lLm5hbWUgPSBcIkhlYWRlclwiO1xuICAgICAgICBkZXRhaWxzRnJhbWUubGF5b3V0TW9kZSA9IFwiSE9SSVpPTlRBTFwiO1xuICAgICAgICBkZXRhaWxzRnJhbWUuY291bnRlckF4aXNTaXppbmdNb2RlID0gXCJBVVRPXCI7XG4gICAgICAgIGRldGFpbHNGcmFtZS5sYXlvdXRBbGlnbiA9IFwiU1RSRVRDSFwiO1xuICAgICAgICBkZXRhaWxzRnJhbWUuaXRlbVNwYWNpbmcgPSAzMjtcbiAgICAgICAgZGV0YWlsc0ZyYW1lLmZpbGxzID0gW107XG4gICAgICAgIGxvYWRGb250cygpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gQWRkIHRoZSB0aWNrZXQgdGV4dCBmaWVsZHNcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlVHh0ID0gZmlnbWEuY3JlYXRlVGV4dCgpO1xuICAgICAgICAgICAgdGl0bGVUeHQuZm9udE5hbWUgPSBGT05UX1JFRztcbiAgICAgICAgICAgIHRpdGxlVHh0LmZvbnRTaXplID0gMzI7XG4gICAgICAgICAgICB0aXRsZVR4dC50ZXh0RGVjb3JhdGlvbiA9IFwiVU5ERVJMSU5FXCI7XG4gICAgICAgICAgICB0aXRsZVR4dC5hdXRvUmVuYW1lID0gZmFsc2U7XG4gICAgICAgICAgICB0aXRsZVR4dC5jaGFyYWN0ZXJzID0gXCJUaWNrZXQgdGl0bGVcIjtcbiAgICAgICAgICAgIHRpdGxlVHh0Lm5hbWUgPSBJU1NVRV9USVRMRV9OQU1FO1xuICAgICAgICAgICAgY29uc3QgaXNzdWVJZFR4dCA9IGZpZ21hLmNyZWF0ZVRleHQoKTtcbiAgICAgICAgICAgIGlzc3VlSWRUeHQuZm9udE5hbWUgPSBGT05UX01FRDtcbiAgICAgICAgICAgIGlzc3VlSWRUeHQuZm9udFNpemUgPSAzMjtcbiAgICAgICAgICAgIGlzc3VlSWRUeHQuYXV0b1JlbmFtZSA9IGZhbHNlO1xuICAgICAgICAgICAgaXNzdWVJZFR4dC5jaGFyYWN0ZXJzID0gXCJJRC0xXCI7XG4gICAgICAgICAgICBpc3N1ZUlkVHh0Lm5hbWUgPSBJU1NVRV9JRF9OQU1FO1xuICAgICAgICAgICAgY29uc3QgY2hhbmdlRGF0ZVR4dCA9IGZpZ21hLmNyZWF0ZVRleHQoKTtcbiAgICAgICAgICAgIGNoYW5nZURhdGVUeHQuZm9udE5hbWUgPSBGT05UX1JFRztcbiAgICAgICAgICAgIGNoYW5nZURhdGVUeHQuZm9udFNpemUgPSAyNDtcbiAgICAgICAgICAgIGNoYW5nZURhdGVUeHQuYXV0b1JlbmFtZSA9IGZhbHNlO1xuICAgICAgICAgICAgY2hhbmdlRGF0ZVR4dC5jaGFyYWN0ZXJzID0gXCJNTSBERCBZWVlZXCI7XG4gICAgICAgICAgICBjaGFuZ2VEYXRlVHh0Lm5hbWUgPSBJU1NVRV9DSEFOR0VfREFURV9OQU1FO1xuICAgICAgICAgICAgY29uc3QgYXNzaWduZWVUeHQgPSBmaWdtYS5jcmVhdGVUZXh0KCk7XG4gICAgICAgICAgICBhc3NpZ25lZVR4dC5mb250TmFtZSA9IEZPTlRfUkVHO1xuICAgICAgICAgICAgYXNzaWduZWVUeHQuZm9udFNpemUgPSAyNDtcbiAgICAgICAgICAgIGFzc2lnbmVlVHh0LmF1dG9SZW5hbWUgPSBmYWxzZTtcbiAgICAgICAgICAgIGFzc2lnbmVlVHh0LmNoYXJhY3RlcnMgPSBcIk5hbWUgb2YgYXNzaWduZWVcIjtcbiAgICAgICAgICAgIGFzc2lnbmVlVHh0Lm5hbWUgPSBBU1NJR05FRV9OQU1FO1xuICAgICAgICAgICAgdGlja2V0VmFyaWFudC5hcHBlbmRDaGlsZChoZWFkZXJGcmFtZSk7XG4gICAgICAgICAgICB0aWNrZXRWYXJpYW50LmFwcGVuZENoaWxkKGRldGFpbHNGcmFtZSk7XG4gICAgICAgICAgICBoZWFkZXJGcmFtZS5hcHBlbmRDaGlsZChpc3N1ZUlkVHh0KTtcbiAgICAgICAgICAgIGhlYWRlckZyYW1lLmFwcGVuZENoaWxkKHRpdGxlVHh0KTtcbiAgICAgICAgICAgIGRldGFpbHNGcmFtZS5hcHBlbmRDaGlsZChhc3NpZ25lZVR4dCk7XG4gICAgICAgICAgICBkZXRhaWxzRnJhbWUuYXBwZW5kQ2hpbGQoY2hhbmdlRGF0ZVR4dCk7XG4gICAgICAgICAgICB0aXRsZVR4dC5sYXlvdXRHcm93ID0gMTtcbiAgICAgICAgICAgIGFzc2lnbmVlVHh0LmxheW91dEdyb3cgPSAxO1xuICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICBmaWdtYS5ub3RpZnkoXCJGb250ICdcIiArIEZPTlRfUkVHLmZhbWlseSArIFwiJyBjb3VsZCBub3QgYmUgbG9hZGVkLiBQbGVhc2UgaW5zdGFsbCB0aGUgZm9udC5cIik7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBGaXhlcyBhIHdlaXJkIGJ1ZyBpbiB3aGljaCB0aGUgJ3N0cmV0Y2gnIGRvZXNudCB3b3JrIHByb3Blcmx5XG4gICAgICAgIGhlYWRlckZyYW1lLnByaW1hcnlBeGlzU2l6aW5nTW9kZSA9IFwiRklYRURcIjtcbiAgICAgICAgaGVhZGVyRnJhbWUubGF5b3V0QWxpZ24gPSBcIlNUUkVUQ0hcIjtcbiAgICAgICAgZGV0YWlsc0ZyYW1lLnByaW1hcnlBeGlzU2l6aW5nTW9kZSA9IFwiRklYRURcIjtcbiAgICAgICAgZGV0YWlsc0ZyYW1lLmxheW91dEFsaWduID0gXCJTVFJFVENIXCI7XG4gICAgICAgIHJldHVybiB0aWNrZXRWYXJpYW50O1xuICAgIH0pO1xufVxuLyoqXG4gKiBDcmVhdGVzIHRoZSBtYWluIGNvbXBvbmVudCBmb3IgdGhlIHRpY2tldHNcbiAqIEByZXR1cm5zIFRoZSBtYWluIGNvbXBvbmVudFxuICovXG5mdW5jdGlvbiBjcmVhdGVUaWNrZXRDb21wb25lbnRTZXQoKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgbGV0IHRpY2tldENvbXBvbmVudDtcbiAgICAgICAgLy8gQ3JlYXRlIHZhcmlhbnRzIChvbmUgZm9yIGVhY2ggc3RhdHVzKVxuICAgICAgICBsZXQgdmFyRGVmYXVsdCA9IHlpZWxkIGNyZWF0ZVRpY2tldFZhcmlhbnQoVkFSSUFOVF9DT0xPUl9ERUZBVUxULCBDT01QT05FTlRfU0VUX1BST1BFUlRZX05BTUUgKyBWQVJJQU5UX05BTUVfREVGQVVMVCk7XG4gICAgICAgIGxldCB2YXIxID0geWllbGQgY3JlYXRlVGlja2V0VmFyaWFudChWQVJJQU5UX0NPTE9SXzEsIENPTVBPTkVOVF9TRVRfUFJPUEVSVFlfTkFNRSArIFZBUklBTlRfTkFNRV8xKTtcbiAgICAgICAgbGV0IHZhcjIgPSB5aWVsZCBjcmVhdGVUaWNrZXRWYXJpYW50KFZBUklBTlRfQ09MT1JfMiwgQ09NUE9ORU5UX1NFVF9QUk9QRVJUWV9OQU1FICsgVkFSSUFOVF9OQU1FXzIpO1xuICAgICAgICBsZXQgdmFyMyA9IHlpZWxkIGNyZWF0ZVRpY2tldFZhcmlhbnQoVkFSSUFOVF9DT0xPUl8zLCBDT01QT05FTlRfU0VUX1BST1BFUlRZX05BTUUgKyBWQVJJQU5UX05BTUVfMyk7XG4gICAgICAgIGxldCB2YXI0ID0geWllbGQgY3JlYXRlVGlja2V0VmFyaWFudChWQVJJQU5UX0NPTE9SXzQsIENPTVBPTkVOVF9TRVRfUFJPUEVSVFlfTkFNRSArIFZBUklBTlRfTkFNRV80KTtcbiAgICAgICAgbGV0IHZhcjUgPSB5aWVsZCBjcmVhdGVUaWNrZXRWYXJpYW50KFZBUklBTlRfQ09MT1JfRE9ORSwgQ09NUE9ORU5UX1NFVF9QUk9QRVJUWV9OQU1FICsgVkFSSUFOVF9OQU1FX0RPTkUpO1xuICAgICAgICBsZXQgdmFyRXJyb3IgPSB5aWVsZCBjcmVhdGVUaWNrZXRWYXJpYW50KFZBUklBTlRfQ09MT1JfRVJST1IsIENPTVBPTkVOVF9TRVRfUFJPUEVSVFlfTkFNRSArIFZBUklBTlRfTkFNRV9FUlJPUik7XG4gICAgICAgIGNvbnN0IHZhcmlhbnRzID0gW3ZhckRlZmF1bHQsIHZhcjEsIHZhcjIsIHZhcjMsIHZhcjQsIHZhcjUsIHZhckVycm9yXTtcbiAgICAgICAgLy8gQ3JlYXRlIGEgY29tcG9uZW50IG91dCBvZiBhbGwgdGhlc2UgdmFyaWFudHNcbiAgICAgICAgdGlja2V0Q29tcG9uZW50ID0gZmlnbWEuY29tYmluZUFzVmFyaWFudHModmFyaWFudHMsIGZpZ21hLmN1cnJlbnRQYWdlKTtcbiAgICAgICAgbGV0IHBhZGRpbmcgPSAxNjtcbiAgICAgICAgdGlja2V0Q29tcG9uZW50Lm5hbWUgPSBDT01QT05FTlRfU0VUX05BTUU7XG4gICAgICAgIHRpY2tldENvbXBvbmVudC5sYXlvdXRNb2RlID0gXCJWRVJUSUNBTFwiO1xuICAgICAgICB0aWNrZXRDb21wb25lbnQuY291bnRlckF4aXNTaXppbmdNb2RlID0gXCJBVVRPXCI7XG4gICAgICAgIHRpY2tldENvbXBvbmVudC5wcmltYXJ5QXhpc1NpemluZ01vZGUgPSBcIkFVVE9cIjtcbiAgICAgICAgdGlja2V0Q29tcG9uZW50LnBhZGRpbmdUb3AgPSBwYWRkaW5nO1xuICAgICAgICB0aWNrZXRDb21wb25lbnQucGFkZGluZ1JpZ2h0ID0gcGFkZGluZztcbiAgICAgICAgdGlja2V0Q29tcG9uZW50LnBhZGRpbmdCb3R0b20gPSBwYWRkaW5nO1xuICAgICAgICB0aWNrZXRDb21wb25lbnQucGFkZGluZ0xlZnQgPSBwYWRkaW5nO1xuICAgICAgICB0aWNrZXRDb21wb25lbnQuaXRlbVNwYWNpbmcgPSAyNDtcbiAgICAgICAgdGlja2V0Q29tcG9uZW50LmNvcm5lclJhZGl1cyA9IDQ7XG4gICAgICAgIC8vIFNhdmUgY29tcG9uZW50IElEIGZvciBsYXRlciByZWZlcmVuY2VcbiAgICAgICAgRE9DVU1FTlRfTk9ERS5zZXRQbHVnaW5EYXRhKCd0aWNrZXRDb21wb25lbnRJRCcsIHRpY2tldENvbXBvbmVudC5pZCk7XG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgY29tcG9uZW50IGlzIHZpc2libGUgd2hlcmUgd2UncmUgY3VycmVudGx5IGxvb2tpbmdcbiAgICAgICAgdGlja2V0Q29tcG9uZW50LnggPSBmaWdtYS52aWV3cG9ydC5jZW50ZXIueCAtICh0aWNrZXRDb21wb25lbnQud2lkdGggLyAyKTtcbiAgICAgICAgdGlja2V0Q29tcG9uZW50LnkgPSBmaWdtYS52aWV3cG9ydC5jZW50ZXIueSAtICh0aWNrZXRDb21wb25lbnQuaGVpZ2h0IC8gMik7XG4gICAgICAgIHJldHVybiB0aWNrZXRDb21wb25lbnQ7XG4gICAgfSk7XG59XG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbWFpbiB0aWNrZXQgY29tcG9uZW50IG9yIGdldHMgdGhlIHJlZmVyZW5jZSB0byB0aGUgZXhpc3Rpbmcgb25lXG4gKi9cbmZ1bmN0aW9uIHJlZmVyZW5jZVRpY2tldENvbXBvbmVudFNldCgpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAvLyBDaGVjayBpZiB0aGUgdGlja2V0IGNvbXBvbmVudCBpcyBhbHJlYWR5IHNhdmVkIGluIHRoZSB2YXJpYWJsZVxuICAgICAgICBpZiAoIXRpY2tldENvbXBvbmVudCkge1xuICAgICAgICAgICAgLy8gSWYgbm8sIHRyeSB0aGUgZ2V0IHRoZSB0aWNrZXQgY29tcG9uZW50IGJ5IGl0cyBJRFxuICAgICAgICAgICAgdmFyIHRpY2tldENvbXBvbmVudElkID0gRE9DVU1FTlRfTk9ERS5nZXRQbHVnaW5EYXRhKCd0aWNrZXRDb21wb25lbnRJRCcpO1xuICAgICAgICAgICAgbGV0IG5vZGU7XG4gICAgICAgICAgICBpZiAodGlja2V0Q29tcG9uZW50SWQgJiYgKG5vZGUgPSBmaWdtYS5nZXROb2RlQnlJZCh0aWNrZXRDb21wb25lbnRJZCkpKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYW4gSUQgc2F2ZWQsIGFjY2VzcyB0aGUgdGlja2V0IGNvbXBvbmVudFxuICAgICAgICAgICAgICAgIHRpY2tldENvbXBvbmVudCA9IG5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBubyBJRCwgY3JlYXRlIGEgbmV3IGNvbXBvbmVudFxuICAgICAgICAgICAgICAgIHRpY2tldENvbXBvbmVudCA9IHlpZWxkIGNyZWF0ZVRpY2tldENvbXBvbmVudFNldCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG4vLyBDaGVja3MgaWYgZmV0Y2hpbmcgZGF0YSB3YXMgc3VjY2Vzc2Z1bCBhdCBhbGwgXG5mdW5jdGlvbiBjaGVja0ZldGNoU3VjY2VzcyhkYXRhKSB7XG4gICAgdmFyIGlzU3VjY2VzcyA9IGZhbHNlO1xuICAgIC8vIENhbiB0aGlzIGV2ZW4gaGFwcGVuP1xuICAgIGlmICghZGF0YSkge1xuICAgICAgICBmaWdtYS5ub3RpZnkoXCJTb21ldGhpbmcgd2VudCB3cm9uZy5cIik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvbWV0aGluZyB3ZW50IHdyb25nLlwiICsgZGF0YSk7XG4gICAgfVxuICAgIC8vIE5vIGNvbm5lY3Rpb24gdG8gRmlyZWJhc2VcbiAgICBlbHNlIGlmIChkYXRhLnR5cGUgPT0gXCJFcnJvclwiKSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeShcIkNvdWxkIG5vdCBnZXQgZGF0YS4gVGhlcmUgc2VlbXMgdG8gYmUgbm8gY29ubmVjdGlvbiB0byB0aGUgc2VydmVyLlwiKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGRhdGEubWVzc2FnZSk7XG4gICAgfVxuICAgIC8vIFdyb25nIGUtbWFpbFxuICAgIGVsc2UgaWYgKGRhdGFbMF0ubWVzc2FnZSA9PSBcIkNsaWVudCBtdXN0IGJlIGF1dGhlbnRpY2F0ZWQgdG8gYWNjZXNzIHRoaXMgcmVzb3VyY2UuXCIpIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KFwiWW91IGhhdmUgZW50ZXJlZCBhbiBpbnZhbGlkIGUtbWFpbC4gU2VlICdBdXRob3JpemF0aW9uJyBzZXR0aW5ncy5cIik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihkYXRhLm1lc3NhZ2UpO1xuICAgIH1cbiAgICAvLyBXcm9uZyBjb21wYW55IG5hbWVcbiAgICBlbHNlIGlmIChkYXRhWzBdLmVycm9yTWVzc2FnZSA9PSBcIlNpdGUgdGVtcG9yYXJpbHkgdW5hdmFpbGFibGVcIikge1xuICAgICAgICBmaWdtYS5ub3RpZnkoXCJDb21wYW55IGRvbWFpbiBuYW1lIGRvZXMgbm90IGV4aXN0LiBTZWUgJ1Byb2plY3QgU2V0dGluZ3MnLlwiKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGRhdGFbMF0uZXJyb3JNZXNzYWdlKTtcbiAgICB9XG4gICAgLy8gV3JvbmcgcGFzc3dvcmRcbiAgICBlbHNlIGlmIChkYXRhWzBdWzBdKSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeShcIkNvdWxkIG5vdCBhY2Nlc3MgZGF0YS4gWW91ciBKaXJhIEFQSSBUb2tlbiBzZWVtcyB0byBiZSBpbnZhbGlkLiBTZWUgJ0F1dGhvcml6YXRpb24nIHNldHRpbmdzLlwiKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGRhdGFbMF1bMF0pO1xuICAgIH1cbiAgICAvLyBFbHNlLCBpdCB3YXMgcHJvYmFibHkgc3VjY2Vzc2Z1bFxuICAgIGVsc2Uge1xuICAgICAgICBpc1N1Y2Nlc3MgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gaXNTdWNjZXNzO1xufVxuLy8gQ2hlY2tzIGlmIHBlciByZWNlaXZlZCB0aWNrZXQgZGF0YSBpZiB0aGUgZmV0Y2hpbmcgd2FzIHN1Y2Nlc3NmdWxcbmZ1bmN0aW9uIGNoZWNrVGlja2V0RGF0YVJlcG9uc2UodGlja2V0RGF0YSwgaXNzdWVJZCkge1xuICAgIHZhciBjaGVja2VkRGF0YTtcbiAgICAvLyBJZiB0aGUgSlNPTiBoYXMgYSBrZXkgZmllbGQsIHRoZSBkYXRhIGlzIHZhbGlkXG4gICAgaWYgKHRpY2tldERhdGEgJiYgdGlja2V0RGF0YS5rZXkpIHtcbiAgICAgICAgY2hlY2tlZERhdGEgPSB0aWNrZXREYXRhO1xuICAgIH1cbiAgICAvLyBJRCBkb2VzIG5vdCBleGlzdFxuICAgIGVsc2UgaWYgKHRpY2tldERhdGEuZXJyb3JNZXNzYWdlcyA9PSBcIlRoZSBpc3N1ZSBubyBsb25nZXIgZXhpc3RzLlwiKSB7XG4gICAgICAgIGNoZWNrZWREYXRhID0gY3JlYXRlRXJyb3JEYXRhSlNPTihgRXJyb3I6IFRpY2tldCBJRCAnJHtpc3N1ZUlkfScgZG9lcyBub3QgZXhpc3QuYCwgaXNzdWVJZCk7XG4gICAgICAgIC8vIGZpZ21hLm5vdGlmeShgVGlja2V0IElEICcke2lzc3VlSWR9JyBkb2VzIG5vdCBleGlzdC5gKVxuICAgIH1cbiAgICAvLyBJRCBoYXMgaW52YWxpZCBmb3JtYXRcbiAgICBlbHNlIGlmICh0aWNrZXREYXRhLmVycm9yTWVzc2FnZXMgPT0gXCJJc3N1ZSBrZXkgaXMgaW4gYW4gaW52YWxpZCBmb3JtYXQuXCIpIHtcbiAgICAgICAgY2hlY2tlZERhdGEgPSBjcmVhdGVFcnJvckRhdGFKU09OKGBFcnJvcjogVGlja2V0IElEICcke2lzc3VlSWR9JyBpcyBpbiBhbiBpbnZhbGlkIGZvcm1hdC5gLCBpc3N1ZUlkKTtcbiAgICAgICAgLy8gZmlnbWEubm90aWZ5KGBUaWNrZXQgSUQgJyR7aXNzdWVJZH0nIGlzIGluIGFuIGludmFsaWQgZm9ybWF0LmApXG4gICAgfVxuICAgIC8vIE90aGVyXG4gICAgZWxzZSB7XG4gICAgICAgIGNoZWNrZWREYXRhID0gY3JlYXRlRXJyb3JEYXRhSlNPTihcIkVycm9yOiBBbiB1bmV4cGVjdGVkIGVycm9yIG9jY3VyZWQuXCIsIGlzc3VlSWQpO1xuICAgICAgICBmaWdtYS5ub3RpZnkoXCJVbmV4cGVjdGVkIGVycm9yLlwiKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIlVuZXhwZWN0ZWQgZXJyb3IuXCIsIHRpY2tldERhdGEpO1xuICAgICAgICAvLyB0aHJvdyBuZXcgRXJyb3IodGlja2V0RGF0YS5tZXNzYWdlKVxuICAgIH1cbiAgICByZXR1cm4gY2hlY2tlZERhdGE7XG59XG4vLyBDcmVhdGUgYSBlcnJvciB2YXJpYWJsZSB0aGF0IGhhcyB0aGUgc2FtZSBtYWluIGZpZWxkcyBhcyB0aGUgSmlyYSBUaWNrZXQgdmFyaWFibGUuIFxuLy8gVGhpcyB3aWxsIGJlIHVzZWQgdGhlIGZpbGwgdGhlIHRpY2tldCBkYXRhIHdpdGggdGhlIGVycm9yIG1lc3NhZ2UuXG5mdW5jdGlvbiBjcmVhdGVFcnJvckRhdGFKU09OKG1lc3NhZ2UsIGlzc3VlSWQpIHtcbiAgICB2YXIgdG9kYXkgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgdmFyIGVycm9yRGF0YSA9IHtcbiAgICAgICAgXCJrZXlcIjogaXNzdWVJZCxcbiAgICAgICAgXCJmaWVsZHNcIjoge1xuICAgICAgICAgICAgXCJzdW1tYXJ5XCI6IG1lc3NhZ2UsXG4gICAgICAgICAgICBcInN0YXR1c1wiOiB7XG4gICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwiRXJyb3JcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwic3RhdHVzY2F0ZWdvcnljaGFuZ2VkYXRlXCI6IHRvZGF5XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBlcnJvckRhdGE7XG59XG4vLyBGdW5jdGlvbiBmb3IgbG9hZGluZyBhbGwgdGhlIGZvbnRzIGZvciB0aGUgbWFpbiBjb21wb25lbnRcbmZ1bmN0aW9uIGxvYWRGb250cygpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICB5aWVsZCBmaWdtYS5sb2FkRm9udEFzeW5jKEZPTlRfUkVHKTtcbiAgICAgICAgeWllbGQgZmlnbWEubG9hZEZvbnRBc3luYyhGT05UX01FRCk7XG4gICAgICAgIHlpZWxkIGZpZ21hLmxvYWRGb250QXN5bmMoRk9OVF9CT0xEKTtcbiAgICB9KTtcbn1cbi8vIEZvcm1hdHMgYSBoZXggdmFsdWUgdG8gUkdCXG5mdW5jdGlvbiBoZXhUb1JnYihoZXgpIHtcbiAgICB2YXIgYmlnaW50ID0gcGFyc2VJbnQoaGV4LCAxNik7XG4gICAgdmFyIHIgPSAoYmlnaW50ID4+IDE2KSAmIDI1NTtcbiAgICB2YXIgZyA9IChiaWdpbnQgPj4gOCkgJiAyNTU7XG4gICAgdmFyIGIgPSBiaWdpbnQgJiAyNTU7XG4gICAgcmV0dXJuIHsgcjogciAvIDI1NSwgZzogZyAvIDI1NSwgYjogYiAvIDI1NSB9O1xufVxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSB7fTtcbl9fd2VicGFja19tb2R1bGVzX19bXCIuL3NyYy9jb2RlLnRzXCJdKCk7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=