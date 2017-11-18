import React from 'react';
import {Button} from 'antd';

const ReplyButton = (props) => {

  const handleOpen = () => {
    props.showReplyCallback()
  }

  const styleTooltip = () => {
    var positionObj = props.style;
    console.log('positionObj', positionObj)
    positionObj['padding'] = '5px';
    positionObj['backgroundColor'] = '#424B54'

    return positionObj;
  }

  return (
    <div style={styleTooltip()}>
      <Button onClick={handleOpen} >Reply ({props.parent.children.length || 0}) </Button>
    </div>
  )
}

export default ReplyButton;
