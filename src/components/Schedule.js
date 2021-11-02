import React from 'react';
import moment from 'moment'
import Scheduler, { Resource } from 'devextreme-react/scheduler';

import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';

const currentDate = moment().format('YYYY-MM-DD');
const views = ['day', 'week', 'month', 'timelineDay'];

const Schedule = ({ customersData, checkedData, updateDataCell, deleteDataCell, ...props }) => {

  return (
    <Scheduler
      dataSource={customersData}
      views={views}
      defaultCurrentView="day"
      defaultCurrentDate={currentDate}
      height={780}
      startDayHour={9}
      onAppointmentUpdated={updateDataCell}
      onAppointmentDeleted={deleteDataCell}
    >

      <Resource
        fieldExpr="priority"
        allowMultiple={false}
        dataSource={checkedData}
        label="Priority"
      />

    </Scheduler>
  );
}

export default React.memo(Schedule);
