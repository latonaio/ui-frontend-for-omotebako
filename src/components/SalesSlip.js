import React from "react";
import styled from "styled-components";
import Navbar from "../components/Navbar";

const SalesSlip = () => {
  return (
    <Container>
      <Row>
        <Label>伝票番号：</Label>
        <Box>2054</Box>
      </Row>
      <Row>
        <Label>伝票タイプ：</Label>
        <Box>売上伝票（チェックアウト）</Box>
      </Row>
      <Row>
        <Label>伝票日付：</Label>
        <Box>2020/5/21</Box>
      </Row>
      <Row>
        <Label>Guest:</Label>
        <Box>XXXXXXX</Box>
      </Row>
      <Row>
        <Label>金額:</Label>
        <Box>37,100</Box>
      </Row>
      <Row>
        <Label>仕訳:</Label>　
        <AccountsSection>
          <Label>売掛金</Label>
          <Label>37,100    /</Label>
          <Label>売上高</Label>
          <Label>　33,455</Label>
          <Label />
          <Label />
          <Label>仮受入湯税</Label>
          <Label>　150</Label>
          <Label />
          <Label />
          <Label>仮受消費税</Label>
          <Label>　3,345</Label>
        </AccountsSection>
      </Row>
    </Container>
  );
};

export default SalesSlip;

const AccountsSection = styled.div`
  display: grid;
	grid-template-areas: "a a b"
	                     "c c c"
                       "d d d";
`;

const Label = styled.div`
  width: 250px;
  text-align: left;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  margin: 10px;
`;

const Box = styled.div`
  border: 1px solid black;
  width: 700px;
  margin: 0 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  width: 80%;
  height: 50%;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  text-align: left;
  font-size: 4rem;
`;
