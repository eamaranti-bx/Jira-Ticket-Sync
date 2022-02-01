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
    figma.showUI(__html__, { width: 300, height: 350 });
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
            valueSaved = "Test";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCO0FBQzNCO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsK0JBQStCLGFBQWEsd0JBQXdCLGVBQWU7QUFDdEg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsWUFBWTtBQUMvQztBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkM7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztVRXRiQTtVQUNBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2VicGFjay1yZWFjdC8uL3NyYy9jb2RlLnRzIiwid2VicGFjazovL3dlYnBhY2stcmVhY3Qvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly93ZWJwYWNrLXJlYWN0L3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly93ZWJwYWNrLXJlYWN0L3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbmNvbnN0IERPQ1VNRU5UX05PREUgPSBmaWdtYS5jdXJyZW50UGFnZS5wYXJlbnQ7XG4vLyBTZXQgdGhlIHJlbGF1bmNoIGJ1dHRvbiBmb3IgdGhlIHdob2xlIGRvY3VtZW50XG5pZiAoIURPQ1VNRU5UX05PREUuZ2V0UmVsYXVuY2hEYXRhKCkudXBkYXRlX2FsbCkge1xuICAgIERPQ1VNRU5UX05PREUuc2V0UmVsYXVuY2hEYXRhKHsgdXBkYXRlX2FsbDogJ1VwZGF0ZSBhbGwgSmlyYSB0aWNrZXRzIG9uIHRoaXMgcGFnZS4nIH0pO1xufVxuY29uc3QgQ09NUEFOWV9OQU1FX0tFWSA9IFwiQ09NUEFOWV9OQU1FXCI7XG5jb25zdCBVU0VSTkFNRV9LRVkgPSBcIlVTRVJOQU1FXCI7XG5jb25zdCBQQVNTV09SRF9LRVkgPSBcIlBBU1NXT1JEXCI7XG5jb25zdCBJU1NVRV9JRF9LRVkgPSBcIklTU1VFX0lEXCI7XG52YXIgY29tcGFueV9uYW1lO1xudmFyIHVzZXJuYW1lO1xudmFyIHBhc3N3b3JkO1xudmFyIGlzc3VlSWQ7XG5jb25zdCBGT05UX1JFRyA9IHsgZmFtaWx5OiBcIldvcmsgU2Fuc1wiLCBzdHlsZTogXCJSZWd1bGFyXCIgfTtcbmNvbnN0IEZPTlRfTUVEID0geyBmYW1pbHk6IFwiV29yayBTYW5zXCIsIHN0eWxlOiBcIk1lZGl1bVwiIH07XG5jb25zdCBGT05UX0JPTEQgPSB7IGZhbWlseTogXCJXb3JrIFNhbnNcIiwgc3R5bGU6IFwiQm9sZFwiIH07XG5mdW5jdGlvbiBnZXRTdGF0dXMoZGF0YSkgeyByZXR1cm4gZGF0YS5maWVsZHMuc3RhdHVzLm5hbWU7IH1cbmZ1bmN0aW9uIGdldFRpdGxlKGRhdGEpIHsgcmV0dXJuIGRhdGEuZmllbGRzLnN1bW1hcnk7IH1cbmZ1bmN0aW9uIGdldElzc3VlSWQoZGF0YSkgeyByZXR1cm4gZGF0YS5rZXk7IH1cbmZ1bmN0aW9uIGdldENoYW5nZURhdGUoZGF0YSkgeyByZXR1cm4gZGF0YS5maWVsZHMuc3RhdHVzY2F0ZWdvcnljaGFuZ2VkYXRlOyB9XG4vLyB0aWNrZXRkYXRhLmZpZWxkcy5hc3NpZ25lZS5kaXNwbGF5TmFtZVxuLy8gdGlja2V0ZGF0YS5maWVsZHMuYXNzaWduZWUuYXZhdGFyVXJsc1xuLy8gdGlja2V0ZGF0YS5maWVsZHMuc3RhdHVzLm5hbWVcbi8vIHRpY2tldGRhdGEuZmllbGRzLnN0YXR1cy5zdGF0dXNDYXRlZ29yeS5uYW1lXG4vLyB0aWNrZXRkYXRhLmZpZWxkcy5zdGF0dXNjYXRlZ29yeWNoYW5nZWRhdGVcbmNvbnN0IElTU1VFX0lEX05BTUUgPSBcIlRpY2tldCBJRFwiO1xuY29uc3QgSVNTVUVfVElUTEVfTkFNRSA9IFwiVGlja2V0IFRpdGxlXCI7XG5jb25zdCBJU1NVRV9DSEFOR0VfREFURV9OQU1FID0gXCJTdGF0dXMgQ2hhbmdlIERhdGVcIjtcbnZhciB0aWNrZXRDb21wb25lbnQ7XG5jb25zdCBDT01QT05FTlRfU0VUX05BTUUgPSBcIkppcmEgVGlja2V0IEhlYWRlclwiO1xuY29uc3QgQ09NUE9ORU5UX1NFVF9QUk9QRVJUWV9OQU1FID0gXCJTdGF0dXM9XCI7XG5jb25zdCBWQVJJQU5UX05BTUVfMSA9IFwiVG8gRG9cIjtcbmNvbnN0IFZBUklBTlRfQ09MT1JfMSA9IGhleFRvUmdiKCdFRUVFRUUnKTtcbmNvbnN0IFZBUklBTlRfTkFNRV8yID0gXCJDb25jZXB0aW5nXCI7XG5jb25zdCBWQVJJQU5UX0NPTE9SXzIgPSBoZXhUb1JnYignRkZFREMwJyk7XG5jb25zdCBWQVJJQU5UX05BTUVfMyA9IFwiRGVzaWduXCI7XG5jb25zdCBWQVJJQU5UX0NPTE9SXzMgPSBoZXhUb1JnYignRDdFMEZGJyk7XG5jb25zdCBWQVJJQU5UX05BTUVfNCA9IFwiVGVzdGluZ1wiO1xuY29uc3QgVkFSSUFOVF9DT0xPUl80ID0gaGV4VG9SZ2IoJ0Q3RTBGRicpO1xuY29uc3QgVkFSSUFOVF9OQU1FX0RPTkUgPSBcIkxhdW5jaFwiO1xuY29uc3QgVkFSSUFOVF9DT0xPUl9ET05FID0gaGV4VG9SZ2IoJ0QzRkZEMicpO1xuY29uc3QgVkFSSUFOVF9OQU1FX0RFRkFVTFQgPSBcIkRlZmF1bHRcIjtcbmNvbnN0IFZBUklBTlRfQ09MT1JfREVGQVVMVCA9IGhleFRvUmdiKCdCOUI5QjknKTtcbmNvbnN0IFZBUklBTlRfTkFNRV9FUlJPUiA9IFwiRXJyb3JcIjtcbmNvbnN0IFZBUklBTlRfQ09MT1JfRVJST1IgPSBoZXhUb1JnYignRkZEOUQ5Jyk7XG4vLyBGdW5jdGlvbnMgcnVuIGJ5IHRoZSBwbHVnaW4gYnV0dG9uIChyZWxhdW5jaClcbmlmIChmaWdtYS5jb21tYW5kID09PSAndXBkYXRlJykge1xuICAgIGZpZ21hLnNob3dVSShfX2h0bWxfXywgeyB2aXNpYmxlOiBmYWxzZSB9KTtcbiAgICB1cGRhdGVTZWxlY3Rpb24oKTtcbn1cbmVsc2UgaWYgKGZpZ21hLmNvbW1hbmQgPT09ICd1cGRhdGVfYWxsJykge1xuICAgIGZpZ21hLnNob3dVSShfX2h0bWxfXywgeyB2aXNpYmxlOiBmYWxzZSB9KTtcbiAgICB2YXIgaGFzRmFpbGVkID0gdXBkYXRlQWxsKCk7XG4gICAgY29uc29sZS5sb2coaGFzRmFpbGVkKTtcbiAgICBpZiAoaGFzRmFpbGVkKSB7XG4gICAgICAgIGZpZ21hLmNsb3NlUGx1Z2luKCk7XG4gICAgfVxufVxuZWxzZSB7XG4gICAgZmlnbWEuc2hvd1VJKF9faHRtbF9fLCB7IHdpZHRoOiAzMDAsIGhlaWdodDogMzUwIH0pO1xufVxuZnVuY3Rpb24gc2VuZERhdGEoKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgY29tcGFueV9uYW1lID0geWllbGQgZ2V0QXV0aG9yaXphdGlvbkluZm8oQ09NUEFOWV9OQU1FX0tFWSk7XG4gICAgICAgIHVzZXJuYW1lID0geWllbGQgZ2V0QXV0aG9yaXphdGlvbkluZm8oVVNFUk5BTUVfS0VZKTtcbiAgICAgICAgcGFzc3dvcmQgPSB5aWVsZCBnZXRBdXRob3JpemF0aW9uSW5mbyhQQVNTV09SRF9LRVkpO1xuICAgICAgICBpc3N1ZUlkID0geWllbGQgZ2V0QXV0aG9yaXphdGlvbkluZm8oSVNTVUVfSURfS0VZKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJSZWNvdmVyZWQgbmFtZXNcIiwgdXNlcm5hbWUsIHBhc3N3b3JkLCBjb21wYW55X25hbWUpO1xuICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7IGNvbXBhbnlfbmFtZTogY29tcGFueV9uYW1lLCB1c2VybmFtZTogdXNlcm5hbWUsIHBhc3N3b3JkOiBwYXNzd29yZCwgaXNzdWVJZDogaXNzdWVJZCwgdHlwZTogJ3NldFVzZXJuYW1lJyB9KTtcbiAgICB9KTtcbn1cbnNlbmREYXRhKCk7XG4vLyBBbGwgdGhlIGZ1bmN0aW9ucyB0aGF0IGNhbiBiZSBzdGFydGVkIGZyb20gdGhlIFVJXG5maWdtYS51aS5vbm1lc3NhZ2UgPSAobXNnKSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgLy8gQ2FsbGVkIHRvIGNyZWF0ZSBhIG5ldyBtYWluIGNvbXBvbmVudCBhbmQgc2F2ZSBpdHMgSURcbiAgICBpZiAobXNnLnR5cGUgPT09ICdjcmVhdGUtY29tcG9uZW50Jykge1xuICAgICAgICB5aWVsZCBjcmVhdGVUaWNrZXRDb21wb25lbnRTZXQoKTtcbiAgICAgICAgRE9DVU1FTlRfTk9ERS5zZXRQbHVnaW5EYXRhKCd0aWNrZXRDb21wb25lbnRJRCcsIHRpY2tldENvbXBvbmVudC5pZCk7XG4gICAgfVxuICAgIC8vIENhbGxlZCB0byBjcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgYSBjb21wb25lbnQgKGJhc2VkIG9uIHRoZSBpc3N1ZUlkIGVudGVyZWQgaW4gdGhlIFVJKVxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2NyZWF0ZS1uZXctdGlja2V0Jykge1xuICAgICAgICB5aWVsZCByZWZlcmVuY2VUaWNrZXRDb21wb25lbnRTZXQoKTtcbiAgICAgICAgeWllbGQgY3JlYXRlVGlja2V0SW5zdGFuY2UobXNnLmRhdGFbMF0pO1xuICAgIH1cbiAgICAvLyBDYWxsZWQgdG8gZ2V0IGFsbCBKaXJhIFRpY2tlciBIZWFkZXIgaW5zdGFuY2VzIGFuZCB1cGRhdGVzIHRoZW0gb25lIGJ5IG9uZS4gXG4gICAgaWYgKG1zZy50eXBlID09PSAndXBkYXRlLWFsbCcpIHtcbiAgICAgICAgdXBkYXRlQWxsKCk7XG4gICAgfVxuICAgIC8vIENhbGxlZCB0byBnZXQgc2VsZWN0ZWQgSmlyYSBUaWNrZXIgSGVhZGVyIGluc3RhbmNlcyBhbmQgdXBkYXRlcyB0aGVtIG9uZSBieSBvbmUuIFxuICAgIGlmIChtc2cudHlwZSA9PT0gJ3VwZGF0ZS1zZWxlY3RlZCcpIHtcbiAgICAgICAgdXBkYXRlU2VsZWN0aW9uKCk7XG4gICAgfVxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2F1dGhvcml6YXRpb24tZGV0YWlsLWNoYW5nZWQnKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiTWVzc2FnZSBpbiBTYW5ib3hcIiwgbXNnLmRhdGEpO1xuICAgICAgICBzZXRBdXRob3JpemF0aW9uSW5mbyhtc2cua2V5LCBtc2cuZGF0YSk7XG4gICAgfVxuICAgIC8vIFVwZGF0ZXMgaW5zdGFuY2VzIGJhc2VkIG9uIHRoZSByZWNlaXZlZCB0aWNrZXQgZGF0YS5cbiAgICBpZiAobXNnLnR5cGUgPT09ICd0aWNrZXREYXRhU2VudCcpIHtcbiAgICAgICAgdmFyIG5vZGVJZHMgPSBtc2cubm9kZUlkcztcbiAgICAgICAgdmFyIG51bWJlck9mTm9kZXMgPSBub2RlSWRzLmxlbmd0aDtcbiAgICAgICAgdmFyIG51bWJlck9mU3VjY2Vzc2VzID0gMDtcbiAgICAgICAgLy8gY29uc29sZS5sb2cobm9kZUlkcywgbXNnLmRhdGEpXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZOb2RlczsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IG5vZGVJZHNbaV07XG4gICAgICAgICAgICBsZXQgdGlja2V0RGF0YSA9IGNoZWNrVGlja2V0RGF0YVJlcG9uc2UobXNnLmRhdGFbaV0pO1xuICAgICAgICAgICAgbGV0IG5vZGUgPSBmaWdtYS5nZXROb2RlQnlJZChpZCk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgVXBkYXRpbmcgbm9kZSAke2l9LmAsIG5vZGUsIHRpY2tldERhdGEpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkhFUkVcIiwgdGlja2V0RGF0YSk7XG4gICAgICAgICAgICBpZiAodGlja2V0RGF0YS5rZXkgIT09ICdFUlJPUicpXG4gICAgICAgICAgICAgICAgbnVtYmVyT2ZTdWNjZXNzZXMgKz0gMTtcbiAgICAgICAgICAgIHlpZWxkIHVwZGF0ZVZhcmlhbnQobm9kZSwgdGlja2V0RGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU3VjY2VzcyBtZXNzYWdlXG4gICAgICAgIHZhciBtZXNzYWdlO1xuICAgICAgICBpZiAobnVtYmVyT2ZTdWNjZXNzZXMgPT0gMCkge1xuICAgICAgICAgICAgbWVzc2FnZSA9IGBVcGRhdGUgZmFpbGVkLmA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobnVtYmVyT2ZTdWNjZXNzZXMgPCBudW1iZXJPZk5vZGVzKSB7XG4gICAgICAgICAgICBtZXNzYWdlID0gYCR7bnVtYmVyT2ZTdWNjZXNzZXN9IG9mICR7bnVtYmVyT2ZOb2Rlc30gc3VjY2Vzc2Z1bGx5IHVwZGF0ZWQuICR7bnVtYmVyT2ZOb2RlcyAtIG51bWJlck9mU3VjY2Vzc2VzfSB1cGRhdGUocykgZmFpbGVkLiBgO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbWVzc2FnZSA9IGAke251bWJlck9mU3VjY2Vzc2VzfSBvZiAke251bWJlck9mTm9kZXN9IGhlYWRlcihzKSB1cGRhdGVkIWA7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgY2FsbGVkIHZpYSB0aGUgcmVsYXVuY2ggYnV0dG9uLCBjbG9zZSBwbHVnaW4gYWZ0ZXIgdXBkYXRpbmcgdGhlIHRpY2tldHNcbiAgICAgICAgaWYgKGZpZ21hLmNvbW1hbmQgPT09ICd1cGRhdGUnIHx8IGZpZ21hLmNvbW1hbmQgPT09ICd1cGRhdGVfYWxsJykge1xuICAgICAgICAgICAgZmlnbWEuY2xvc2VQbHVnaW4obWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmaWdtYS5ub3RpZnkobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcbi8vIFNhdmVzIGF1dGhvcml6YXRpb24gZGV0YWlscyBpbiBjbGllbnQgc3RvcmFnZVxuZnVuY3Rpb24gc2V0QXV0aG9yaXphdGlvbkluZm8oa2V5LCB2YWx1ZSkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIHlpZWxkIGZpZ21hLmNsaWVudFN0b3JhZ2Uuc2V0QXN5bmMoa2V5LCB2YWx1ZSk7XG4gICAgfSk7XG59XG4vLyBHZXQgYXV0aG9yaXphdGlvbiBkZXRhaWxzIGZyb20gY2xpZW50IHN0b3JhZ2VcbmZ1bmN0aW9uIGdldEF1dGhvcml6YXRpb25JbmZvKGtleSkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIHZhciB2YWx1ZVNhdmVkID0geWllbGQgZmlnbWEuY2xpZW50U3RvcmFnZS5nZXRBc3luYyhrZXkpO1xuICAgICAgICBpZiAoIXZhbHVlU2F2ZWQpXG4gICAgICAgICAgICB2YWx1ZVNhdmVkID0gXCJUZXN0XCI7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiUmVzdG9yZWQgdmFsdWVcIiwgdmFsdWVTYXZlZCk7XG4gICAgICAgIHJldHVybiB2YWx1ZVNhdmVkO1xuICAgIH0pO1xufVxuLy8gR2V0IGFsbCBlbGVtZW50cyBvbiBwYWdlIGFuZCBzdGFydCB1cGRhdGUgcHJvY2Vzc1xuZnVuY3Rpb24gdXBkYXRlQWxsKCkge1xuICAgIGNvbnN0IG5vZGVzID0gZmlnbWEuY3VycmVudFBhZ2UuZmluZEFsbFdpdGhDcml0ZXJpYSh7XG4gICAgICAgIHR5cGVzOiBbJ0lOU1RBTkNFJ11cbiAgICB9KTtcbiAgICBjb25zdCBub2Rlc0ZpbHRlcmVkID0gbm9kZXMuZmlsdGVyKG5vZGUgPT4gbm9kZS5uYW1lID09PSBDT01QT05FTlRfU0VUX05BTUUpO1xuICAgIGlmIChub2Rlc0ZpbHRlcmVkLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeShgTm8gaW5zdGFuY2VzIG5hbWVkICcke0NPTVBPTkVOVF9TRVRfTkFNRX0nIGZvdW5kIG9uIHRoaXMgcGFnZS5gKTtcbiAgICAgICAgbGV0IGlzRmFpbGVkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIGlzRmFpbGVkO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZ2V0RGF0YUZvck11bHRpcGxlKG5vZGVzRmlsdGVyZWQpO1xuICAgIH1cbn1cbi8vIEdldCBzZWxlY3Rpb24gYW5kIHN0YXJ0IHVwZGF0ZSBwcm9jZXNzXG5mdW5jdGlvbiB1cGRhdGVTZWxlY3Rpb24oKSB7XG4gICAgbGV0IHNlbGVjdGlvbiA9IGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbjtcbiAgICBpZiAoc2VsZWN0aW9uLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeShgTm90aGluZyBzZWxlY3RlZC5gKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGdldERhdGFGb3JNdWx0aXBsZShzZWxlY3Rpb24pO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGdldERhdGFGb3JNdWx0aXBsZShpbnN0YW5jZXMpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAvLyB2YXIgbm9kZUlkcyA9IGluc3RhbmNlcy5tYXAoZnVuY3Rpb24gKG5vZGUpIHsgcmV0dXJuIG5vZGUuaWQgfSlcbiAgICAgICAgdmFyIG5vZGVJZHMgPSBbXTtcbiAgICAgICAgdmFyIGlzc3VlSWRzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5zdGFuY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gaW5zdGFuY2VzW2ldO1xuICAgICAgICAgICAgaWYgKG5vZGUudHlwZSAhPT0gXCJJTlNUQU5DRVwiKSB7XG4gICAgICAgICAgICAgICAgZmlnbWEubm90aWZ5KFwiVGhlIGVsZW1lbnQgbmVlZHMgdG8gYmUgYW4gaW5zdGFuY2Ugb2YgXCIgKyBDT01QT05FTlRfU0VUX05BTUUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGlzc3VlSWROb2RlID0gbm9kZS5maW5kT25lKG4gPT4gbi50eXBlID09PSBcIlRFWFRcIiAmJiBuLm5hbWUgPT09IElTU1VFX0lEX05BTUUpO1xuICAgICAgICAgICAgICAgIGlmICghaXNzdWVJZE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlnbWEubm90aWZ5KGBBdCBsZWFzdCBvbmUgaW5zdGFuY2UgaXMgbWlzc2luZyB0aGUgdGV4dCBlbGVtZW50ICcke0lTU1VFX0lEX05BTUV9Jy4gQ291bGQgbm90IHVwZGF0ZS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGlzc3VlSWROb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgaXNzdWVJZHMucHVzaChpc3N1ZUlkTm9kZS5jaGFyYWN0ZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZUlkcy5wdXNoKG5vZGUuaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7IG5vZGVJZHM6IG5vZGVJZHMsIGlzc3VlSWRzOiBpc3N1ZUlkcywgdHlwZTogJ2dldFRpY2tldERhdGEnIH0pO1xuICAgIH0pO1xufVxuLy8gQ3JlYXRlIGluc3RhbmNlcyBvZiB0aGUgbWFpbiB0aWNrZXQgY29tcG9uZW50IGFuZCByZXBsYWNlcyB0aGUgY29udGVudCB3aXRoIGRhdGEgb2YgdGhlIGFjdHVhbCBKaXJhIHRpY2tldFxuZnVuY3Rpb24gY3JlYXRlVGlja2V0SW5zdGFuY2UodGlja2V0RGF0YSkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIC8vIENyZWF0ZSBhbiBpbnN0YW5jZSBhbmQgdXBkYXRlIGl0IHRvIHRoZSBjb3JyZWN0IHN0YXR1c1xuICAgICAgICBsZXQgdGlja2V0VmFyaWFudCA9IHRpY2tldENvbXBvbmVudC5kZWZhdWx0VmFyaWFudDtcbiAgICAgICAgbGV0IHRpY2tldEluc3RhbmNlID0gdGlja2V0VmFyaWFudC5jcmVhdGVJbnN0YW5jZSgpO1xuICAgICAgICB0aWNrZXREYXRhID0gY2hlY2tUaWNrZXREYXRhUmVwb25zZSh0aWNrZXREYXRhKTtcbiAgICAgICAgdGlja2V0SW5zdGFuY2UgPSB5aWVsZCB1cGRhdGVWYXJpYW50KHRpY2tldEluc3RhbmNlLCB0aWNrZXREYXRhKTtcbiAgICAgICAgLy8gVXBkYXRlIElEXG4gICAgICAgIGxldCBpc3N1ZUlEVHh0ID0gdGlja2V0SW5zdGFuY2UuZmluZE9uZShuID0+IG4udHlwZSA9PT0gXCJURVhUXCIgJiYgbi5uYW1lID09PSBJU1NVRV9JRF9OQU1FKTtcbiAgICAgICAgaWYgKGlzc3VlSURUeHQpIHtcbiAgICAgICAgICAgIC8vIEFkZCBoZWFkZXJcbiAgICAgICAgICAgIHlpZWxkIGZpZ21hLmxvYWRGb250QXN5bmMoaXNzdWVJRFR4dC5mb250TmFtZSk7XG4gICAgICAgICAgICBpc3N1ZUlEVHh0LmNoYXJhY3RlcnMgPSBnZXRJc3N1ZUlkKHRpY2tldERhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZmlnbWEubm90aWZ5KFwiQ291bGQgbm90IGZpbmQgdGV4dCBlbGVtZW50IG5hbWVkICdcIiArIElTU1VFX0lEX05BTUUgKyBcIicuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRpY2tldEluc3RhbmNlLnggPSBmaWdtYS52aWV3cG9ydC5jZW50ZXIueDtcbiAgICAgICAgdGlja2V0SW5zdGFuY2UueSA9IGZpZ21hLnZpZXdwb3J0LmNlbnRlci55O1xuICAgICAgICBmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb24gPSBbdGlja2V0SW5zdGFuY2VdO1xuICAgIH0pO1xufVxuLy8gQ3JlYXRlcyBhIG5ldyBjb21wb25lbnQgdGhhdCByZXByZXNlbnQgYSB0aWNrZXRcbmZ1bmN0aW9uIGNyZWF0ZVRpY2tldFZhcmlhbnQoc3RhdHVzQ29sb3IsIHN0YXR1c05hbWUpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAvLyBDcmVhdGUgdGhlIG1haW4gZnJhbWVcbiAgICAgICAgdmFyIHRpY2tldFZhcmlhbnQgPSBmaWdtYS5jcmVhdGVDb21wb25lbnQoKTtcbiAgICAgICAgbGV0IHBhZGRpbmcgPSAyNDtcbiAgICAgICAgdGlja2V0VmFyaWFudC5uYW1lID0gc3RhdHVzTmFtZTtcbiAgICAgICAgdGlja2V0VmFyaWFudC5sYXlvdXRNb2RlID0gXCJWRVJUSUNBTFwiO1xuICAgICAgICB0aWNrZXRWYXJpYW50LnJlc2l6ZSg2MDAsIDIwMCk7XG4gICAgICAgIHRpY2tldFZhcmlhbnQuY291bnRlckF4aXNTaXppbmdNb2RlID0gXCJGSVhFRFwiO1xuICAgICAgICB0aWNrZXRWYXJpYW50LnByaW1hcnlBeGlzU2l6aW5nTW9kZSA9IFwiQVVUT1wiO1xuICAgICAgICB0aWNrZXRWYXJpYW50LnBhZGRpbmdUb3AgPSBwYWRkaW5nO1xuICAgICAgICB0aWNrZXRWYXJpYW50LnBhZGRpbmdSaWdodCA9IHBhZGRpbmc7XG4gICAgICAgIHRpY2tldFZhcmlhbnQucGFkZGluZ0JvdHRvbSA9IHBhZGRpbmc7XG4gICAgICAgIHRpY2tldFZhcmlhbnQucGFkZGluZ0xlZnQgPSBwYWRkaW5nO1xuICAgICAgICB0aWNrZXRWYXJpYW50Lml0ZW1TcGFjaW5nID0gMTY7XG4gICAgICAgIHRpY2tldFZhcmlhbnQuY29ybmVyUmFkaXVzID0gNDtcbiAgICAgICAgdGlja2V0VmFyaWFudC5maWxscyA9IFt7IHR5cGU6ICdTT0xJRCcsIGNvbG9yOiBzdGF0dXNDb2xvciB9XTtcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBoZWFkZXIgZnJhbWVcbiAgICAgICAgdmFyIGhlYWRlckZyYW1lID0gZmlnbWEuY3JlYXRlRnJhbWUoKTtcbiAgICAgICAgaGVhZGVyRnJhbWUubmFtZSA9IFwiSGVhZGVyXCI7XG4gICAgICAgIGhlYWRlckZyYW1lLmxheW91dE1vZGUgPSBcIkhPUklaT05UQUxcIjtcbiAgICAgICAgaGVhZGVyRnJhbWUuY291bnRlckF4aXNTaXppbmdNb2RlID0gXCJBVVRPXCI7XG4gICAgICAgIC8vIGhlYWRlckZyYW1lLnByaW1hcnlBeGlzU2l6aW5nTW9kZSA9IFwiQVVUT1wiXG4gICAgICAgIGhlYWRlckZyYW1lLmxheW91dEFsaWduID0gXCJTVFJFVENIXCI7XG4gICAgICAgIGhlYWRlckZyYW1lLml0ZW1TcGFjaW5nID0gNDA7XG4gICAgICAgIGhlYWRlckZyYW1lLmZpbGxzID0gW107XG4gICAgICAgIGxvYWRGb250cygpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gQWRkIHRoZSB0aWNrZXQgdGV4dCBmaWVsZHNcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlVHh0ID0gZmlnbWEuY3JlYXRlVGV4dCgpO1xuICAgICAgICAgICAgdGl0bGVUeHQuZm9udE5hbWUgPSBGT05UX1JFRztcbiAgICAgICAgICAgIHRpdGxlVHh0LmZvbnRTaXplID0gMzI7XG4gICAgICAgICAgICB0aXRsZVR4dC50ZXh0RGVjb3JhdGlvbiA9IFwiVU5ERVJMSU5FXCI7XG4gICAgICAgICAgICB0aXRsZVR4dC5hdXRvUmVuYW1lID0gZmFsc2U7XG4gICAgICAgICAgICB0aXRsZVR4dC5jaGFyYWN0ZXJzID0gXCJUaWNrZXQgdGl0bGVcIjtcbiAgICAgICAgICAgIHRpdGxlVHh0Lm5hbWUgPSBJU1NVRV9USVRMRV9OQU1FO1xuICAgICAgICAgICAgY29uc3QgaXNzdWVJZFR4dCA9IGZpZ21hLmNyZWF0ZVRleHQoKTtcbiAgICAgICAgICAgIGlzc3VlSWRUeHQuZm9udE5hbWUgPSBGT05UX01FRDtcbiAgICAgICAgICAgIGlzc3VlSWRUeHQuZm9udFNpemUgPSAzMjtcbiAgICAgICAgICAgIGlzc3VlSWRUeHQuYXV0b1JlbmFtZSA9IGZhbHNlO1xuICAgICAgICAgICAgaXNzdWVJZFR4dC5jaGFyYWN0ZXJzID0gXCJJRC0xXCI7XG4gICAgICAgICAgICBpc3N1ZUlkVHh0Lm5hbWUgPSBJU1NVRV9JRF9OQU1FO1xuICAgICAgICAgICAgY29uc3QgY2hhbmdlRGF0ZVR4dCA9IGZpZ21hLmNyZWF0ZVRleHQoKTtcbiAgICAgICAgICAgIGNoYW5nZURhdGVUeHQuZm9udE5hbWUgPSBGT05UX1JFRztcbiAgICAgICAgICAgIGNoYW5nZURhdGVUeHQuZm9udFNpemUgPSAyNDtcbiAgICAgICAgICAgIGNoYW5nZURhdGVUeHQuYXV0b1JlbmFtZSA9IGZhbHNlO1xuICAgICAgICAgICAgY2hhbmdlRGF0ZVR4dC5jaGFyYWN0ZXJzID0gXCJNTSBERCBZWVlZXCI7XG4gICAgICAgICAgICBjaGFuZ2VEYXRlVHh0Lm5hbWUgPSBJU1NVRV9DSEFOR0VfREFURV9OQU1FO1xuICAgICAgICAgICAgdGlja2V0VmFyaWFudC5hcHBlbmRDaGlsZChoZWFkZXJGcmFtZSk7XG4gICAgICAgICAgICB0aWNrZXRWYXJpYW50LmFwcGVuZENoaWxkKGNoYW5nZURhdGVUeHQpO1xuICAgICAgICAgICAgaGVhZGVyRnJhbWUuYXBwZW5kQ2hpbGQoaXNzdWVJZFR4dCk7XG4gICAgICAgICAgICBoZWFkZXJGcmFtZS5hcHBlbmRDaGlsZCh0aXRsZVR4dCk7XG4gICAgICAgICAgICB0aXRsZVR4dC5sYXlvdXRHcm93ID0gMTtcbiAgICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgZmlnbWEubm90aWZ5KFwiRm9udCAnXCIgKyBGT05UX1JFRy5mYW1pbHkgKyBcIicgY291bGQgbm90IGJlIGxvYWRlZC4gUGxlYXNlIGluc3RhbGwgdGhlIGZvbnQuXCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gRml4ZXMgYSB3ZWlyZCBidWcgaW4gd2hpY2ggdGhlICdzdHJldGNoJyBkb2VzbnQgd29yayBwcm9wZXJseVxuICAgICAgICBoZWFkZXJGcmFtZS5wcmltYXJ5QXhpc1NpemluZ01vZGUgPSBcIkZJWEVEXCI7XG4gICAgICAgIGhlYWRlckZyYW1lLmxheW91dEFsaWduID0gXCJTVFJFVENIXCI7XG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgbmV3IHRleHQgbm9kZSBpcyB2aXNpYmxlIHdoZXJlIHdlJ3JlIGN1cnJlbnRseSBsb29raW5nXG4gICAgICAgIHRpY2tldFZhcmlhbnQueCA9IGZpZ21hLnZpZXdwb3J0LmNlbnRlci54O1xuICAgICAgICB0aWNrZXRWYXJpYW50LnkgPSBmaWdtYS52aWV3cG9ydC5jZW50ZXIueTtcbiAgICAgICAgcmV0dXJuIHRpY2tldFZhcmlhbnQ7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBjcmVhdGVUaWNrZXRDb21wb25lbnRTZXQoKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgLy8gQ3JlYXRlIGZvdXIgdmFyaWFudHMgKG9uZSBmb3IgZWFjaCBzdGF0dXMpXG4gICAgICAgIGxldCB2YXJEZWZhdWx0ID0geWllbGQgY3JlYXRlVGlja2V0VmFyaWFudChWQVJJQU5UX0NPTE9SX0RFRkFVTFQsIENPTVBPTkVOVF9TRVRfUFJPUEVSVFlfTkFNRSArIFZBUklBTlRfTkFNRV9ERUZBVUxUKTtcbiAgICAgICAgbGV0IHZhcjEgPSB5aWVsZCBjcmVhdGVUaWNrZXRWYXJpYW50KFZBUklBTlRfQ09MT1JfMSwgQ09NUE9ORU5UX1NFVF9QUk9QRVJUWV9OQU1FICsgVkFSSUFOVF9OQU1FXzEpO1xuICAgICAgICBsZXQgdmFyMiA9IHlpZWxkIGNyZWF0ZVRpY2tldFZhcmlhbnQoVkFSSUFOVF9DT0xPUl8yLCBDT01QT05FTlRfU0VUX1BST1BFUlRZX05BTUUgKyBWQVJJQU5UX05BTUVfMik7XG4gICAgICAgIGxldCB2YXIzID0geWllbGQgY3JlYXRlVGlja2V0VmFyaWFudChWQVJJQU5UX0NPTE9SXzMsIENPTVBPTkVOVF9TRVRfUFJPUEVSVFlfTkFNRSArIFZBUklBTlRfTkFNRV8zKTtcbiAgICAgICAgbGV0IHZhcjQgPSB5aWVsZCBjcmVhdGVUaWNrZXRWYXJpYW50KFZBUklBTlRfQ09MT1JfNCwgQ09NUE9ORU5UX1NFVF9QUk9QRVJUWV9OQU1FICsgVkFSSUFOVF9OQU1FXzQpO1xuICAgICAgICBsZXQgdmFyNSA9IHlpZWxkIGNyZWF0ZVRpY2tldFZhcmlhbnQoVkFSSUFOVF9DT0xPUl9ET05FLCBDT01QT05FTlRfU0VUX1BST1BFUlRZX05BTUUgKyBWQVJJQU5UX05BTUVfRE9ORSk7XG4gICAgICAgIGxldCB2YXJFcnJvciA9IHlpZWxkIGNyZWF0ZVRpY2tldFZhcmlhbnQoVkFSSUFOVF9DT0xPUl9FUlJPUiwgQ09NUE9ORU5UX1NFVF9QUk9QRVJUWV9OQU1FICsgVkFSSUFOVF9OQU1FX0VSUk9SKTtcbiAgICAgICAgY29uc3QgdmFyaWFudHMgPSBbdmFyRGVmYXVsdCwgdmFyMSwgdmFyMiwgdmFyMywgdmFyNCwgdmFyNSwgdmFyRXJyb3JdO1xuICAgICAgICAvLyBDcmVhdGUgYSBjb21wb25lbnQgb3V0IG9mIGFsbCB0aGVzZSB2YXJpYW50c1xuICAgICAgICB0aWNrZXRDb21wb25lbnQgPSBmaWdtYS5jb21iaW5lQXNWYXJpYW50cyh2YXJpYW50cywgZmlnbWEuY3VycmVudFBhZ2UpO1xuICAgICAgICBsZXQgcGFkZGluZyA9IDE2O1xuICAgICAgICB0aWNrZXRDb21wb25lbnQubmFtZSA9IENPTVBPTkVOVF9TRVRfTkFNRTtcbiAgICAgICAgdGlja2V0Q29tcG9uZW50LmxheW91dE1vZGUgPSBcIlZFUlRJQ0FMXCI7XG4gICAgICAgIHRpY2tldENvbXBvbmVudC5jb3VudGVyQXhpc1NpemluZ01vZGUgPSBcIkFVVE9cIjtcbiAgICAgICAgdGlja2V0Q29tcG9uZW50LnByaW1hcnlBeGlzU2l6aW5nTW9kZSA9IFwiQVVUT1wiO1xuICAgICAgICB0aWNrZXRDb21wb25lbnQucGFkZGluZ1RvcCA9IHBhZGRpbmc7XG4gICAgICAgIHRpY2tldENvbXBvbmVudC5wYWRkaW5nUmlnaHQgPSBwYWRkaW5nO1xuICAgICAgICB0aWNrZXRDb21wb25lbnQucGFkZGluZ0JvdHRvbSA9IHBhZGRpbmc7XG4gICAgICAgIHRpY2tldENvbXBvbmVudC5wYWRkaW5nTGVmdCA9IHBhZGRpbmc7XG4gICAgICAgIHRpY2tldENvbXBvbmVudC5pdGVtU3BhY2luZyA9IDI0O1xuICAgICAgICB0aWNrZXRDb21wb25lbnQuY29ybmVyUmFkaXVzID0gNDtcbiAgICAgICAgLy8gU2F2ZSBjb21wb25lbnQgSUQgZm9yIGxhdGVyIHJlZmVyZW5jZVxuICAgICAgICBET0NVTUVOVF9OT0RFLnNldFBsdWdpbkRhdGEoJ3RpY2tldENvbXBvbmVudElEJywgdGlja2V0Q29tcG9uZW50LmlkKTtcbiAgICB9KTtcbn1cbi8vIENyZWF0ZSBhIHRpY2tldCBjb21wb25lbnQgb3IgZ2V0cyB0aGUgcmVmZXJlbmNlIHRvIHRoZSBleGlzdGluZyBvbmVcbmZ1bmN0aW9uIHJlZmVyZW5jZVRpY2tldENvbXBvbmVudFNldCgpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAvLyBDaGVjayBpZiB0aGUgdGlja2V0IGNvbXBvbmVudCBpcyBhbHJlYWR5IHNhdmVkIGluIHRoZSB2YXJpYWJsZVxuICAgICAgICBpZiAoIXRpY2tldENvbXBvbmVudCkge1xuICAgICAgICAgICAgLy8gSWYgbm8sIHRyeSB0aGUgZ2V0IHRoZSB0aWNrZXQgY29tcG9uZW50IGJ5IGl0cyBJRFxuICAgICAgICAgICAgdmFyIHRpY2tldENvbXBvbmVudElkID0gRE9DVU1FTlRfTk9ERS5nZXRQbHVnaW5EYXRhKCd0aWNrZXRDb21wb25lbnRJRCcpO1xuICAgICAgICAgICAgaWYgKHRpY2tldENvbXBvbmVudElkKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYW4gSUQgc2F2ZWQsIGFjY2VzcyB0aGUgdGlja2V0IGNvbXBvbmVudFxuICAgICAgICAgICAgICAgIHRpY2tldENvbXBvbmVudCA9IGZpZ21hLmdldE5vZGVCeUlkKHRpY2tldENvbXBvbmVudElkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIG5vIElELCBjcmVhdGUgYSBuZXcgY29tcG9uZW50XG4gICAgICAgICAgICAgICAgeWllbGQgY3JlYXRlVGlja2V0Q29tcG9uZW50U2V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbi8vIFVwZGF0ZXMgdGhlIHRpY2tldCBiYXNlZCBvbiBpdHMgc3RhdHVzXG5mdW5jdGlvbiB1cGRhdGVWYXJpYW50KGluc3RhbmNlLCB0aWNrZXREYXRhKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgbGV0IHRpY2tldFN0YXR1cyA9IGdldFN0YXR1cyh0aWNrZXREYXRhKTtcbiAgICAgICAgLy8gQXNzdXJlIHRoYXQgdGhlIG1haW4gY29tcG9uZW50IGlzIHJlZmVyZW5jZWRcbiAgICAgICAgaWYgKCF0aWNrZXRDb21wb25lbnQpXG4gICAgICAgICAgICB5aWVsZCByZWZlcmVuY2VUaWNrZXRDb21wb25lbnRTZXQoKTtcbiAgICAgICAgLy8gR2V0IHRoZSB2YXJpYW50IGJhc2VkIG9uIHRoZSB0aWNrZXQgc3RhdHVzIGFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnRcbiAgICAgICAgbGV0IG5ld1ZhcmlhbnQgPSB0aWNrZXRDb21wb25lbnQuZmluZENoaWxkKG4gPT4gbi5uYW1lID09PSBDT01QT05FTlRfU0VUX1BST1BFUlRZX05BTUUgKyB0aWNrZXRTdGF0dXMpO1xuICAgICAgICBpZiAoIW5ld1ZhcmlhbnQpIHsgLy8gSWYgdGhlIHN0YXR1cyBkb2Vzbid0IG1hdGNoIGFueSBvZiB0aGUgdmFyaWFudHMsIHVzZSBkZWZhdWx0XG4gICAgICAgICAgICBuZXdWYXJpYW50ID0gdGlja2V0Q29tcG9uZW50LmRlZmF1bHRWYXJpYW50O1xuICAgICAgICAgICAgZmlnbWEubm90aWZ5KFwiU3RhdHVzICdcIiArIHRpY2tldFN0YXR1cyArIFwiJyBub3QgZXhpc3RpbmcuIFlvdSBjYW4gYWRkIGl0IGFzIG5ldyB2YXJpYW50IHRvIHRoZSBtYWluIGNvbXBvbmVudC5cIiwge1xuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDYwMDBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIFVwZGF0ZSB0aXRsZVxuICAgICAgICBsZXQgdGl0bGVUeHQgPSBpbnN0YW5jZS5maW5kT25lKG4gPT4gbi50eXBlID09PSBcIlRFWFRcIiAmJiBuLm5hbWUgPT09IElTU1VFX1RJVExFX05BTUUpO1xuICAgICAgICBpZiAodGl0bGVUeHQpIHtcbiAgICAgICAgICAgIHlpZWxkIGZpZ21hLmxvYWRGb250QXN5bmModGl0bGVUeHQuZm9udE5hbWUpO1xuICAgICAgICAgICAgdGl0bGVUeHQuY2hhcmFjdGVycyA9IGdldFRpdGxlKHRpY2tldERhdGEpO1xuICAgICAgICAgICAgdGl0bGVUeHQuaHlwZXJsaW5rID0geyB0eXBlOiBcIlVSTFwiLCB2YWx1ZTogYGh0dHBzOi8vJHtjb21wYW55X25hbWV9LmF0bGFzc2lhbi5uZXQvYnJvd3NlLyR7dGlja2V0RGF0YS5rZXl9YCB9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZmlnbWEubm90aWZ5KFwiQ291bGQgbm90IGZpbmQgdGV4dCBlbGVtZW50IG5hbWVkICdcIiArIElTU1VFX1RJVExFX05BTUUgKyBcIicuXCIpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFVwZGF0ZSBkYXRlXG4gICAgICAgIGxldCBjaGFuZ2VEYXRlVHh0ID0gaW5zdGFuY2UuZmluZE9uZShuID0+IG4udHlwZSA9PT0gXCJURVhUXCIgJiYgbi5uYW1lID09PSBJU1NVRV9DSEFOR0VfREFURV9OQU1FKTtcbiAgICAgICAgaWYgKGNoYW5nZURhdGVUeHQpIHtcbiAgICAgICAgICAgIHlpZWxkIGZpZ21hLmxvYWRGb250QXN5bmMoY2hhbmdlRGF0ZVR4dC5mb250TmFtZSk7XG4gICAgICAgICAgICAvLyBGaWx0ZXJzIG91dCB0aGUgZGF0YSB0byBhIHNpbXBsZXQgZm9ybWF0IChNbW0gREQgWVlZWSlcbiAgICAgICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoZ2V0Q2hhbmdlRGF0ZSh0aWNrZXREYXRhKS5yZXBsYWNlKC9bVF0rLiovLCBcIlwiKSk7XG4gICAgICAgICAgICBjaGFuZ2VEYXRlVHh0LmNoYXJhY3RlcnMgPSBkYXRlLnRvRGF0ZVN0cmluZygpO1xuICAgICAgICAgICAgLy8gY2hhbmdlRGF0ZVR4dC5jaGFyYWN0ZXJzID0gZGF0ZS50b0RhdGVTdHJpbmcoKS5yZXBsYWNlKC9eKFtBLVphLXpdKikuLyxcIlwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZpZ21hLm5vdGlmeShcIkNvdWxkIG5vdCBmaW5kIHRleHQgZWxlbWVudCBuYW1lZCAnXCIgKyBJU1NVRV9DSEFOR0VfREFURV9OQU1FICsgXCInLlwiKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkRPTkVcIilcbiAgICAgICAgLy8gQWRkIHRoZSByZWxhdW5jaCBidXR0b25cbiAgICAgICAgaW5zdGFuY2Uuc3dhcENvbXBvbmVudChuZXdWYXJpYW50KTtcbiAgICAgICAgaW5zdGFuY2Uuc2V0UmVsYXVuY2hEYXRhKHsgdXBkYXRlOiAnJyB9KTtcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH0pO1xufVxuLy8gRnVuY3Rpb24gZm9yIGxvYWRpbmcgYWxsIHRoZSBuZWVkZWQgZm9udHNcbmNvbnN0IGxvYWRGb250cyA9ICgpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICB5aWVsZCBmaWdtYS5sb2FkRm9udEFzeW5jKEZPTlRfUkVHKTtcbiAgICB5aWVsZCBmaWdtYS5sb2FkRm9udEFzeW5jKEZPTlRfTUVEKTtcbiAgICB5aWVsZCBmaWdtYS5sb2FkRm9udEFzeW5jKEZPTlRfQk9MRCk7XG59KTtcbi8vIEZvcm1hdHMgYSBoZXggdmFsdWUgdG8gUkdCXG5mdW5jdGlvbiBoZXhUb1JnYihoZXgpIHtcbiAgICB2YXIgYmlnaW50ID0gcGFyc2VJbnQoaGV4LCAxNik7XG4gICAgdmFyIHIgPSAoYmlnaW50ID4+IDE2KSAmIDI1NTtcbiAgICB2YXIgZyA9IChiaWdpbnQgPj4gOCkgJiAyNTU7XG4gICAgdmFyIGIgPSBiaWdpbnQgJiAyNTU7XG4gICAgcmV0dXJuIHsgcjogciAvIDI1NSwgZzogZyAvIDI1NSwgYjogYiAvIDI1NSB9O1xufVxuLy8gQ2hlY2tzIGlmIHRoZSByZWNlaXZlZCB0aWNrZXQgZGF0YSBpcyB2YWxpZCBvciB3aGV0aGVyIGFuIGVycm9yIG9jY3VyZWRcbmZ1bmN0aW9uIGNoZWNrVGlja2V0RGF0YVJlcG9uc2UodGlja2V0RGF0YSkge1xuICAgIHZhciBjaGVja2VkRGF0YTtcbiAgICBpZiAodGlja2V0RGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeShcIkNvdWxkIG5vdCBnZXQgZGF0YS4gVGhlcmUgc2VlbXMgdG8gYmUgbm8gY29ubmVjdGlvbiB0byB0aGUgc2VydmVyLlwiKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IGdldCBkYXRhLiBUaGVyZSBzZWVtcyB0byBiZSBubyBjb25uZWN0aW9uIHRvIHRoZSBzZXJ2ZXIuXCIpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aWNrZXREYXRhICYmIHRpY2tldERhdGEua2V5KSB7IC8vIElmIHRoZSBKU09OIGhhcyBhIGtleSBmaWVsZCwgdGhlIGRhdGEgaXMgdmFsaWRcbiAgICAgICAgY2hlY2tlZERhdGEgPSB0aWNrZXREYXRhO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKHRpY2tldERhdGEuZXJyb3JNZXNzYWdlcykge1xuICAgICAgICAgICAgY2hlY2tlZERhdGEgPSBjcmVhdGVFcnJvckRhdGFKU09OKHRpY2tldERhdGEuZXJyb3JNZXNzYWdlc1swXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGlja2V0RGF0YS5tZXNzYWdlKSB7XG4gICAgICAgICAgICBjaGVja2VkRGF0YSA9IGNyZWF0ZUVycm9yRGF0YUpTT04odGlja2V0RGF0YS5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZpZ21hLm5vdGlmeShcIkNvdWxkIG5vdCBnZXQgZGF0YS4gVGhlcmUgc2VlbXMgdG8gYmUgbm8gY29ubmVjdGlvbiB0byB0aGUgc2VydmVyLlwiKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBnZXQgZGF0YS4gVGhlcmUgc2VlbXMgdG8gYmUgbm8gY29ubmVjdGlvbiB0byB0aGUgc2VydmVyLlwiKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2hlY2tlZERhdGE7XG59XG4vLyBDcmVhdGUgYSBlcnJvciB2YXJpYWJsZSB0aGF0IGhhcyB0aGUgc2FtZSBtYWluIGZpZWxkcyBhcyB0aGUgSmlyYSBUaWNrZXQgdmFyaWFibGUuIFxuLy8gVGhpcyB3aWxsIGJlIHVzZWQgdGhlIGZpbGwgdGhlIHRpY2tldCBkYXRhIHdpdGggdGhlIGVycm9yIG1lc3NhZ2UuXG5mdW5jdGlvbiBjcmVhdGVFcnJvckRhdGFKU09OKG1lc3NhZ2UpIHtcbiAgICB2YXIgdG9kYXkgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgdmFyIGVycm9yRGF0YSA9IHtcbiAgICAgICAgXCJrZXlcIjogXCJFUlJPUlwiLFxuICAgICAgICBcImZpZWxkc1wiOiB7XG4gICAgICAgICAgICBcInN1bW1hcnlcIjogbWVzc2FnZSxcbiAgICAgICAgICAgIFwic3RhdHVzXCI6IHtcbiAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJFcnJvclwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJzdGF0dXNjYXRlZ29yeWNoYW5nZWRhdGVcIjogdG9kYXlcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGVycm9yRGF0YTtcbn1cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0ge307XG5fX3dlYnBhY2tfbW9kdWxlc19fW1wiLi9zcmMvY29kZS50c1wiXSgpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9