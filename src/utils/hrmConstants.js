const CAME = 1;
const DIDNOTCOME = 2;
const TIME_OFF = 3;
const VACATION = 4;
const BUSINESS_TRIP = 5;
const SICK_LEAVE = 6;
const APPOINTMENT = 7;

export const employeeActivityTypes = {
  CAME,
  DIDNOTCOME,
  TIME_OFF,
  VACATION,
  BUSINESS_TRIP,
  SICK_LEAVE,
  APPOINTMENT,
};

export const attendanceJournalStatusData = [
  { id: VACATION, name: 'Məzuniyyət' },
  { id: BUSINESS_TRIP, name: 'Ezamiyyət' },
  { id: TIME_OFF, name: 'İcazə' },
  { id: APPOINTMENT, name: 'İş görüşü' },
  { id: SICK_LEAVE, name: 'Xəstəlik' },
];

// timeCard constants http://hrmdoc.prospectsmb.com/#api-Timecard_report
/** 
1 - İşə qəbul olunmayıb
2 - Qeyri iş günü
3 - İstirahət günü
4 - Ezamiyyət
5 - Xəstəlik
6 - Məzuniyyət
7 - İş günü //saatlar [1,2,3,4,5,6,7,8]
*/

export const eventCodes = {
  1: {
    label: 'QO',
    color: '#505050',
    title: 'İşə qəbul olunmayıb',
  },

  2: {
    label: 'Qİ',
    color: '#BB6BD9',
    title: 'Qeyri iş günü',
  },

  3: {
    label: 'İS',
    color: '#33658A',
    title: 'İstirahət günü',
  },

  4: {
    label: 'EZ',
    color: '#F2994A',
    title: 'Ezamiyyət',
  },

  5: {
    label: 'XS',
    color: '#EB5757',
    title: 'Xəstəlik',
  },

  6: {
    label: 'MZ',
    color: '#4E9CDF',
    title: 'Məzuniyyət',
  },

  7: {
    label: '0',
    color: '#fff',
    title: 'İş günü',
  },
};

const workHours = {};

// generate working hours
Array.from(Array(8).keys()).forEach(item => {
  // start index from 8
  workHours[item + 8] = {
    title: `${item + 1} saat`,
    label: item + 1,
  };
});

export const workTimeEventCodes = { ...eventCodes, ...workHours };

// colors
export const hrmNonWorkingColors = [
  {
    name: 2500134,
  },
  {
    name: 16065069,
  },
  {
    name: 16405532,
  },
  {
    name: 16419862,
  },
  {
    name: 5424154,
  },
  {
    name: 1609983,
  },
];
export const hrmNonWorkingColorsValues = {
  2500134: `rgb(38, 38, 38)`,
  16065069: `rgb(245, 34, 45)`,
  16405532: `rgb(250, 84, 28)`,
  16419862: `rgb(250, 140, 22)`,
  5424154: `rgb(82, 196, 26)`,
  1609983: `rgb(24, 144, 255)`,
};

export const hrmNonWorkingTypesOptions = [
  {
    id: 1,
    name: 'Bayram',
  },
  {
    id: 2,
    name: 'Matəm',
  },
];
export const hrmNonWorkingTypes = { 1: 'Bayram', 2: 'Matəm' };
