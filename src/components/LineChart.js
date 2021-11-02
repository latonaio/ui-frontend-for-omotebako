import React, { PureComponent } from 'react';
import styled from "styled-components";
import {
  LineChart, Line, XAxis, Tooltip
} from 'recharts';

const data = [
  {
		name: 'Week1',
		value: 930300
  },
  {
		name: 'Week2',
		value: 2511900
  },
  {
		name: 'Week3',
		value: 1302000
	},
	{
		name: 'Week4',
		value: 1209950
  },
];

export default class Example extends PureComponent {

  render() {
    return (
			<Container>
			<Title>By Time-Scale</Title>
			<LineChart
        width={400}
        height={240}
        data={data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
				}}
				fontSize={20}
      >
        <XAxis dataKey="name" />
        <Tooltip />
        <Line type="number" dataKey="value" stroke="#8884d8"/>
      </LineChart>
			</Container>
    );
  }
}


const Container = styled.div`
display: flex;
justify-content: center;
align-items: center;
flex-direction: column;
`;

const Title = styled.div`
	font-size: 3rem;
`;