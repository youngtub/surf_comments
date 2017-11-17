import React from 'react';
import {Button} from 'antd';

const ReplyButton = (props) => {

  const handleOpen = () => {
    props.openReplyCb()
  }

  return (
    <Button onClick={handleOpen}>Reply ({props.parent.children.length || 0})</Button>
  )
}

export default ReplyButton;
