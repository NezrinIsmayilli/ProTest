import { useState } from 'react';

const defaultPermissions = {
  details: {
    read: false,
  },
  delivery: {
    read: false,
    write: false,
  },
  invoiceContent: {
    read: false,
    write: false,
  },
  invoiceSent: {
    read: false,
    write: false,
  },
  invoiceAccepted: {
    read: false,
    write: false,
  },
  conversation: {
    read: false,
    write: false,
  },
  timeline: {
    read: false,
    write: false,
  },
};

const restriction = {
  read: false,
  write: false,
};
const readAccess = {
  read: true,
  write: false,
};
const writeAccess = {
  read: true,
  write: true,
};
export const useOrderPermissions = () => {
  const [permissions, setPermissions] = useState(defaultPermissions);

  const handlePermissionsChange = (order, isTenant) => {
    const { direction, stageBeforeCancel } = order;
    const newPermissions = {};

    switch (order.stage) {
      case 1: {
        newPermissions.details = readAccess;
        newPermissions.delivery = writeAccess;
        newPermissions.invoiceContent =
          direction === 2 || (direction === 1 && isTenant)
            ? writeAccess
            : readAccess;
        newPermissions.invoiceAccepted = restriction;
        newPermissions.invoiceSent = restriction;
        newPermissions.conversation = writeAccess;
        newPermissions.timeline = writeAccess;
        break;
      }
      case 2: {
        newPermissions.details = readAccess;
        newPermissions.delivery = writeAccess;
        newPermissions.invoiceContent =
          direction === 2 || (direction === 1 && isTenant)
            ? writeAccess
            : readAccess;
        newPermissions.invoiceAccepted = restriction;
        newPermissions.invoiceSent = restriction;
        newPermissions.conversation = writeAccess;
        newPermissions.timeline = writeAccess;
        break;
      }
      case 3: {
        newPermissions.details = readAccess;
        newPermissions.delivery = writeAccess;
        newPermissions.invoiceContent = readAccess;
        newPermissions.invoiceSent =
          direction === 1 || (direction === 1 && isTenant)
            ? writeAccess
            : readAccess;
        newPermissions.invoiceAccepted = restriction;
        newPermissions.conversation = writeAccess;
        newPermissions.timeline = writeAccess;
        break;
      }
      case 6: {
        newPermissions.details = readAccess;
        newPermissions.delivery = readAccess;
        newPermissions.invoiceContent = readAccess;
        newPermissions.invoiceSent = readAccess;
        newPermissions.invoiceAccepted =
          direction === 1 || (direction === 1 && isTenant)
            ? writeAccess
            : readAccess;
        newPermissions.conversation = writeAccess;
        newPermissions.timeline = writeAccess;
        break;
      }
      case 9: {
        newPermissions.details = readAccess;
        newPermissions.delivery = readAccess;
        newPermissions.invoiceContent = readAccess;
        newPermissions.invoiceSent = readAccess;
        newPermissions.invoiceAccepted = readAccess;
        newPermissions.conversation = writeAccess;
        newPermissions.timeline = writeAccess;
        break;
      }
      case 10: {
        newPermissions.details = readAccess;
        newPermissions.delivery = readAccess;
        newPermissions.invoiceContent = readAccess;
        newPermissions.invoiceSent = readAccess;
        newPermissions.invoiceAccepted = readAccess;
        newPermissions.conversation = readAccess;
        newPermissions.timeline = readAccess;
        break;
      }
      case 11: {
        newPermissions.details = readAccess;
        newPermissions.delivery = readAccess;
        newPermissions.invoiceContent = readAccess;
        newPermissions.invoiceSent =
          stageBeforeCancel >= 3 ? readAccess : restriction;
        newPermissions.invoiceAccepted =
          stageBeforeCancel >= 6 ? readAccess : restriction;
        newPermissions.conversation = writeAccess;
        newPermissions.timeline = writeAccess;
        break;
      }
      case 13: {
        newPermissions.details = readAccess;
        newPermissions.delivery = writeAccess;
        newPermissions.invoiceContent = readAccess;
        newPermissions.invoiceSent =
          direction === 1 || (direction === 1 && isTenant)
            ? writeAccess
            : readAccess;
        newPermissions.invoiceAccepted = readAccess;
        newPermissions.conversation = readAccess;
        newPermissions.timeline = readAccess;
        break;
      }
      default:
        newPermissions.details = readAccess;
        newPermissions.delivery = readAccess;
        newPermissions.invoiceContent = readAccess;
        newPermissions.invoiceSent = readAccess;
        newPermissions.invoiceAccepted = readAccess;
        newPermissions.conversation = readAccess;
        newPermissions.timeline = readAccess;
    }
    setPermissions(newPermissions);
  };

  return [permissions, handlePermissionsChange];
};
