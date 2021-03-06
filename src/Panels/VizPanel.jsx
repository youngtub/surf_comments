import React from 'react';
import * as d3 from 'd3';
import InfoPanel from './InfoPanel';
import Surch from '../Surch/Surch';
import ReplyToComment from '../Sections/ReplyToComment';
import ReplyButton from '../Sections/ReplyButton';
import Presets from '../Sections/Presets';
import {Grid, Row, Col, ListGroup, ListGroupItem, Button} from 'react-bootstrap';
import $ from 'jquery';
import axios from 'axios';
import ReactDOM from 'react-dom';
import clamp from 'clamp-js';
import ellipsis from 'text-ellipsis';

class VizPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // jsonObj: {},
      root: {},
      comments: [],
      links: [],
      commentsLibrary: [],
      linksLibrary: [],
      selectedComment: {},
      selectedLink: {},
      display: '',
      showTooltip: false,
      tooltipPosition: {},
      likedComment: false,
      level: 0
    }
    this.generateCharts = this.generateCharts.bind(this);
    this.applySurchCb = this.applySurchCb.bind(this);
    this.infoPanelCallback = this.infoPanelCallback.bind(this);
    this.resetSurchCb = this.resetSurchCb.bind(this);
    this.getNodeSize = this.getNodeSize.bind(this);
    this.replyToCommentCallback = this.replyToCommentCallback.bind(this);
    this.getTooltipPosition = this.getTooltipPosition.bind(this);
  }

  componentWillMount() {

    this.setState({
      // jsonObj: jsonData,
      root: jsonData["initial"].nodes[0],
      comments: jsonData["initial"].nodes,
      commentsLibrary: jsonData["initial"].nodes,
      links: jsonData["initial"].links,
      linksLibrary: jsonData["initial"].links,
      selectedComment: jsonData["initial"].nodes[0]
    }, () => {
      this.generateCharts();
    });

  };

  componentWillReceiveProps() {
    // console.log('PROPS IN VIZPANEL', this.props.settings)
    setTimeout(() => this.generateCharts(), 100)
  }

  generateCharts() {
    var that = this;
    console.log('STATE in gen charts', this.state)
    d3.select('#canvas').selectAll('svg').remove();

    var width = 960,
        height = 700

    var svg = d3.select("#canvas").append("svg")
        .attr("width", width)
        .attr("height", height);

    var linkDistance = this.props.settings.linkDistance || 280;
    var circleSize = this.props.settings.circleSize || 25;
    var artistNum = this.props.settings.artistNumber || 7;
    var roles = this.props.settings.roles || ['rapper', 'producer'];
    var label = this.props.settings.label || 'circles';

    var nodes = d3.forceSimulation(this.state.commentsLibrary)
    .force("charge", d3.forceManyBody().strength(-200))
    .force("link", d3.forceLink(this.state.linksLibrary)
      .distance((d) => {
        return d.value > 0 ? linkDistance/(d.value*1.5) : linkDistance;
      }))
    .force("center", d3.forceCenter(420, 380))
    .force("gravity", d3.forceManyBody().strength(-200))
    .force('collision', d3.forceCollide().radius(function(d) {
      // console.log('RADD', d)
      return circleSize*2
    }))
    .force("size", d3.forceManyBody([width, height]))


    var link = svg.selectAll(".link").data(this.state.linksLibrary).enter()
        .append("line")
        .attr("class", (d) => `${d.source.id} ${d.target.id} link`)
        .attr("stroke-width", (d) => d.value*5);

          $('.link').toggle();

    link.on("click", (d) => {
        console.log('selected link', d);

        this.setState({
          display: 'link',
          selectedLink: d
        })
      });

var node = svg.selectAll(".node").data(this.state.comments).enter()
    .append("g").attr("class", "node")
    .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended)
    );

function dragstarted() {
  that.setState({
    showTooltip: false
  })
  if (!d3.event.active) nodes.alphaTarget(0.3).restart();
  d3.event.subject.fx = d3.event.subject.x;
  d3.event.subject.fy = d3.event.subject.y;
}

function dragged() {
  d3.event.subject.fx = d3.event.x;
  d3.event.subject.fy = d3.event.y;
}

function dragended() {
  if (!d3.event.active) nodes.alphaTarget(0);
  d3.event.subject.fx = null;
  d3.event.subject.fy = null;
}

// append("svg:image")
// .attr('x', -9)
// .attr('y', -12)
// .attr('width', 20)
// .attr('height', 24)
// .attr("xlink:href", "resources/images/check.png")


var colors = {
  0: '#424874',
  1: '#6D435A',
  2: '#4E598C',
  3: '#0C6291',
  4: '#5C6672',
  5: '#3A435E'
}

if (label === 'text') {

  node.append("rect")
      .attr('x', (d) => { return d.id === 0 ? -125 : -200/(d.level+1)})
      .attr('y', (d) => { return d.id === 0 ? -75 : -50/(d.level+1)})
      .attr('rx', 20)
      .attr('ry', 20)
      .attr('width', (d) => { return d.id === 0 ? 200 : 400/(d.level+1)})
      .attr('height', (d) => {return d.id === 0 ? 150 : 100/(d.level+1)})
      .attr("fill", function(d) { return d.id === 0 ? '#241587' : '#3f88a3' })
      .attr("class", (d) => `${d.id} node`);

  node.append("text")
      .attr("dx", -50).attr("dy", -20)
      .text(function(d) { return d.text })
      .style("font-size", "14px")
      .style("fill", (d) => d.id === 'C0' ? '#eff0f2' : '#1b1b1c')

} else {

  node.append("circle")
      .attr("r", (d) => d.id === 'C0' ? 75 : 5*circleSize/(d.level+1) )
      .attr("fill", d => colors[d.level])
      .attr("class", (d) => `${d.id} node`);

  node.append("foreignObject")
      .attr('width', d => {
        var w = 6 - d.level;
        return `${w}vw`
      })
      .attr('height', d => {
        var h = 10 - d.level;
        return `${h}vh`
      })
      .attr('x', d=> -this.getNodeSize(d.level) + 5)
      .attr('y', d=> -this.getNodeSize(d.level))
      .html( d => {
        var chars = 7*(6-d.level);
        var short = ellipsis(d.text, chars);
        return `<div>${short}</div>`
      })
      .style('overflow', 'hidden')
      .style('text-overflow', 'ellipsis')
      .style("font-size", "14px")
      .style("color", (d) => d.id === 'C0' ? '#eff0f2' : '#efefef')
      .style('visibility', d => d.level < 3 ? 'visible' : 'hidden')
      .attr('class',d=> `${d.id} ${d.level} comment`)

  node.append("svg:image")
      .attr('x', d => -0.5*this.getNodeSize(d.level))
      .attr('y', d => -0.2*this.getNodeSize(d.level))
      .attr('width', d => this.getNodeSize(d.level))
      .attr('height', d => this.getNodeSize(d.level))
      .attr("border-radius", '50%')
      .attr("xlink:href", (d) => `${d.url || ''}`)

}

    node.on('click',  function(d){
      console.log('selected node', d)

      var relatedLinks = that.state.linksLibrary.filter(link => {
        return link.source.id === d.id || link.target.id === d.id;
      })

      console.log('RELATED LINKS', relatedLinks)

      // $('.link').css('display', 'none')
      $(`.${d.id}.link`).css('display', 'inline')
      $(`.${d.level+1}.comment`).css('visibility', 'visible')
      // $(`.${d.level+2}.comment`).css('visibility', 'visible')
      var position = that.getTooltipPosition(d)

      console.log('POSITION', position)
      that.setState({
        selectedComment: d,
        display: 'artist',
        showTooltip: true,
        likedComment: false,
        tooltipPosition: position,
        level: d.level
      }, () => {
        console.log('comment in state', that.state.selectedComment)
        // this.generateCharts();
      })
    })

    // .on('mouseover', d => {
    //   this.setState({
    //     selectedComment: d,
    //     display: 'comment'
    //   })
    // })

    for (let i = 0; i <= this.state.level+1; i++) {
      $(`.${i}.comment`).css('visibility', 'visible')
    }

      nodes.on("tick", function() {

            node.attr("transform", function(d) {
              var xcoord = d.x > width / 2 ? Math.min(d.x, width-circleSize) : Math.max(circleSize, d.x);
              var ycoord = d.y > height / 2 ? Math.min(d.y-30, height-(circleSize+30)) : Math.max(circleSize, d.y);
              return "translate(" + xcoord + "," + ycoord + ")"; });
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
      });

  };

  getTooltipPosition(d) {
    console.log('NODE TO GET POSITION OF', d)
    var newLeft = (parseInt(d.x)-this.getNodeSize(d.level)).toString()+'px';
    var newTop = (parseInt(d.y)-1.6*this.getNodeSize(d.level)).toString()+'px';
    var outputObj = {
      position: 'absolute',
      left: newLeft,
      top: newTop
    }
    console.log('OUTPUT OBJ', outputObj)
    return outputObj;
  }

  replyToCommentCallback(comment, reply) {

    let newId = `${'C'+this.state.commentsLibrary.length}`
    let newReplyObj = { id: newId, text: reply, level: comment.level+1, children: [], parent: comment.id , author: "User" };
    let commentIds = this.state.commentsLibrary.reduce((acc, curr) => {acc.push(curr.id); return acc;}, []);
    let parentCommentInd = commentIds.indexOf(comment.id);
    let newLinkObj = {source: parentCommentInd, target: this.state.commentsLibrary.length, value: 1};
    let updatedComments = this.state.commentsLibrary.slice()
    updatedComments.push(newReplyObj);
    let updatedLinks = this.state.linksLibrary.slice()
    updatedLinks.push(newLinkObj);

    this.setState({
      comments: updatedComments,
      commentsLibrary: updatedComments,
      links: updatedLinks,
      linksLibrary: updatedLinks,
      showCommentEntry: false,
      level: comment.level
    }, () => {
      this.generateCharts();
      this.props.fakePassStateToViz()
    })
  }

  handleCancel = () => {
    this.setState({
      showCommentEntry: false
    })
  }

  getNodeSize(level) {
    let circleSize = this.props.settings.circleSize || 25;
    var sizes = {
      0: circleSize*2.3,
      1: circleSize*1.7,
      2: circleSize*1.3,
      3: circleSize,
      4: circleSize,
      5: circleSize,
      6: circleSize,
      7: circleSize
    }
    return sizes[level];
  }

  applySurchCb(surchArr) {
    // console.log('surch array', surchArr)
    var filteredArtistsArray = this.state.artistsLibrary.filter(artist => {
      return surchArr.includes(artist.name);
    });

    var filteredLinksArray = this.state.linksLibrary.filter(link => {
      if (surchArr.length === 1) {
        return false;
      } else {
        return surchArr.includes(link.source.name) && surchArr.includes(link.target.name);
      }
    })
    this.setState({
      artists: filteredArtistsArray,
      links: filteredLinksArray
    }, () => {
      console.log('state in viz panel', this.state)
      this.generateCharts()
    })
  };

  resetSurchCb() {
    this.setState({
      artists: this.state.artistsLibrary,
      links: this.state.linksLibrary
    }, () => {
      this.generateCharts();
    })
  }

  infoPanelCallback(name) {
    var newSelectedArtist = this.state.artists.filter(artist => artist.name === name)[0];
    var newSongs = this.state.songsLibrary.filter(song => {
      return newSelectedArtist.songs.includes(song.id)
    })
    this.setState({
      selectedArtist: newSelectedArtist,
      display: 'artist',
      songs: newSongs
    }, () => {
      $(`.link`).css('display', 'none');
      $(`.${name.split(' ').join('')}`).css('display', 'inline');
    })
  };

  likeCommentCallback = () => {
    if (!this.state.likedComment) {
      var likedNode = this.state.selectedComment;
      likedNode.likes+=1;
      console.log('LIKED NODE', likedNode)
      this.setState({
        selectedComment: likedNode,
        likedComment: true
      }, () => {
        console.log('selectedComment', this.state.selectedComment)
      })
    }
  }

  showReplyCallback = () => {
    this.setState({
      showTooltip: false,
      showCommentEntry: true
    })
  };

  changeCommentData = (val) => {
    console.log('val', val)
    this.setState({
      // jsonObj: jsonData,
      root: jsonData[val].nodes[0],
      comments: jsonData[val].nodes,
      commentsLibrary: jsonData[val].nodes,
      links: jsonData[val].links,
      linksLibrary: jsonData[val].links,
      selectedComment: jsonData[val].nodes[0],
      showTooltip: false,
      level: 0
    }, () => {
      this.generateCharts();
      this.props.fakePassStateToViz()
    });
  }

  closeTooptipCb = () => {
    this.setState({
      showTooltip: false
    })
  }

  render() {
    return (
      <div>
        <Grid fluid={true}>

          <Row>

            <Col md={9} className="show-grid">
              <div id='canvas' style={border}></div>
            </Col>

            <Col md={3} style={border}>


                  <Row className="show-grid">
                    { this.props.showPanels ? (
                    <InfoPanel selectedComment={this.state.selectedComment} selectedLink={this.state.selectedLink}
                      display={this.state.display} comments={this.state.comments}
                      links={this.state.linksLibrary} root={this.state.root}
                      infoPanelCallback={this.infoPanelCallback} addCommentCB={this.addCommentCB}
                      /> ) : <div style={infoPlaceholder}></div> }
                  </Row>
                  {/*<Row className="show-grid">
                    <Surch allArtists={this.state.artistsLibrary} applySurchCb={this.applySurchCb} reset={this.resetSurchCb}/>
                  </Row>*/}


                <Row>
                  <Presets changeCommentData={this.changeCommentData}/>
                </Row>

            </Col>

          </Row>

        </Grid>
        {this.state.showTooltip ? (
          <ReplyButton parent={this.state.selectedComment} style={this.state.tooltipPosition} showReplyCallback={this.showReplyCallback} likeCommentCallback={this.likeCommentCallback} closeTooptipCb={this.closeTooptipCb}/>
        ) : ''}
        { this.state.showCommentEntry ? (
          <ReplyToComment parent={this.state.selectedComment} replyToCommentCallback={this.replyToCommentCallback} style={this.state.tooltipPosition} handleCancel={this.handleCancel}/>
        ) : ''}
        </div>
    )
  }

};

const border = {
  // border: 'solid black 1px'
}

const infoPlaceholder = {
  height: '60vh'
}

const jsonData = {

  "initial" : {
    "nodes": [
      {id: 'C0', text: 'A dumb post; click to comment', level: 0, children: [], parent: null, likes: 0, author: 'tub'}
    ],
    "links": []
  },
  "dogs": {
      "nodes": [
        { id: 'C0', text: 'My dogs curious face', level: 0, children: [1, 2, 3], parent: null, likes: 2, author: 'BeagleBob7', url: "http://www.animalgenetics.us/images/canine/Beagle4.jpg"},
        { id: 'C1', text: 'Same here! I think its a beagle thing', level: 1, children: [ 4, 5 ], parent: 'C0', likes: 0, author: "catnip47" },
        { id: 'C2', text: 'Classic 30 degree head tilt', level: 1, children: [ 6 ], parent: 'C0', likes: 3, author: "jackrabbit5" },
        { id: 'C3', text: 'When theres a treat in smellshot', level: 1, children: [ 7 ], parent: 'C0', likes: 2, author: "meanstack91" },
        { id: 'C4', text: 'Nah my lab does too', level: 2, children: [ 8 ], parent: 'C1', likes: 1, author: "hooplahadup" },
        { id: 'C5', text: 'Maybe! My pup does the same thing', level: 2, children: [], parent: 'C1', likes: 0, author: "bballoo" },
        { id: 'C6', text: 'Lol u measured that shit', level: 2, children: [ 9 ], parent: 'C2', likes: 0, author: "timpumbo" },
        { id: 'C7', text: 'Smellshot hahahaha', level: 2, children: [], parent: 'C3', likes: 2, author: "skrrrttt88" },
        { id: 'C8', text: 'Agreed ya my dalmation been doing this since she was born', level: 3, children: [], parent: 'C4', likes: 1, author: "lil uzi horizont" },
        { id: 'C9', text: 'eyeballed then verified with protractor mate', level: 3, children: [], parent: 'C6' , likes: 0, author: "bathtub gin"}
      ],
        "links": [
          { source: 0, target: 1, value: 1 },
          { source: 0, target: 2, value: 1 },
          { source: 0, target: 3, value: 1 },
          { source: 1, target: 4, value: 1 },
          { source: 1, target: 5, value: 1 },
          { source: 2, target: 6, value: 1 },
          { source: 3, target: 7, value: 1 },
          { source: 4, target: 8, value: 1 },
          { source: 6, target: 9, value: 1 }
        ]
    },
    "politics" : {
      "nodes": [
        { id: 'C0', text: "Trump: 'I should have left them in jail!' ", level: 0, children: [1, 2], parent: null, likes: 2, author: 'BeagleBob7', url: "http://static4.businessinsider.com/image/59c7cd6a19d2f58d008b5284/trump-administration-officials-play-defense-over-backlash-to-his-comments-about-nfl-and-nba-players.jpg"},
        { id: 'C1', text: 'I mean...why they steal in China...', level: 1, children: [ 3 ], parent: 'C0', likes: 0, author: "catnip47" },
        { id: 'C2', text: 'Unbelievable! Hes dirtying sports now too', level: 1, children: [ 4, 5 ], parent: 'C0', likes: 3, author: "jackrabbit5" },
        { id: 'C3', text: 'Thats not the point', level: 2, children: [ 6, 7 ], parent: 'C1', likes: 2, author: "meanstack91" },
        { id: 'C4', text: 'good pushback from NBA and NFL officials though', level: 2, children: [ 8 ], parent: 'C2', likes: 1, author: "hooplahadup" },
        { id: 'C5', text: 'was bound to happen sooner or later', level: 2, children: [], parent: 'C2', likes: 0, author: "bballoo" },
        { id: 'C6', text: 'Agreed, terrible response', level: 3, children: [ 9 ], parent: 'C3', likes: 0, author: "timpumbo" },
        { id: 'C7', text: 'Lol ok sure...', level: 3, children: [], parent: 'C3', likes: 2, author: "skrrrttt88" },
        { id: 'C8', text: 'LeBron said it straight up! lol', level: 3, children: [], parent: 'C4', likes: 1, author: "lil uzi horizont" },
        { id: 'C9', text: 'He got em out of a Chinese jail tho right', level: 4, children: [], parent: 'C6' , likes: 0, author: "bathtub gin"},
        { id: 'C10', text: 'Sigh....NO!', level: 1, children: [], parent: 'C0' , likes: 0, author: "bathtub gin"}
      ],
        "links": [
          { source: 0, target: 1, value: 1 },
          { source: 0, target: 2, value: 1 },
          { source: 0, target: 10, value: 1 },
          { source: 1, target: 3, value: 1 },
          { source: 2, target: 4, value: 1 },
          { source: 2, target: 5, value: 1 },
          { source: 3, target: 6, value: 1 },
          { source: 3, target: 7, value: 1 },
          { source: 4, target: 8, value: 1 },
          { source: 6, target: 9, value: 1 }
        ]
    }
}

export default VizPanel;
