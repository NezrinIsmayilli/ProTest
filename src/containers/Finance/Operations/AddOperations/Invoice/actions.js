export const getInvoiceList = (invoices, type, edit, operationsList) => {
    const invoicesWithVat =
        invoices?.length > 0 || edit
            ? [
                  edit &&
                  operationsList.length > 0 &&
                  (!invoices
                      .map(({ id }) => id)
                      .includes(Number(operationsList[0].invoiceId)) ||
                      (operationsList[0].transactionType === 10 &&
                          invoices.filter(
                              ({ id, isTax }) =>
                                  id === Number(operationsList[0].invoiceId) &&
                                  isTax
                          ).length === 0))
                      ? {
                            id: operationsList[0].invoiceId,
                            invoiceType: operationsList[0].invoiceType,
                            invoiceNumber: operationsList[0].invoiceNumber,
                            remainingInvoiceDebt: 0,
                            remainingInvoiceDebtWithCredit: 0,
                            debtAmount: 0,
                            currencyCode: operationsList[0].invoiceCurrencyCode,
                            currencyId: operationsList[0].invoiceCurrencyId,
                            fromEdit: true,
                            isTax: operationsList[0].transactionType === 10,
                        }
                      : {},
                  ...invoices,
              ]
                  .filter(invoice =>
                      type === 1
                          ? invoice.invoiceType === 2 ||
                            invoice.invoiceType === 4 ||
                            invoice.invoiceType === 13
                          : invoice.invoiceType === 1 ||
                            invoice.invoiceType === 3 ||
                            invoice.invoiceType === 10 ||
                            invoice.invoiceType === 12
                  )
                  .map(currentInvoice => {
                      if (currentInvoice.isTax) {
                          return {
                              ...currentInvoice,
                              id: `${currentInvoice.id}-vat`,
                              invoiceNumber: `${currentInvoice.invoiceNumber}(VAT)`,
                              debtAmount: Number(
                                  currentInvoice.remainingInvoiceDebt
                              ),
                              isTax: true,
                          };
                      }
                      return {
                          ...currentInvoice,
                          debtAmount: Number(
                              currentInvoice.remainingInvoiceDebt
                          ),
                      };
                  }, [])
            : [];
    return invoicesWithVat;
};

export const handleReceivablesPayables = (invoices, edit, operationsList) => {
    // eslint-disable-next-line no-var
    var receivablesTemp = {};
    // eslint-disable-next-line no-var
    var payablesTemp = {};

    [
        edit &&
        operationsList.length > 0 &&
        (!invoices
            .map(({ id }) => id)
            .includes(Number(operationsList[0].invoiceId)) ||
            (operationsList[0].transactionType === 10 &&
                invoices.filter(
                    ({ id, isTax }) =>
                        id === Number(operationsList[0].invoiceId) && isTax
                ).length === 0))
            ? {
                  id: operationsList[0].invoiceId,
                  invoiceType: operationsList[0].invoiceType,
                  invoiceNumber: operationsList[0].invoiceNumber,
                  remainingInvoiceDebt: 0,
                  currencyCode: operationsList[0].invoiceCurrencyCode,
                  fromEdit: true,
              }
            : {},
        ...invoices,
    ].forEach(invoice => {
        const { invoiceType, currencyCode, remainingInvoiceDebt } = invoice;
        if (invoiceType === 2 || invoiceType === 4 || invoiceType === 13) {
            receivablesTemp = {
                ...receivablesTemp,
                [currencyCode]:
                    (receivablesTemp[currencyCode] || 0) +
                    Number(remainingInvoiceDebt),
            };
        } else if (
            invoiceType === 1 ||
            invoiceType === 3 ||
            invoiceType === 10 ||
            invoiceType === 12
        ) {
            payablesTemp = {
                ...payablesTemp,
                [currencyCode]:
                    (payablesTemp[currencyCode] || 0) +
                    Number(remainingInvoiceDebt),
            };
        }
    });

    return {
        receivables: receivablesTemp,
        payables: payablesTemp,
    };
};
