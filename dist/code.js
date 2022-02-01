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
if (!DOCUMENT_NODE.getRelaunchData().update_all) {
    DOCUMENT_NODE.setRelaunchData({ update_all: 'Update all Jira tickets on this page.' });
}
const WINDOW_WIDTH = 250;
const WINDOW_HEIGHT_BIG = 466;
const WINDOW_HEIGHT_SMALL = 200;
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
// ticketdata.fields.assignee.displayName
// ticketdata.fields.assignee.avatarUrls
// ticketdata.fields.status.name
// ticketdata.fields.status.statusCategory.name
// ticketdata.fields.statuscategorychangedate
const ISSUE_ID_NAME = "Ticket ID";
const ISSUE_TITLE_NAME = "Ticket Title";
const ISSUE_CHANGE_DATE_NAME = "Status Change Date";
var ticketComponent;
const COMPONENT_SET_NAME = "Jira Ticket Header";
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
// Functions run by the plugin button (relaunch)
if (figma.command === 'update') {
    figma.showUI(__html__, { visible: false });
    updateSelection();
}
else if (figma.command === 'update_all') {
    figma.showUI(__html__, { visible: false });
    var hasFailed = updateAll();
    console.log(hasFailed);
    if (hasFailed) {
        figma.closePlugin();
    }
}
else {
    figma.showUI(__html__, { width: WINDOW_WIDTH, height: WINDOW_HEIGHT_SMALL });
}
function sendData() {
    return __awaiter(this, void 0, void 0, function* () {
        company_name = yield getAuthorizationInfo(COMPANY_NAME_KEY);
        username = yield getAuthorizationInfo(USERNAME_KEY);
        password = yield getAuthorizationInfo(PASSWORD_KEY);
        issueId = yield getAuthorizationInfo(ISSUE_ID_KEY);
        console.log("Recovered names", username, password, company_name);
        figma.ui.postMessage({ company_name: company_name, username: username, password: password, issueId: issueId, type: 'setUsername' });
    });
}
sendData();
// All the functions that can be started from the UI
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    // Called to create a new main component and save its ID
    if (msg.type === 'create-component') {
        yield createTicketComponentSet();
        DOCUMENT_NODE.setPluginData('ticketComponentID', ticketComponent.id);
    }
    // Called to create a new instance of a component (based on the issueId entered in the UI)
    if (msg.type === 'create-new-ticket') {
        yield referenceTicketComponentSet();
        yield createTicketInstance(msg.data[0]);
    }
    // Called to get all Jira Ticker Header instances and updates them one by one. 
    if (msg.type === 'update-all') {
        updateAll();
    }
    // Called to get selected Jira Ticker Header instances and updates them one by one. 
    if (msg.type === 'update-selected') {
        updateSelection();
    }
    if (msg.type === 'authorization-detail-changed') {
        console.log("Message in Sanbox", msg.data);
        setAuthorizationInfo(msg.key, msg.data);
    }
    if (msg.type === 'resize-ui') {
        console.log("Resize", msg.big_size);
        msg.big_size ? figma.ui.resize(WINDOW_WIDTH, WINDOW_HEIGHT_BIG) : figma.ui.resize(WINDOW_WIDTH, WINDOW_HEIGHT_SMALL);
    }
    // Updates instances based on the received ticket data.
    if (msg.type === 'ticketDataSent') {
        var nodeIds = msg.nodeIds;
        var numberOfNodes = nodeIds.length;
        var numberOfSuccesses = 0;
        // console.log(nodeIds, msg.data)
        for (let i = 0; i < numberOfNodes; i++) {
            const id = nodeIds[i];
            let ticketData = checkTicketDataReponse(msg.data[i]);
            let node = figma.getNodeById(id);
            // console.log(`Updating node ${i}.`, node, ticketData)
            console.log("HERE", ticketData);
            if (ticketData.key !== 'ERROR')
                numberOfSuccesses += 1;
            yield updateVariant(node, ticketData);
        }
        // Success message
        var message;
        if (numberOfSuccesses == 0) {
            message = `Update failed.`;
        }
        else if (numberOfSuccesses < numberOfNodes) {
            message = `${numberOfSuccesses} of ${numberOfNodes} successfully updated. ${numberOfNodes - numberOfSuccesses} update(s) failed. `;
        }
        else {
            message = `${numberOfSuccesses} of ${numberOfNodes} header(s) updated!`;
        }
        // If called via the relaunch button, close plugin after updating the tickets
        if (figma.command === 'update' || figma.command === 'update_all') {
            figma.closePlugin(message);
        }
        else {
            figma.notify(message);
        }
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
        console.log("Restored value", valueSaved);
        return valueSaved;
    });
}
// Get all elements on page and start update process
function updateAll() {
    const nodes = figma.currentPage.findAllWithCriteria({
        types: ['INSTANCE']
    });
    const nodesFiltered = nodes.filter(node => node.name === COMPONENT_SET_NAME);
    if (nodesFiltered.length == 0) {
        figma.notify(`No instances named '${COMPONENT_SET_NAME}' found on this page.`);
        let isFailed = true;
        return isFailed;
    }
    else {
        getDataForMultiple(nodesFiltered);
    }
}
// Get selection and start update process
function updateSelection() {
    let selection = figma.currentPage.selection;
    if (selection.length == 0) {
        figma.notify(`Nothing selected.`);
    }
    else {
        getDataForMultiple(selection);
    }
}
function getDataForMultiple(instances) {
    return __awaiter(this, void 0, void 0, function* () {
        // var nodeIds = instances.map(function (node) { return node.id })
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
                    console.log(issueIdNode);
                    issueIds.push(issueIdNode.characters);
                    nodeIds.push(node.id);
                }
            }
        }
        figma.ui.postMessage({ nodeIds: nodeIds, issueIds: issueIds, type: 'getTicketData' });
    });
}
// Create instances of the main ticket component and replaces the content with data of the actual Jira ticket
function createTicketInstance(ticketData) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create an instance and update it to the correct status
        let ticketVariant = ticketComponent.defaultVariant;
        let ticketInstance = ticketVariant.createInstance();
        ticketData = checkTicketDataReponse(ticketData);
        ticketInstance = yield updateVariant(ticketInstance, ticketData);
        // Update ID
        let issueIDTxt = ticketInstance.findOne(n => n.type === "TEXT" && n.name === ISSUE_ID_NAME);
        if (issueIDTxt) {
            // Add header
            yield figma.loadFontAsync(issueIDTxt.fontName);
            issueIDTxt.characters = getIssueId(ticketData);
        }
        else {
            figma.notify("Could not find text element named '" + ISSUE_ID_NAME + "'.");
        }
        ticketInstance.x = figma.viewport.center.x;
        ticketInstance.y = figma.viewport.center.y;
        figma.currentPage.selection = [ticketInstance];
    });
}
// Creates a new component that represent a ticket
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
        // headerFrame.primaryAxisSizingMode = "AUTO"
        headerFrame.layoutAlign = "STRETCH";
        headerFrame.itemSpacing = 40;
        headerFrame.fills = [];
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
            ticketVariant.appendChild(headerFrame);
            ticketVariant.appendChild(changeDateTxt);
            headerFrame.appendChild(issueIdTxt);
            headerFrame.appendChild(titleTxt);
            titleTxt.layoutGrow = 1;
        }).catch(() => {
            figma.notify("Font '" + FONT_REG.family + "' could not be loaded. Please install the font.");
        });
        // Fixes a weird bug in which the 'stretch' doesnt work properly
        headerFrame.primaryAxisSizingMode = "FIXED";
        headerFrame.layoutAlign = "STRETCH";
        // Make sure the new text node is visible where we're currently looking
        ticketVariant.x = figma.viewport.center.x;
        ticketVariant.y = figma.viewport.center.y;
        return ticketVariant;
    });
}
function createTicketComponentSet() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create four variants (one for each status)
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
    });
}
// Create a ticket component or gets the reference to the existing one
function referenceTicketComponentSet() {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if the ticket component is already saved in the variable
        if (!ticketComponent) {
            // If no, try the get the ticket component by its ID
            var ticketComponentId = DOCUMENT_NODE.getPluginData('ticketComponentID');
            if (ticketComponentId) {
                // If there is an ID saved, access the ticket component
                ticketComponent = figma.getNodeById(ticketComponentId);
            }
            else {
                // If there is no ID, create a new component
                yield createTicketComponentSet();
            }
        }
    });
}
// Updates the ticket based on its status
function updateVariant(instance, ticketData) {
    return __awaiter(this, void 0, void 0, function* () {
        let ticketStatus = getStatus(ticketData);
        // Assure that the main component is referenced
        if (!ticketComponent)
            yield referenceTicketComponentSet();
        // Get the variant based on the ticket status and swap it with the current
        let newVariant = ticketComponent.findChild(n => n.name === COMPONENT_SET_PROPERTY_NAME + ticketStatus);
        if (!newVariant) { // If the status doesn't match any of the variants, use default
            newVariant = ticketComponent.defaultVariant;
            figma.notify("Status '" + ticketStatus + "' not existing. You can add it as new variant to the main component.", {
                timeout: 6000
            });
        }
        // Update title
        let titleTxt = instance.findOne(n => n.type === "TEXT" && n.name === ISSUE_TITLE_NAME);
        if (titleTxt) {
            yield figma.loadFontAsync(titleTxt.fontName);
            titleTxt.characters = getTitle(ticketData);
            titleTxt.hyperlink = { type: "URL", value: `https://${company_name}.atlassian.net/browse/${ticketData.key}` };
        }
        else {
            figma.notify("Could not find text element named '" + ISSUE_TITLE_NAME + "'.");
        }
        // Update date
        let changeDateTxt = instance.findOne(n => n.type === "TEXT" && n.name === ISSUE_CHANGE_DATE_NAME);
        if (changeDateTxt) {
            yield figma.loadFontAsync(changeDateTxt.fontName);
            // Filters out the data to a simplet format (Mmm DD YYYY)
            var date = new Date(getChangeDate(ticketData).replace(/[T]+.*/, ""));
            changeDateTxt.characters = date.toDateString();
            // changeDateTxt.characters = date.toDateString().replace(/^([A-Za-z]*)./,"");
        }
        else {
            figma.notify("Could not find text element named '" + ISSUE_CHANGE_DATE_NAME + "'.");
        }
        // console.log("DONE")
        // Add the relaunch button
        instance.swapComponent(newVariant);
        instance.setRelaunchData({ update: '' });
        return instance;
    });
}
// Function for loading all the needed fonts
const loadFonts = () => __awaiter(this, void 0, void 0, function* () {
    yield figma.loadFontAsync(FONT_REG);
    yield figma.loadFontAsync(FONT_MED);
    yield figma.loadFontAsync(FONT_BOLD);
});
// Formats a hex value to RGB
function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return { r: r / 255, g: g / 255, b: b / 255 };
}
// Checks if the received ticket data is valid or whether an error occured
function checkTicketDataReponse(ticketData) {
    var checkedData;
    if (ticketData === undefined) {
        figma.notify("Could not get data. There seems to be no connection to the server.");
        throw new Error("Could not get data. There seems to be no connection to the server.");
    }
    else if (ticketData && ticketData.key) { // If the JSON has a key field, the data is valid
        checkedData = ticketData;
    }
    else {
        if (ticketData.errorMessages) {
            checkedData = createErrorDataJSON(ticketData.errorMessages[0]);
        }
        else if (ticketData.message) {
            checkedData = createErrorDataJSON(ticketData.message);
        }
        else {
            figma.notify("Could not get data. There seems to be no connection to the server.");
            throw new Error("Could not get data. There seems to be no connection to the server.");
        }
    }
    return checkedData;
}
// Create a error variable that has the same main fields as the Jira Ticket variable. 
// This will be used the fill the ticket data with the error message.
function createErrorDataJSON(message) {
    var today = new Date().toISOString();
    var errorData = {
        "key": "ERROR",
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkI7QUFDM0I7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQywrQkFBK0IsYUFBYSx3QkFBd0IsZUFBZTtBQUN0SDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxZQUFZO0FBQy9DO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O1VFN2JBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWJwYWNrLXJlYWN0Ly4vc3JjL2NvZGUudHMiLCJ3ZWJwYWNrOi8vd2VicGFjay1yZWFjdC93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3dlYnBhY2stcmVhY3Qvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3dlYnBhY2stcmVhY3Qvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuY29uc3QgRE9DVU1FTlRfTk9ERSA9IGZpZ21hLmN1cnJlbnRQYWdlLnBhcmVudDtcbi8vIFNldCB0aGUgcmVsYXVuY2ggYnV0dG9uIGZvciB0aGUgd2hvbGUgZG9jdW1lbnRcbmlmICghRE9DVU1FTlRfTk9ERS5nZXRSZWxhdW5jaERhdGEoKS51cGRhdGVfYWxsKSB7XG4gICAgRE9DVU1FTlRfTk9ERS5zZXRSZWxhdW5jaERhdGEoeyB1cGRhdGVfYWxsOiAnVXBkYXRlIGFsbCBKaXJhIHRpY2tldHMgb24gdGhpcyBwYWdlLicgfSk7XG59XG5jb25zdCBXSU5ET1dfV0lEVEggPSAyNTA7XG5jb25zdCBXSU5ET1dfSEVJR0hUX0JJRyA9IDQ2NjtcbmNvbnN0IFdJTkRPV19IRUlHSFRfU01BTEwgPSAyMDA7XG5jb25zdCBDT01QQU5ZX05BTUVfS0VZID0gXCJDT01QQU5ZX05BTUVcIjtcbmNvbnN0IFVTRVJOQU1FX0tFWSA9IFwiVVNFUk5BTUVcIjtcbmNvbnN0IFBBU1NXT1JEX0tFWSA9IFwiUEFTU1dPUkRcIjtcbmNvbnN0IElTU1VFX0lEX0tFWSA9IFwiSVNTVUVfSURcIjtcbnZhciBjb21wYW55X25hbWU7XG52YXIgdXNlcm5hbWU7XG52YXIgcGFzc3dvcmQ7XG52YXIgaXNzdWVJZDtcbmNvbnN0IEZPTlRfUkVHID0geyBmYW1pbHk6IFwiV29yayBTYW5zXCIsIHN0eWxlOiBcIlJlZ3VsYXJcIiB9O1xuY29uc3QgRk9OVF9NRUQgPSB7IGZhbWlseTogXCJXb3JrIFNhbnNcIiwgc3R5bGU6IFwiTWVkaXVtXCIgfTtcbmNvbnN0IEZPTlRfQk9MRCA9IHsgZmFtaWx5OiBcIldvcmsgU2Fuc1wiLCBzdHlsZTogXCJCb2xkXCIgfTtcbmZ1bmN0aW9uIGdldFN0YXR1cyhkYXRhKSB7IHJldHVybiBkYXRhLmZpZWxkcy5zdGF0dXMubmFtZTsgfVxuZnVuY3Rpb24gZ2V0VGl0bGUoZGF0YSkgeyByZXR1cm4gZGF0YS5maWVsZHMuc3VtbWFyeTsgfVxuZnVuY3Rpb24gZ2V0SXNzdWVJZChkYXRhKSB7IHJldHVybiBkYXRhLmtleTsgfVxuZnVuY3Rpb24gZ2V0Q2hhbmdlRGF0ZShkYXRhKSB7IHJldHVybiBkYXRhLmZpZWxkcy5zdGF0dXNjYXRlZ29yeWNoYW5nZWRhdGU7IH1cbi8vIHRpY2tldGRhdGEuZmllbGRzLmFzc2lnbmVlLmRpc3BsYXlOYW1lXG4vLyB0aWNrZXRkYXRhLmZpZWxkcy5hc3NpZ25lZS5hdmF0YXJVcmxzXG4vLyB0aWNrZXRkYXRhLmZpZWxkcy5zdGF0dXMubmFtZVxuLy8gdGlja2V0ZGF0YS5maWVsZHMuc3RhdHVzLnN0YXR1c0NhdGVnb3J5Lm5hbWVcbi8vIHRpY2tldGRhdGEuZmllbGRzLnN0YXR1c2NhdGVnb3J5Y2hhbmdlZGF0ZVxuY29uc3QgSVNTVUVfSURfTkFNRSA9IFwiVGlja2V0IElEXCI7XG5jb25zdCBJU1NVRV9USVRMRV9OQU1FID0gXCJUaWNrZXQgVGl0bGVcIjtcbmNvbnN0IElTU1VFX0NIQU5HRV9EQVRFX05BTUUgPSBcIlN0YXR1cyBDaGFuZ2UgRGF0ZVwiO1xudmFyIHRpY2tldENvbXBvbmVudDtcbmNvbnN0IENPTVBPTkVOVF9TRVRfTkFNRSA9IFwiSmlyYSBUaWNrZXQgSGVhZGVyXCI7XG5jb25zdCBDT01QT05FTlRfU0VUX1BST1BFUlRZX05BTUUgPSBcIlN0YXR1cz1cIjtcbmNvbnN0IFZBUklBTlRfTkFNRV8xID0gXCJUbyBEb1wiO1xuY29uc3QgVkFSSUFOVF9DT0xPUl8xID0gaGV4VG9SZ2IoJ0VFRUVFRScpO1xuY29uc3QgVkFSSUFOVF9OQU1FXzIgPSBcIkNvbmNlcHRpbmdcIjtcbmNvbnN0IFZBUklBTlRfQ09MT1JfMiA9IGhleFRvUmdiKCdGRkVEQzAnKTtcbmNvbnN0IFZBUklBTlRfTkFNRV8zID0gXCJEZXNpZ25cIjtcbmNvbnN0IFZBUklBTlRfQ09MT1JfMyA9IGhleFRvUmdiKCdEN0UwRkYnKTtcbmNvbnN0IFZBUklBTlRfTkFNRV80ID0gXCJUZXN0aW5nXCI7XG5jb25zdCBWQVJJQU5UX0NPTE9SXzQgPSBoZXhUb1JnYignRDdFMEZGJyk7XG5jb25zdCBWQVJJQU5UX05BTUVfRE9ORSA9IFwiTGF1bmNoXCI7XG5jb25zdCBWQVJJQU5UX0NPTE9SX0RPTkUgPSBoZXhUb1JnYignRDNGRkQyJyk7XG5jb25zdCBWQVJJQU5UX05BTUVfREVGQVVMVCA9IFwiRGVmYXVsdFwiO1xuY29uc3QgVkFSSUFOVF9DT0xPUl9ERUZBVUxUID0gaGV4VG9SZ2IoJ0I5QjlCOScpO1xuY29uc3QgVkFSSUFOVF9OQU1FX0VSUk9SID0gXCJFcnJvclwiO1xuY29uc3QgVkFSSUFOVF9DT0xPUl9FUlJPUiA9IGhleFRvUmdiKCdGRkQ5RDknKTtcbi8vIEZ1bmN0aW9ucyBydW4gYnkgdGhlIHBsdWdpbiBidXR0b24gKHJlbGF1bmNoKVxuaWYgKGZpZ21hLmNvbW1hbmQgPT09ICd1cGRhdGUnKSB7XG4gICAgZmlnbWEuc2hvd1VJKF9faHRtbF9fLCB7IHZpc2libGU6IGZhbHNlIH0pO1xuICAgIHVwZGF0ZVNlbGVjdGlvbigpO1xufVxuZWxzZSBpZiAoZmlnbWEuY29tbWFuZCA9PT0gJ3VwZGF0ZV9hbGwnKSB7XG4gICAgZmlnbWEuc2hvd1VJKF9faHRtbF9fLCB7IHZpc2libGU6IGZhbHNlIH0pO1xuICAgIHZhciBoYXNGYWlsZWQgPSB1cGRhdGVBbGwoKTtcbiAgICBjb25zb2xlLmxvZyhoYXNGYWlsZWQpO1xuICAgIGlmIChoYXNGYWlsZWQpIHtcbiAgICAgICAgZmlnbWEuY2xvc2VQbHVnaW4oKTtcbiAgICB9XG59XG5lbHNlIHtcbiAgICBmaWdtYS5zaG93VUkoX19odG1sX18sIHsgd2lkdGg6IFdJTkRPV19XSURUSCwgaGVpZ2h0OiBXSU5ET1dfSEVJR0hUX1NNQUxMIH0pO1xufVxuZnVuY3Rpb24gc2VuZERhdGEoKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgY29tcGFueV9uYW1lID0geWllbGQgZ2V0QXV0aG9yaXphdGlvbkluZm8oQ09NUEFOWV9OQU1FX0tFWSk7XG4gICAgICAgIHVzZXJuYW1lID0geWllbGQgZ2V0QXV0aG9yaXphdGlvbkluZm8oVVNFUk5BTUVfS0VZKTtcbiAgICAgICAgcGFzc3dvcmQgPSB5aWVsZCBnZXRBdXRob3JpemF0aW9uSW5mbyhQQVNTV09SRF9LRVkpO1xuICAgICAgICBpc3N1ZUlkID0geWllbGQgZ2V0QXV0aG9yaXphdGlvbkluZm8oSVNTVUVfSURfS0VZKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJSZWNvdmVyZWQgbmFtZXNcIiwgdXNlcm5hbWUsIHBhc3N3b3JkLCBjb21wYW55X25hbWUpO1xuICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7IGNvbXBhbnlfbmFtZTogY29tcGFueV9uYW1lLCB1c2VybmFtZTogdXNlcm5hbWUsIHBhc3N3b3JkOiBwYXNzd29yZCwgaXNzdWVJZDogaXNzdWVJZCwgdHlwZTogJ3NldFVzZXJuYW1lJyB9KTtcbiAgICB9KTtcbn1cbnNlbmREYXRhKCk7XG4vLyBBbGwgdGhlIGZ1bmN0aW9ucyB0aGF0IGNhbiBiZSBzdGFydGVkIGZyb20gdGhlIFVJXG5maWdtYS51aS5vbm1lc3NhZ2UgPSAobXNnKSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgLy8gQ2FsbGVkIHRvIGNyZWF0ZSBhIG5ldyBtYWluIGNvbXBvbmVudCBhbmQgc2F2ZSBpdHMgSURcbiAgICBpZiAobXNnLnR5cGUgPT09ICdjcmVhdGUtY29tcG9uZW50Jykge1xuICAgICAgICB5aWVsZCBjcmVhdGVUaWNrZXRDb21wb25lbnRTZXQoKTtcbiAgICAgICAgRE9DVU1FTlRfTk9ERS5zZXRQbHVnaW5EYXRhKCd0aWNrZXRDb21wb25lbnRJRCcsIHRpY2tldENvbXBvbmVudC5pZCk7XG4gICAgfVxuICAgIC8vIENhbGxlZCB0byBjcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgYSBjb21wb25lbnQgKGJhc2VkIG9uIHRoZSBpc3N1ZUlkIGVudGVyZWQgaW4gdGhlIFVJKVxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2NyZWF0ZS1uZXctdGlja2V0Jykge1xuICAgICAgICB5aWVsZCByZWZlcmVuY2VUaWNrZXRDb21wb25lbnRTZXQoKTtcbiAgICAgICAgeWllbGQgY3JlYXRlVGlja2V0SW5zdGFuY2UobXNnLmRhdGFbMF0pO1xuICAgIH1cbiAgICAvLyBDYWxsZWQgdG8gZ2V0IGFsbCBKaXJhIFRpY2tlciBIZWFkZXIgaW5zdGFuY2VzIGFuZCB1cGRhdGVzIHRoZW0gb25lIGJ5IG9uZS4gXG4gICAgaWYgKG1zZy50eXBlID09PSAndXBkYXRlLWFsbCcpIHtcbiAgICAgICAgdXBkYXRlQWxsKCk7XG4gICAgfVxuICAgIC8vIENhbGxlZCB0byBnZXQgc2VsZWN0ZWQgSmlyYSBUaWNrZXIgSGVhZGVyIGluc3RhbmNlcyBhbmQgdXBkYXRlcyB0aGVtIG9uZSBieSBvbmUuIFxuICAgIGlmIChtc2cudHlwZSA9PT0gJ3VwZGF0ZS1zZWxlY3RlZCcpIHtcbiAgICAgICAgdXBkYXRlU2VsZWN0aW9uKCk7XG4gICAgfVxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2F1dGhvcml6YXRpb24tZGV0YWlsLWNoYW5nZWQnKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiTWVzc2FnZSBpbiBTYW5ib3hcIiwgbXNnLmRhdGEpO1xuICAgICAgICBzZXRBdXRob3JpemF0aW9uSW5mbyhtc2cua2V5LCBtc2cuZGF0YSk7XG4gICAgfVxuICAgIGlmIChtc2cudHlwZSA9PT0gJ3Jlc2l6ZS11aScpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJSZXNpemVcIiwgbXNnLmJpZ19zaXplKTtcbiAgICAgICAgbXNnLmJpZ19zaXplID8gZmlnbWEudWkucmVzaXplKFdJTkRPV19XSURUSCwgV0lORE9XX0hFSUdIVF9CSUcpIDogZmlnbWEudWkucmVzaXplKFdJTkRPV19XSURUSCwgV0lORE9XX0hFSUdIVF9TTUFMTCk7XG4gICAgfVxuICAgIC8vIFVwZGF0ZXMgaW5zdGFuY2VzIGJhc2VkIG9uIHRoZSByZWNlaXZlZCB0aWNrZXQgZGF0YS5cbiAgICBpZiAobXNnLnR5cGUgPT09ICd0aWNrZXREYXRhU2VudCcpIHtcbiAgICAgICAgdmFyIG5vZGVJZHMgPSBtc2cubm9kZUlkcztcbiAgICAgICAgdmFyIG51bWJlck9mTm9kZXMgPSBub2RlSWRzLmxlbmd0aDtcbiAgICAgICAgdmFyIG51bWJlck9mU3VjY2Vzc2VzID0gMDtcbiAgICAgICAgLy8gY29uc29sZS5sb2cobm9kZUlkcywgbXNnLmRhdGEpXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZOb2RlczsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IG5vZGVJZHNbaV07XG4gICAgICAgICAgICBsZXQgdGlja2V0RGF0YSA9IGNoZWNrVGlja2V0RGF0YVJlcG9uc2UobXNnLmRhdGFbaV0pO1xuICAgICAgICAgICAgbGV0IG5vZGUgPSBmaWdtYS5nZXROb2RlQnlJZChpZCk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgVXBkYXRpbmcgbm9kZSAke2l9LmAsIG5vZGUsIHRpY2tldERhdGEpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkhFUkVcIiwgdGlja2V0RGF0YSk7XG4gICAgICAgICAgICBpZiAodGlja2V0RGF0YS5rZXkgIT09ICdFUlJPUicpXG4gICAgICAgICAgICAgICAgbnVtYmVyT2ZTdWNjZXNzZXMgKz0gMTtcbiAgICAgICAgICAgIHlpZWxkIHVwZGF0ZVZhcmlhbnQobm9kZSwgdGlja2V0RGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU3VjY2VzcyBtZXNzYWdlXG4gICAgICAgIHZhciBtZXNzYWdlO1xuICAgICAgICBpZiAobnVtYmVyT2ZTdWNjZXNzZXMgPT0gMCkge1xuICAgICAgICAgICAgbWVzc2FnZSA9IGBVcGRhdGUgZmFpbGVkLmA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobnVtYmVyT2ZTdWNjZXNzZXMgPCBudW1iZXJPZk5vZGVzKSB7XG4gICAgICAgICAgICBtZXNzYWdlID0gYCR7bnVtYmVyT2ZTdWNjZXNzZXN9IG9mICR7bnVtYmVyT2ZOb2Rlc30gc3VjY2Vzc2Z1bGx5IHVwZGF0ZWQuICR7bnVtYmVyT2ZOb2RlcyAtIG51bWJlck9mU3VjY2Vzc2VzfSB1cGRhdGUocykgZmFpbGVkLiBgO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbWVzc2FnZSA9IGAke251bWJlck9mU3VjY2Vzc2VzfSBvZiAke251bWJlck9mTm9kZXN9IGhlYWRlcihzKSB1cGRhdGVkIWA7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgY2FsbGVkIHZpYSB0aGUgcmVsYXVuY2ggYnV0dG9uLCBjbG9zZSBwbHVnaW4gYWZ0ZXIgdXBkYXRpbmcgdGhlIHRpY2tldHNcbiAgICAgICAgaWYgKGZpZ21hLmNvbW1hbmQgPT09ICd1cGRhdGUnIHx8IGZpZ21hLmNvbW1hbmQgPT09ICd1cGRhdGVfYWxsJykge1xuICAgICAgICAgICAgZmlnbWEuY2xvc2VQbHVnaW4obWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmaWdtYS5ub3RpZnkobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcbi8vIFNhdmVzIGF1dGhvcml6YXRpb24gZGV0YWlscyBpbiBjbGllbnQgc3RvcmFnZVxuZnVuY3Rpb24gc2V0QXV0aG9yaXphdGlvbkluZm8oa2V5LCB2YWx1ZSkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIHlpZWxkIGZpZ21hLmNsaWVudFN0b3JhZ2Uuc2V0QXN5bmMoa2V5LCB2YWx1ZSk7XG4gICAgfSk7XG59XG4vLyBHZXQgYXV0aG9yaXphdGlvbiBkZXRhaWxzIGZyb20gY2xpZW50IHN0b3JhZ2VcbmZ1bmN0aW9uIGdldEF1dGhvcml6YXRpb25JbmZvKGtleSkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIHZhciB2YWx1ZVNhdmVkID0geWllbGQgZmlnbWEuY2xpZW50U3RvcmFnZS5nZXRBc3luYyhrZXkpO1xuICAgICAgICBpZiAoIXZhbHVlU2F2ZWQpXG4gICAgICAgICAgICB2YWx1ZVNhdmVkID0gXCJcIjtcbiAgICAgICAgY29uc29sZS5sb2coXCJSZXN0b3JlZCB2YWx1ZVwiLCB2YWx1ZVNhdmVkKTtcbiAgICAgICAgcmV0dXJuIHZhbHVlU2F2ZWQ7XG4gICAgfSk7XG59XG4vLyBHZXQgYWxsIGVsZW1lbnRzIG9uIHBhZ2UgYW5kIHN0YXJ0IHVwZGF0ZSBwcm9jZXNzXG5mdW5jdGlvbiB1cGRhdGVBbGwoKSB7XG4gICAgY29uc3Qgbm9kZXMgPSBmaWdtYS5jdXJyZW50UGFnZS5maW5kQWxsV2l0aENyaXRlcmlhKHtcbiAgICAgICAgdHlwZXM6IFsnSU5TVEFOQ0UnXVxuICAgIH0pO1xuICAgIGNvbnN0IG5vZGVzRmlsdGVyZWQgPSBub2Rlcy5maWx0ZXIobm9kZSA9PiBub2RlLm5hbWUgPT09IENPTVBPTkVOVF9TRVRfTkFNRSk7XG4gICAgaWYgKG5vZGVzRmlsdGVyZWQubGVuZ3RoID09IDApIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KGBObyBpbnN0YW5jZXMgbmFtZWQgJyR7Q09NUE9ORU5UX1NFVF9OQU1FfScgZm91bmQgb24gdGhpcyBwYWdlLmApO1xuICAgICAgICBsZXQgaXNGYWlsZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gaXNGYWlsZWQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBnZXREYXRhRm9yTXVsdGlwbGUobm9kZXNGaWx0ZXJlZCk7XG4gICAgfVxufVxuLy8gR2V0IHNlbGVjdGlvbiBhbmQgc3RhcnQgdXBkYXRlIHByb2Nlc3NcbmZ1bmN0aW9uIHVwZGF0ZVNlbGVjdGlvbigpIHtcbiAgICBsZXQgc2VsZWN0aW9uID0gZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uO1xuICAgIGlmIChzZWxlY3Rpb24ubGVuZ3RoID09IDApIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KGBOb3RoaW5nIHNlbGVjdGVkLmApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZ2V0RGF0YUZvck11bHRpcGxlKHNlbGVjdGlvbik7XG4gICAgfVxufVxuZnVuY3Rpb24gZ2V0RGF0YUZvck11bHRpcGxlKGluc3RhbmNlcykge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIC8vIHZhciBub2RlSWRzID0gaW5zdGFuY2VzLm1hcChmdW5jdGlvbiAobm9kZSkgeyByZXR1cm4gbm9kZS5pZCB9KVxuICAgICAgICB2YXIgbm9kZUlkcyA9IFtdO1xuICAgICAgICB2YXIgaXNzdWVJZHMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnN0YW5jZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBpbnN0YW5jZXNbaV07XG4gICAgICAgICAgICBpZiAobm9kZS50eXBlICE9PSBcIklOU1RBTkNFXCIpIHtcbiAgICAgICAgICAgICAgICBmaWdtYS5ub3RpZnkoXCJUaGUgZWxlbWVudCBuZWVkcyB0byBiZSBhbiBpbnN0YW5jZSBvZiBcIiArIENPTVBPTkVOVF9TRVRfTkFNRSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgaXNzdWVJZE5vZGUgPSBub2RlLmZpbmRPbmUobiA9PiBuLnR5cGUgPT09IFwiVEVYVFwiICYmIG4ubmFtZSA9PT0gSVNTVUVfSURfTkFNRSk7XG4gICAgICAgICAgICAgICAgaWYgKCFpc3N1ZUlkTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBmaWdtYS5ub3RpZnkoYEF0IGxlYXN0IG9uZSBpbnN0YW5jZSBpcyBtaXNzaW5nIHRoZSB0ZXh0IGVsZW1lbnQgJyR7SVNTVUVfSURfTkFNRX0nLiBDb3VsZCBub3QgdXBkYXRlLmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaXNzdWVJZE5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBpc3N1ZUlkcy5wdXNoKGlzc3VlSWROb2RlLmNoYXJhY3RlcnMpO1xuICAgICAgICAgICAgICAgICAgICBub2RlSWRzLnB1c2gobm9kZS5pZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHsgbm9kZUlkczogbm9kZUlkcywgaXNzdWVJZHM6IGlzc3VlSWRzLCB0eXBlOiAnZ2V0VGlja2V0RGF0YScgfSk7XG4gICAgfSk7XG59XG4vLyBDcmVhdGUgaW5zdGFuY2VzIG9mIHRoZSBtYWluIHRpY2tldCBjb21wb25lbnQgYW5kIHJlcGxhY2VzIHRoZSBjb250ZW50IHdpdGggZGF0YSBvZiB0aGUgYWN0dWFsIEppcmEgdGlja2V0XG5mdW5jdGlvbiBjcmVhdGVUaWNrZXRJbnN0YW5jZSh0aWNrZXREYXRhKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgLy8gQ3JlYXRlIGFuIGluc3RhbmNlIGFuZCB1cGRhdGUgaXQgdG8gdGhlIGNvcnJlY3Qgc3RhdHVzXG4gICAgICAgIGxldCB0aWNrZXRWYXJpYW50ID0gdGlja2V0Q29tcG9uZW50LmRlZmF1bHRWYXJpYW50O1xuICAgICAgICBsZXQgdGlja2V0SW5zdGFuY2UgPSB0aWNrZXRWYXJpYW50LmNyZWF0ZUluc3RhbmNlKCk7XG4gICAgICAgIHRpY2tldERhdGEgPSBjaGVja1RpY2tldERhdGFSZXBvbnNlKHRpY2tldERhdGEpO1xuICAgICAgICB0aWNrZXRJbnN0YW5jZSA9IHlpZWxkIHVwZGF0ZVZhcmlhbnQodGlja2V0SW5zdGFuY2UsIHRpY2tldERhdGEpO1xuICAgICAgICAvLyBVcGRhdGUgSURcbiAgICAgICAgbGV0IGlzc3VlSURUeHQgPSB0aWNrZXRJbnN0YW5jZS5maW5kT25lKG4gPT4gbi50eXBlID09PSBcIlRFWFRcIiAmJiBuLm5hbWUgPT09IElTU1VFX0lEX05BTUUpO1xuICAgICAgICBpZiAoaXNzdWVJRFR4dCkge1xuICAgICAgICAgICAgLy8gQWRkIGhlYWRlclxuICAgICAgICAgICAgeWllbGQgZmlnbWEubG9hZEZvbnRBc3luYyhpc3N1ZUlEVHh0LmZvbnROYW1lKTtcbiAgICAgICAgICAgIGlzc3VlSURUeHQuY2hhcmFjdGVycyA9IGdldElzc3VlSWQodGlja2V0RGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmaWdtYS5ub3RpZnkoXCJDb3VsZCBub3QgZmluZCB0ZXh0IGVsZW1lbnQgbmFtZWQgJ1wiICsgSVNTVUVfSURfTkFNRSArIFwiJy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgdGlja2V0SW5zdGFuY2UueCA9IGZpZ21hLnZpZXdwb3J0LmNlbnRlci54O1xuICAgICAgICB0aWNrZXRJbnN0YW5jZS55ID0gZmlnbWEudmlld3BvcnQuY2VudGVyLnk7XG4gICAgICAgIGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbiA9IFt0aWNrZXRJbnN0YW5jZV07XG4gICAgfSk7XG59XG4vLyBDcmVhdGVzIGEgbmV3IGNvbXBvbmVudCB0aGF0IHJlcHJlc2VudCBhIHRpY2tldFxuZnVuY3Rpb24gY3JlYXRlVGlja2V0VmFyaWFudChzdGF0dXNDb2xvciwgc3RhdHVzTmFtZSkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIC8vIENyZWF0ZSB0aGUgbWFpbiBmcmFtZVxuICAgICAgICB2YXIgdGlja2V0VmFyaWFudCA9IGZpZ21hLmNyZWF0ZUNvbXBvbmVudCgpO1xuICAgICAgICBsZXQgcGFkZGluZyA9IDI0O1xuICAgICAgICB0aWNrZXRWYXJpYW50Lm5hbWUgPSBzdGF0dXNOYW1lO1xuICAgICAgICB0aWNrZXRWYXJpYW50LmxheW91dE1vZGUgPSBcIlZFUlRJQ0FMXCI7XG4gICAgICAgIHRpY2tldFZhcmlhbnQucmVzaXplKDYwMCwgMjAwKTtcbiAgICAgICAgdGlja2V0VmFyaWFudC5jb3VudGVyQXhpc1NpemluZ01vZGUgPSBcIkZJWEVEXCI7XG4gICAgICAgIHRpY2tldFZhcmlhbnQucHJpbWFyeUF4aXNTaXppbmdNb2RlID0gXCJBVVRPXCI7XG4gICAgICAgIHRpY2tldFZhcmlhbnQucGFkZGluZ1RvcCA9IHBhZGRpbmc7XG4gICAgICAgIHRpY2tldFZhcmlhbnQucGFkZGluZ1JpZ2h0ID0gcGFkZGluZztcbiAgICAgICAgdGlja2V0VmFyaWFudC5wYWRkaW5nQm90dG9tID0gcGFkZGluZztcbiAgICAgICAgdGlja2V0VmFyaWFudC5wYWRkaW5nTGVmdCA9IHBhZGRpbmc7XG4gICAgICAgIHRpY2tldFZhcmlhbnQuaXRlbVNwYWNpbmcgPSAxNjtcbiAgICAgICAgdGlja2V0VmFyaWFudC5jb3JuZXJSYWRpdXMgPSA0O1xuICAgICAgICB0aWNrZXRWYXJpYW50LmZpbGxzID0gW3sgdHlwZTogJ1NPTElEJywgY29sb3I6IHN0YXR1c0NvbG9yIH1dO1xuICAgICAgICAvLyBDcmVhdGUgdGhlIGhlYWRlciBmcmFtZVxuICAgICAgICB2YXIgaGVhZGVyRnJhbWUgPSBmaWdtYS5jcmVhdGVGcmFtZSgpO1xuICAgICAgICBoZWFkZXJGcmFtZS5uYW1lID0gXCJIZWFkZXJcIjtcbiAgICAgICAgaGVhZGVyRnJhbWUubGF5b3V0TW9kZSA9IFwiSE9SSVpPTlRBTFwiO1xuICAgICAgICBoZWFkZXJGcmFtZS5jb3VudGVyQXhpc1NpemluZ01vZGUgPSBcIkFVVE9cIjtcbiAgICAgICAgLy8gaGVhZGVyRnJhbWUucHJpbWFyeUF4aXNTaXppbmdNb2RlID0gXCJBVVRPXCJcbiAgICAgICAgaGVhZGVyRnJhbWUubGF5b3V0QWxpZ24gPSBcIlNUUkVUQ0hcIjtcbiAgICAgICAgaGVhZGVyRnJhbWUuaXRlbVNwYWNpbmcgPSA0MDtcbiAgICAgICAgaGVhZGVyRnJhbWUuZmlsbHMgPSBbXTtcbiAgICAgICAgbG9hZEZvbnRzKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBBZGQgdGhlIHRpY2tldCB0ZXh0IGZpZWxkc1xuICAgICAgICAgICAgY29uc3QgdGl0bGVUeHQgPSBmaWdtYS5jcmVhdGVUZXh0KCk7XG4gICAgICAgICAgICB0aXRsZVR4dC5mb250TmFtZSA9IEZPTlRfUkVHO1xuICAgICAgICAgICAgdGl0bGVUeHQuZm9udFNpemUgPSAzMjtcbiAgICAgICAgICAgIHRpdGxlVHh0LnRleHREZWNvcmF0aW9uID0gXCJVTkRFUkxJTkVcIjtcbiAgICAgICAgICAgIHRpdGxlVHh0LmF1dG9SZW5hbWUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRpdGxlVHh0LmNoYXJhY3RlcnMgPSBcIlRpY2tldCB0aXRsZVwiO1xuICAgICAgICAgICAgdGl0bGVUeHQubmFtZSA9IElTU1VFX1RJVExFX05BTUU7XG4gICAgICAgICAgICBjb25zdCBpc3N1ZUlkVHh0ID0gZmlnbWEuY3JlYXRlVGV4dCgpO1xuICAgICAgICAgICAgaXNzdWVJZFR4dC5mb250TmFtZSA9IEZPTlRfTUVEO1xuICAgICAgICAgICAgaXNzdWVJZFR4dC5mb250U2l6ZSA9IDMyO1xuICAgICAgICAgICAgaXNzdWVJZFR4dC5hdXRvUmVuYW1lID0gZmFsc2U7XG4gICAgICAgICAgICBpc3N1ZUlkVHh0LmNoYXJhY3RlcnMgPSBcIklELTFcIjtcbiAgICAgICAgICAgIGlzc3VlSWRUeHQubmFtZSA9IElTU1VFX0lEX05BTUU7XG4gICAgICAgICAgICBjb25zdCBjaGFuZ2VEYXRlVHh0ID0gZmlnbWEuY3JlYXRlVGV4dCgpO1xuICAgICAgICAgICAgY2hhbmdlRGF0ZVR4dC5mb250TmFtZSA9IEZPTlRfUkVHO1xuICAgICAgICAgICAgY2hhbmdlRGF0ZVR4dC5mb250U2l6ZSA9IDI0O1xuICAgICAgICAgICAgY2hhbmdlRGF0ZVR4dC5hdXRvUmVuYW1lID0gZmFsc2U7XG4gICAgICAgICAgICBjaGFuZ2VEYXRlVHh0LmNoYXJhY3RlcnMgPSBcIk1NIEREIFlZWVlcIjtcbiAgICAgICAgICAgIGNoYW5nZURhdGVUeHQubmFtZSA9IElTU1VFX0NIQU5HRV9EQVRFX05BTUU7XG4gICAgICAgICAgICB0aWNrZXRWYXJpYW50LmFwcGVuZENoaWxkKGhlYWRlckZyYW1lKTtcbiAgICAgICAgICAgIHRpY2tldFZhcmlhbnQuYXBwZW5kQ2hpbGQoY2hhbmdlRGF0ZVR4dCk7XG4gICAgICAgICAgICBoZWFkZXJGcmFtZS5hcHBlbmRDaGlsZChpc3N1ZUlkVHh0KTtcbiAgICAgICAgICAgIGhlYWRlckZyYW1lLmFwcGVuZENoaWxkKHRpdGxlVHh0KTtcbiAgICAgICAgICAgIHRpdGxlVHh0LmxheW91dEdyb3cgPSAxO1xuICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICBmaWdtYS5ub3RpZnkoXCJGb250ICdcIiArIEZPTlRfUkVHLmZhbWlseSArIFwiJyBjb3VsZCBub3QgYmUgbG9hZGVkLiBQbGVhc2UgaW5zdGFsbCB0aGUgZm9udC5cIik7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBGaXhlcyBhIHdlaXJkIGJ1ZyBpbiB3aGljaCB0aGUgJ3N0cmV0Y2gnIGRvZXNudCB3b3JrIHByb3Blcmx5XG4gICAgICAgIGhlYWRlckZyYW1lLnByaW1hcnlBeGlzU2l6aW5nTW9kZSA9IFwiRklYRURcIjtcbiAgICAgICAgaGVhZGVyRnJhbWUubGF5b3V0QWxpZ24gPSBcIlNUUkVUQ0hcIjtcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBuZXcgdGV4dCBub2RlIGlzIHZpc2libGUgd2hlcmUgd2UncmUgY3VycmVudGx5IGxvb2tpbmdcbiAgICAgICAgdGlja2V0VmFyaWFudC54ID0gZmlnbWEudmlld3BvcnQuY2VudGVyLng7XG4gICAgICAgIHRpY2tldFZhcmlhbnQueSA9IGZpZ21hLnZpZXdwb3J0LmNlbnRlci55O1xuICAgICAgICByZXR1cm4gdGlja2V0VmFyaWFudDtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZVRpY2tldENvbXBvbmVudFNldCgpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAvLyBDcmVhdGUgZm91ciB2YXJpYW50cyAob25lIGZvciBlYWNoIHN0YXR1cylcbiAgICAgICAgbGV0IHZhckRlZmF1bHQgPSB5aWVsZCBjcmVhdGVUaWNrZXRWYXJpYW50KFZBUklBTlRfQ09MT1JfREVGQVVMVCwgQ09NUE9ORU5UX1NFVF9QUk9QRVJUWV9OQU1FICsgVkFSSUFOVF9OQU1FX0RFRkFVTFQpO1xuICAgICAgICBsZXQgdmFyMSA9IHlpZWxkIGNyZWF0ZVRpY2tldFZhcmlhbnQoVkFSSUFOVF9DT0xPUl8xLCBDT01QT05FTlRfU0VUX1BST1BFUlRZX05BTUUgKyBWQVJJQU5UX05BTUVfMSk7XG4gICAgICAgIGxldCB2YXIyID0geWllbGQgY3JlYXRlVGlja2V0VmFyaWFudChWQVJJQU5UX0NPTE9SXzIsIENPTVBPTkVOVF9TRVRfUFJPUEVSVFlfTkFNRSArIFZBUklBTlRfTkFNRV8yKTtcbiAgICAgICAgbGV0IHZhcjMgPSB5aWVsZCBjcmVhdGVUaWNrZXRWYXJpYW50KFZBUklBTlRfQ09MT1JfMywgQ09NUE9ORU5UX1NFVF9QUk9QRVJUWV9OQU1FICsgVkFSSUFOVF9OQU1FXzMpO1xuICAgICAgICBsZXQgdmFyNCA9IHlpZWxkIGNyZWF0ZVRpY2tldFZhcmlhbnQoVkFSSUFOVF9DT0xPUl80LCBDT01QT05FTlRfU0VUX1BST1BFUlRZX05BTUUgKyBWQVJJQU5UX05BTUVfNCk7XG4gICAgICAgIGxldCB2YXI1ID0geWllbGQgY3JlYXRlVGlja2V0VmFyaWFudChWQVJJQU5UX0NPTE9SX0RPTkUsIENPTVBPTkVOVF9TRVRfUFJPUEVSVFlfTkFNRSArIFZBUklBTlRfTkFNRV9ET05FKTtcbiAgICAgICAgbGV0IHZhckVycm9yID0geWllbGQgY3JlYXRlVGlja2V0VmFyaWFudChWQVJJQU5UX0NPTE9SX0VSUk9SLCBDT01QT05FTlRfU0VUX1BST1BFUlRZX05BTUUgKyBWQVJJQU5UX05BTUVfRVJST1IpO1xuICAgICAgICBjb25zdCB2YXJpYW50cyA9IFt2YXJEZWZhdWx0LCB2YXIxLCB2YXIyLCB2YXIzLCB2YXI0LCB2YXI1LCB2YXJFcnJvcl07XG4gICAgICAgIC8vIENyZWF0ZSBhIGNvbXBvbmVudCBvdXQgb2YgYWxsIHRoZXNlIHZhcmlhbnRzXG4gICAgICAgIHRpY2tldENvbXBvbmVudCA9IGZpZ21hLmNvbWJpbmVBc1ZhcmlhbnRzKHZhcmlhbnRzLCBmaWdtYS5jdXJyZW50UGFnZSk7XG4gICAgICAgIGxldCBwYWRkaW5nID0gMTY7XG4gICAgICAgIHRpY2tldENvbXBvbmVudC5uYW1lID0gQ09NUE9ORU5UX1NFVF9OQU1FO1xuICAgICAgICB0aWNrZXRDb21wb25lbnQubGF5b3V0TW9kZSA9IFwiVkVSVElDQUxcIjtcbiAgICAgICAgdGlja2V0Q29tcG9uZW50LmNvdW50ZXJBeGlzU2l6aW5nTW9kZSA9IFwiQVVUT1wiO1xuICAgICAgICB0aWNrZXRDb21wb25lbnQucHJpbWFyeUF4aXNTaXppbmdNb2RlID0gXCJBVVRPXCI7XG4gICAgICAgIHRpY2tldENvbXBvbmVudC5wYWRkaW5nVG9wID0gcGFkZGluZztcbiAgICAgICAgdGlja2V0Q29tcG9uZW50LnBhZGRpbmdSaWdodCA9IHBhZGRpbmc7XG4gICAgICAgIHRpY2tldENvbXBvbmVudC5wYWRkaW5nQm90dG9tID0gcGFkZGluZztcbiAgICAgICAgdGlja2V0Q29tcG9uZW50LnBhZGRpbmdMZWZ0ID0gcGFkZGluZztcbiAgICAgICAgdGlja2V0Q29tcG9uZW50Lml0ZW1TcGFjaW5nID0gMjQ7XG4gICAgICAgIHRpY2tldENvbXBvbmVudC5jb3JuZXJSYWRpdXMgPSA0O1xuICAgICAgICAvLyBTYXZlIGNvbXBvbmVudCBJRCBmb3IgbGF0ZXIgcmVmZXJlbmNlXG4gICAgICAgIERPQ1VNRU5UX05PREUuc2V0UGx1Z2luRGF0YSgndGlja2V0Q29tcG9uZW50SUQnLCB0aWNrZXRDb21wb25lbnQuaWQpO1xuICAgIH0pO1xufVxuLy8gQ3JlYXRlIGEgdGlja2V0IGNvbXBvbmVudCBvciBnZXRzIHRoZSByZWZlcmVuY2UgdG8gdGhlIGV4aXN0aW5nIG9uZVxuZnVuY3Rpb24gcmVmZXJlbmNlVGlja2V0Q29tcG9uZW50U2V0KCkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIHRoZSB0aWNrZXQgY29tcG9uZW50IGlzIGFscmVhZHkgc2F2ZWQgaW4gdGhlIHZhcmlhYmxlXG4gICAgICAgIGlmICghdGlja2V0Q29tcG9uZW50KSB7XG4gICAgICAgICAgICAvLyBJZiBubywgdHJ5IHRoZSBnZXQgdGhlIHRpY2tldCBjb21wb25lbnQgYnkgaXRzIElEXG4gICAgICAgICAgICB2YXIgdGlja2V0Q29tcG9uZW50SWQgPSBET0NVTUVOVF9OT0RFLmdldFBsdWdpbkRhdGEoJ3RpY2tldENvbXBvbmVudElEJyk7XG4gICAgICAgICAgICBpZiAodGlja2V0Q29tcG9uZW50SWQpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBhbiBJRCBzYXZlZCwgYWNjZXNzIHRoZSB0aWNrZXQgY29tcG9uZW50XG4gICAgICAgICAgICAgICAgdGlja2V0Q29tcG9uZW50ID0gZmlnbWEuZ2V0Tm9kZUJ5SWQodGlja2V0Q29tcG9uZW50SWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gSUQsIGNyZWF0ZSBhIG5ldyBjb21wb25lbnRcbiAgICAgICAgICAgICAgICB5aWVsZCBjcmVhdGVUaWNrZXRDb21wb25lbnRTZXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufVxuLy8gVXBkYXRlcyB0aGUgdGlja2V0IGJhc2VkIG9uIGl0cyBzdGF0dXNcbmZ1bmN0aW9uIHVwZGF0ZVZhcmlhbnQoaW5zdGFuY2UsIHRpY2tldERhdGEpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICBsZXQgdGlja2V0U3RhdHVzID0gZ2V0U3RhdHVzKHRpY2tldERhdGEpO1xuICAgICAgICAvLyBBc3N1cmUgdGhhdCB0aGUgbWFpbiBjb21wb25lbnQgaXMgcmVmZXJlbmNlZFxuICAgICAgICBpZiAoIXRpY2tldENvbXBvbmVudClcbiAgICAgICAgICAgIHlpZWxkIHJlZmVyZW5jZVRpY2tldENvbXBvbmVudFNldCgpO1xuICAgICAgICAvLyBHZXQgdGhlIHZhcmlhbnQgYmFzZWQgb24gdGhlIHRpY2tldCBzdGF0dXMgYW5kIHN3YXAgaXQgd2l0aCB0aGUgY3VycmVudFxuICAgICAgICBsZXQgbmV3VmFyaWFudCA9IHRpY2tldENvbXBvbmVudC5maW5kQ2hpbGQobiA9PiBuLm5hbWUgPT09IENPTVBPTkVOVF9TRVRfUFJPUEVSVFlfTkFNRSArIHRpY2tldFN0YXR1cyk7XG4gICAgICAgIGlmICghbmV3VmFyaWFudCkgeyAvLyBJZiB0aGUgc3RhdHVzIGRvZXNuJ3QgbWF0Y2ggYW55IG9mIHRoZSB2YXJpYW50cywgdXNlIGRlZmF1bHRcbiAgICAgICAgICAgIG5ld1ZhcmlhbnQgPSB0aWNrZXRDb21wb25lbnQuZGVmYXVsdFZhcmlhbnQ7XG4gICAgICAgICAgICBmaWdtYS5ub3RpZnkoXCJTdGF0dXMgJ1wiICsgdGlja2V0U3RhdHVzICsgXCInIG5vdCBleGlzdGluZy4gWW91IGNhbiBhZGQgaXQgYXMgbmV3IHZhcmlhbnQgdG8gdGhlIG1haW4gY29tcG9uZW50LlwiLCB7XG4gICAgICAgICAgICAgICAgdGltZW91dDogNjAwMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVXBkYXRlIHRpdGxlXG4gICAgICAgIGxldCB0aXRsZVR4dCA9IGluc3RhbmNlLmZpbmRPbmUobiA9PiBuLnR5cGUgPT09IFwiVEVYVFwiICYmIG4ubmFtZSA9PT0gSVNTVUVfVElUTEVfTkFNRSk7XG4gICAgICAgIGlmICh0aXRsZVR4dCkge1xuICAgICAgICAgICAgeWllbGQgZmlnbWEubG9hZEZvbnRBc3luYyh0aXRsZVR4dC5mb250TmFtZSk7XG4gICAgICAgICAgICB0aXRsZVR4dC5jaGFyYWN0ZXJzID0gZ2V0VGl0bGUodGlja2V0RGF0YSk7XG4gICAgICAgICAgICB0aXRsZVR4dC5oeXBlcmxpbmsgPSB7IHR5cGU6IFwiVVJMXCIsIHZhbHVlOiBgaHR0cHM6Ly8ke2NvbXBhbnlfbmFtZX0uYXRsYXNzaWFuLm5ldC9icm93c2UvJHt0aWNrZXREYXRhLmtleX1gIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmaWdtYS5ub3RpZnkoXCJDb3VsZCBub3QgZmluZCB0ZXh0IGVsZW1lbnQgbmFtZWQgJ1wiICsgSVNTVUVfVElUTEVfTkFNRSArIFwiJy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVXBkYXRlIGRhdGVcbiAgICAgICAgbGV0IGNoYW5nZURhdGVUeHQgPSBpbnN0YW5jZS5maW5kT25lKG4gPT4gbi50eXBlID09PSBcIlRFWFRcIiAmJiBuLm5hbWUgPT09IElTU1VFX0NIQU5HRV9EQVRFX05BTUUpO1xuICAgICAgICBpZiAoY2hhbmdlRGF0ZVR4dCkge1xuICAgICAgICAgICAgeWllbGQgZmlnbWEubG9hZEZvbnRBc3luYyhjaGFuZ2VEYXRlVHh0LmZvbnROYW1lKTtcbiAgICAgICAgICAgIC8vIEZpbHRlcnMgb3V0IHRoZSBkYXRhIHRvIGEgc2ltcGxldCBmb3JtYXQgKE1tbSBERCBZWVlZKVxuICAgICAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShnZXRDaGFuZ2VEYXRlKHRpY2tldERhdGEpLnJlcGxhY2UoL1tUXSsuKi8sIFwiXCIpKTtcbiAgICAgICAgICAgIGNoYW5nZURhdGVUeHQuY2hhcmFjdGVycyA9IGRhdGUudG9EYXRlU3RyaW5nKCk7XG4gICAgICAgICAgICAvLyBjaGFuZ2VEYXRlVHh0LmNoYXJhY3RlcnMgPSBkYXRlLnRvRGF0ZVN0cmluZygpLnJlcGxhY2UoL14oW0EtWmEtel0qKS4vLFwiXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZmlnbWEubm90aWZ5KFwiQ291bGQgbm90IGZpbmQgdGV4dCBlbGVtZW50IG5hbWVkICdcIiArIElTU1VFX0NIQU5HRV9EQVRFX05BTUUgKyBcIicuXCIpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiRE9ORVwiKVxuICAgICAgICAvLyBBZGQgdGhlIHJlbGF1bmNoIGJ1dHRvblxuICAgICAgICBpbnN0YW5jZS5zd2FwQ29tcG9uZW50KG5ld1ZhcmlhbnQpO1xuICAgICAgICBpbnN0YW5jZS5zZXRSZWxhdW5jaERhdGEoeyB1cGRhdGU6ICcnIH0pO1xuICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfSk7XG59XG4vLyBGdW5jdGlvbiBmb3IgbG9hZGluZyBhbGwgdGhlIG5lZWRlZCBmb250c1xuY29uc3QgbG9hZEZvbnRzID0gKCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgIHlpZWxkIGZpZ21hLmxvYWRGb250QXN5bmMoRk9OVF9SRUcpO1xuICAgIHlpZWxkIGZpZ21hLmxvYWRGb250QXN5bmMoRk9OVF9NRUQpO1xuICAgIHlpZWxkIGZpZ21hLmxvYWRGb250QXN5bmMoRk9OVF9CT0xEKTtcbn0pO1xuLy8gRm9ybWF0cyBhIGhleCB2YWx1ZSB0byBSR0JcbmZ1bmN0aW9uIGhleFRvUmdiKGhleCkge1xuICAgIHZhciBiaWdpbnQgPSBwYXJzZUludChoZXgsIDE2KTtcbiAgICB2YXIgciA9IChiaWdpbnQgPj4gMTYpICYgMjU1O1xuICAgIHZhciBnID0gKGJpZ2ludCA+PiA4KSAmIDI1NTtcbiAgICB2YXIgYiA9IGJpZ2ludCAmIDI1NTtcbiAgICByZXR1cm4geyByOiByIC8gMjU1LCBnOiBnIC8gMjU1LCBiOiBiIC8gMjU1IH07XG59XG4vLyBDaGVja3MgaWYgdGhlIHJlY2VpdmVkIHRpY2tldCBkYXRhIGlzIHZhbGlkIG9yIHdoZXRoZXIgYW4gZXJyb3Igb2NjdXJlZFxuZnVuY3Rpb24gY2hlY2tUaWNrZXREYXRhUmVwb25zZSh0aWNrZXREYXRhKSB7XG4gICAgdmFyIGNoZWNrZWREYXRhO1xuICAgIGlmICh0aWNrZXREYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KFwiQ291bGQgbm90IGdldCBkYXRhLiBUaGVyZSBzZWVtcyB0byBiZSBubyBjb25uZWN0aW9uIHRvIHRoZSBzZXJ2ZXIuXCIpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgZ2V0IGRhdGEuIFRoZXJlIHNlZW1zIHRvIGJlIG5vIGNvbm5lY3Rpb24gdG8gdGhlIHNlcnZlci5cIik7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRpY2tldERhdGEgJiYgdGlja2V0RGF0YS5rZXkpIHsgLy8gSWYgdGhlIEpTT04gaGFzIGEga2V5IGZpZWxkLCB0aGUgZGF0YSBpcyB2YWxpZFxuICAgICAgICBjaGVja2VkRGF0YSA9IHRpY2tldERhdGE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAodGlja2V0RGF0YS5lcnJvck1lc3NhZ2VzKSB7XG4gICAgICAgICAgICBjaGVja2VkRGF0YSA9IGNyZWF0ZUVycm9yRGF0YUpTT04odGlja2V0RGF0YS5lcnJvck1lc3NhZ2VzWzBdKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aWNrZXREYXRhLm1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGNoZWNrZWREYXRhID0gY3JlYXRlRXJyb3JEYXRhSlNPTih0aWNrZXREYXRhLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZmlnbWEubm90aWZ5KFwiQ291bGQgbm90IGdldCBkYXRhLiBUaGVyZSBzZWVtcyB0byBiZSBubyBjb25uZWN0aW9uIHRvIHRoZSBzZXJ2ZXIuXCIpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IGdldCBkYXRhLiBUaGVyZSBzZWVtcyB0byBiZSBubyBjb25uZWN0aW9uIHRvIHRoZSBzZXJ2ZXIuXCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjaGVja2VkRGF0YTtcbn1cbi8vIENyZWF0ZSBhIGVycm9yIHZhcmlhYmxlIHRoYXQgaGFzIHRoZSBzYW1lIG1haW4gZmllbGRzIGFzIHRoZSBKaXJhIFRpY2tldCB2YXJpYWJsZS4gXG4vLyBUaGlzIHdpbGwgYmUgdXNlZCB0aGUgZmlsbCB0aGUgdGlja2V0IGRhdGEgd2l0aCB0aGUgZXJyb3IgbWVzc2FnZS5cbmZ1bmN0aW9uIGNyZWF0ZUVycm9yRGF0YUpTT04obWVzc2FnZSkge1xuICAgIHZhciB0b2RheSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICB2YXIgZXJyb3JEYXRhID0ge1xuICAgICAgICBcImtleVwiOiBcIkVSUk9SXCIsXG4gICAgICAgIFwiZmllbGRzXCI6IHtcbiAgICAgICAgICAgIFwic3VtbWFyeVwiOiBtZXNzYWdlLFxuICAgICAgICAgICAgXCJzdGF0dXNcIjoge1xuICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcIkVycm9yXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInN0YXR1c2NhdGVnb3J5Y2hhbmdlZGF0ZVwiOiB0b2RheVxuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gZXJyb3JEYXRhO1xufVxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSB7fTtcbl9fd2VicGFja19tb2R1bGVzX19bXCIuL3NyYy9jb2RlLnRzXCJdKCk7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=