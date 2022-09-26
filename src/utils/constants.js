import 'moment/locale/az';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

moment.locale('az');

const { t } = useTranslation();

export const years = [
  {
    id: 2020,
    name: '2020',
  },
  {
    id: 2021,
    name: '2021',
  },
];

export const months = [
  {
    id: 1,
    name: 'january',
    label: 'Yanvar',
  },
  {
    id: 2,
    name: 'february',
    label: 'Fevral',
  },
  {
    id: 3,
    name: 'march',
    label: 'Mart',
  },
  {
    id: 4,
    name: 'april',
    label: 'Aprel',
  },
  {
    id: 5,
    name: 'may',
    label: 'May',
  },
  {
    id: 6,
    name: 'june',
    label: 'Iyun',
  },
  {
    id: 7,
    name: 'july',
    label: 'Iyul',
  },
  {
    id: 8,
    name: 'august',
    label: 'Avqust',
  },
  {
    id: 9,
    name: 'september',
    label: 'Sentyabr',
  },
  {
    id: 10,
    name: 'october',
    label: 'Oktyabr',
  },
  {
    id: 11,
    name: 'november',
    label: 'Noyabr',
  },
  {
    id: 12,
    name: 'december',
    label: 'Dekabr',
  },
];
export const quarters = [
  {
    id: 1,
    name: 'first',
    label: 'RÜB I',
    months: [1, 2, 3],
  },
  {
    id: 2,
    name: 'second',
    label: 'RÜB II',
    months: [4, 5, 6],
  },
  {
    id: 3,
    name: 'third',
    label: 'RÜB III',
    months: [7, 8, 9],
  },
  {
    id: 4,
    name: 'fourth',
    label: 'RÜB IV',
    months: [10, 11, 12],
  },
];

export const re_percent = /^[0-9]{1,9}\.?[0-9]{0,4}$/;
export const re_amount = /^[0-9]{1,9}\.?[0-9]{0,4}$/;
export const re_paymentAmount = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
export const re_quantity = /^[0-9]{1,5}$/;
export const currentYear = moment().year();
export const currentMonth = moment().month() + 1;
export const currentDay = moment().format('DD');

export const dateFormat = 'DD-MM-YYYY';
export const formatDate = date => moment(date).format(dateFormat);
export const fullDateTime = 'DD-MM-YYYY HH:mm';
export const fullDateTimeWithSecond = 'DD-MM-YYYY HH:mm:ss';
export const today = moment().format(dateFormat);
export const yesterday = moment()
  .subtract(1, 'day')
  .format(dateFormat);

export const todayWithMinutes = moment().format('DD.MM.YYYY HH:mm:ss');

export const thisWeekStart = moment()
  .startOf('week')
  .format(dateFormat);

export const thisWeekEnd = moment()
  .endOf('week')
  .format(dateFormat);

export const thisMonthStart = moment()
  .startOf('month')
  .format(dateFormat);

export const thisMonthEnd = moment()
  .endOf('month')
  .format(dateFormat);

export const thisYearStart = moment()
  .startOf('year')
  .format(dateFormat);

export const thisYearEnd = moment()
  .endOf('year')
  .format(dateFormat);

export const formItemSize = 'large';
export const defaultFormItemSize = 'default';

export const accountTypeOptions = [
  { id: 1, name: 'Nəğd hesablar' },
  { id: 2, name: 'Bank hesabları' },
  { id: 3, name: 'Kredit kartları' },
  { id: 4, name: 'Digər' },
];

export const operationNames = {
  EXPENSE: 1,
  INCOME: 2,
  SPEND: 3,
  MONEY_TRANSFER: 4,
  SALARY: 6, // not 5
  INITIAL_BALANCE: 7,
};

Object.freeze(operationNames);

export const connectTypes = {
  Invite: 0,
  ReSend: 1,
  Connected: 2,
  ReInvite: 3,
};

export const userConnectTypesNames = {
  [connectTypes.Invite]: 'Dəvət et',
  [connectTypes.ReSend]: 'Dəvət göndərilib',
  [connectTypes.Connected]: 'Qoşulub',
  [connectTypes.ReInvite]: 'Yenidən dəvət et',
};

export const userSearchConnectOperationTypes = {
  Not_Connected: 1,
  Connected: 2,
  All: 3,
};

export const workerOperationTypes = {
  Entrance: 1,
  Vacation: 4,
  TimeOff: 3,
  Fire: 2,
  BusinessTrip: 5,
  SickLeave: 6,
  Appointment: 7,
};

export const reportHistoryOperationStatus = {
  Non_Deleted: 0,
  Deleted: 1,
};

export const getMonthNameByNumber = number =>
  moment(number, 'M').format('MMMM');

export const optionsMonth = [
  { id: 1, name: 'Yanvar' },
  { id: 2, name: 'Fevral' },
  { id: 3, name: 'Mart' },
  { id: 4, name: 'Aprel' },
  { id: 5, name: 'May' },
  { id: 6, name: 'Iyun' },
  { id: 7, name: 'Iyul' },
  { id: 8, name: 'Avqust' },
  { id: 9, name: 'Sentyabr' },
  { id: 10, name: 'Oktyabr' },
  { id: 11, name: 'Noyabr' },
  { id: 12, name: 'Dekabr' },
];

export const optionsYear = [
  { id: currentYear - 3, name: `${currentYear - 3}` },
  { id: currentYear - 2, name: `${currentYear - 2}` },
  { id: currentYear - 1, name: `${currentYear - 1}` },
  { id: currentYear, name: `${currentYear}` },
  { id: currentYear + 1, name: `${currentYear + 1}` },
  { id: currentYear + 2, name: `${currentYear + 2}` },
  { id: currentYear + 3, name: `${currentYear + 3}` },
];

export const featuresNamesByGroupKey = {
  tenant_requisites: 'İnfo',
  common: 'Ümumi',
  settings: 'MSK',
  dashboard: 'Nəzarət paneli',
  users: 'İstifadəçilər',
  contact: 'Əlaqələr',
  projobs: 'İşçi axtarışı',
  stock: 'Anbar',
  sales: 'Ticarət',
  transaction: 'Maliyyə',
  hrm: 'HRM',
  order: 'Sifariş',
  call_center: 'Əlaqə mərkəzi',
  report: 'Hesabat',
  task: 'Tapşırıqlar',
  columns: 'Sütunlar',
  business_unit: 'Biznes blok',
  init_settings: 'İlkin qalıqlar',
  contact_center: 'Əlaqə mərkəzi',
};

export const minimumDate = '01-01-1900';
export const maximumDate = '31-12-2099';

export const contactTypes = [
  {
    id: 1,
    name: 'Fiziki şəxs',
  },
  {
    id: 2,
    name: 'Hüquqi şəxs',
  },
];

export const contactCategories = {
  1: {
    id: 1,
    name: 'Alıcı',
  },
  // 2: {
  //   id: 2,
  //   name: 'Error',
  // },
  4: {
    id: 4,
    name: 'Təchizatçı',
  },
  8: {
    id: 8,
    name: 'İstehsalçı',
  },
};

export const userStatusTypes = [
  {
    id: 0,
    name: 'constants:userStatusTypes:notConnected',
  },
  {
    id: 1,
    name: 'constants:userStatusTypes:connected',
  },
];

export const productTypes = [
  {
    id: 2,
    name: 'Məhsul',
  },
  {
    id: 1,
    name: 'Xidmət',
  },
];

export const typeOfOperations = [
  { name: 'Alış', id: 1, key: 'purchase_invoice' },
  { name: 'Satış', id: 2, key: 'sales_invoice' },
  { name: 'Geri Alma', id: 3, key: 'return_from_customer_invoice' },
  { name: 'Geri Qaytarma', id: 4, key: 'return_to_supplier_invoice' },
  { name: 'Transfer', id: 5, key: 'transfer_invoice' },
  { name: 'Silinmə', id: 6, key: 'remove_invoice' },
  { name: 'Qaralama', id: 8, key: 'purchase_invoice' },
  { name: 'İdxal alışı', id: 10, key: 'import_purchase' },
  { name: 'İstehsalat', id: 11, key: 'production_invoice' },
];

export const paymentStatuses = [
  { name: 'Ödənilib', id: 3 },
  { name: 'Qismən ödənilib', id: 2 },
  { name: 'Açıq', id: 1 },
];

export const paymentType = [
  { name: 'Qaimə', id: 9, key: 'transaction_invoice_payment' },
  { name: 'Əməkhaqqı', id: 6, key: 'salary_payment' },
  { name: 'Transfer', id: 4, key: 'money_transfer' },
  {
    name: 'Təhtəl hesab',
    id: 12,
    key: 'transaction_balance_creation_payment',
  },
  { name: 'Təsisçi', id: 7, key: 'transaction_tenant_person_payment' },
  { name: 'Avans', id: 11, key: 'transaction_advance_payment' },
  { name: 'Xərclər', id: 8, key: 'transaction_expense_payment' },
  { name: 'Valyuta mübadiləsi', id: 13, key: 'transaction_exchange' },
  { name: 'İlkin hesab qalığı', id: 14, key: 'cashbox_balance_report' },
];

export const accountTypes = [
  { id: 1, name: 'Nağd' },
  { id: 2, name: 'Bank transfer' },
  { id: 3, name: 'Kart' },
  { id: 4, name: 'Qarışıq' },
];

export const orderStages = {
  1: { name: 'New', id: 1, label: 'Yeni' },
  2: { name: 'Approved', id: 2, label: 'Təsdiq' },
  3: { name: 'In progress', id: 3, label: 'İcrada' },
  4: { name: 'Delivery', id: 4, label: 'Çatdırılma' },
  5: { name: 'Done', id: 5, label: 'Bitib' },
  6: { name: 'Reject', id: 6, label: 'İmtina' },
};

export const sortedStatuses = [
  { id: 1, name: 'draft', label: 'Qaralama', color: '#9b59b6', group: 1 },
  { id: 2, name: 'new', label: 'Yeni', color: '#3b4557', group: 1 },
  { id: 3, name: 'going', label: 'Icrada', color: '#f39c12', group: 1 },
  {
    id: 11,
    name: 'delivery',
    label: 'Çatdırılma/Qəbul',
    color: '#2980b9',
    group: 2,
  },
  { id: 10, name: 'done', label: 'Qəbul', color: '#16a085', group: 1 },
  { id: 12, name: 'done', label: 'Yolda', color: '#27ae60', group: 1 },
  {
    id: 13,
    name: 'delivery',
    label: 'Çatdırılma/Yolda',
    color: '#2980b9',
    group: 3,
  },
  {
    id: 9,
    name: 'delivery',
    label: 'Çatdırılma',
    color: '#2980b9',
    group: 1,
  },
  { id: 8, name: 'takeover', label: 'Təhvil', color: '#16a085', group: 1 },
  { id: 4, name: 'done', label: 'Bitib', color: '#27ae60', group: 2 },
  { id: 5, name: 'reject', label: 'Imtina', color: '#d35400', group: 1 },
  { id: 6, name: 'delete', label: 'Silinib', color: '#c0392b', group: 3 },
];
export const expeditorStages = [
  { id: 2, name: 'new', label: 'Yeni', color: '#3b4557', group: 1 },
  { id: 10, name: 'done', label: 'Qəbul', color: '#16a085', group: 1 },
  { id: 12, name: 'done', label: 'Yolda', color: '#27ae60', group: 1 },
  { id: 8, name: 'takeover', label: 'Təhvil', color: '#16a085', group: 1 },
  { id: 4, name: 'done', label: 'Bitib', color: '#27ae60', group: 2 },
];
export const visualStatuses = {
  1: { id: 1, name: 'draft', label: 'Qaralama', color: '#9b59b6', group: 1 },
  2: { id: 2, name: 'new', label: 'Yeni', color: '#3b4557', group: 1 },
  3: { id: 3, name: 'going', label: 'Icrada', color: '#f39c12', group: 1 },
  11: {
    id: 11,
    name: 'delivery',
    label: 'Çatdırılma/Qəbul',
    color: '#2980b9',
    group: 2,
  },
  10: { id: 10, name: 'done', label: 'Qəbul', color: '#16a085', group: 1 },
  12: { id: 12, name: 'done', label: 'Yolda', color: '#27ae60', group: 1 },
  13: {
    id: 13,
    name: 'delivery',
    label: 'Çatdırılma/Yolda',
    color: '#2980b9',
    group: 3,
  },
  9: {
    id: 9,
    name: 'delivery',
    label: 'Çatdırılma',
    color: '#2980b9',
    group: 1,
  },
  8: { id: 8, name: 'takeover', label: 'Təhvil', color: '#16a085', group: 1 },
  4: { id: 4, name: 'done', label: 'Bitib', color: '#27ae60', group: 2 },
  5: { id: 5, name: 'reject', label: 'Imtina', color: '#d35400', group: 1 },
  6: { id: 6, name: 'delete', label: 'Silinib', color: '#c0392b', group: 3 },
};

export const historyStatuses = {
  1: { id: 1, name: 'draft', label: 'Qaralama', color: '#9b59b6', group: 1 },
  2: { id: 2, name: 'new', label: 'Yeni', color: '#3b4557', group: 1 },
  3: { id: 3, name: 'going', label: 'Icrada', color: '#f39c12', group: 1 },
  4: {
    id: 4,
    name: 'going',
    label: 'İcrada/Qəbul',
    color: '#27ae60',
    group: 1,
  },
  5: {
    id: 5,
    name: 'going',
    label: 'İcrada/Bitib',
    color: '#27ae60',
    group: 1,
  },
  6: {
    id: 6,
    name: 'delivery',
    label: 'Çatdırılma',
    color: '#2980b9',
    group: 1,
  },
  7: {
    id: 7,
    name: 'delivery',
    label: 'Çatdırılma/Qəbul',
    color: '#2980b9',
    group: 1,
  },
  8: {
    id: 8,
    name: 'delivery',
    label: 'Çatdırılma/Yolda',
    color: '#2980b9',
    group: 1,
  },
  9: { id: 9, name: 'takeover', label: 'Təhvil', color: '#16a085', group: 1 },
  10: { id: 10, name: 'done', label: 'Bitib', color: '#16a085', group: 2 },
  11: { id: 11, name: 'reject', label: 'Imtina', color: '#d35400', group: 1 },
  12: {
    id: 12,
    name: 'delete',
    label: 'Silinib',
    color: '#c0392b',
    group: 3,
  },
  13: { id: 13, name: 'reject', label: 'Imtina', color: '#d35400', group: 1 },
};

export const orderStatuses = {
  1: { id: 1, name: 'draft', label: 'Qaralama', color: '#9b59b6', group: 1 },
  2: { id: 2, name: 'new', label: 'Yeni', color: '#3b4557', group: 1 },
  3: { id: 3, name: 'going', label: 'Icrada', color: '#f39c12', group: 1 },
  4: {
    id: 9,
    name: 'delivery',
    label: 'Çatdırılma',
    color: '#2980b9',
    group: 1,
  },
  5: {
    id: 11,
    name: 'delivery',
    label: 'Çatdırılma/Qəbul',
    color: '#2980b9',
    group: 1,
  },
  6: {
    id: 10,
    name: 'going',
    label: 'Qəbul',
    color: '#f39c12',
    group: 1,
  },
  7: {
    id: 13,
    name: 'delivery',
    label: 'Çatdırılma/Yolda',
    color: '#2980b9',
    group: 1,
  },
  8: {
    id: 12,
    name: 'delivery',
    label: 'Yolda',
    color: '#2980b9',
    group: 1,
  },
  9: { id: 8, name: 'takeover', label: 'Təhvil', color: '#16a085', group: 1 },
  10: { id: 4, name: 'done', label: 'Bitib', color: '#27ae60', group: 2 },
  11: { id: 5, name: 'reject', label: 'Imtina', color: '#d35400', group: 1 },
  12: { id: 6, name: 'delete', label: 'Silinib', color: '#c0392b', group: 3 },
};
export const order_statuses = [
  { id: 1, name: 'draft', label: 'Qaralama', color: '#9b59b6' },
  { id: 2, name: 'new', label: 'Yeni', color: '#3b4557' },
  { id: 3, name: 'going', label: 'Icrada', color: '#f39c12' },
  {
    id: 6,
    name: 'delivery',
    label: 'Çatdırılma',
    color: '#2980b9',
  },
  { id: 10, name: 'done', label: 'Bitib', color: '#27ae60' },
];

export const orderTabs = [
  { id: 1, name: 'details', label: 'Ətraflı' },
  { id: 7, name: 'delivery', label: 'Çatdırılma' },
  { id: 2, name: 'invoiceContent', label: 'Daxil olan sifariş' },
  { id: 3, name: 'invoiceSent', label: 'Göndərilən sifariş' },
  { id: 4, name: 'invoiceAccepted', label: 'Təhvil alınan sifariş' },
  { id: 5, name: 'conversation', label: 'Mesajlar' },
  { id: 6, name: 'timeline', label: 'Tarixçə' },
];
export const orderTabsOrder = [
  { id: 1, name: 'details', label: 'Ətraflı' },
  { id: 7, name: 'delivery', label: 'Çatdırılma' },
  { id: 2, name: 'invoiceContent', label: 'Xaric olan sifariş' },
  { id: 3, name: 'invoiceSent', label: 'Göndərilən sifariş' },
  { id: 4, name: 'invoiceAccepted', label: 'Təhvil alınan sifariş' },
  { id: 5, name: 'conversation', label: 'Mesajlar' },
  { id: 6, name: 'timeline', label: 'Tarixçə' },
];
export const orderDirections = {
  1: { id: 1, name: 'from', label: 'Daxil olan' },
  2: { id: 2, name: 'to', label: 'Xaric olan' },
};

export const internalCallTabs = [
  { id: 1, name: 'details', label: 'Ətraflı' },
  { id: 2, name: 'history', label: 'Tarixçə' },
  { id: 3, name: 'calls', label: 'Zənglər' },
];
export const expenseTypes = [
  { id: 1, label: 'Inzibati' },
  { id: 2, label: 'Əməliyyat' },
  { id: 3, label: 'Maliyyə' },
  { id: 4, label: 'Vergi' },
  { id: 6, label: 'Gömrük' },
  { id: 5, label: 'Digər' },
];

export const profitAndLossSummaryRows = [2, 6, 8, 10, 13, 17];
export const profitAndLossReportsWithoutDetail = [
  1,
  2,
  6,
  8,
  10,
  12,
  13,
  15,
  17,
];

export const balanceSheetWithoutDetail = [
  'Qiymətli kağızlar',
  'Öncədən ödənilmiş xərclər',
  'Digər cari aktivlər',
  'Torpaq, tikili, avadanlıqlar',
  'Qeyri maddi aktivlər',
  'Uzunmüddətli alacaqlar',
  'Digər uzunmüddətli aktvilər',
  'Bank kreditləri',
];
export const moduleForFilter = [
  {
    id: 'user',
    name: 'İstifadəçilər',
    subModule: [{ id: 'user', name: '' }],
  },
  {
    id: 2,
    name: 'Əlaqələr',
    subModule: [
      { id: 'contact', name: 'Əlaqələr' },
      { id: 'partner', name: 'Partnyoralar' },
    ],
  },
  {
    id: 3,
    name: 'Anbar',
    subModule: [
      { id: 'warehouse', name: 'Anbarlar' },
      { id: 'product_catalog', name: 'Kataloq' },
      { id: 'product', name: 'Məhsullar' },
      { id: 'invoice_bron', name: 'Bron' },
    ],
  },
  {
    id: 4,
    name: 'Ticarət',
    subModule: [
      {
        id: 'invoice_purchase',
        name: 'Əməliyyatlar',
        categories: [
          'invoice_sales',
          'invoice_return_from_customer',
          'invoice_return_to_supplier',
          'invoice_draft',
          'invoice_removed',
        ],
      },
      {
        id: 'invoice_contract_purchase',
        name: 'Müqavilələr',
        categories: ['invoice_contract_sales'],
      },
      {
        id: 'invoice_production_in',
        name: 'İstehsalat',
        categories: [
          'invoice_production_out',
          'invoice_production_transfer',
        ],
      },
    ],
  },
  {
    id: 5,
    name: 'Maliyyə',
    subModule: [
      {
        id: 'transaction_invoice',
        name: 'Əməliyyatlar',
        categories: [
          'transaction_payment',
          'transaction_salary',
          'transaction_advance',
          'transaction_balance_creation',
          'transaction_employee_payment',
          'transaction_transfer',
          'transaction_exchange',
          'transaction_invoice_tax',
        ],
      },
      {
        id: 'cashbox_cash',
        name: 'Hesablar',
        categories: [
          'cashbox_bank',
          'cashbox_credit_card',
          'cashbox_other',
        ],
      },
      {
        id: 'transaction_item',
        name: 'Xərc maddələri',
        categories: ['transaction_catalog'],
      },
      {
        id: 'transaction_employee_sales_bonus_configuration',
        name: 'Satışdan bonus',
        categories: ['transaction_sales_bonus_configuration'],
      },
      {
        id: 'transaction_credit_sales',
        name: 'Ödəniş cədvəli/Cədvəllər',
        categories: [
          'transaction_credit_purchase',
          'transaction_credit_return_from_customer',
          'transaction_credit_return_to_supplier',
          'transaction_credit_import_purchase',
        ],
      },
    ],
  },
  {
    id: 6,
    name: 'Əməkdaşlar',
    subModule: [
      {
        id: 'hrm_hire',
        name: 'Əməkdaşlar',
        categories: [
          'hrm_business_trip',
          'hrm_vacation',
          'hrm_sick_leave',
          'hrm_time_off',
          'hrm_appointment',
          'hrm_fire',
          'hrm_hire_after_fire',
          'hrm_employee',
        ],
      },
      {
        id: 'hrm_structure',
        name: 'Struktur',
        categories: ['hrm_occupation'],
      },
      {
        id: 'hrm_calendar',
        name: 'Davamiyyət',
        categories: ['hrm_work_schedule'],
      },
    ],
  },
  {
    id: 7,
    name: 'Sifariş',
    subModule: [
      {
        id: 'order_incoming',
        name: 'Sifarişlər',
        categories: ['order_outgoing', 'order_message'],
      },
    ],
  },
  {
    id: 8,
    name: 'MSK',
    subModule: [
      {
        id: 'currency',
        name: 'Kassa',
      },
      {
        id: 'stock_type',
        name: 'Anbar',
      },
      {
        id: 'contract_type',
        name: 'Müqavilə',
      },
      {
        id: 'product_type',
        name: 'Məhsul',
        categories: [
          'product_unit_of_measurement',
          'product_special_parameter',
          'barcode_configuration_ean_13',
          'barcode_configuration_free',
          'product_price_types',
        ],
      },
      {
        id: 'role',
        name: 'İstifadəçi hüquqları',
        categories: ['role_feature'],
      },
      {
        id: 'hrm_vacation_type',
        name: 'İnsan resursları',
        categories: [
          'hrm_business_trip_reason',
          'hrm_time_off_reason',
          'hrm_fire_reason',
        ],
      },
      {
        id: 'telegram_chat',
        name: 'Bildirişlər',
      },
      {
        id: 'hrm_vacation_prefix',
        name: 'Sənədlər',
        categories: [
          'hrm_business_trip_prefix',
          'hrm_time_off_prefix',
          'hrm_fire_prefix',
        ],
      },
      {
        id: 'order_tenant_person_role_warehouseman',
        name: 'Sifariş tənzimləmələri',
        categories: [
          'order_tenant_person_role_forwarder',
          'order_tenant_person_role_operator',
          'order_stage_role_executor',
        ],
      },
      {
        id: 'transaction_credit_type',
        name: 'Kredit növü',
      },
      {
        id: 'integration_projobs',
        name: 'İnteqrasiya',
      },
      {
        id: 'faq_folder',
        name: 'FAQ',
        categories: ['faq_subject', 'faq_question'],
      },
    ],
  },
  {
    id: 9,
    name: 'Biznes blok',
    subModule: [
      {
        id: 'business_unit',
        name: 'Biznes blok',
      },
    ],
  },
  {
    id: 10,
    name: 'İlkin qalıqlar',
    subModule: [
      {
        id: 'invoice_init',
        name: 'Anbar',
      },
      {
        id: 'transaction_initial_balance',
        name: 'Hesab',
      },
      {
        id: 'invoice_initial_debt',
        name: 'Borc',
      },
    ],
  },
  {
    id: 11,
    name: 'İnfo',
    subModule: [
      {
        id: 'data_deletion',
        name: 'Əməliyyatların silinməsi',
      },
    ],
  },
];
export const allModules = [
  {
    moduleName: 'user',
    module: 'İstifadəçilər',
    subModule: null,
    category: null,
    isDetail: true,
  },
  {
    moduleName: 'contact',
    module: 'Əlaqələr',
    subModule: 'Əlaqələr',
    category: null,
    isDetail: true,
  },
  {
    moduleName: 'partner',
    module: 'Əlaqələr',
    subModule: 'Partnyorlar',
    category: null,
    isDetail: true,
  },
  {
    moduleName: 'warehouse',
    module: 'Anbar',
    subModule: 'Anbarlar',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'product_catalog',
    module: 'Anbar',
    subModule: 'Kataloq',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'product',
    module: 'Anbar',
    subModule: 'Məhsullar',
    category: null,
    isDetail: true,
  },
  {
    moduleName: 'invoice_bron',
    module: 'Anbar',
    subModule: 'Bron',
    category: null,
    isDetail: true,
  },
  {
    moduleName: 'business_unit',
    module: 'Biznes blok',
    subModule: 'Biznes blok',
    category: null,
    isDetail: true,
  },
  {
    moduleName: 'invoice_purchase',
    module: 'Ticarət',
    subModule: 'Əməliyyatlar',
    category: 'Alış',
    isDetail: true,
  },
  {
    moduleName: 'invoice_sales',
    module: 'Ticarət',
    subModule: 'Əməliyyatlar',
    category: 'Satış',
    isDetail: true,
  },
  {
    moduleName: 'invoice_return_from_customer',
    module: 'Ticarət',
    subModule: 'Əməliyyatlar',
    category: 'Geri alma',
    isDetail: true,
  },
  {
    moduleName: 'invoice_return_to_supplier',
    module: 'Ticarət',
    subModule: 'Əməliyyatlar',
    category: 'Geri qaytarma',
    isDetail: true,
  },
  {
    moduleName: 'invoice_draft',
    module: 'Ticarət',
    subModule: 'Əməliyyatlar',
    category: 'Qaralama',
    isDetail: true,
    isDeleted: true,
  },
  {
    moduleName: 'invoice_transfer',
    module: 'Ticarət',
    subModule: 'Əməliyyatlar',
    category: 'Transfer',
    isDetail: true,
  },
  {
    moduleName: 'invoice_removed',
    module: 'Ticarət',
    subModule: 'Əməliyyatlar',
    category: 'Silinmə',
    isDetail: true,
  },
  {
    moduleName: 'invoice_production_in',
    module: 'Ticarət',
    subModule: 'İstehsalat',
    category: 'Daxili',
    isDetail: true,
  },
  {
    moduleName: 'invoice_production_out',
    module: 'Ticarət',
    subModule: 'İstehsalat',
    category: 'Xarici',
    isDetail: true,
  },
  {
    moduleName: 'invoice_production_transfer',
    module: 'Ticarət',
    subModule: 'İstehsalat',
    category: 'Anbara transfer',
    isDetail: true,
  },
  {
    moduleName: 'invoice_contract_purchase',
    module: 'Ticarət',
    subModule: 'Müqavilələr',
    category: 'Alış',
    isDetail: true,
    isDeleted: true,
  },
  {
    moduleName: 'invoice_contract_sales',
    module: 'Ticarət',
    subModule: 'Müqavilələr',
    category: 'Satış',
    isDetail: true,
    isDeleted: true,
  },
  {
    moduleName: 'transaction_invoice',
    module: 'Maliyyə',
    subModule: 'Əməliyyatlar',
    category: 'Qaimə',
    isDetail: true,
  },
  {
    moduleName: 'transaction_invoice_tax',
    module: 'Maliyyə',
    subModule: 'Əməliyyatlar',
    category: 'Qaimə(Vat)',
    isDetail: true,
  },
  {
    moduleName: 'transaction_payment',
    module: 'Maliyyə',
    subModule: 'Əməliyyatlar',
    category: 'Xərclər',
    isDetail: true,
  },
  {
    moduleName: 'transaction_salary',
    module: 'Maliyyə',
    subModule: 'Əməliyyatlar',
    category: 'Əməkhaqqı ödənişi',
    isDetail: true,
  },
  {
    moduleName: 'transaction_advance',
    module: 'Maliyyə',
    subModule: 'Əməliyyatlar',
    category: 'Avans',
    isDetail: true,
  },
  {
    moduleName: 'transaction_balance_creation',
    module: 'Maliyyə',
    subModule: 'Əməliyyatlar',
    category: 'Təsisçi',
    isDetail: true,
  },
  {
    moduleName: 'transaction_employee_payment',
    module: 'Maliyyə',
    subModule: 'Əməliyyatlar',
    category: 'Təhtəl hesab',
    isDetail: true,
  },
  {
    moduleName: 'transaction_transfer',
    module: 'Maliyyə',
    subModule: 'Əməliyyatlar',
    category: 'Transfer',
    isDetail: true,
  },
  {
    moduleName: 'transaction_exchange',
    module: 'Maliyyə',
    subModule: 'Əməliyyatlar',
    category: 'Valyuta mübadiləsi',
    isDetail: true,
  },
  {
    moduleName: 'cashbox_cash',
    module: 'Maliyyə',
    subModule: 'Hesablar',
    category: 'Nağd hesablar',
    isDetail: false,
  },
  {
    moduleName: 'cashbox_bank',
    module: 'Maliyyə',
    subModule: 'Hesablar',
    category: 'Bank hesabları',
    isDetail: false,
  },
  {
    moduleName: 'cashbox_credit_card',
    module: 'Maliyyə',
    subModule: 'Hesablar',
    category: 'Kredit kartları',
    isDetail: false,
  },
  {
    moduleName: 'cashbox_other',
    module: 'Maliyyə',
    subModule: 'Hesablar',
    category: 'Digər',
    isDetail: false,
  },
  {
    moduleName: 'transaction_catalog',
    module: 'Maliyyə',
    subModule: 'Xərc maddələri',
    category: 'Xərc maddəsi',
    isDetail: false,
  },
  {
    moduleName: 'transaction_item',
    module: 'Maliyyə',
    subModule: 'Xərc maddələri',
    category: 'Xərc adı',
    isDetail: false,
  },
  {
    moduleName: 'transaction_employee_sales_bonus_configuration',
    module: 'Maliyyə',
    subModule: 'Satışdan bonus/ Əməkdaşlar üzrə bonus',
    category: null,
    isDetail: true,
  },
  {
    moduleName: 'transaction_sales_bonus_configuration',
    module: 'Maliyyə',
    subModule: 'Satışdan bonus/ Tənzimləmələr',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'transaction_credit_sales',
    module: 'Maliyyə',
    subModule: 'Ödəniş cədvəli/Cədvəllər',
    category: 'Satış',
    isDetail: true,
  },
  {
    moduleName: 'transaction_credit_return_from_customer',
    module: 'Maliyyə',
    subModule: 'Ödəniş cədvəli/Cədvəllər',
    category: 'Geri alma',
    isDetail: true,
  },
  {
    moduleName: 'transaction_credit_return_to_supplier',
    module: 'Maliyyə',
    subModule: 'Ödəniş cədvəli/Cədvəllər',
    category: 'Geri qaytarma',
    isDetail: true,
  },
  {
    moduleName: 'transaction_credit_purchase',
    module: 'Maliyyə',
    subModule: 'Ödəniş cədvəli/Cədvəllər',
    category: 'Alış',
    isDetail: true,
  },
  {
    moduleName: 'transaction_credit_import_purchase',
    module: 'Maliyyə',
    subModule: 'Ödəniş cədvəli/Cədvəllər',
    category: 'İdxal alışı',
    isDetail: true,
  },
  {
    moduleName: 'hrm_hire',
    module: 'Əməkdaşlar',
    subModule: 'Əməkdaşlar/İşçilər',
    category: 'İşə qəbul',
    isDetail: false,
  },
  {
    moduleName: 'hrm_vacation',
    module: 'Əməkdaşlar',
    subModule: 'Əməkdaşlar/İşçilər',
    category: 'Məzuniyyət',
    isDetail: false,
  },
  {
    moduleName: 'hrm_business_trip',
    module: 'Əməkdaşlar',
    subModule: 'Əməkdaşlar/İşçilər',
    category: 'Ezamiyyət',
    isDetail: false,
  },
  {
    moduleName: 'hrm_sick_leave',
    module: 'Əməkdaşlar',
    subModule: 'Əməkdaşlar/İşçilər',
    category: 'Xəstəlik',
    isDetail: false,
  },
  {
    moduleName: 'hrm_time_off',
    module: 'Əməkdaşlar',
    subModule: 'Əməkdaşlar/İşçilər',
    category: 'İcazə',
    isDetail: false,
  },
  {
    moduleName: 'hrm_appointment',
    module: 'Əməkdaşlar',
    subModule: 'Əməkdaşlar/İşçilər',
    category: 'İş görüşü',
    isDetail: false,
  },
  {
    moduleName: 'hrm_fire',
    module: 'Əməkdaşlar',
    subModule: 'Əməkdaşlar/İşçilər',
    category: 'Xitam',
    isDetail: false,
  },
  {
    moduleName: 'hrm_hire_after_fire',
    module: 'Əməkdaşlar',
    subModule: 'Əməkdaşlar/Azad olunanlar',
    category: 'İşə qəbul',
    isDetail: false,
  },
  {
    moduleName: 'hrm_employee',
    module: 'Əməkdaşlar',
    subModule: 'Əməkdaşlar/Azad olunanlar',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'hrm_structure',
    module: 'Əməkdaşlar',
    subModule: 'Struktur/Bölmələr',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'hrm_occupation',
    module: 'Əməkdaşlar',
    subModule: 'Struktur/Vəzifələr',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'hrm_calendar',
    module: 'Əməkdaşlar',
    subModule: 'Davamiyyət/İstehsalat təqviminin adı',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'hrm_work_schedule',
    module: 'Əməkdaşlar',
    subModule: 'Davamiyyət/İş rejimi',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'order_incoming',
    module: 'Sifariş',
    subModule: 'Sifarişlər',
    category: 'Daxil olan',
    isDetail: true,
  },
  {
    moduleName: 'order_outgoing',
    module: 'Sifariş',
    subModule: 'Sifarişlər',
    category: 'Xaric olan',
    isDetail: true,
  },
  {
    moduleName: 'order_message',
    module: 'Sifariş',
    subModule: 'Sifarişlər',
    category: 'Mesajlar',
    isDetail: false,
  },
  {
    moduleName: 'barcode_configuration_ean_13',
    module: 'MSK',
    subModule: 'Məhsul/Barkod',
    category: 'Ean-13',
    isDetail: false,
  },
  {
    moduleName: 'barcode_configuration_free',
    module: 'MSK',
    subModule: 'Məhsul/Barkod',
    category: 'Sərbəst',
    isDetail: false,
  },
  {
    moduleName: 'currency',
    module: 'MSK',
    subModule: 'Kassa/Valyutalar',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'contract_type',
    module: 'MSK',
    subModule: 'Müqavilə/Müqavilə tipləri',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'stock_type',
    module: 'MSK',
    subModule: 'Anbar/Anbar növləri',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'product_type',
    module: 'MSK',
    subModule: 'Məhsul/Məhsul tipləri',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'product_unit_of_measurement',
    module: 'MSK',
    subModule: 'Məhsul/Ölçü vahidləri',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'product_special_parameter',
    module: 'MSK',
    subModule: 'Məhsul/Xüsusi parametrlər',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'product_price_types',
    module: 'MSK',
    subModule: 'Məhsul/Qiymət tipləri',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'role',
    module: 'MSK',
    subModule: 'İstifadəçi hüquqları/ Qruplar',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'role_feature',
    module: 'MSK',
    subModule: 'İstifadəçi hüquqları/ Hüquqlar',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'hrm_vacation_type',
    module: 'MSK',
    subModule: 'İnsan resursları',
    category: 'Məzuniyyət növləri',
    isDetail: false,
  },
  {
    moduleName: 'hrm_business_trip_reason',
    module: 'MSK',
    subModule: 'İnsan resursları',
    category: 'Ezamiyyət növləri',
    isDetail: false,
  },
  {
    moduleName: 'hrm_time_off_reason',
    module: 'MSK',
    subModule: 'İnsan resursları',
    category: 'İcazə səbəbləri',
    isDetail: false,
  },
  {
    moduleName: 'hrm_fire_reason',
    module: 'MSK',
    subModule: 'İnsan resursları',
    category: 'Xitam əsasları',
    isDetail: false,
  },
  {
    moduleName: 'telegram_chat',
    module: 'MSK',
    subModule: 'Bildirişlər',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'hrm_vacation_prefix',
    module: 'MSK',
    subModule: 'Sənədlər',
    category: 'Məzuniyyət',
    isDetail: false,
  },
  {
    moduleName: 'hrm_business_trip_prefix',
    module: 'MSK',
    subModule: 'Sənədlər',
    category: 'Ezamiyyət',
    isDetail: false,
  },
  {
    moduleName: 'hrm_time_off_prefix',
    module: 'MSK',
    subModule: 'Sənədlər',
    category: 'İcazə',
    isDetail: false,
  },
  {
    moduleName: 'hrm_fire_prefix',
    module: 'MSK',
    subModule: 'Sənədlər',
    category: 'Xitam',
    isDetail: false,
  },
  {
    moduleName: 'order_tenant_person_role_warehouseman',
    module: 'MSK',
    subModule: 'Sifariş tənzimləmələri/ Rollar və istifadəçilər',
    category: 'Anbarlar',
    isDetail: false,
  },
  {
    moduleName: 'order_tenant_person_role_forwarder',
    module: 'MSK',
    subModule: 'Sifariş tənzimləmələri/ Rollar və istifadəçilər',
    category: 'Ekspeditorlar',
    isDetail: false,
  },
  {
    moduleName: 'order_tenant_person_role_operator',
    module: 'MSK',
    subModule: 'Sifariş tənzimləmələri/ Rollar və istifadəçilər',
    category: 'Operatorlar',
    isDetail: false,
  },
  {
    moduleName: 'order_stage_role_executor',
    module: 'MSK',
    subModule: 'Sifariş tənzimləmələri/ Tənzimləmələr',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'integration_projobs',
    module: 'MSK',
    subModule: 'MSK/İnteqrasiyalar',
    category: 'ProJobs',
    isDetail: false,
  },
  {
    moduleName: 'transaction_credit_type',
    module: 'MSK',
    subModule: 'Kredit',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'data_deletion',
    module: 'İnfo',
    subModule: 'Əməliyyatların silinməsi',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'invoice_init',
    module: 'İlkin qalıqlar',
    subModule: 'Anbar',
    category: null,
    isDetail: true,
  },
  {
    moduleName: 'transaction_initial_balance',
    module: 'İlkin qalıqlar',
    subModule: 'Hesab',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'invoice_initial_debt',
    module: 'İlkin qalıqlar',
    subModule: 'Borc',
    category: null,
    isDetail: false,
  },
  {
    moduleName: 'faq_folder',
    module: 'MSK',
    subModule: 'FAQ',
    category: 'Qovluq',
    isDetail: false,
  },
  {
    moduleName: 'faq_subject',
    module: 'MSK',
    subModule: 'FAQ',
    category: 'Mövzu',
    isDetail: false,
  },
  {
    moduleName: 'faq_question',
    module: 'MSK',
    subModule: 'FAQ',
    category: 'Sual',
    isDetail: false,
  },
];
