// utils
import { permissions } from 'config/permissions';

import { operationNames } from 'utils';

// icons
import { FaMoneyCheckAlt } from 'react-icons/fa';

import { ReactComponent as ComeIn } from 'assets/img/icons/purchase.svg';
import { ReactComponent as ComeOut } from 'assets/img/icons/sales.svg';
import { ReactComponent as Expenses } from 'assets/img/icons/returnFromCustomer.svg';
import { ReactComponent as MoneyTransfer } from 'assets/img/icons/returnToSupplier.svg';
import { ReactComponent as Salary } from 'assets/img/icons/transfer.svg';

function editUrl(route) {
  return `/finance/${route}/edit/`;
}

function addUrl(route) {
  return `/finance/${route}/add/`;
}

// KMX = 1, KMD = 2, XÖ = 3, PY = 4, ƏH = 6, IQ=7 (!)
export const tabUrls = {
  1: editUrl('comeout'),
  2: editUrl('comein'),
  3: editUrl('expenses'),
  4: editUrl('money-transfer'),
  6: editUrl('salary'),
  7: editUrl('balance'),
};

const {
  EXPENSE,
  INCOME,
  SPEND,
  MONEY_TRANSFER,
  SALARY,
  INITIAL_BALANCE,
} = operationNames;

export const financePermissionsHelper = {
  [EXPENSE]: permissions.kmx,
  [INCOME]: permissions.kmd,
  [SPEND]: permissions.expense_payment,
  [MONEY_TRANSFER]: permissions.money_transfer,
  [SALARY]: permissions.salary_payment,
  [INITIAL_BALANCE]: permissions.balance_creation,
};

export const fabItems = [
  {
    link: addUrl('balance'),
    text: 'İlkin qalıq',
    icon: FaMoneyCheckAlt,
    key: permissions.balance_creation,
  },
  {
    link: addUrl('salary'),
    text: 'Əmək haqqı',
    icon: Salary,
    key: permissions.salary_payment,
  },
  {
    link: addUrl('money-transfer'),
    text: 'Pul transfer',
    icon: MoneyTransfer,
    key: permissions.money_transfer,
  },
  {
    link: addUrl('expenses'),
    text: 'Xərclər',
    icon: Expenses,
    key: permissions.expense_payment,
  },
  {
    link: addUrl('comeout'),
    text: 'Məxaric',
    icon: ComeOut,
    key: permissions.kmx,
  },
  {
    link: addUrl('comein'),
    text: 'Mədaxil',
    icon: ComeIn,
    key: permissions.kmd,
  },
];
