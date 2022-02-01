import * as React from 'react'
import { useState, useEffect, useRef } from 'react'
import * as ReactDOM from 'react-dom'
import './ui.css'

import { Disclosure, Tip, Title, Checkbox, Button, Input } from "react-figma-plugin-ds"
import "react-figma-plugin-ds/figma-plugin-ds.css";
import { getTicketDataFromJira } from './fetch-data'

import { Buffer } from 'buffer';

declare function require(path: string): any

function App() {
  const [company_name, setCompanyName] = useState()
  const [username, setUsername] = useState()
  const [password, setPassword] = useState()
  const [issueId, setIssueId] = useState()

  // const issueIdTextbox: HTMLInputElement
  // const companyNameTextbox: HTMLInputElement
  // usernameTextbox: HTMLInputElement
  // passwordTextbox: HTMLInputElement
  // const usernameRef = useRef()

  // useEffect(() => {
  //   // const storedUsername = figma.clientStorage.getAsync(username)
  //   // if (storedUsername) setUsername(storedUsername)
  //   console.log("EFFECT", username)
  //   setUsername(username)
  // }, [ username ])



  window.onmessage = async (event) => {

    if (event.data.pluginMessage.type === 'getTicketData') {
      console.log("Fetch data!")
      // Fetch data and send to sandbox
      var issueIds = event.data.pluginMessage.issueIds
      var nodeIds = event.data.pluginMessage.nodeIds
      // console.log(issueIds, nodeIds)
      const username = 'bittner.lukas@gmail.com'
      const password = 'adcGusBdCLgLYQsrtJBf1ACB'
      const companyName = 'lukasbittner'
      let basicAuth: string = Buffer.from(username + ':' + password).toString('base64')
      var ticketDataArray = await getTicketDataFromJira(issueIds, basicAuth, companyName)
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
    }
  }



  // const usernameRef = (element: HTMLInputElement) => {
  //   if (element) element.value = 'bittner.lukas@gmail.com'
  //   this.usernameTextbox = element
  // }


  const onCreateTicket = async () => {
    const basicAuth = Buffer.from(username + ':' + password).toString('base64')

    // Fetch data and send to sandbox
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

  const onInputFieldChanged = (event, key) => {
    console.log("Input field changed:", event, key)
    parent.postMessage({ pluginMessage: { type: 'authorization-detail-changed', key: key, data: event  } }, '*')
  }


    return <div>
      {/* <img src={require('./logo.svg')} /> */}
      {/* <h2>Jira Ticket Status</h2> */}

      <Input className="" id="" defaultValue={company_name} placeholder="Company name" onChange={(input) => onInputFieldChanged(input, "COMPANY_NAME")}/>
      <Input className="" id=""  defaultValue={username} placeholder="Username" onChange={(input) => onInputFieldChanged(input, "USERNAME")}/>
      <Input className="" id=""  defaultValue={password} placeholder="API token" onChange={(input) => onInputFieldChanged(input, "PASSWORD")}/>
      <Input className="" id=""  defaultValue={issueId} placeholder="Issue ID" onChange={(input) => onInputFieldChanged(input, "ISSUE_ID")}/>
      {/* <p>Jira API Token: <input ref={passwordRef} /></p>
      <p>Issue ID: <input ref={issueIdRef} /></p> */}
      <Button className="" id="create-new-ticket" onClick={onCreateTicket}>Create new</Button><br/>
      <Button className="" isSecondary id="update-selected" onClick={onUpdateSelected}>Update</Button><br/>
      <Button className="" isSecondary id="update-all" onClick={onUpdateAll}>Update All</Button><br/>
      <Button className="" isSecondary id="create-component" onClick={onCreateComponent}>Create Component</Button>
    </div>
  
}






ReactDOM.render(<App />, document.getElementById('react-page'))
