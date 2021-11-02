import React from "react";
import styled, { keyframes } from "styled-components";

import ryokan1 from ".././assets/images/ryokan1.png";
import ryokan2 from ".././assets/images/ryokan2.png";
import ryokan3 from ".././assets/images/ryokan3.png";

export const HomeImages = () => {
  return (
    <div>
      <SlideContainer1>
        <Image src={ryokan1} />
      </SlideContainer1>
      <SlideContainer2>
        <Image src={ryokan2} />
      </SlideContainer2>
      <SlideContainer3>
        <Image src={ryokan3} />
      </SlideContainer3>
    </div>
  );
};

export default HomeImages;

const fade1 = keyframes`
from {
	opacity: 1.0
}


33% {
	opacity: 0.0
}

80% {
	opacity: 0.7
}

to {
	opacity: 0.9
}
`;

const fade2 = keyframes`
from {
	opacity: 0.0
}

33% {
	opacity: 1.0
}

66% {
	opacity: 0.0
}

to {
	opacity: 0.0
}
`;

const fade3 = keyframes`
from {
	opacity: 0.0
}

33% {
	opacity: 0.0
}


66% {
	opacity: 1.0
}


to {
	opacity: 0.2
}
`;

const SlideContainer1 = styled.div`
  animation-duration: 33s; 
  animation-name: ${fade1};
  animation-iteration-count: infinite;
  animation-timing-function: ease-in;
`;

const SlideContainer2 = styled.div`
  animation-duration: 33s;
  animation-name: ${fade2};
  animation-iteration-count: infinite;
  animation-timing-function: ease-in;
`;

const SlideContainer3 = styled.div`
  animation-duration: 33s;
  animation-name: ${fade3};
  animation-iteration-count: infinite;
  animation-timing-function: ease-in;
`;

const Image = styled.img`
  margin-top: -20px;
  margin-left: -40px;
  flex: 1;
  position: fixed;
  z-index: 1;
  width: 1670px;
  height: 920px;
`;
