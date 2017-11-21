import React from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import {Button} from 'antd';

const ReplyButton = (props) => {

  const handleOpen = () => {
    props.showReplyCallback()
  }

  const handleLike = () => {
    props.likeCommentCallback()
  }

  const styleTooltip = () => {
    var positionObj = props.style;
    console.log('positionObj', positionObj)
    positionObj['width'] ? null : positionObj['width'] = '9vw'
    positionObj['padding'] ? null : positionObj['padding'] = '15px';
    positionObj['backgroundColor'] ? null : positionObj['backgroundColor'] = '#424B54';
    positionObj['textAlign'] ? null : positionObj['textAlign'] = 'center';
    return positionObj;
  }

  return (
    <Grid style={styleTooltip()} fluid={true}>
      <Row>
        <p style={commentText}>{props.parent.text}</p>
      </Row>
      <Row>
        <Col md={5}>
          <Button onClick={handleLike} size='small' icon='like'>({props.parent.likes || 0})</Button>
        </Col>
        <Col md={5}>
          <Button onClick={handleOpen} size='small'>Reply ({props.parent.children.length || 0}) </Button>
        </Col>
      </Row>
      <Row>
        <Col md={3}>
          <Button onClick={props.closeTooptipCb} size='small' icon='rollback'>Close</Button>
        </Col>
      </Row>
    </Grid>
  )
}

const commentText = {
  fontSize: '14px',
  color: '#efefef'
}

export default ReplyButton;
