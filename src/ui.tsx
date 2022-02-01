import * as React from 'react'
import { useState, useEffect, useRef } from 'react'
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
  const [company_name, setCompanyName] = useState()
  const [username, setUsername] = useState()
  const [password, setPassword] = useState()
  const [issueId, setIssueId] = useState()
  const [showAuth, setShowAuth] = useState(true)
  const [showAuthForOnboarding, setShowAuthForOnboarding] = useState(true)


  window.onmessage = async (event) => {

    if (event.data.pluginMessage.type === 'getTicketData') {
      console.log("Fetch data!")
      // Fetch data and send to sandbox
      var issueIds = event.data.pluginMessage.issueIds
      var nodeIds = event.data.pluginMessage.nodeIds

      let basicAuth: string = Buffer.from(username + ':' + password).toString('base64')
      var ticketDataArray = await getTicketDataFromJira(issueIds, basicAuth, company_name)
      parent.postMessage({ pluginMessage: { nodeIds: nodeIds, data: ticketDataArray, type: 'ticketDataSent' } }, '*')
    }

    if (event.data.pluginMessage.type === 'setUsername') {
      let company_name = event.data.pluginMessage.company_name
      let username = event.data.pluginMessage.username
      let password = event.data.pluginMessage.password
      let issueId = event.data.pluginMessage.issueId

      console.log("Received by UI", company_name, username, password, issueId)
      // console.log(usernameRef)
      // usernameRef.current.defaultValue = name
      setCompanyName(company_name)
      setUsername(username)
      setPassword(password)
      setIssueId(issueId)

      var notAllAuthDataEntered = company_name === "" || username === "" || password === ""
      setShowAuth(notAllAuthDataEntered)
      setShowAuthForOnboarding(notAllAuthDataEntered)
      parent.postMessage({ pluginMessage: { type: 'resize-ui', big_size: notAllAuthDataEntered } }, '*')

    }
  }



  // const usernameRef = (element: HTMLInputElement) => {
  //   if (element) element.value = 'bittner.lukas@gmail.com'
  //   this.usernameTextbox = element
  // }


  const onCreateTicket = async () => {

    const basicAuth = Buffer.from(username + ':' + password).toString('base64')
    // Fetch data and send to sandbox
    console.log("Issue id", issueId)
    var ticketDataArray = await getTicketDataFromJira([issueId], basicAuth, company_name)
    console.log("Array", ticketDataArray)
    parent.postMessage({ pluginMessage: { type: 'create-new-ticket', data: ticketDataArray } }, '*')
  }

  const onUpdateSelected = () => {
    parent.postMessage({ pluginMessage: { type: 'update-selected' } }, '*')
  }

  const onUpdateAll = () => {
    parent.postMessage({ pluginMessage: { type: 'update-all' } }, '*')
  }

  const onCreateComponent = () => {
    parent.postMessage({ pluginMessage: { type: 'create-component' } }, '*')
  }

  const switchView = () => {
    setShowAuth(!showAuth)
    parent.postMessage({ pluginMessage: { type: 'resize-ui', big_size: !showAuth } }, '*')
  }

  const onInputFieldChanged = (value, key) => {
    console.log("Input field changed:", value, key)
    if (key === ISSUE_ID_KEY) setIssueId(value)
    else if (key === COMPANY_NAME_KEY) setCompanyName(value)
    else if (key === USERNAME_KEY) setUsername(value)
    else if (key === PASSWORD_KEY) setPassword(value)
    parent.postMessage({ pluginMessage: { type: 'authorization-detail-changed', key: key, data: value } }, '*')
  }

  return <>
    {showAuth ?
      <div className='vertical'>
        <div className='section-title-with-icon'>
          {!showAuthForOnboarding && <Icon className="" color="black8" name="back" onClick={switchView} />}
          <Title level="h2" size="" weight="bold">Authorization</Title>
        </div>
        <div className='tip'>
          {showAuthForOnboarding && <Tip>Please enter your Jira credentials to get all setup and running.</Tip>}
        </div>
        <div className='row'>
          <div>
            <Text className="" size="" weight="">Company Name</Text>
            <Input className="" id="" defaultValue={company_name} placeholder="e.g. parkside-interactive" onChange={(input) => onInputFieldChanged(input, COMPANY_NAME_KEY)} />
            <Label className="" size="">www.<b>company-name</b>.atlassian.net</Label>
          </div>
        </div>
        <div className='row'>
          <div>
            <Text className="" size="" weight="">E-Mail</Text>
            {/* <Label className="" size="">E-Mail</Label> */}
            <Input className="" id="" defaultValue={username} placeholder="Username" onChange={(input) => onInputFieldChanged(input, USERNAME_KEY)} />
            <Label className="" size="">The e-mail you use for Jira.</Label>
          </div>
        </div>
        <div className='row'>
          <div>
            <Text className="" size="" weight="">Jira API Token</Text>
            {/* <Label className="" size="">Jira API Token</Label> */}
            <Input className="" id="" defaultValue={password} placeholder="API token" onChange={(input) => onInputFieldChanged(input, PASSWORD_KEY)} />
            <Button className="" isTertiary onClick={function _() { window.open("https://id.atlassian.com/manage-profile/security/api-tokens", "_blank") }}>Get API token here.</Button>
          </div>
        </div>
        <div className='row align-right'>
          {showAuthForOnboarding && <Button className="" id="create-component" onClick={function _() { switchView(); setShowAuthForOnboarding(false); }}>Next</Button>}
        </div>
      </div>
      :
      <div>
        {/* <img src={require('./logo.svg')} /> */}
        {/* <h2>Jira Ticket Status</h2> */}
        {/* <Button className="" id="create-new-ticket" onClick={switchView}>Switch</Button> */}
        <div className='vertical divider'>
          <div className='section-title-with-icon'>
            <Title level="h2" size="" weight="bold">Add</Title>
            <Icon color="black8" name="adjust" onClick={function _() { switchView() }} />
          </div>
          <div className='horizontal'>
            <Input className="" id="" iconColor="blue" defaultValue={issueId} placeholder="Issue ID" onChange={(input) => onInputFieldChanged(input, ISSUE_ID_KEY)} />
            <Button className="" id="create-new-ticket" onClick={onCreateTicket}>Add Ticket</Button>
          </div>
        </div>
        <div className='vertical'>
          <Title level="h2" size="" weight="bold">Update</Title>
          <div className='horizontal'>
            <Button className="" isSecondary id="update-selected" onClick={onUpdateSelected}>Update Selected</Button>
            <Button className="" isSecondary id="update-all" onClick={onUpdateAll}>Update All</Button>
          </div>
        </div>
      </div>
    }
  </>
}






ReactDOM.render(<App />, document.getElementById('react-page'))

