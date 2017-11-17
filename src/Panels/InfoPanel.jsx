import React from 'react';
import {Col, Row, Grid, ListGroup, ListGroupItem} from 'react-bootstrap';
import {Input, Button} from 'antd';
const {TextArea} = Input;

class InfoPanel extends React.Component {
constructor(props) {
  super(props);
  this.state = {
    commentVal: ''
  }
}

  componentWillMount() {
    console.log('PROPS', this.props)
  }

  handleChange = (e) => {
    this.setState({
      commentVal: e.target.value
    })
  };

  handleSubmit = () => {
    let newText = this.state.commentVal;
    this.props.addCommentCB(newText, this.props.selectedComment);
    this.setState({
      commentVal: ''
    })
  }

  render() {
    return (
      <div id='infoPanel'>
        <br/>
        <Grid fluid={true}>
          <Row>
            <Col md={1}></Col>
            <Col md={10}>
            <ListGroup>
              <ListGroupItem>
                <div>
                  {this.props.selectedComment.url ? <img src={this.props.selectedComment.url} height={100} width={100} /> : null}
                  <p> {this.props.selectedComment.text}</p>
                  <p> - {this.props.selectedComment.author}</p>
                </div>
              </ListGroupItem>
            </ListGroup>
            </Col>
            <Col md={1}></Col>
          </Row>
          <Row>
            <Col md={1}></Col>
            <Col md={10}>
            { this.props.selectedComment.level > 0 ? (
              <Row>
                <TextArea value={this.state.commentVal} onChange={this.handleChange} placeholder='Reply'/>
                <Button type='primary' onClick={this.handleSubmit}>Submit</Button>
              </Row>
            ) : (
              <Row>
                <TextArea value={this.state.commentVal} onChange={this.handleChange} placeholder='Enter comment'/>
                <Button type='primary' onClick={this.handleSubmit}>Submit</Button>
              </Row>
            )
            }
            </Col>
            <Col md={1}></Col>
          </Row>
        </Grid>
      </div>
    )
  }
};

const centered = {
  textAlign: "center",
  align: "center"
}

const offset = {
  // marginLeft: '7%'
}

export default InfoPanel;
