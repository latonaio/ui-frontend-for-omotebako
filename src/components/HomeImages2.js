import React from "react";
import "react-slideshow-image/dist/styles.css";
import styled, { keyframes } from "styled-components";

import ryokan1 from ".././assets/images/ryokan1.png";
import ryokan2 from ".././assets/images/ryokan2.png";
import ryokan3 from ".././assets/images/ryokan3.png";

// const images = [
// 	{src:ryokan1 },{src:ryokan2 },{src:ryokan3 }
// ]

let num = 0;

const renderImage = (img) => {
	return (
		<div>
			<SlideContainer>
				<Image src={img} />
			</SlideContainer>
		</div>
	);
}

class HomeImages2 extends React.Component {
	state = {
		displayingImage: 0
	}

	componentDidMount() {
		setInterval(() => this.showNewImage(), 6000);
	}

	showNewImage = () => {
console.log({num})
		if(num<3){
			this.setState({displayingImage: num})
			num++;
		}else{
			this.setState({displayingImage: 0})
			num = 0;
		}

	}

  render() {
		const { displayingImage } = this.state

		return(
			<div>
			{displayingImage === 0 && renderImage(ryokan1)}
			{displayingImage === 1 && renderImage(ryokan2)}
			{displayingImage === 2 && renderImage(ryokan3)}
			</div>
		);

  }
}

export default HomeImages2;

const fadeIn = keyframes`
	from {
		opacity: 0;
	}

	to {
		 opacity: 1;
	}
`;

const fadeOut = keyframes`
	from {
		opacity: 0;
	}

	to {
		 opacity: 1;
	}
`;


const SlideContainer = styled.div`
  width: 100%;
	animation: 4s ${fadeIn} ease-in;
	animation: 3s ${fadeOut} ease-out;
`;

const Image = styled.img`
  flex: 1;
  position: relative;
  z-index: 1;
	width: 1670px;
	height: 100%;
`;
