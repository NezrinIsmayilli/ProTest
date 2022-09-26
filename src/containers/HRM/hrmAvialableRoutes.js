export const hrmMainPathList = {
  hrm_working_employees: '/hrm/employees',
  hrm_fired_employees: '/hrm/employees',
  hrm_activities: '/hrm/employees',

  sections: '/hrm/structure',
  positions: '/hrm/structure',
  structure: '/hrm/structure',
  occupation: '/hrm/structure',
  tree: '/hrm/structure',

  calendar: '/hrm/attendance',
  timecard: '/hrm/attendance',
  work_schedule: '/hrm/attendance',

  lateness_report: '/hrm/report',
  payroll: '/hrm/report',
  timecard_report: '/hrm/report',
};

export const routes = {
  hrm_fired_employees: {
    group: 'employees',
    link: '/hrm/employees/dismissed-people',
  },
  hrm_working_employees: {
    group: 'employees',
    link: '/hrm/employees/workers',
  },
  hrm_activities: {
    group: 'employees',
    link: '/hrm/employees/operations',
  },

  structure: {
    group: 'structure',
    link: '/hrm/structure/sections',
  },
  occupation: {
    group: 'structure',
    link: '/hrm/structure/positions',
  },
  tree: {
    group: 'structure',
    link: '/hrm/structure/tree',
  },

  calendar: {
    group: 'attendance',
    link: '/hrm/attendance/production-calendar',
  },
  timecard: {
    group: 'attendance',
    link: '/hrm/attendance/attendance-journal',
  },
  work_schedule: {
    group: 'attendance',
    link: '/hrm/attendance/work-schedule',
  },

  lateness_report: {
    group: 'report',
    link: '/hrm/report/fines',
  },
  timecard_report: {
    group: 'report',
    link: '/hrm/report/work-time-record',
  },
  payroll: {
    group: 'report',
    link: '/hrm/report/salary',
  },
};

// export const getAvailableHrmRoutes = (key, group_key) => {
//   if (group_key !== 'hrm') {
//     return;
//   }

//   const { group, link } = routes[key];

//   if (!hrmMainActivePathList[group]) {
//     hrmMainActivePathList[group] = link;
//   }
// };
