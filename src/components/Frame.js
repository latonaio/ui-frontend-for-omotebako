import React from "react";
import styled from "styled-components";
import Navbar from "../components/Navbar";

import Header from "../components/Header";

const Frame = ({ location }) => {
	return (
		<Container>
			<Header />
			<Navbar />
		</Container>
	);

}

export default Frame;

const Container = styled.div`
position: fixed;
width: 100vw;
`;