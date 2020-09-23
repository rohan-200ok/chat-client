import React, { Component } from "react";
import { Bubble, GiftedChat, InputToolbar, Send } from "react-web-gifted-chat";
import io from "socket.io-client";

const socket = io.connect("http://localhost:8000")
class App extends Component {

    constructor(props) {
        super(props)
    
        this.state = {
             messages : [],
             user:{ id: 1, name: 'buyer'},
             count: 3,
        }
        this.updateSender = this.updateSender.bind(this)
    }

  componentDidMount() {

    if (!"Notification" in window) {
      console.log("This browser does not support desktop notification");
    } else {
      Notification.requestPermission();
    }

    socket.on('connect', () => {
      socket.emit('connected','abc');
    });

    socket.on('connected',(messages) => {
      this.setState({ messages, count : messages.length });
    });

    socket.on("chat message", (messages) => {
      this.setState({ messages: [...this.state.messages,messages], count : this.state.count + 1 });
    });

    socket.on('generated notification', ({title,body,username}) => {
      
      var options = {
        body: `${username} : ${body}`,
        dir: "ltr"
      };
      var notification = new Notification(title, options);
      notification.onclick = function(event) {
        event.preventDefault();
        window.open('http://www.google.com', '_blank');
      }
      });
  }

  onSend(message) {
    if(message[0]['text'].length > 0) {
        socket.emit("chat message", { id: this.state.count + 1, text: message[0]['text'], createdAt: Date.now(), user: message[0]['user'] });
    }
  }
  
  updateSender(event) {
    let value = event.target.value;
    var user = this.state.user;
    if(value === 'buyer') {
      user = { id: 1, name: 'Buyer'}
    } else if(value === 'seller') {
      user = { id: 2, name: 'Seller'}
    } else if(value === 'admin') {
      user = { id: 3, name: 'Admin'}
    }

    this.setState({ user })
  }

  renderBubble = props => {
    return (
        <Bubble
            {...props}
            wrapperStyle={{
            left: {
                backgroundImage: 'linear-gradient(to bottom right, #fafafa, #f0f0f0)',
            },
            right: {
                backgroundImage: 'linear-gradient(to bottom right, #30949C, #47d3de)'
            }
            }}
        />
        )
    }

  render() {
      console.log('messages',this.state.messages)
    return (
      <div style={styles.container}>
        <GiftedChat
            renderSend={(props) => <Send {...props} textStyle={{color:'white'}} containerStyle={{paddingTop:'10px',backgroundColor:'#0084FF', borderRadius:'25px'}} />}
            renderInputToolbar={(props) =>  <InputToolbar {...props} containerStyle={{paddingTop:'5px'}} /> }
            timeTextStyle={{left:{color:'darkgray'},right:{color:'#f5f5f5',marginLeft:'30px'}}}
            scrollToBottom
            renderBubble={this.renderBubble}//This is what you must add in the code
            messages={this.state.messages.slice().reverse()}
            onSend={(message) => this.onSend(message)}
            user={this.state.user}
        />
        <div onChange={this.updateSender}>
          <div>
          <input type="radio" name="sender" id="buyer" value="buyer" defaultChecked />
          <label htmlFor="buyer"> Buyer </label>
          </div>
          <div>
          <input type="radio" name="sender" id="seller" value="seller" /> 
          <label htmlFor="seller"> Seller </label>
          </div>
          <div>
          <input type="radio" name="sender" id="admin" value="admin" />
          <label htmlFor="admin"> Admin </label>
          </div>
        </div>  
      </div>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    height: "97vh",
  }
};

export default App;
