import React from 'react';
import styled from "styled-components";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

const Loader = () => {
	return (<LoaderContainer><FontAwesomeIcon icon={faSpinner} spin /></LoaderContainer>);
}

export default Loader;


const LoaderContainer = styled.div`
	display: flex;
	justify-content:center;
	align-items: center;
	font-size: 10.6rem;
`;



