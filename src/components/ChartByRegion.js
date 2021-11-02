import React, { PureComponent } from "react";
import styled from "styled-components";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  LabelList,
} from "recharts";

const data = [
  {
    name: "Tokyo",
		割合: 27.0,
		label: "27%"
  },
  {
    name: "Kansai",
		割合: 19.9,
		label: "19.9%"
  },
  {
    name: "Kanto",
		割合: 17.5,
		label: "17.5%"
  },
  {
    name: "Kyushu",
		割合: 14.8,
		label: "14.8%"
  },
  {
    name: "Others",
		割合: 13.7,
		label: "13.7%"
  }
];

export default class Example extends PureComponent {

  render() {
    return (
			<Container>
			<Title>By Region</Title>
      <BarChart
        width={600}
        height={230}
        data={data}
				margin={{right: 30, left: 30}}
				fontSize={20}
      >
        <XAxis dataKey="name" />
        <Tooltip />
        <Bar dataKey="割合" fill="green" barSize={60}  minPointSize={5}>
          <LabelList dataKey="label" position="top" fontSize={20}/>
        </Bar>
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
`;