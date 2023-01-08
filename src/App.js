import React, { startTransition } from 'react';
import './style.css';
import {Provider, connect} from 'react-redux';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import "bootstrap/dist/css/bootstrap.min.css";
import {Button, Card, Nav, Col, Row, Image} from 'react-bootstrap';
import { findDOMNode } from 'react-dom';
import $ from 'jquery';
import thunk from 'redux-thunk';
import {PropTypes} from 'prop-types';
import * as d3 from 'd3';
import { timeMinute } from 'd3';
import { timeFormat } from 'd3-time-format';
import * as topojson from 'topojson';

const [UPDATE_HEADING, UPDATE_SUBHEADING, MOVIE_CLICKED, GAME_CLICKED, KICKSTARTER_CLICKED] = ['UPDATE_HEADING', 'UPDATE_SUBHEADING', 'MOVIE_CLICKED', 'GAME_CLICKED', 'KICKSTARTER_CLICKED'];

//KICKSTARTER
const updateKickStarterState = (kBool) => ({
	type: KICKSTARTER_CLICKED,
	kBool: kBool
});

const kickStarterReducer = (state=false, action) => {
	switch(action.type){
		case KICKSTARTER_CLICKED:
			return action.kBool;
		default:
			return state;
	}
};
//---------------------------------------------------------------------------

//GAME
const updateGameState = (gBool) => ({
	type: GAME_CLICKED,
	gBool: gBool
});

const gameReducer = (state=true, action) => {
	switch(action.type){
		case GAME_CLICKED:
			return action.gBool;
		default:
			return state;
	}
};
//----------------------------------------------------------------------

//MOVIE
const updateMovieState = (mBool) => ({
	type: MOVIE_CLICKED,
	mBool:mBool 
});

const movieReducer = (state=false, action) => {
	switch(action.type){
		case MOVIE_CLICKED:
			return action.mBool;
		default:
			return state;
	}
};
//-------------------------------------------------------------

//HEADING
const heading_actionCreator = (head) =>({
	type: UPDATE_HEADING,
	head: head
});

const headingReducer = (state='', action)=>{
	switch(action.type){
		case UPDATE_HEADING:
			return action.head;
		default:
			return state;
	}
};
//----------------------------------------------
//SUBHEADING
const subHeading_actionCreator = (subHead) => ({
	type: UPDATE_SUBHEADING,
	subHead: subHead
});

const subHeadingReducer = (state='', action) => {
	switch(action.type){
		case UPDATE_SUBHEADING:
			return action.subHead;
		default:
			return state;
	}
};

const rootReducer = combineReducers({
	head: headingReducer,
	subHead: subHeadingReducer,
	mBool: movieReducer,
	gBool: gameReducer,
	kBool: kickStarterReducer
});

const store = createStore(rootReducer);

class Main extends React.Component{
	constructor(props){
		super(props);
		this.showSVG = this.showSVG.bind(this);
		this.game = this.game.bind(this);
		this.movie = this.movie.bind(this);
		this.kickStarter = this.kickStarter.bind(this);
		this.setDataBool = this.setDataBool.bind(this);
		this.updateHead_n_SubHead = this.updateHead_n_SubHead.bind(this);
		this.mainSvg = this.mainSvg.bind(this);
		this.heirachy = this.heirachy.bind(this);
		this.tree = this.tree.bind(this);
		//this.createShapes = this.createShapes.bind(this);
	}

	//createShapes = (myData, colorObject) => {
		//const [w, h, padding] = [1250, window.innerHeight - 20, 10];
		//const mainSvg = d3.select('#mainSvg').attr('height', h).attr('width', w);
	//		let treeShape = mainSvg.selectAll('g').data(myData).enter().append('g')
	//		.attr('transform', d => (`translate(${d.x0}, ${d.y0})`));

	//		treeShape.append('rect').attr('class', 'tile').attr('fill', d => {
	//			return colorObject[`${d['data']['category']}`];
	//		})
	//		.attr('data-name', d=>(d['data']['name'])).attr('data-category', d=>(d['data']['category'])).attr('data-value', d=>(d['data']['value'])).attr('width', d=>(d.x1 - d.x0)).attr('height', d=>(d.y1 - d.y0)).attr('stroke', 'black').attr('stroke-width', '0.1px');
	//};

	tree = (operator) => {
		const treeMap = d3.treemap().size([1400, 600]);
		return treeMap(operator);
	};

	heirachy = (data) => {
		const tree = d3.hierarchy(data, (node)=>(node.children))
		.sum((node)=> (node.value))
		.sort((node1, node2)=> (node2.value - node1.value));

		return 	this.tree(tree);
 
	};

	mainSvg = ()=>{
		const [w, h, padding] = [1400, window.innerHeight + 200, 10];
		const mainSvg = d3.select('#mainSvg').attr('height', h).attr('width', w);
		return mainSvg;
	};

	updateHead_n_SubHead = (head, subHead) => {
		this.props.updateHead(head);
		this.props.updateSubHead(subHead);
	};

	setDataBool = (game, movie, kickStarter) => {
		this.props.updateGameBool(game);
		this.props.updateMovieBool(movie);
		this.props.updateKickStarterBool(kickStarter);
	};
	
	game = ()=>{
		//Set the state of game movie and kickStarter to display messages
		const [heading, subHeading] = ['Video Game Sales', 'Top 100 Most Sold Video Games Grouped by Platform'];
		this.updateHead_n_SubHead(heading, subHeading);
		//---------------------------------------------------------------------------

		this.setDataBool(true, false, false);//Make game show on screen leaving the other two trees behind: game gets value true

		//Create new xmlHttpRequest
		const url = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json';
		const req = new XMLHttpRequest();
		req.open('GET', url, true);
		req.send();
		req.onload = () => {
			const json = JSON.parse(req.responseText);
			const heirachy = this.heirachy(json);
			//console.log(heirachy.leaves()[0])
			const sampleColor = ['#ffe5ec', '#ffc2d1', '#ffb3c6', '#ff8fab', '#fb6f92', '#936639', '#b6ad90', '#a4ac86', '#656d4a', '#eae2b7', '#fcbf49', '#f77f00', '#a5a58d', '#b7b7a4', '#ffe8d6', '#ddbea9', '#e0b1cb', '#02c39a'];
			const colorObject = {};
			let myArr = (heirachy.leaves()).map((elem)=>(elem['data']['category']));
			let condensedArr = [...new Set(myArr)];//remove duplicated elements
			condensedArr.map((elem, i) => {
				colorObject[elem] = sampleColor[i];
			});

			let myData = heirachy.leaves();
			let mainSvg = this.mainSvg();
			let treeShape = mainSvg.selectAll('g').data(myData).enter().append('g')
			.attr('transform', d => (`translate(${d.x0}, ${d.y0})`));

			treeShape.append('rect').attr('class', 'tile').attr('fill', d => {
				return colorObject[`${d['data']['category']}`];
			})
			.attr('data-name', d=>(d['data']['name'])).attr('data-category', d=>(d['data']['category'])).attr('data-value', d=>(d['data']['value'])).attr('width', d=>(d.x1 - d.x0)).attr('height', d=>(d.y1 - d.y0)).attr('stroke', 'black').attr('stroke-width', '0.1px');

			treeShape.append('text').text(d => (d['data']['name'])).attr('x', 5).attr('y', 20).attr('lengthAdjust', "spacingAndGlyphs").attr('textLength', 60);

			treeShape.on('mouseenter', (i, d) => {
				console.log(`d=`);
				console.log(d);

				d3.select('#mainSvg').append('foreignObject').attr('id', 'tooltip')
				.attr('width', 230).attr('height', 150)
				.attr('data-value', d['data']['value'])
				.attr('x', d.x0).attr('y', d.y0).append('xhtml:div').attr('id', 'tooltipDiv').html(`<div>Name: ${d['data']['name']}</div>
				<div>Category: ${d['data']['category']}</div>
				<div>Value: ${d['data']['value']}</div>`);
			}).on('mouseout', ()=>(d3.select('#tooltip').remove()));

			const [rh, rw, rPadding] = [300, 600, 20];
			const subSvg = d3.select('#mainSvg').append('foreignObject').attr('width', rw).attr('height', rh).attr('y', 600).attr('x', 400).append('svg').attr('id', 'legend').attr('width', rw).attr('height', rh);

			const myColorLegend = subSvg.selectAll('g').data(condensedArr).enter().append('g');

			myColorLegend.append('rect').attr('width', 40).attr('height', 40).attr('class', 'legend-item').attr('x', (d, i)=> {
				const [sideMargin, innerPadding] = [60, 90];
				if(i <= Math.floor((condensedArr.length-1)/3)){
					return ((i * innerPadding) + sideMargin);
				}else if(i <= Math.floor((condensedArr.length - 1)/3)*2 + 1){
					return (((i - Math.floor(condensedArr.length/3)) * innerPadding) + sideMargin);
				}else {
					return (((i - Math.floor(condensedArr.length/3) * 2) * innerPadding) + sideMargin);
				}
			}).attr('y', (d, i)=>{
				const addedY = 50;
				if(i <= Math.floor((condensedArr.length - 1)/3)){
					return 10 + addedY;
				}else if(i <= Math.floor((condensedArr.length - 1)/3)*2 + 1){
					return 80 + addedY;
				}else{
					return 150 + addedY;
				}
			}).attr('fill', d=>(colorObject[`${d}`])).attr('stroke', 'white').attr('stroke-width', '1px');

			myColorLegend.append('text').text(d=>{
				return d;
			}).attr('y', (d, i)=>{
				const addedY = 48;
				if(i <= Math.floor((condensedArr.length - 1)/3)){
					return 10 + addedY;
				}else if(i <= Math.floor((condensedArr.length - 1)/3)*2 + 1){
					return 80 + addedY;
				}else{
					return 150 + addedY;
				}
			}).attr('x', (d, i)=> {
				const [sideMargin, innerPadding] = [70, 90];
				if(i <= Math.floor((condensedArr.length-1)/3)){
					return ((i * innerPadding) + sideMargin);
				}else if(i <= Math.floor((condensedArr.length - 1)/3)*2 + 1){
					return (((i - Math.floor(condensedArr.length/3)) * innerPadding) + sideMargin);
				}else {
					return (((i - Math.floor(condensedArr.length/3) * 2) * innerPadding) + sideMargin);
				}
			}).attr('text-anchor', 'center');
		};
	};

	movie = ()=>{
		this.setDataBool(false, true, false);
		const [heading, subHeading] = ['Movie Sales', 'Top 100 Highest Grossing Movies Grouped By Genre'];
		this.updateHead_n_SubHead(heading, subHeading);
		//Create new xmlHttpRequest
		const url = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';
		const req = new XMLHttpRequest();
		req.open('GET', url, true);
		req.send();
		req.onload = ()=>{
			const json = JSON.parse(req.responseText);
			const heirachy = this.heirachy(json);
			
			const sampleColor = ['#f77f00', '#a5a58d', '#b7b7a4', '#ffe8d6', '#ddbea9', '#e0b1cb', '#02c39a'];
			const colorObject = {};
			let myArr = (heirachy.leaves()).map((elem)=>(elem['data']['category']));
			let condensedArr = [...new Set(myArr)];//remove duplicated elements
			condensedArr.map((elem, i) => {
				colorObject[elem] = sampleColor[i];
			});

			let myData = heirachy.leaves();
			let mainSvg = this.mainSvg();
			let treeShape = mainSvg.selectAll('g').data(myData).enter().append('g')
			.attr('transform', d => (`translate(${d.x0}, ${d.y0})`));

			treeShape.append('rect').attr('class', 'tile').attr('fill', d => {
				return colorObject[`${d['data']['category']}`];
			})
			.attr('data-name', d=>(d['data']['name'])).attr('data-category', d=>(d['data']['category'])).attr('data-value', d=>(d['data']['value'])).attr('width', d=>(d.x1 - d.x0)).attr('height', d=>(d.y1 - d.y0)).attr('stroke', 'black').attr('stroke-width', '0.1px');
		};
	};

	kickStarter = ()=>{
		this.setDataBool(false, false, true);
		const [heading, subHeading] = ['Kickstarter Pledges', 'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category'];
		this.updateHead_n_SubHead(heading, subHeading);
		//Create new xmlHttpRequest
		const url = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json';
		const req = new XMLHttpRequest();
		req.open('GET', url, true);
		req.send();
		req.onload = () => {
			const json = JSON.parse(req.responseText);
			const heirachy = this.heirachy(json);
			//console.log(heirachy);
			//this.createTree(heirachy.leaves());
		};
	};

	shouldComponentUpdate(nextState, nextProps){
		return true;
	}

	componentWillMount(){
		$('body').addClass('backgroundColor');
	}
	componentWillUnmount(){
		document.removeEventListener('DOMContentLoaded', this.showSVG());
	}
	componentDidMount(){
		document.addEventListener('DOMContentLoaded', this.showSVG());
	}

	showSVG(){
		//Creating the width height and padding for the main svg

		//const displaySvg = ()=>{
		//	this.mainSvg();
		//};
		//displaySvg();
		if(this.props.mBool === true){
			this.movie();
		}else if(this.props.kBool === true){
			this.kickStarter();
		}else{
			this.game();
		}

	}


	render(){
		return(
			<div className="wrapperContainer">
				{/*<nav><p onClick={this.game}>Video Game Data Set</p>|<p onClick={this.movie}>Movies Data Set</p>|<p onClick={this.kickStarter}>Kickstarter Data Set</p></nav>*/}
				<br />
				<div className="discriptionDiv">
					<h1 id="title">{this.props.head}</h1>
					<p id="description">{this.props.subHead}</p>
				</div>
				<div className="svgDiv">
					<svg id='mainSvg'></svg>
				</div>
			</div>
		);
	}
};

const mapStateToProps = (state) => ({
	head: state.head,
	subHead: state.subHead,
	mBool: state.mBool,
	gBool: state.gBool,
	kBool: state.kBool
});

const mapDispatchToProps = (dispatch) => ({
	updateHead: (head) => (dispatch(heading_actionCreator(head))),
	updateSubHead: (subHead) => (dispatch(subHeading_actionCreator(subHead))),
	updateMovieBool: (mBool) => (dispatch(updateMovieState(mBool))),
	updateGameBool: (gBool) => (dispatch(updateGameState(gBool))),
	updateKickStarterBool: (kBool) => (dispatch(updateKickStarterState(kBool)))
});

const Container = connect(mapStateToProps, mapDispatchToProps)(Main);

export default class AppWrapper extends React.Component{
	render(){
		return(
			<Provider store={store}>
				<Container />
			</Provider>
		);
	}
}

//export default Main;