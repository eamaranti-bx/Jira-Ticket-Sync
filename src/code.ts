
const DOCUMENT_NODE = figma.currentPage.parent

// Set the relaunch button for the whole document
if (!DOCUMENT_NODE.getRelaunchData().update_all) {
  DOCUMENT_NODE.setRelaunchData({ update_all: 'Update all Jira tickets on this page.' })
}

const COMPANY_NAME = "lukasbittner"

const FONT_REG = { family: "Work Sans", style: "Regular" }
const FONT_MED = { family: "Work Sans", style: "Medium" }
const FONT_BOLD = { family: "Work Sans", style: "Bold" }

function getStatus(data) { return data.fields.status.name }
function getTitle(data) { return data.fields.summary }
function getIssueId(data) { return data.key }
function getChangeDate(data) { return data.fields.statuscategorychangedate }

// ticketdata.fields.assignee.displayName
// ticketdata.fields.assignee.avatarUrls
// ticketdata.fields.status.name
// ticketdata.fields.status.statusCategory.name
// ticketdata.fields.statuscategorychangedate

const ISSUE_ID_NAME = "Ticket ID"
const ISSUE_TITLE_NAME = "Ticket Title"
const ISSUE_CHANGE_DATE_NAME = "Status Change Date"

var ticketComponent
const COMPONENT_SET_NAME = "Jira Ticket Header"
const COMPONENT_SET_PROPERTY_NAME = "Status="
const VARIANT_NAME_1 = "To Do"
const VARIANT_COLOR_1 = hexToRgb('EEEEEE')
const VARIANT_NAME_2 = "Concepting"
const VARIANT_COLOR_2 = hexToRgb('FFEDC0')
const VARIANT_NAME_3 = "Design"
const VARIANT_COLOR_3 = hexToRgb('D7E0FF')
const VARIANT_NAME_4 = "Testing"
const VARIANT_COLOR_4 = hexToRgb('D7E0FF')
const VARIANT_NAME_DONE = "Launch"
const VARIANT_COLOR_DONE = hexToRgb('D3FFD2')
const VARIANT_NAME_DEFAULT = "Default"
const VARIANT_COLOR_DEFAULT = hexToRgb('B9B9B9')
const VARIANT_NAME_ERROR = "Error"
const VARIANT_COLOR_ERROR = hexToRgb('FFD9D9')


// Functions run by the plugin button (relaunch)
if (figma.command === 'update') {
  figma.showUI(__html__, { visible: false })
  updateSelection()
} else if (figma.command === 'update_all') {
  figma.showUI(__html__, { visible: false })
  var hasFailed = updateAll()
  console.log(hasFailed)
  if(hasFailed){
    figma.closePlugin()
  }
} else {
  figma.showUI(__html__, { width: 300, height: 350 });
}



// All the functions that can be started from the UI
figma.ui.onmessage = async (msg) => {
  // Called to create a new main component and save its ID
  if (msg.type === 'create-component') {
    await createTicketComponentSet()
    DOCUMENT_NODE.setPluginData('ticketComponentID', ticketComponent.id)
  }

  // Called to create a new instance of a component (based on the issueId entered in the UI)
  if (msg.type === 'create-new-ticket') {
    await referenceTicketComponentSet()
    await createTicketInstance(msg.data[0])
  }

  // Called to get all Jira Ticker Header instances and updates them one by one. 
  if (msg.type === 'update-all') {
    updateAll()
  }

  // Called to get selected Jira Ticker Header instances and updates them one by one. 
  if (msg.type === 'update-selected') {
    updateSelection()
  }

  // Updates instances based on the received ticket data.
  if (msg.type === 'ticketDataSent') {
    var nodeIds = msg.nodeIds
    var numberOfNodes = nodeIds.length
    var numberOfSuccesses = 0
    // console.log(nodeIds, msg.data)

    for (let i = 0; i < numberOfNodes; i++) {
      const id = nodeIds[i];
      let ticketData = checkTicketDataReponse(msg.data[i])
      let node = figma.getNodeById(id) as InstanceNode
      // console.log(`Updating node ${i}.`, node, ticketData)
      console.log("HERE", ticketData)
      if (ticketData.key !== 'ERROR') numberOfSuccesses += 1
      await updateVariant(node, ticketData)
    }

    // Success message
    var message: string
    if (numberOfSuccesses == 0) {
      message = `Update failed.`
    } else if (numberOfSuccesses < numberOfNodes) {
      message = `${numberOfSuccesses} of ${numberOfNodes} successfully updated. ${numberOfNodes - numberOfSuccesses} update(s) failed. `
    } else {
      message = `${numberOfSuccesses} of ${numberOfNodes} header(s) updated!`
    }

    // If called via the relaunch button, close plugin after updating the tickets
    if (figma.command === 'update' || figma.command === 'update_all') {
      figma.closePlugin(message)
    } else {
      figma.notify(message)
    }
  }

}

// Get all elements on page and start update process
function updateAll() {
  const nodes = figma.currentPage.findAllWithCriteria({
    types: ['INSTANCE']
  })
  const nodesFiltered = nodes.filter(node => node.name === COMPONENT_SET_NAME);
  if(nodesFiltered.length == 0){
    figma.notify(`No instances named '${COMPONENT_SET_NAME}' found on this page.`)
    let isFailed = true
    return isFailed
  } else {
    getDataForMultiple(nodesFiltered)
  }
}

// Get selection and start update process
function updateSelection() {
  let selection = figma.currentPage.selection
  if(selection.length == 0){
    figma.notify(`Nothing selected.`)
  } else {
    getDataForMultiple(selection)
  }
}



async function getDataForMultiple(instances) {
  // var nodeIds = instances.map(function (node) { return node.id })
  var nodeIds = []
  var issueIds = []
  for (let i = 0; i < instances.length; i++) {
    const node = instances[i]
    if (node.type !== "INSTANCE") {
      figma.notify("The element needs to be an instance of " + COMPONENT_SET_NAME)
    } else {
      let issueIdNode = node.findOne(n => n.type === "TEXT" && n.name === ISSUE_ID_NAME) as TextNode
      if (!issueIdNode) {
        figma.notify(`At least one instance is missing the text element '${ISSUE_ID_NAME}'. Could not update.`)
      } else {
        console.log(issueIdNode)
        issueIds.push(issueIdNode.characters)
        nodeIds.push(node.id)
      }
    }
  }
  figma.ui.postMessage({ nodeIds: nodeIds, issueIds: issueIds, type: 'getTicketData' })
}


// Create instances of the main ticket component and replaces the content with data of the actual Jira ticket
async function createTicketInstance(ticketData) {
  // Create an instance and update it to the correct status
  let ticketVariant = ticketComponent.defaultVariant
  let ticketInstance = ticketVariant.createInstance()
  ticketData = checkTicketDataReponse(ticketData)
  ticketInstance = await updateVariant(ticketInstance, ticketData)

  // Update ID
  let issueIDTxt = ticketInstance.findOne(n => n.type === "TEXT" && n.name === ISSUE_ID_NAME) as TextNode
  if (issueIDTxt) {
    // Add header
    await figma.loadFontAsync(issueIDTxt.fontName as FontName)
    issueIDTxt.characters = getIssueId(ticketData)
  } else {
    figma.notify("Could not find text element named '" + ISSUE_ID_NAME + "'.")
  }

  ticketInstance.x = figma.viewport.center.x
  ticketInstance.y = figma.viewport.center.y
  figma.currentPage.selection = [ticketInstance]
}

// Creates a new component that represent a ticket
async function createTicketVariant(statusColor: { r: any, g: any, b: any }, statusName: string) {
  // Create the main frame
  var ticketVariant = figma.createComponent()
  let padding = 24
  ticketVariant.name = statusName
  ticketVariant.layoutMode = "VERTICAL"
  ticketVariant.resize(600, 200)
  ticketVariant.counterAxisSizingMode = "FIXED"
  ticketVariant.primaryAxisSizingMode = "AUTO"
  ticketVariant.paddingTop = padding
  ticketVariant.paddingRight = padding
  ticketVariant.paddingBottom = padding
  ticketVariant.paddingLeft = padding
  ticketVariant.itemSpacing = 16
  ticketVariant.cornerRadius = 4
  ticketVariant.fills = [{ type: 'SOLID', color: statusColor }]

  // Create the header frame
  var headerFrame = figma.createFrame()
  headerFrame.name = "Header"
  headerFrame.layoutMode = "HORIZONTAL"
  headerFrame.counterAxisSizingMode = "AUTO"
  // headerFrame.primaryAxisSizingMode = "AUTO"
  headerFrame.layoutAlign = "STRETCH"
  headerFrame.itemSpacing = 40
  headerFrame.fills = []

  loadFonts().then(() => {
    // Add the ticket text fields
    const titleTxt = figma.createText()
    titleTxt.fontName = FONT_REG
    titleTxt.fontSize = 32
    titleTxt.textDecoration = "UNDERLINE"
    titleTxt.autoRename = false
    titleTxt.characters = "Ticket title"
    titleTxt.name = ISSUE_TITLE_NAME

    const issueIdTxt = figma.createText()
    issueIdTxt.fontName = FONT_MED
    issueIdTxt.fontSize = 32
    issueIdTxt.autoRename = false
    issueIdTxt.characters = "ID-1"
    issueIdTxt.name = ISSUE_ID_NAME

    const changeDateTxt = figma.createText()
    changeDateTxt.fontName = FONT_REG
    changeDateTxt.fontSize = 24
    changeDateTxt.autoRename = false
    changeDateTxt.characters = "MM DD YYYY"
    changeDateTxt.name = ISSUE_CHANGE_DATE_NAME

    ticketVariant.appendChild(headerFrame)
    ticketVariant.appendChild(changeDateTxt)
    headerFrame.appendChild(issueIdTxt)
    headerFrame.appendChild(titleTxt)

    titleTxt.layoutGrow = 1
  }).catch(() => {
    figma.notify("Font '" + FONT_REG.family + "' could not be loaded. Please install the font.")
  })

  // Fixes a weird bug in which the 'stretch' doesnt work properly
  headerFrame.primaryAxisSizingMode = "FIXED"
  headerFrame.layoutAlign = "STRETCH"

  // Make sure the new text node is visible where we're currently looking
  ticketVariant.x = figma.viewport.center.x
  ticketVariant.y = figma.viewport.center.y

  return ticketVariant
}

async function createTicketComponentSet() {
  // Create four variants (one for each status)
  let varDefault = await createTicketVariant(VARIANT_COLOR_DEFAULT, COMPONENT_SET_PROPERTY_NAME + VARIANT_NAME_DEFAULT)
  let var1 = await createTicketVariant(VARIANT_COLOR_1, COMPONENT_SET_PROPERTY_NAME + VARIANT_NAME_1)
  let var2 = await createTicketVariant(VARIANT_COLOR_2, COMPONENT_SET_PROPERTY_NAME + VARIANT_NAME_2)
  let var3 = await createTicketVariant(VARIANT_COLOR_3, COMPONENT_SET_PROPERTY_NAME + VARIANT_NAME_3)
  let var4 = await createTicketVariant(VARIANT_COLOR_4, COMPONENT_SET_PROPERTY_NAME + VARIANT_NAME_4)
  let var5 = await createTicketVariant(VARIANT_COLOR_DONE, COMPONENT_SET_PROPERTY_NAME + VARIANT_NAME_DONE)
  let varError = await createTicketVariant(VARIANT_COLOR_ERROR, COMPONENT_SET_PROPERTY_NAME + VARIANT_NAME_ERROR)
  const variants = [varDefault, var1, var2, var3, var4, var5, varError]

  // Create a component out of all these variants
  ticketComponent = figma.combineAsVariants(variants, figma.currentPage)
  let padding = 16
  ticketComponent.name = COMPONENT_SET_NAME
  ticketComponent.layoutMode = "VERTICAL"
  ticketComponent.counterAxisSizingMode = "AUTO"
  ticketComponent.primaryAxisSizingMode = "AUTO"
  ticketComponent.paddingTop = padding
  ticketComponent.paddingRight = padding
  ticketComponent.paddingBottom = padding
  ticketComponent.paddingLeft = padding
  ticketComponent.itemSpacing = 24
  ticketComponent.cornerRadius = 4

  // Save component ID for later reference
  DOCUMENT_NODE.setPluginData('ticketComponentID', ticketComponent.id)
}

// Create a ticket component or gets the reference to the existing one
async function referenceTicketComponentSet() {
  // Check if the ticket component is already saved in the variable
  if (!ticketComponent) {
    // If no, try the get the ticket component by its ID
    var ticketComponentId = DOCUMENT_NODE.getPluginData('ticketComponentID')
    if (ticketComponentId) {
      // If there is an ID saved, access the ticket component
      ticketComponent = figma.getNodeById(ticketComponentId)
    } else {
      // If there is no ID, create a new component
      await createTicketComponentSet();
    }
  }
}

// Updates the ticket based on its status
async function updateVariant(instance: InstanceNode, ticketData) {

  let ticketStatus = getStatus(ticketData)

  // Assure that the main component is referenced
  if (!ticketComponent) await referenceTicketComponentSet()

  // Get the variant based on the ticket status and swap it with the current
  let newVariant = ticketComponent.findChild(n => n.name === COMPONENT_SET_PROPERTY_NAME + ticketStatus)
  if (!newVariant) { // If the status doesn't match any of the variants, use default
    newVariant = ticketComponent.defaultVariant
    figma.notify("Status '" + ticketStatus + "' not existing. You can add it as new variant to the main component.", {
      timeout: 6000
    })
  }

  // Update title
  let titleTxt = instance.findOne(n => n.type === "TEXT" && n.name === ISSUE_TITLE_NAME) as TextNode
  if (titleTxt) {
    await figma.loadFontAsync(titleTxt.fontName as FontName)
    titleTxt.characters = getTitle(ticketData)
    titleTxt.hyperlink = { type: "URL", value: `https://${COMPANY_NAME}.atlassian.net/browse/${ticketData.key}` }
  } else {
    figma.notify("Could not find text element named '" + ISSUE_TITLE_NAME + "'.")
  }

  // Update date
  let changeDateTxt = instance.findOne(n => n.type === "TEXT" && n.name === ISSUE_CHANGE_DATE_NAME) as TextNode
  if (changeDateTxt) {
    await figma.loadFontAsync(changeDateTxt.fontName as FontName)

    // Filters out the data to a simplet format (Mmm DD YYYY)
    var date = new Date(getChangeDate(ticketData).replace(/[T]+.*/, ""))
    changeDateTxt.characters = date.toDateString();
    // changeDateTxt.characters = date.toDateString().replace(/^([A-Za-z]*)./,"");
  } else {
    figma.notify("Could not find text element named '" + ISSUE_CHANGE_DATE_NAME + "'.")
  }

  // console.log("DONE")

  // Add the relaunch button
  instance.swapComponent(newVariant)
  instance.setRelaunchData({ update: '' })

  return instance
}

// Function for loading all the needed fonts
const loadFonts = async () => {

  await figma.loadFontAsync(FONT_REG)
  await figma.loadFontAsync(FONT_MED)
  await figma.loadFontAsync(FONT_BOLD)

}

// Formats a hex value to RGB
function hexToRgb(hex) {

  var bigint = parseInt(hex, 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;

  return { r: r / 255, g: g / 255, b: b / 255 }
}

// Checks if the received ticket data is valid or whether an error occured
function checkTicketDataReponse(ticketData: any) {
  var checkedData;
  if (ticketData === undefined) {
    figma.notify("Could not get data. There seems to be no connection to the server.")
    throw new Error("Could not get data. There seems to be no connection to the server.")
  }
  else if (ticketData && ticketData.key) { // If the JSON has a key field, the data is valid
    checkedData = ticketData
  } else {
    if (ticketData.errorMessages) {
      checkedData = createErrorDataJSON(ticketData.errorMessages[0])
    } else if (ticketData.message) {
      checkedData = createErrorDataJSON(ticketData.message)
    } else {
      figma.notify("Could not get data. There seems to be no connection to the server.")
      throw new Error("Could not get data. There seems to be no connection to the server.")
    }
  }
  return checkedData
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
  }
  return errorData
}




