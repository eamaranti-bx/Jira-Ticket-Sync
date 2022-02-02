import * as React from 'react'
import { useState, useRef } from 'react'
import * as ReactDOM from 'react-dom'
import './ui.css'

import { Icon, Text, Title, Label, Button, Input, Tip } from "react-figma-plugin-ds"
import "react-figma-plugin-ds/figma-plugin-ds.css";
import { getTicketDataFromJira } from './fetch-data'

import { Buffer } from 'buffer';

declare function require(path: string): any

const ISSUE_ID_KEY = "ISSUE_ID"
const COMPANY_NAME_KEY = "COMPANY_NAME"
const USERNAME_KEY = "USERNAME"
const PASSWORD_KEY = "PASSWORD"

function App() {
  const [companyName, setCompanyName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [issueId, setIssueId] = useState("")

  const [companyNameError, setCompanyNameError] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [issueIdError, setIssueIdError] = useState("")

  const [showAuth, setShowAuth] = useState(true)
  const [showAuthForOnboarding, setShowAuthForOnboarding] = useState(true)
  const [showInput, setShowInput] = useState(false)

  const companyNameInput = useRef(null)
  const usernameInput = useRef(null)
  const passwordInput = useRef(null)

  window.onmessage = async (event) => {

    // Fetches tickeet data and sends it to sandbox
    if (event.data.pluginMessage.type === 'getTicketData') {
      var issueIds = event.data.pluginMessage.issueIds
      var nodeIds = event.data.pluginMessage.nodeIds

      let basicAuth: string = Buffer.from(username + ':' + password).toString('base64')
      var ticketDataArray = await getTicketDataFromJira(issueIds, basicAuth, companyName)
      parent.postMessage({ pluginMessage: { issueIds: issueIds, nodeIds: nodeIds, data: ticketDataArray, type: 'ticketDataSent' } }, '*')
    }

    // Fills the authorization variables with the data stored in the sandbox (clientStorage)
    if (event.data.pluginMessage.type === 'setAuthorizationVariables') {
      let company_name = event.data.pluginMessage.company_name
      let username = event.data.pluginMessage.username
      let password = event.data.pluginMessage.password
      let issueId = event.data.pluginMessage.issueId

      setCompanyName(company_name)
      setUsername(username)
      setPassword(password)
      setIssueId(issueId.replace(/[1-9]*$/,""))

      var notAllAuthDataEntered = company_name === "" || username === "" || password === ""
      setShowAuth(notAllAuthDataEntered)
      setShowAuthForOnboarding(notAllAuthDataEntered)
      parent.postMessage({ pluginMessage: { type: 'resize-ui', big_size: notAllAuthDataEntered } }, '*')

    }
  }

  // Fetches ticket data and calls sandbox to add a new ticket with that data
  const onCreateTicket = async () => {
    if (issueId === "") {
      setIssueIdError("Please enter a ticket ID.")
    } else {
      setIssueIdError("")
      const basicAuth = Buffer.from(username + ':' + password).toString('base64')
      var ticketDataArray = await getTicketDataFromJira([issueId], basicAuth, companyName)
      console.log("Array", ticketDataArray)
      parent.postMessage({ pluginMessage: { type: 'create-new-ticket', data: ticketDataArray, issueId: issueId } }, '*')
      console.log(issueId.replace(/[1-9]*$/,""))
      setIssueId(issueId.replace(/[1-9]*$/,""))
    }
  }

  // Start the process to update all selected ticket headers
  const onUpdateSelected = () => {
    parent.postMessage({ pluginMessage: { type: 'update-selected' } }, '*')
  }

  // Start the process to update all ticket headers on page
  const onUpdateAll = () => {
    parent.postMessage({ pluginMessage: { type: 'update-all' } }, '*')
  }

  // Creates a new main component (used for development purposes)
  const onCreateComponent = () => {
    parent.postMessage({ pluginMessage: { type: 'create-component' } }, '*')
  }

  // Change the view beetween the main view and the authorization view
  const switchView = () => {
    setShowAuth(!showAuth)
    parent.postMessage({ pluginMessage: { type: 'resize-ui', big_size: !showAuth } }, '*')
    setCompanyNameError("")
    setUsernameError("")
    setPasswordError("")
  }

  // Toggles the password field between show/hide password
  const switchShowInput = () => {
    setShowInput(!showInput)
  }

  // Saves the current field input in the sandbox
  const onInputFieldChanged = (value, key) => {
    console.log(key, value)
    if (key === ISSUE_ID_KEY) setIssueId(value)
    // else if (key === COMPANY_NAME_KEY) setCompanyName(value)
    // else if (key === USERNAME_KEY) setUsername(value)
    // else if (key === PASSWORD_KEY) setPassword(value)
    parent.postMessage({ pluginMessage: { type: 'authorization-detail-changed', key: key, data: value } }, '*')
  }

  // Saves the authorization details in the sandbox
  const onSaveAuthDetails = () => {
    var companyName = companyNameInput.current.value
    var username = usernameInput.current.value
    var password = passwordInput.current.value

    setCompanyNameError("")
    setUsernameError("")
    setPasswordError("")

    var allCredentialsProvided = true
    if (companyName === "") {
      console.log(1)
      setCompanyNameError("Please enter a company name.")
      allCredentialsProvided = false
    }
    if (username === "") {
      console.log(2)
      setUsernameError("Please enter a username.")
      allCredentialsProvided = false
    }
    if (password === "") {
      console.log(3)
      setPasswordError("Please enter an API token.")
      allCredentialsProvided = false
    }

    if (allCredentialsProvided) {
      setCompanyName(companyName)
      setUsername(username)
      setPassword(password)

      parent.postMessage({ pluginMessage: { type: 'create-visual-bell', message: "Changes saved." } }, '*')
      parent.postMessage({ pluginMessage: { type: 'authorization-detail-changed', key: COMPANY_NAME_KEY, data: companyName } }, '*')
      parent.postMessage({ pluginMessage: { type: 'authorization-detail-changed', key: USERNAME_KEY, data: username } }, '*')
      parent.postMessage({ pluginMessage: { type: 'authorization-detail-changed', key: PASSWORD_KEY, data: password } }, '*')

      setShowAuthForOnboarding(false)
      switchView()
    }
  }

  // Hit enter to create a new ticket
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onCreateTicket()
    }
  }

  // UI - changes between authorisation view and main view
  return <>
    {showAuth ?
      // Authorization view
      <div className='vertical padding-small'>
        <div className='section-title-with-icon'>
          {/* {!showAuthForOnboarding && <Icon color="black8" name="back" onClick={switchView} />} */}
          <Title level="h2" size="" weight="bold">Authorization</Title>
        </div>
        <div className='tip'>
          {showAuthForOnboarding && <Tip>Please enter your Jira credentials to get all setup and running.</Tip>}
        </div>
        <div className='row'>
          <div>
            <Text>Company Name</Text>
            <div className="input">
              <input ref={companyNameInput} type="input" className="input__field" defaultValue={companyName} placeholder="e.g. parkside-interactive" />
            </div>
            {/* <Input defaultValue={company_name} placeholder="e.g. parkside-interactive" onChange={(input) => onInputFieldChanged(input, COMPANY_NAME_KEY)} /> */}
            {companyNameError.length > 0 &&
              <Text className="error-text">{companyNameError}</Text>
            }
            <Label>www.<b>company-name</b>.atlassian.net</Label>
          </div>
        </div>
        <div className='row'>
          <div>
            <Text>E-Mail</Text>
            <div className="input">
              <input ref={usernameInput} type="input" className="input__field" defaultValue={username} placeholder="e.g. jeff@google.com" />
            </div>
            {/* <Input defaultValue={username} placeholder="e.g. jeff@google.com" onChange={(input) => onInputFieldChanged(input, USERNAME_KEY)} /> */}
            {usernameError.length > 0 &&
              <Text className="error-text">{usernameError}</Text>
            }
            <Label>The e-mail you use for Jira.</Label>
          </div>
        </div>
        <div className='row'>
          <div>
            <Text>Jira API Token</Text>
            <div className='horizontal'>
              <div className="input">
                <input ref={passwordInput} type={showInput ? 'text' : 'password'} className="input__field stretch" defaultValue={password} placeholder="e.g. A90SjdsS8MKLASsa9767" />
              </div>
              {/* <Input className='stretch' type={showInput ? 'text' : 'password'} name="password" defaultValue={password} placeholder="API token" onChange={(input) => onInputFieldChanged(input, PASSWORD_KEY)} /> */}
              {showInput ?
                <Icon color="black8" name="visible" onClick={switchShowInput} />
                : <Icon color="black8" name="hidden" onClick={switchShowInput} />}
            </div>
            {passwordError.length > 0 &&
              <Text className="error-text">{passwordError}</Text>
            }
            <Button isTertiary onClick={function _() { window.open("https://id.atlassian.com/manage-profile/security/api-tokens", "_blank") }}>Create API token here.</Button>
          </div>
        </div>
        <div className='horizontal align-right padding-small'>
          {showAuthForOnboarding && <Button className="" id="create-component" onClick={function _() { onSaveAuthDetails() }}>Next</Button>}
          {!showAuthForOnboarding && <Button className="" isSecondary id="create-component" onClick={function _() { switchView() }}>Discard</Button>}
          {!showAuthForOnboarding && <Button className="" id="create-component" onClick={function _() { onSaveAuthDetails() }}>Save</Button>}
        </div>
      </div>
      :
      // Main view
      <div>
        <div className='vertical padding-small divider'>
          <div className='section-title-with-icon'>
            <Title level="h2" size="" weight="bold">Add</Title>
            <Icon color="black8" name="adjust" onClick={function _() { switchView() }} />
          </div>
          <div className='horizontal padding-small'>
            <div>
              <div className="input">
                <input type="input" className="input__field" value={issueId} placeholder="Ticket ID (e.g. PR-3)"
                  onKeyDown={handleKeyDown} onChange={(event) => { onInputFieldChanged(event.target.value, ISSUE_ID_KEY) }} />
              </div>
              {/* <Input className="" id="" defaultValue={issueId} placeholder="Ticket ID (e.g. PR-3)" onChange={(input) => onInputFieldChanged(input, ISSUE_ID_KEY)} /> */}
              {issueIdError.length > 0 &&
                <Text className="error-text">{issueIdError}</Text>
              }
            </div>
            <Button className="" id="create-new-ticket" onClick={onCreateTicket}>Add Ticket</Button>
          </div>
        </div>
        <div className='vertical padding-small'>
          <Title level="h2" size="" weight="bold">Update</Title>
          <div className='horizontal padding-small'>
            <Button className="" isSecondary id="update-selected" onClick={onUpdateSelected}>Update Selected</Button>
            <Button className="" isSecondary id="update-all" onClick={onUpdateAll}>Update All</Button>
          </div>
        </div>
      </div>
    }
  </>
}


ReactDOM.render(<App />, document.getElementById('react-page'))

