import styled from "styled-components";
import React from "react";

const ReservationList = ({ reservationList, onClick, imagePath}) => {
  return (
    <Container>
      <Image src={imagePath}/>
      <ListContainer>
        <Text>顧客リストから該当する顧客を選択してください</Text>
        <ListHeader>
          <Text>顧客名 </Text>
          <Center>宿泊日</Center> <Center>{`泊数/\n人数`}</Center>
          <Center>部屋数</Center>
        </ListHeader>
        <ListContents>
          {reservationList && reservationList.length > 0 && reservationList.map((i) => (
            <List key={i.guest_id} onClick={() => onClick(i.guest_id)}>
              <Text>
                {i.name}, {i.name_kana}
              </Text>
              <Center> {i.stay_date_from.substr(0,10)}</Center>
              <Center>
                {i.stay_days}/{i.number_of_guests}
              </Center>
              <Center> {i.number_of_rooms}</Center>
            </List>
          ))}
        </ListContents>
        <ArrowButton />
      </ListContainer>
    </Container>
  );
};

export default ReservationList;

const ListContainer = styled.div`
  width: 1000px;
  height: 800px;
`;


const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
`;

const List = styled.div`
  padding: 15px 15px;
  display: grid;
  grid-template-columns: 450px 2fr 1fr 1fr;
  font-size: 2rem;
  height: 30px;
  align-items: center;
  text-align: left;
  color: #3968bf;
  font-family: "Segoe UI";
  align-items: baseline;
  cursor: pointer;
  border-top: 1px solid #c7c7c7;
  border-bottom: 1px solid #c7c7c7;
  overflow: hidden;
  &:hover {
    background-color: #aed6c3;
  }
`;

const Image = styled.img`
  width: 500px;
  height: 275px
`;

const Text = styled.div`
  font-size: 2.8rem;
`;


const Center = styled(Text)`
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: pre;
`;


const ArrowButton = styled.div`
  margin-left: auto;
  margin-right: auto;
  border-color: ${(props) => props.theme.primary} transparent;
  border-style: solid;
  border-width: 20px 100px 0px 100px;
  height: 0px;
  width: 0px;
`;

const ListHeader = styled.div`
  display: grid;
  grid-template-rows: 1em;
  grid-template-columns: 450px 2fr 1fr 1fr;
  height: 80px;
  font-size: 2rem;
  align-items: center;
  text-align: left;
  background: ${(props) => props.theme.primary};
  padding: 10px;
  color: white;
  align-content: center;
  margin-top: 10px;
  font-family: "Segoe UI";
`;

const ListContents = styled.div`
  overflow-y: scroll;
  height: 70%;
  padding-bottom: 30px;
`;
