import React, { PureComponent } from 'react';
import styled from "styled-components";
import {
  BarChart, Bar, XAxis, Tooltip, LabelList,
} from 'recharts';

const data = [
  {
    name: '20-39 Female', percentage: 28.7, label: "28.7%"
  },
  {
    name: '40-59 Male', percentage: 21.4,label: "21.4%"
  },
  {
    name: '20-39 Male', percentage: 16.2,label: "16.2%"
  },
  {
    name: '40-59 Female', percentage: 9.5,label: "9.2%"
  },
  {
    name: '0-19 Male', percentage: 7.2,label: "7.2%"
  },
  {
    name: '70 - Female', percentage: 3.8,label: "3.8%"
	},
	{
    name: 'others', percentage: 13.2,label: "13.2%"
  },
];

export default class Example extends PureComponent {


  render() {
    return (
			<Container>
			<Title>By Gender / Age</Title>
      <BarChart
        layout="vertical"
        width={500}
        height={300}
				data={data}
				margin={{top: 50 }}
		    fontSize={20}
      >

        <Tooltip />
        <Bar dataKey="percentage" barSize={30} fill="gold">
			  <LabelList dataKey="name" position="insideLeft" fontSize={20}/>
				<LabelList dataKey="label" position="right" fontSize={20}/>
				</Bar>
				<XAxis type="number" display="none"/>
      </BarChart>

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
	margin-top: 30px;
`;