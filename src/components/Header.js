import styled from "styled-components";
import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/header-girl.png";
import aion from "../assets/images/aion_logo.png";
import { color } from "../helper/styles"

const Header = () => {
  return (
    <Container color={color}>
      <Logo to="/">
        <Title>OMOTE-Bako</Title>
        <Image src={logo} />
      </Logo>
      <Logo>
        <SubTitle>Powered by</SubTitle>
        <AionImage src={aion} />
      </Logo>
    </Container>
  );
};

export default Header;

const Container = styled.div`
  width: 1840px;
  height: 140px;
  background: #38bdf8;
  display: flex;
  align-items: center;
  color: ${(props) => props.color.white};
  justify-content: space-between;
  padding: 5px 40px 15px;
`;

const Image = styled.img`
  max-width: 9em;
`;

const AionImage = styled.img`
  width: 230px;
  margin-left: 20px;
`;

const SubTitle = styled.div`
  font-size: 3em;
  font-family: "Calibri Light";
  font-weight: bold;
  text-shadow: 3px 4px 5px rgba(0, 0, 0, 0.2);
`;

const Logo = styled(Link)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  height: 100%;
  text-decoration: none;
  color: white;
`;

const Title = styled.div`
  font-size: 6em;
  font-family: "Calibri Light";
  font-weight: bold;
  margin-top: 30px;
  text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.4);
`;