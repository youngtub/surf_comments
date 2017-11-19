import React, { Component } from 'react';
import VizPanel from './Panels/VizPanel';
import 'antd/dist/antd.css';
import axios from 'axios';
import Menu from './Sections/Menu.jsx';
import {Grid, Row, Col} from 'react-bootstrap';
import ScrollableAnchor from 'react-scrollable-anchor'
import About from './Sections/About';
import Contribute from './Sections/Contribute'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settingsObj: {},
      showPanels: false
    }
    this.passStateInSettings = this.passStateInSettings.bind(this);
    this.showPanelsCallback = this.showPanelsCallback.bind(this);
  }

  componentDidMount() {
    // axios.get('/api/test').then((res)=>console.log('test', res))
  }

  passStateInSettings(obj) {
    this.setState({
      settingsObj: obj
    })
  }

  showPanelsCallback() {
    this.setState({
      showPanels: !this.state.showPanels
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <ScrollableAnchor id={'main'}>
            <Row>
              <Col md={1}>
                <h2 className='Balmain'> Surf </h2>
              </Col>
              <Col md={1}>
                <h2 style={movieHeaderStyle}> Comments </h2>
              </Col>
            </Row>
          </ScrollableAnchor>
        </header>
        <Grid fluid={true}>

        <Row>
          <Col md={2}>
            <Menu passStateInSettings={this.passStateInSettings} showPanelsCallback={this.showPanelsCallback}/>
          </Col>

          <Col md={10}>
            <VizPanel settings={this.state.settingsObj} showPanels={this.state.showPanels}/>
          </Col>

        </Row>


      {/*<ScrollableAnchor id={'about'}>
        <hr/>
      </ScrollableAnchor>
        <Row style={aboutStyle}>
          <br/>
          <About/>
          <br/><br/><hr/><br/><br/>
        </Row>


        <ScrollableAnchor id={'contribute'}>
        <Row>
          <Contribute />
        </Row>
        </ScrollableAnchor>*/}

        <Row>
          <Col md={5}>
            <h5>Linear Representation of same comments</h5>
            <iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3D311850872627538%26id%3D100014078829018&width=500" style={fbPostStyle} scrolling="no" frameBorder="0" allowTransparency="true"></iframe>
          </Col>
        </Row>
        </Grid>
      </div>
    );
  }
}

const movieHeaderStyle = {
  marginLeft: '24%',
  marginTop: '7%',
  fontFamily: 'Montserrat',
  fontSize: '38px'
}

const fbPostStyle = {
  marginTop: '10vh',
  width: '40vw',
  height: '40vh'
}

const surfStyle = {
  float: 'right'
  // backgroundColor: '#dbdde0'
}

// const black = {
//   color: 'black'
// }

const aboutStyle = {
  backgroundColor: '#afbdd3'
}

export default App;
