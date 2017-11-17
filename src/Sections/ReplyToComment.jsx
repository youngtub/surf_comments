import React from 'react';
import {Input, Button, Icon} from 'antd';
const TextArea = Input.TextArea;

class ReplyToComment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      val: ''
    }
  }

  handleChange = (e) => {
    this.setState({
      val: e.target.value
    })
  }

  handleSubmit = () => {
    this.props.tooltipo.hide()
    var parent = this.props.parent;
    this.props.replyToCommentCallback(parent, this.state.val)
  }

  render() {
    return (
      <div>
        <TextArea value={this.state.val} onChange={this.handleChange} placeholder='enter reply' counter={true}/>
        <hr/>
        <Button >Cancel</Button>
        <Button type='primary' onClick={this.handleSubmit}>Submit</Button>
      </div>
    )
  }

};

export default ReplyToComment;
