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
import { useState, useRef } from 'react';
import * as ReactDOM from 'react-dom';
import './ui.css';
import { Icon, Text, Title, Label, Button, Tip } from "react-figma-plugin-ds";
import "react-figma-plugin-ds/figma-plugin-ds.css";
import { getTicketDataFromJira } from './fetch-data';
import { Buffer } from 'buffer';
const ISSUE_ID_KEY = "ISSUE_ID";
const COMPANY_NAME_KEY = "COMPANY_NAME";
const USERNAME_KEY = "USERNAME";
const PASSWORD_KEY = "PASSWORD";
function App() {
    const [companyName, setCompanyName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [issueId, setIssueId] = useState("");
    const [companyNameError, setCompanyNameError] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [issueIdError, setIssueIdError] = useState("");
    const [showAuth, setShowAuth] = useState(true);
    const [showAuthForOnboarding, setShowAuthForOnboarding] = useState(true);
    const [showInput, setShowInput] = useState(false);
    const companyNameInput = useRef(null);
    const usernameInput = useRef(null);
    const passwordInput = useRef(null);
    window.onmessage = (event) => __awaiter(this, void 0, void 0, function* () {
        // Fetches tickeet data and sends it to sandbox
        if (event.data.pluginMessage.type === 'getTicketData') {
            var issueIds = event.data.pluginMessage.issueIds;
            var nodeIds = event.data.pluginMessage.nodeIds;
            let basicAuth = Buffer.from(username + ':' + password).toString('base64');
            var ticketDataArray = yield getTicketDataFromJira(issueIds, basicAuth, companyName);
            parent.postMessage({ pluginMessage: { issueIds: issueIds, nodeIds: nodeIds, data: ticketDataArray, type: 'ticketDataSent' } }, '*');
        }
        // Fills the authorization variables with the data stored in the sandbox (clientStorage)
        if (event.data.pluginMessage.type === 'setAuthorizationVariables') {
            let company_name = event.data.pluginMessage.company_name;
            let username = event.data.pluginMessage.username;
            let password = event.data.pluginMessage.password;
            let issueId = event.data.pluginMessage.issueId;
            setCompanyName(company_name);
            setUsername(username);
            setPassword(password);
            setIssueId(issueId.replace(/[1-9]*$/, ""));
            var notAllAuthDataEntered = company_name === "" || username === "" || password === "";
            setShowAuth(notAllAuthDataEntered);
            setShowAuthForOnboarding(notAllAuthDataEntered);
            parent.postMessage({ pluginMessage: { type: 'resize-ui', big_size: notAllAuthDataEntered } }, '*');
        }
    });
    // Fetches ticket data and calls sandbox to add a new ticket with that data
    const onCreateTicket = () => __awaiter(this, void 0, void 0, function* () {
        if (issueId === "") {
            setIssueIdError("Please enter a ticket ID.");
        }
        else {
            setIssueIdError("");
            const basicAuth = Buffer.from(username + ':' + password).toString('base64');
            var ticketDataArray = yield getTicketDataFromJira([issueId], basicAuth, companyName);
            parent.postMessage({ pluginMessage: { type: 'create-new-ticket', data: ticketDataArray, issueIds: [issueId] } }, '*');
            setIssueId(issueId.replace(/[1-9]*$/, ""));
        }
    });
    // Start the process to update all selected ticket headers
    const onUpdateSelected = () => {
        parent.postMessage({ pluginMessage: { type: 'update-selected' } }, '*');
    };
    // Start the process to update all ticket headers on page
    const onUpdateAll = () => {
        parent.postMessage({ pluginMessage: { type: 'update-all' } }, '*');
    };
    // Creates a new main component (used for development purposes)
    const onCreateComponent = () => {
        parent.postMessage({ pluginMessage: { type: 'create-component' } }, '*');
    };
    // Change the view beetween the main view and the authorization view
    const switchView = () => {
        setShowAuth(!showAuth);
        parent.postMessage({ pluginMessage: { type: 'resize-ui', big_size: !showAuth } }, '*');
        setCompanyNameError("");
        setUsernameError("");
        setPasswordError("");
    };
    // Toggles the password field between show/hide password
    const switchShowInput = () => {
        setShowInput(!showInput);
    };
    // Saves the current field input in the sandbox
    const onInputFieldChanged = (value, key) => {
        if (key === ISSUE_ID_KEY)
            setIssueId(value);
        // else if (key === COMPANY_NAME_KEY) setCompanyName(value)
        // else if (key === USERNAME_KEY) setUsername(value)
        // else if (key === PASSWORD_KEY) setPassword(value)
        parent.postMessage({ pluginMessage: { type: 'authorization-detail-changed', key: key, data: value, save_public: false } }, '*');
    };
    // Saves the authorization details in the sandbox
    const onSaveAuthDetails = () => {
        var companyName = companyNameInput.current.value;
        var username = usernameInput.current.value;
        var password = passwordInput.current.value;
        setCompanyNameError("");
        setUsernameError("");
        setPasswordError("");
        var allCredentialsProvided = true;
        if (companyName === "") {
            setCompanyNameError("Please enter a company domain name.");
            allCredentialsProvided = false;
        }
        if (username === "") {
            setUsernameError("Please enter a username.");
            allCredentialsProvided = false;
        }
        if (password === "") {
            setPasswordError("Please enter an API token.");
            allCredentialsProvided = false;
        }
        if (allCredentialsProvided) {
            setCompanyName(companyName);
            setUsername(username);
            setPassword(password);
            parent.postMessage({ pluginMessage: { type: 'authorization-detail-changed', key: COMPANY_NAME_KEY, data: companyName, save_public: true } }, '*');
            parent.postMessage({ pluginMessage: { type: 'authorization-detail-changed', key: USERNAME_KEY, data: username, save_public: false } }, '*');
            parent.postMessage({ pluginMessage: { type: 'authorization-detail-changed', key: PASSWORD_KEY, data: password, save_public: false } }, '*');
            parent.postMessage({ pluginMessage: { type: 'create-visual-bell', message: "Saved." } }, '*');
            setShowAuthForOnboarding(false);
            switchView();
        }
    };
    // Hit enter to create a new ticket
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            onCreateTicket();
        }
    };
    // UI - changes between authorisation view and main view
    return React.createElement(React.Fragment, null, showAuth ?
        // Authorization view
        React.createElement("div", { className: 'vertical padding-small' },
            React.createElement("div", { className: 'section-title-with-icon' },
                React.createElement(Title, { level: "h2", size: "", weight: "bold" }, "Authorization")),
            React.createElement("div", { className: 'tip' }, showAuthForOnboarding && React.createElement(Tip, null, "Please enter your Jira credentials to get all setup and running.")),
            React.createElement("div", { className: 'row' },
                React.createElement("div", null,
                    React.createElement(Text, null, "Company Domain Name"),
                    React.createElement("div", { className: "input" },
                        React.createElement("input", { ref: companyNameInput, type: "input", className: "input__field", defaultValue: companyName, placeholder: "e.g. parkside-interactive" })),
                    companyNameError.length > 0 &&
                        React.createElement(Text, { className: "error-text" }, companyNameError),
                    React.createElement(Label, null,
                        "www.",
                        React.createElement("b", null, "company-name"),
                        ".atlassian.net"))),
            React.createElement("div", { className: 'row' },
                React.createElement("div", null,
                    React.createElement(Text, null, "E-Mail"),
                    React.createElement("div", { className: "input" },
                        React.createElement("input", { ref: usernameInput, type: "input", className: "input__field", defaultValue: username, placeholder: "e.g. jeff@google.com" })),
                    usernameError.length > 0 &&
                        React.createElement(Text, { className: "error-text" }, usernameError),
                    React.createElement(Label, null, "The e-mail you use for Jira."))),
            React.createElement("div", { className: 'row' },
                React.createElement("div", null,
                    React.createElement(Text, null, "Jira API Token"),
                    React.createElement("div", { className: 'horizontal' },
                        React.createElement("div", { className: "input" },
                            React.createElement("input", { ref: passwordInput, type: showInput ? 'text' : 'password', className: "input__field stretch", defaultValue: password, placeholder: "e.g. A90SjdsS8MKLASsa9767" })),
                        showInput ?
                            React.createElement(Icon, { color: "black8", name: "visible", onClick: switchShowInput })
                            : React.createElement(Icon, { color: "black8", name: "hidden", onClick: switchShowInput })),
                    passwordError.length > 0 &&
                        React.createElement(Text, { className: "error-text" }, passwordError),
                    React.createElement(Button, { isTertiary: true, onClick: function _() { window.open("https://id.atlassian.com/manage-profile/security/api-tokens", "_blank"); } }, "Create API token here."))),
            React.createElement("div", { className: 'horizontal align-right padding-small' },
                showAuthForOnboarding && React.createElement(Button, { className: "", id: "create-component", onClick: function _() { onSaveAuthDetails(); } }, "Next"),
                !showAuthForOnboarding && React.createElement(Button, { className: "", isSecondary: true, id: "create-component", onClick: function _() { switchView(); } }, "Back"),
                !showAuthForOnboarding && React.createElement(Button, { className: "", id: "create-component", onClick: function _() { onSaveAuthDetails(); } }, "Save Changes")))
        :
            // Main view
            React.createElement("div", null,
                React.createElement("div", { className: 'vertical padding-small divider' },
                    React.createElement("div", { className: 'section-title-with-icon' },
                        React.createElement(Title, { level: "h2", size: "", weight: "bold" }, "Add"),
                        React.createElement(Icon, { color: "black8", name: "adjust", onClick: function _() { switchView(); } })),
                    React.createElement("div", { className: 'horizontal padding-small' },
                        React.createElement("div", null,
                            React.createElement("div", { className: "input" },
                                React.createElement("input", { type: "input", autoFocus: true, className: "input__field", value: issueId, placeholder: "Ticket ID (e.g. PR-3)", onKeyDown: handleKeyDown, onChange: (event) => { onInputFieldChanged(event.target.value, ISSUE_ID_KEY); } })),
                            issueIdError.length > 0 &&
                                React.createElement(Text, { className: "error-text" }, issueIdError)),
                        React.createElement(Button, { className: "", id: "create-new-ticket", onClick: onCreateTicket }, "Add Ticket"))),
                React.createElement("div", { className: 'vertical padding-small' },
                    React.createElement(Title, { level: "h2", size: "", weight: "bold" }, "Update"),
                    React.createElement("div", { className: 'padding-small' },
                        React.createElement(Button, { className: "margin-small", isSecondary: true, id: "update-selected", onClick: onUpdateSelected }, "Update Selected"),
                        React.createElement(Button, { className: "margin-small", isSecondary: true, id: "update-page", onClick: onUpdateAll }, "Update Page"),
                        React.createElement(Button, { className: "margin-small", isSecondary: true, id: "update-all", onClick: onUpdateAll }, "Update All in Document")))));
}
ReactDOM.render(React.createElement(App, null), document.getElementById('react-page'));
