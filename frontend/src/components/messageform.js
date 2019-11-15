import React, { Component } from 'react';

import axios from 'axios';

const baseUrl = process.env.REACT_APP_BASE_URL || "localhost:5000";

class MessageForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      form_message: ''
    }

    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleMessageSubmit = this.handleMessageSubmit.bind(this);
  }

  handleMessageChange(event) {
    this.setState({ form_message : event.target.value });
  }

  handleMessageSubmit(event) {
    event.preventDefault();

    let message = this.state.form_message;
    if (message == null || message === '') {
      return;
    }

    axios.post(`http://${baseUrl}/api/messages`, {
      sender: localStorage.get("name"),
      content: message
    }).then(res => {
      document.getElementById("message-form").reset();
    }).catch(err => {
      console.log(err);
    });
  }

  render() {
    return (<div>
        <h4>Add a Message</h4>
        <p>Enter content below and press submit when ready.</p>
        <form onSubmit={this.handleMessageSubmit} id="message-form">
          <label>Content: </label>
          <input type="text" className="u-full-width" onChange={this.handleMessageChange}/><br/>
          <input type="submit" value="Submit"/>
        </form>
      </div>
    );
  }
}

export default MessageForm;
