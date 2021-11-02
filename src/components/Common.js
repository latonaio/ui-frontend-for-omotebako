import styled from "styled-components";
import { Link } from "react-router-dom";

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

export const Container = styled.div`
  display: flex;
  flex-direction: row;
`;

export const Contents = styled.div`
  width: 1670px;
  height: 800px;
  font-size: 3rem;
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

export const Message = styled.div`
  height: auto;
  text-align: center;
  width: 55%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 4rem;
  line-height: 1.5;
  font-family: "UD";
  font-weight: bold;
  flex-direction: column;
  line-break: strict;
	white-space: pre;
	top:25%;
`;

export const CameraMessage = styled.div`
  position: fixed;
  margin-left: auto;
  width: 650px;
  height: auto;
  top: 500px;
  left: 760px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 9;

  font-weight: bold;
  font-size: 2.4rem;
  line-height: 1.5;
  font-family: "UD";
  line-break: strict;
  white-space: pre;
  text-align: center;
  background-color: white;
  opacity:50%;
  padding: 50px 0;
 `;

export const Button = styled.button`
  height: 174px;
  width: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: #f7c142;
  color: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 5.6rem;
  text-shadow: 3px 4px 5px rgba(0, 0, 0, 0.2);
  font-family: "Segoe UI";
  white-space: pre;
  border: none;
  text-decoration: none;
  margin: 30px 0;
`;

export const ListHeader = styled.div`
  display: grid;
  grid-template-rows: 1em;
  grid-template-columns: 1fr 300px 1fr 1fr;
  height: 40px;
  font-size: 3rem;
  align-items: center;
  text-align: left;
  background: ${(props) => props.theme.primary};
  padding: 15px;
  color: white;
  align-content: center;
`;

export const List = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px 1fr 1fr;
  padding: 15px;
  font-size: 2rem;
  height: 30px;
  align-items: center;
  text-align: left;
  color: #3968bf;
  font-family: "Segoe UI";
  align-items: baseline;
  cursor: pointer;
  border-bottom: 1px solid #c7c7c7;
  overflow: hidden;
  &:hover {
    background-color: #aed6c3;
  }
`;

export const ArrowButton = styled.div`
  margin-left: auto;
  margin-right: auto;
  border-color: ${(props) => props.theme.primary} transparent;
  border-style: solid;
  border-width: 20px 100px 0px 100px;
  height: 0px;
  width: 0px;
`;

export const StreamingButton = styled(Button)`
  position: relative;
  width: 150px;
  height: 80px;
  background-color: green;
  position: fixed;
  top: 150px;
  left: 270px;
  z-index: 10;
  font-size: 2.2rem;
  font-family: "Segoe UI";
  outline: none;
`;
