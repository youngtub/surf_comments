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
    positionObj['padding'] ? null : positionObj['padding'] = '15px';
    positionObj['backgroundColor'] ? null : positionObj['backgroundColor'] = '#424B54';
    positionObj['textAlign'] ? null : positionObj['textAlign'] = 'center';
    return positionObj;
  }

  return (
    <Grid style={styleTooltip()} fluid={true}>
      <Row>
        <Button onClick={handleOpen} size='small'>Reply ({props.parent.children.length || 0}) </Button>
      </Row>
      <Row>
        <Button onClick={handleLike} size='small' icon='like'>({props.parent.likes || 0})</Button>
      </Row>
    </Grid>
  )
}

export default ReplyButton;
