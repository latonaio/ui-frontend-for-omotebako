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
    name: "-19",
		割合: 27.0,
		label: "27%"
  },
  {
    name: "20-29",
		割合: 19.9,
		label: "19.9%"
  },
  {
    name: "30-39",
		割合: 17.5,
		label: "17.5%"
  },
  {
    name: "40-49",
		割合: 14.8,
		label: "14.8%"
  },
  {
    name: "50-59",
		割合: 13.7,
		label: "13.7%"
  },
  {
    name: "60-69",
		割合: 14.0,
		label: "14.0%"
  },
  {
    name: "70-",
		割合: 17.4,
		label: "17.4%"
  },
];

export default class Example extends PureComponent {

  render() {
    return (
			<Container>
			<Title>By Age</Title>
      <BarChart
        width={500}
        height={250}
        data={data}
        margin={{right: 30, left: 30}}
        fontSize={20}
      >
        <XAxis dataKey="name" />
        <Tooltip />
        <Bar dataKey="割合" fill="#8884d8" barSize={40}  minPointSize={5}>
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