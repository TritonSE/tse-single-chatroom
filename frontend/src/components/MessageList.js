import React, { Component } from 'react';

import axios from 'axios';

const baseUrl = process.env.REACT_APP_BASE_URL || "localhost:5000";

const MESSAGE_LIMIT = 30;
const HEARTBEAT_INTERVAL = 3000;

class Channel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      heartbeat: null,
      heartbeat_timestamp: new Date()
    }
    this.heartbeat_lock = false;

    this.handleHeartbeat = this.handleHeartbeat.bind(this);

    props.refresher.registerTrigger(this.handleHeartbeat);
  }

  componentDidMount() {
    let fetch_messages = (self) => {
      axios.get(`http://${baseUrl}/api/messages?limit=${MESSAGE_LIMIT}`).then(res => {
        let messages = res.data.data;
        let heartbeat_id = setInterval(self.handleHeartbeat, HEARTBEAT_INTERVAL);
        self.setState({messages : messages, heartbeat : heartbeat_id, heartbeat_timestamp: new Date()});
      }).catch(err => {
        console.log(err);
      });
    }
    fetch_messages(this); 
  }

  // In the heartbeat function, we want to fetch any messages that were created
  // after the last time we updated the heartbeat timestamp date. This ensures
  // that we're not fetching redundant data, and we're updating in the most 'efficient'
  // way possible.
  handleHeartbeat() {
    if (this.heartbeat_lock) {
      return;
    }
    this.heartbeat_lock = true;
    axios.get(`http://${baseUrl}/api/messages?limit=${MESSAGE_LIMIT}`).then(res => {
      let messages = res.data.data;
      this.setState({ messages : messages, heartbeat_timestamp: new Date() });
      this.heartbeat_lock = false;
    });
    /*
    axios.get(`http://${baseUrl}/api/messages?limit=${MESSAGE_LIMIT}&after=${this.state.heartbeat_timestamp.toISOString()}`).then(res => {
      let new_messages = res.data.data;
      let messages = new_messages.length > 0 ? new_messages.concat(this.state.messages).slice(0, MESSAGE_LIMIT) : this.state.messages; 
      this.setState({ messages : messages, heartbeat_timestamp: new Date() });
      this.heartbeat_lock = false;
    });
    */
  }

  render() {
    if (this.state.heartbeat == null) {
      return (
        <div>
          <p>Loading messages ...</p>
        </div>
      );
    }

    if (this.state.messages.length === 0) {
      return (
        <div>
          <p style={{'color': 'red'}}>No messages yet.</p>
        </div>
      )
    }

    return (
      <div>
        {this.state.messages.map(message => 
          <p key={message._id}><b>{message.sender}:</b> {message.content}</p>
        )}
      </div>
    );
  }
}

export default Channel;
