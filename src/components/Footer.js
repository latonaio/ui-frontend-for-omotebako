import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <FooterSection>
      <StyledFooterButton to="/customer-info" color="red">
        {`顧客\n管理`}
      </StyledFooterButton>
      <StyledFooterButton to="/room-management" color="#404040">
        {`客室\n管理`}
      </StyledFooterButton>
      <StyledFooterButton
        to="/room-management"
        color="#9cc3e6"
      >{`予約サイト\n連携`}</StyledFooterButton>
      <StyledFooterButton
        to="/room-management"
        color="#9cc3e6"
      >{`自社HP\n連携`}</StyledFooterButton>
    </FooterSection>
  );
};

export default Footer;

export const ModeButton = styled(Link)`
  height: 70px;
  width: 120px;
  background-color: ${(props) => props.color};
  font-size: 2rem;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  white-space: pre;
  margin: 0 5px;
  text-decoration: none;
  text-align: center;
`;

const StyledFooterButton = styled(ModeButton)`
  display: flex;
  align-items: center;
  justify-contents: center;
`;

export const FooterSection = styled.div`
  position: absolute;
  right: 40px;
  bottom: 2%;
  width: 100%;
  height: 8%;
  display: flex;
  flex-direction: row-reverse;
`;
