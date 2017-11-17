import React from 'react';
import * as d3 from 'd3';
import InfoPanel from './InfoPanel';
import Surch from '../Surch/Surch';
import ReplyToComment from '../Sections/ReplyToComment';
import ReplyButton from '../Sections/ReplyButton';
import {Grid, Row, Col, ListGroup, ListGroupItem, Button} from 'react-bootstrap';
import $ from 'jquery';
import axios from 'axios';
import tip from 'd3-tip';
import ReactDOM from 'react-dom';

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
      display: ''
    }
    this.generateCharts = this.generateCharts.bind(this);
    this.applySurchCb = this.applySurchCb.bind(this);
    this.infoPanelCallback = this.infoPanelCallback.bind(this);
    this.resetSurchCb = this.resetSurchCb.bind(this);
    this.sendRequestForArtist = this.sendRequestForArtist.bind(this);
    this.addCommentCB = this.addCommentCB.bind(this);
    this.getNodeSize = this.getNodeSize.bind(this);
    this.replyToCommentCallback = this.replyToCommentCallback.bind(this);
  }

  componentWillMount() {
    //axios call to db

    this.setState({
      // jsonObj: jsonData,
      root: jsonData.nodes[0],
      comments: jsonData.nodes,
      commentsLibrary: jsonData.nodes,
      links: jsonData.links,
      linksLibrary: jsonData.links,
      selectedComment: jsonData.nodes[0]
    }, () => {
      this.generateCharts();
      this.sendRequestForArtist();
    });

  };

  componentWillReceiveProps() {
    // console.log('PROPS IN VIZPANEL', this.props.settings)
    setTimeout(() => this.generateCharts(), 100)
  }

  sendRequestForArtist() {
    // var artistName = 'Young Thug';
    // axios.get('/api/getArtistData', {params: {artistName}})
    // .then((res) => {
    //   console.log('ARTIST DATA', res.data)
    // })
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

    var linkDistance = this.props.settings.linkDistance || 250;
    var circleSize = this.props.settings.circleSize || 15;
    var artistNum = this.props.settings.artistNumber || 7;
    var roles = this.props.settings.roles || ['rapper', 'producer'];
    var label = this.props.settings.label || 'circles';

    var nodes = d3.forceSimulation(this.state.commentsLibrary)
    .force("charge", d3.forceManyBody().strength(-150))
    .force("link", d3.forceLink(this.state.linksLibrary)
      .distance((d) => {
        return d.value > 0 ? linkDistance/(d.value*1.5) : linkDistance;
      })
      // .strength((d) => {
      //   return d.value > 0 ? d.value : 0;
      // })
      )
    .force("center", d3.forceCenter(420, 380))
    .force("gravity", d3.forceManyBody().strength(-100))
    // .force("distance", d3.forceManyBody(100))

    .force('collision', d3.forceCollide().radius(function(d) {
      // console.log('RADD', d)
      return 10
    }))
    .force("size", d3.forceManyBody([width, height]));

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

  node.append("text")
      .attr("dx", d => d.id === 'C0' ? -(circleSize*5) : this.getNodeSize(d.level)+15)
      .attr("dy", d => d.id === 'C0' ? -20 : 0)
      .text(function(d) { return d.text })
      .style("font-size", "14px")
      .style("fill", (d) => d.id === 'C0' ? '#eff0f2' : '#1b1b1c')

  node.append("svg:image")
      .attr('x', d => -this.getNodeSize(d.level))
      .attr('y', d => -0.4*this.getNodeSize(d.level))
      .attr('width', d => 2*this.getNodeSize(d.level))
      .attr('height', d => 2*this.getNodeSize(d.level))
      .attr("border-radius", '50%')
      .attr("xlink:href", (d) => `${d.url || ''}`)

}

    node.on('click',  function(d){
      console.log('selected node', d)
      var tooltip = tip()
      .attr('class', 'd3-tip')
      .attr('id', `tipo${d.id}`)
      .offset([-10, 0])

      node.call(tooltip)
      tooltip.show(d)

      ReactDOM.render(<ReplyButton id={d.id+'open'} parent={d} openReplyCb={openReply} tooltipo={tooltip}/>, document.getElementById(`tipo${d.id}`));

      function openReply() {
        ReactDOM.unmountComponentAtNode(document.getElementById(`tipo${d.id}`))
        ReactDOM.render(<ReplyToComment id={d.id+'reply'} parent={d} replyToCommentCallback={that.replyToCommentCallback} tooltipo={tooltip}/>, document.getElementById(`tipo${d.id}`));
      }

      var relatedLinks = that.state.linksLibrary.filter(link => {
        return link.source.id === d.id || link.target.id === d.id;
      })

      console.log('RELATED LINKS', relatedLinks)

      // $('.link').css('display', 'none')
      $(`.${d.id}.link`).css('display', 'inline')

      that.setState({
        selectedComment: d,
        display: 'artist',
        links: relatedLinks
      }, () => {
        console.log('comment in state', that.state.selectedComment)
        // this.generateCharts();
      })
    })
    .on('mouseover', d => {
      this.setState({
        selectedComment: d,
        display: 'artist'
      })

    })
    // .on('mouseout', tooltip.hide)

      nodes.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

            node.attr("transform", function(d) {
              var xcoord = d.x > width / 2 ? Math.min(d.x, width-circleSize) : Math.max(circleSize, d.x);
              var ycoord = d.y > height / 2 ? Math.min(d.y-30, height-(circleSize+30)) : Math.max(circleSize, d.y);
              return "translate(" + xcoord + "," + ycoord + ")"; });
      });

  };

  replyToCommentCallback(comment, reply) {
    ReactDOM.unmountComponentAtNode(document.getElementById(`tipo${comment.id}`))
    console.log('target comment: ', comment);
    console.log('new reply: ', reply);
    let newId = `${'C'+this.state.commentsLibrary.length}`
    console.log('NEW ID', newId)
    let newReplyObj = { id: newId, text: reply, level: comment.level+1, children: [], parent: comment.id , author: "User" };
    let commentIds = this.state.commentsLibrary.reduce((acc, curr) => {acc.push(curr.id); return acc;}, []);
    let parentCommentInd = commentIds.indexOf(comment.id);
    let newLinkObj = {source: parentCommentInd, target: this.state.commentsLibrary.length, value: 1};
    let updatedComments = this.state.commentsLibrary.slice()
    updatedComments.push(newReplyObj);
    let updatedLinks = this.state.linksLibrary.slice()
    updatedLinks.push(newLinkObj);
    console.log('updated comments', updatedComments);
    console.log('updated links', updatedLinks)
    this.setState({
      comments: updatedComments,
      commentsLibrary: updatedComments,
      links: updatedLinks,
      linksLibrary: updatedLinks
    }, this.generateCharts)
  }

  getNodeSize(level) {
    let circleSize = this.props.settings.circleSize || 15;
    var sizes = {
      0: circleSize*2.3,
      1: circleSize*1.7,
      2: circleSize*1.3,
      3: circleSize
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

  addCommentCB(text, replyComment) {
    let newId = this.state.commentsLibrary.length;
    let newLevel = replyComment.level+1;
    let newParent = replyComment.id;
    let newCommentObj = { id: newId, text: text, level: newLevel, children: null, parent: newParent, author: "newUserComment" };
    var newComments = this.state.commentsLibrary;
    var newLinkObj = { source: newParent, target: newId, value: 1 }
    var newLinks = this.state.linksLibrary;
    newLinks.push(newLinkObj);
    newComments.push(newCommentObj);
    this.setState({
      commentsLibrary: newComments,
      comments: newComments,
      linksLibrary: newLinks,
      links: newLinks
    }, this.generateCharts)
  }

  render() {
    return (
        <Grid fluid={true}>

          <Row>

            <Col md={9} className="show-grid">
              <div id='canvas' style={border}></div>
            </Col>

            <Col md={3} style={border}>

              { this.props.showPanels ? (
                  <div>
                  <Row className="show-grid">
                    <InfoPanel selectedComment={this.state.selectedComment} selectedLink={this.state.selectedLink}
                      display={this.state.display} comments={this.state.comments}
                      links={this.state.linksLibrary} root={this.state.root}
                      infoPanelCallback={this.infoPanelCallback} addCommentCB={this.addCommentCB}
                      />
                  </Row>

                  <Row className="show-grid">
                    <Surch allArtists={this.state.artistsLibrary} applySurchCb={this.applySurchCb} reset={this.resetSurchCb}/>
                  </Row>
                  </div>
                ) : '' }

            </Col>

          </Row>

        </Grid>
    )
  }

};

const border = {
  // border: 'solid black 1px'
}

const jsonData = {
  "nodes": [
  { id: 'C0', text: 'My dogs curious face', level: 0, children: [1, 2, 3], parent: null, author: 'BeagleBob7', url: "http://www.animalgenetics.us/images/canine/Beagle4.jpg"},
  { id: 'C1', text: 'Same here! I think its a beagle thing', level: 1, children: [ 4, 5 ], parent: 'C0', author: "catnip47" },
  { id: 'C2', text: 'Classic 30 degree head tilt', level: 1, children: [ 6 ], parent: 'C0', author: "jackrabbit5" },
  { id: 'C3', text: 'When theres a treat in smellshot', level: 1, children: [ 7 ], parent: 'C0', author: "meanstack91" },
  { id: 'C4', text: 'Nah my lab does too', level: 2, children: [ 8 ], parent: 'C1', author: "hooplahadup" },
  { id: 'C5', text: 'Maybe! My pup does the same thing', level: 2, children: [], parent: 'C1', author: "bballoo" },
  { id: 'C6', text: 'Lol u measured that shit', level: 2, children: [ 9 ], parent: 'C2', author: "timpumbo" },
  { id: 'C7', text: 'Smellshot hahahaha', level: 2, children: [], parent: 'C3', author: "skrrrttt88" },
  { id: 'C8', text: 'Agreed ya my dalmation been doing this since she was born', level: 3, children: [], parent: 'C4', author: "lil uzi horizont" },
  { id: 'C9', text: 'eyeballed then verified with protractor mate', level: 3, children: [], parent: 'C6' , author: "bathtub gin"} ],

  "links": [
  { source: 0, target: 1, value: 1 },
  { source: 0, target: 2, value: 1 },
  { source: 0, target: 3, value: 1 },
  // { source: 0, target: 4, value: 0 },
  // { source: 0, target: 5, value: 0 },
  // { source: 0, target: 6, value: 0 },
  // { source: 0, target: 7, value: 0 },
  // { source: 0, target: 8, value: 0 },
  // { source: 0, target: 9, value: 0 },
  // { source: 1, target: 2, value: 0 },
  // { source: 1, target: 3, value: 0 },
  { source: 1, target: 4, value: 1 },
  { source: 1, target: 5, value: 1 },
  // { source: 1, target: 6, value: 0 },
  // { source: 1, target: 7, value: 0 },
  // { source: 1, target: 8, value: 0 },
  // { source: 1, target: 9, value: 0 },
  // { source: 2, target: 3, value: 0 },
  // { source: 2, target: 4, value: 0 },
  // { source: 2, target: 5, value: 0 },
  { source: 2, target: 6, value: 1 },
  // { source: 2, target: 7, value: 0 },
  // { source: 2, target: 8, value: 0 },
  // { source: 2, target: 9, value: 0 },
  // { source: 3, target: 4, value: 0 },
  // { source: 3, target: 5, value: 0 },
  // { source: 3, target: 6, value: 0 },
  { source: 3, target: 7, value: 1 },
  // { source: 3, target: 8, value: 0 },
  // { source: 3, target: 9, value: 0 },
  // { source: 4, target: 5, value: 0 },
  // { source: 4, target: 6, value: 0 },
  // { source: 4, target: 7, value: 0 },
  { source: 4, target: 8, value: 1 },
  // { source: 4, target: 9, value: 0 },
  // { source: 5, target: 6, value: 0 },
  // { source: 5, target: 7, value: 0 },
  // { source: 5, target: 8, value: 0 },
  // { source: 5, target: 9, value: 0 },
  // { source: 6, target: 7, value: 0 },
  // { source: 6, target: 8, value: 0 },
  { source: 6, target: 9, value: 1 },
  // { source: 7, target: 8, value: 0 },
  // { source: 7, target: 9, value: 0 },
  // { source: 8, target: 9, value: 0 }
  ]
}

export default VizPanel;
