import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './ui.css'
import { Disclosure, Tip, Title, Checkbox, Button } from "react-figma-plugin-ds";
import "react-figma-plugin-ds/figma-plugin-ds.css";


import { getTicketDataFromJira } from './fetch-data'

declare function require(path: string): any

class App extends React.Component {
  issueIdTextbox: HTMLInputElement
  companyNameTextbox: HTMLInputElement
  usernameTextbox: HTMLInputElement
  passwordTextbox: HTMLInputElement

  companyNameRef = (element: HTMLInputElement) => {
    if (element) element.value = 'lukasbittnerbvbcv'
    this.companyNameTextbox = element
  }

  usernameRef = (element: HTMLInputElement) => {
    if (element) element.value = 'bittner.lukas@gmail.com'
    this.usernameTextbox = element
  }

  passwordRef = (element: HTMLInputElement) => {
    if (element) element.value = 'adcGusBdCLgLYQsrtJBf1ACB'
    this.passwordTextbox = element
  }

  issueIdRef = (element: HTMLInputElement) => {
    if (element) element.value = 'FIG-1'
    this.issueIdTextbox = element
  }

  onCreateTicket = async () => {
    const issueId = this.issueIdTextbox.value
    const username = this.usernameTextbox.value
    const password = this.passwordTextbox.value
    const companyName = this.companyNameTextbox.value

    // Fetch data and send to sandbox
    var ticketDataArray = await getTicketDataFromJira([issueId], username, password, companyName)
    console.log("Array", ticketDataArray)
    parent.postMessage({ pluginMessage: { type: 'create-new-ticket', data: ticketDataArray } }, '*')
  }

  onUpdateSelected = () => {
    parent.postMessage({ pluginMessage: { type: 'update-selected' } }, '*')
  }

  onUpdateAll = () => {
    parent.postMessage({ pluginMessage: { type: 'update-all' } }, '*')
  }

  onCreateComponent = () => {
    parent.postMessage({ pluginMessage: { type: 'create-component' } }, '*')
  }


  render() {
    return <div>
      {/* <img src={require('./logo.svg')} /> */}
      {/* <h2>Jira Ticket Status</h2> */}
      <p>Company Name: <input ref={this.companyNameRef} /></p>
      <p>E-Mail: <input ref={this.usernameRef} /></p>
      <p>Jira API Token: <input ref={this.passwordRef} /></p>
      <p>Issue ID: <input ref={this.issueIdRef} /></p>
      {/* <Button id="create-new-ticket" onClick={this.onCreateTicket}>Create new</Button><br/> */}
      <button id="update-selected" onClick={this.onUpdateSelected}>Update</button><br/>
      <button id="update-all" onClick={this.onUpdateAll}>Update All</button><br/>
      <button id="create-component" onClick={this.onCreateComponent}>Create Component</button>
    </div>
  }
}

ReactDOM.render(<App />, document.getElementById('react-page'))
