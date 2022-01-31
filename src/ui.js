var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './ui.css';
// import { Disclosure, Tip, Title, Checkbox, Button } from "react-figma-plugin-ds";
// import "react-figma-plugin-ds/figma-plugin-ds.css";
import { getTicketDataFromJira } from './fetch-data';
class App extends React.Component {
    constructor() {
        super(...arguments);
        this.companyNameRef = (element) => {
            if (element)
                element.value = 'lukasbittnerbvbcv';
            this.companyNameTextbox = element;
        };
        this.usernameRef = (element) => {
            if (element)
                element.value = 'bittner.lukas@gmail.com';
            this.usernameTextbox = element;
        };
        this.passwordRef = (element) => {
            if (element)
                element.value = 'adcGusBdCLgLYQsrtJBf1ACB';
            this.passwordTextbox = element;
        };
        this.issueIdRef = (element) => {
            if (element)
                element.value = 'FIG-1';
            this.issueIdTextbox = element;
        };
        this.onCreateTicket = () => __awaiter(this, void 0, void 0, function* () {
            const issueId = this.issueIdTextbox.value;
            const username = this.usernameTextbox.value;
            const password = this.passwordTextbox.value;
            const companyName = this.companyNameTextbox.value;
            // Fetch data and send to sandbox
            var ticketDataArray = yield getTicketDataFromJira([issueId], username, password, companyName);
            console.log("Array", ticketDataArray);
            parent.postMessage({ pluginMessage: { type: 'create-new-ticket', data: ticketDataArray } }, '*');
        });
        this.onUpdateSelected = () => {
            parent.postMessage({ pluginMessage: { type: 'update-selected' } }, '*');
        };
        this.onUpdateAll = () => {
            parent.postMessage({ pluginMessage: { type: 'update-all' } }, '*');
        };
        this.onCreateComponent = () => {
            parent.postMessage({ pluginMessage: { type: 'create-component' } }, '*');
        };
    }
    render() {
        return React.createElement("div", null,
            React.createElement("p", null,
                "Company Name: ",
                React.createElement("input", { ref: this.companyNameRef })),
            React.createElement("p", null,
                "E-Mail: ",
                React.createElement("input", { ref: this.usernameRef })),
            React.createElement("p", null,
                "Jira API Token: ",
                React.createElement("input", { ref: this.passwordRef })),
            React.createElement("p", null,
                "Issue ID: ",
                React.createElement("input", { ref: this.issueIdRef })),
            React.createElement("button", { id: "update-selected", onClick: this.onUpdateSelected }, "Update"),
            React.createElement("br", null),
            React.createElement("button", { id: "update-all", onClick: this.onUpdateAll }, "Update All"),
            React.createElement("br", null),
            React.createElement("button", { id: "create-component", onClick: this.onCreateComponent }, "Create Component"));
    }
}
ReactDOM.render(React.createElement(App, null), document.getElementById('react-page'));
