import React from 'react';
import styled from 'styled-components';

const Button = ({ size, text }) => {

	return (
		<Container size={size}>{text}</Container>
	);
};

export default Button;

const Container = styled.div`
	height: ${(props) => props.size === 'large' ? '160' : '114'}px;
	width: ${(props) => props.size === 'large' ? '529' : '72'}px;
	background-color: #F7C142;
	display: flex;
	justify-content: center;
	align-items: center;
	color: white;
	border-radius: 10px;
	cursor: pointer;
	font-size: 5.2rem;
	text-shadow: 1px 5px 8px rgba(0, 0, 0, 0.51);
	margin: 10px;
`;