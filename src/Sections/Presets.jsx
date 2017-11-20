import React from 'react';
import {Grid, Row, Col, ListGroup, ListGroupItem} from 'react-bootstrap';

const Presets = (props) => {

  const handleClick = (val) => {
    props.changeCommentData(val)
  }

  return (
    <Grid fluid={true} style={presetsStyle} id='surchContainer' >
      <h3>Demos</h3>
      <br/>
        <ListGroup>
          <ListGroupItem onClick={() => handleClick('initial')}>Blank</ListGroupItem>
          <ListGroupItem onClick={() => handleClick('dogs')}>Dogs</ListGroupItem>
          <ListGroupItem onClick={() => handleClick('politics')}>Politics</ListGroupItem>
        </ListGroup>
    </Grid>
  )
};

const presetsStyle = {
  textAlign: 'center',
  border: 'solid grey 1px',
  borderRadius: '10px',
  backgroundColor: 'rgba(111, 92, 130, 0.6)',
  width: '50%',
  float:'right'
}

export default Presets;
