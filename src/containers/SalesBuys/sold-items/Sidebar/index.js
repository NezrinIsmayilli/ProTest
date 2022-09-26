/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Col, Row, Select, Icon } from 'antd';
import {
    Sidebar,
    ProDateRangePicker,
    ProSidebarItem,
    ProSelect,
    ProSearch,
    ProTypeFilterButton,
    ProAsyncSelect,
} from 'components/Lib';
import moment from 'moment';

// fetchs
import { fetchUsers } from 'store/actions/users';
import { fetchContacts } from 'store/actions/contact';
import { fetchSuppliers } from 'store/actions/relations';
import { fetchContracts } from 'store/actions/contracts';
import { fetchStocks } from 'store/actions/stock';
import { fetchProducts } from 'store/actions/product';
import {
    fetchSalesInvoiceSearch,
    fetchSalesInvoiceCount,
} from 'store/actions/salesAndBuys';
import { fetchSalesInvoices } from 'store/actions/operations/sold-items';
import { useCatalog } from 'hooks';
import { fetchCatalogs, fetchFilteredCatalogs } from 'store/actions/catalog';

import { ReactComponent as DownArrow } from 'assets/img/icons/downarrow.svg';
import styles from './styles.module.scss';

const { Option } = Select;
const SoldItemsSidebar = ({
    suppliers,
    fetchUsers,
    fetchContacts,
    fetchSuppliers,
    fetchCatalogs,
    fetchProducts,
    fetchContracts,
    fetchStocks,
    fetchSalesInvoices,
    fetchFilteredCatalogs,

    filters,
    fetchBusinessUnitList,
    onFilter,
    profile,
    handlePaginationChange,
    thisMonthStart,
    thisMonthEnd,
}) => {
    const [selectedType, setSelectedType] = useState(
        filters.isSerialNumber ? Number(filters.isSerialNumber) : null
    );
    const [componentIsMounted, setComponentIsMounted] = useState(false);
    const [StartDate, setStartDate] = useState(
        filters.dateFrom != thisMonthStart ? filters.dateFrom : null
    );
    const [EndDate, setEndDate] = useState(
        filters.dateTo != thisMonthEnd ? filters.dateTo : null
    );
    const [category, setCategory] = useState(null);
    const [subcategory, setSubCategory] = useState(null);
    const [productCode, setProductCode] = useState(
        filters.productCode ? filters.productCode : null
    );
    const [serialNumber, setserialNumber] = useState(
        filters.serialNumber ? filters.serialNumber : null
    );
    const [barCode, setbarCode] = useState(
        filters.barcode ? filters.barcode : null
    );
    const [description, setDescription] = useState(
        filters.description ? filters.description : undefined
    );

    const [selectedCatalogs, setSelectedCatalogs] = useState([]);
    const [catalogs, setCatalogs] = useState({ root: [], children: {} });
    const [filtered, setFiltered] = useState(false);
    const [filterSelectedClients, setFilterSelectedClients] = useState([]);
    const [filterSelectedCatalog, setFilterSelectedCatalog] = useState({
        root: [],
    });
    const [filterSelectedStocks, setFilterSelectedStocks] = useState([]);
    const [filterSelectedProducts, setFilterSelectedProducts] = useState([]);
    const [filterSelectedContracts, setFilterSelectedContracts] = useState([]);
    const [
        filterSelectedSalesManagers,
        setFilterSelectedSalesManagers,
    ] = useState([]);
    const [filterSelectedAgent, setFilterSelectedAgent] = useState([]);
    const [
        filterSelectedSalesInvoices,
        setFilterSelectedSalesInvoices,
    ] = useState([]);
    const [products, setProducts] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [salesman, setSalesman] = useState([]);
    const [agent, setAgent] = useState([]);
    const [businessUnits, setBusinessUnits] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [clients, setClients] = useState([]);
    const [salesInvoices, setSalesInvoices] = useState([]);
    const [
        filterSelectedBusinessUnit,
        setFilterSelectedBusinessUnit,
    ] = useState([]);
    const [businessUnitLength, setBusinessUnitLength] = useState(2);

    useEffect(() => {
        fetchBusinessUnitList({
            filters: {
                limit: 20,
                page: 1,
                isDeleted: 0,
                businessUnitIds: profile.businessUnits?.map(({ id }) => id),
            },
            onSuccess: data => {
                setBusinessUnitLength(data.data?.length || 0);
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const {
        parentCatalogs,
        childCatalogs,
        handleParentCatalogsChange,
        handleChildCatalogsChange,
    } = useCatalog();

    useEffect(() => {
        if (componentIsMounted) {
            onFilter(
                'rootCatalogs',
                parentCatalogs.map(parentCatalog => parentCatalog.id)
            );
            if (category) {
                handlePaginationChange(1);
            }
        } else {
            setComponentIsMounted(true);
        }
    }, [parentCatalogs]);

    useEffect(() => {
        if (componentIsMounted) {
            onFilter(
                'productCatalogs',
                childCatalogs.map(childCatalog => childCatalog.id)
            );
            if (subcategory) {
                handlePaginationChange(1);
            }
        } else {
            setComponentIsMounted(true);
        }
    }, [childCatalogs]);

    useEffect(() => {
        if (
            filters.rootCatalogs &&
            catalogs.root?.length &&
            filterSelectedCatalog.root?.length &&
            !filtered
        ) {
            const catalogOptions = filterSelectedCatalog.root?.filter(catalog =>
                filters.rootCatalogs.map(id => Number(id)).includes(catalog.id)
            );
            const Options = catalogOptions.map(catalog => ({
                props: { catalog },
            }));
            handleParentCatalogsChange(
                filters.rootCatalogs.map(Number),
                Options
            );
            setFiltered(true);
        }
    }, [catalogs.root, filterSelectedCatalog]);

    useEffect(() => {
        const subCatalogs = [];
        parentCatalogs.map(parentCategory =>
            catalogs.children[parentCategory.id]?.map(subCategory => {
                subCatalogs.push(subCategory);
            })
        );

        if (filters.productCatalogs && subCatalogs.length) {
            const sub = subCatalogs.filter(subCat =>
                filters.productCatalogs.map(Number).includes(subCat.id)
            );
            const subOptions = sub.map(catalog => ({ props: { catalog } }));

            handleChildCatalogsChange(
                filters.productCatalogs.map(Number),
                subOptions
            );
        }
    }, [catalogs.children]);

    const handleFilterType = (value = null) => {
        handlePaginationChange(1);
        if (value) {
            setSelectedType(value);
            onFilter('isSerialNumber', [value]);
        } else {
            setSelectedType(null);
            onFilter('isSerialNumber', null);
        }
    };
    const handleSearchCodeFilter = value => {
        handlePaginationChange(1);
        if (value) {
            onFilter('productCode', value);
        } else {
            onFilter('productCode', null);
        }
    };
    const handleSearchSerialNumberFilter = value => {
        handlePaginationChange(1);
        if (value) {
            onFilter('serialNumber', value);
        } else {
            onFilter('serialNumber', null);
        }
    };
    const handleSearchBarcodeFilter = value => {
        handlePaginationChange(1);
        if (value) {
            onFilter('barcode', value);
        } else {
            onFilter('barcode', null);
        }
    };
    const handleChange = (e, value) => {
        setDescription(e.target.value);
        if (e.target.value === '') {
            onFilter('description', value);
            onFilter('page', 1);
        }
    };

    const handleDatePicker = (startValue, endValue) => {
        handlePaginationChange(1);
        const startDate = startValue
            ? moment(startValue).format('DD-MM-YYYY')
            : undefined;
        setStartDate(startDate);
        const endDate = endValue
            ? moment(endValue).format('DD-MM-YYYY')
            : undefined;
        setEndDate(endDate);
        onFilter('dateFrom', startDate);
        onFilter('dateTo', endDate);
    };

    useEffect(() => {
        if (suppliers.length === 0) fetchSuppliers();
        fetchCatalogs();
        handlePaginationChange(filters.page ? filters.page : 1);

        if (filters.stocks) {
            fetchStocks({ ids: filters.stocks.map(Number) }, data => {
                const appendList = [];

                if (data.data) {
                    data.data.forEach(element => {
                        appendList.push({
                            id: element.id,
                            name: element.name,
                            ...element,
                        });
                    });
                }
                setFilterSelectedStocks(appendList);
            });
        }
        if (filters.products) {
            fetchProducts({
                filters: { ids: filters.products.map(Number) },
                callback: data => {
                    const appendList = [];
                    if (data.data) {
                        data.data.forEach(element => {
                            appendList.push({
                                id: element.id,
                                name: element.name,
                                ...element,
                            });
                        });
                    }
                    setFilterSelectedProducts(appendList);
                },
            });
        }
        if (filters.contracts) {
            fetchContracts({ ids: filters.contracts.map(Number) }, data => {
                const appendList = [];

                if (data.data) {
                    data.data.forEach(element => {
                        appendList.push({
                            id: element.id,
                            name: element.name,
                            ...element,
                        });
                    });
                }
                setFilterSelectedContracts(appendList);
            });
        }
        if (filters.salesman) {
            fetchUsers({
                filters: { ids: filters.salesman.map(Number) },
                onSuccessCallback: data => {
                    const appendList = [];
                    if (data.data) {
                        data.data.forEach(element => {
                            appendList.push({
                                id: element.id,
                                name: element.name,
                                ...element,
                            });
                        });
                    }
                    setFilterSelectedSalesManagers(appendList);
                },
            });
        }
        if (filters.agents) {
            fetchContacts({ ids: filters.agents.map(Number) }, data => {
                const appendList = [];
                if (data.data) {
                    data.data.forEach(element => {
                        appendList.push({
                            id: element.id,
                            name: element.name,
                            ...element,
                        });
                    });
                }
                setFilterSelectedAgent(appendList);
            });
        }
        if (filters.invoices) {
            fetchSalesInvoices(
                { ids: filters.invoices.map(Number), invoiceTypes: [2] },
                data => {
                    const appendList = [];

                    if (data.data) {
                        data.data.forEach(element => {
                            appendList.push({
                                id: element.id,
                                name: element.name,
                                ...element,
                            });
                        });
                    }
                    setFilterSelectedSalesInvoices(appendList);
                }
            );
        }

        if (filters.clients) {
            const filter = {
                ids: filters.clients.map(Number),
                categories: [1],
            };
            fetchContacts(filter, data => {
                const appendList = [];

                if (data.data) {
                    data.data.forEach(element => {
                        appendList.push({
                            id: element.id,
                            name: element.name,
                            ...element,
                        });
                    });
                }
                setFilterSelectedClients(appendList);
            });
        }
        if (filters.businessUnitIds) {
            fetchBusinessUnitList({
                filters: {
                    isDeleted: 0,
                    businessUnitIds: profile.businessUnits?.map(({ id }) => id),
                    ids: filters.businessUnitIds.map(Number),
                },
                onSuccess: data => {
                    const appendList = [];
                    if (data.data) {
                        data.data.forEach(element => {
                            appendList.push({
                                id: element.id,
                                name: element.name,
                                ...element,
                            });
                        });
                    }
                    setFilterSelectedBusinessUnit(appendList);
                },
            });
        }
        if (filters.rootCatalogs) {
            fetchFilteredCatalogs(
                { ids: filters.rootCatalogs.map(Number) },
                data => {
                    let appendList = {};
                    if (data.data) {
                        appendList = data.data;
                    }
                    setFilterSelectedCatalog(appendList);
                }
            );
        }
    }, []);
    useEffect(() => {
        if (filters?.businessUnitIds) {
            ajaxStocksSelectRequest(1, 20, '', 1);
        } else {
            ajaxStocksSelectRequest(1, 20, '', 1);
        }
    }, [filters.businessUnitIds]);

    const ajaxSalesmansSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = {
            limit,
            page,
            'filters[search]': search,
            businessUnitIds: filters?.businessUnitIds
                ? filters?.businessUnitIds
                : undefined,
        };
        fetchUsers({
            filters: defaultFilters,
            onSuccessCallback: data => {
                const appendList = [];
                if (data.data) {
                    data.data.forEach(element => {
                        appendList.push({
                            id: element.id,
                            name: element.name,
                            ...element,
                        });
                    });
                }
                if (onSuccessCallback !== undefined) {
                    onSuccessCallback(!appendList.length);
                }
                if (stateReset) {
                    setSalesman(appendList);
                } else {
                    setSalesman(salesman.concat(appendList));
                }
            },
        });
    };

    const ajaxCatalogsSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = { limit, page, name: search };
        fetchFilteredCatalogs(defaultFilters, data => {
            let appendList = {};
            if (data.data) {
                appendList = data.data;
            }
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(!Object.keys(appendList).length);
            }
            if (stateReset) {
                setCatalogs(appendList);
            } else {
                setCatalogs({
                    ...appendList,
                    root: catalogs.root.concat(appendList.root),
                });
            }
        });
    };

    const ajaxAgentSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = { limit, page, name: search };
        fetchContacts(filters, data => {
            const appendList = [];

            if (data.data) {
                data.data.forEach(element => {
                    appendList.push({
                        id: element.id,
                        name: element.name,
                        ...element,
                    });
                });
            }
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(!appendList.length);
            }
            if (stateReset) {
                setAgent(appendList);
            } else {
                setAgent(agent.concat(appendList));
            }
        });
    };

    const ajaxContractsSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = {
            limit,
            page,
            contractNo: search,
            businessUnitIds: filters?.businessUnitIds
                ? filters?.businessUnitIds
                : undefined,
        };
        fetchContracts(defaultFilters, data => {
            const appendList = [];

            if (data.data) {
                data.data.forEach(element => {
                    appendList.push({
                        id: element.id,
                        name: element.name,
                        ...element,
                    });
                });
            }
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(!appendList.length);
            }
            if (stateReset) {
                setContracts(appendList);
            } else {
                setContracts(contracts.concat(appendList));
            }
        });
    };

    const ajaxProductsSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = { limit, page, q: search, isDeleted: 0 };
        fetchProducts({
            filters: defaultFilters,
            callback: data => {
                const appendList = [];
                if (data.data) {
                    data.data.forEach(element => {
                        appendList.push({
                            id: element.id,
                            name: element.name,
                            ...element,
                        });
                    });
                }
                if (onSuccessCallback !== undefined) {
                    onSuccessCallback(!appendList.length);
                }
                if (stateReset) {
                    setProducts(appendList);
                } else {
                    setProducts(products.concat(appendList));
                }
            },
        });
    };

    const ajaxBusinessUnitSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = {
            limit,
            page,
            name: search,
            isDeleted: 0,
            businessUnitIds: profile.businessUnits?.map(({ id }) => id),
        };
        fetchBusinessUnitList({
            filters,
            onSuccess: data => {
                const appendList = [];
                if (data.data) {
                    data.data.forEach(element => {
                        appendList.push({
                            id: element.id,
                            name: element.name,
                            ...element,
                        });
                    });
                }
                if (onSuccessCallback !== undefined) {
                    onSuccessCallback(!appendList.length);
                }
                if (stateReset) {
                    setBusinessUnits(appendList);
                } else {
                    setBusinessUnits(businessUnits.concat(appendList));
                }
            },
        });
    };

    const ajaxStocksSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = {
            limit,
            page,
            q: search,
            businessUnitIds: filters?.businessUnitIds
                ? filters?.businessUnitIds
                : undefined,
        };
        fetchStocks(defaultFilters, data => {
            const appendList = [];

            if (data.data) {
                data.data.forEach(element => {
                    appendList.push({
                        id: element.id,
                        name: element.name,
                        ...element,
                    });
                });
            }
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(!appendList.length);
            }
            if (stateReset) {
                setStocks(appendList);
            } else {
                setStocks(stocks.concat(appendList));
            }
        });
    };

    const ajaxClientsSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = { limit, page, name: search, categories: [1] };
        fetchContacts(filters, data => {
            const appendList = [];

            if (data.data) {
                data.data.forEach(element => {
                    appendList.push({
                        id: element.id,
                        name: element.name,
                        ...element,
                    });
                });
            }
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(!appendList.length);
            }
            if (stateReset) {
                setClients(appendList);
            } else {
                setClients(clients.concat(appendList));
            }
        });
    };

    const ajaxInvoicesSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = { limit, page, name: search, invoiceTypes: [2] };
        fetchSalesInvoices(filters, data => {
            const appendList = [];

            if (data.data) {
                data.data.forEach(element => {
                    appendList.push({
                        id: element.id,
                        name: element.name,
                        ...element,
                    });
                });
            }
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(!appendList.length);
            }
            if (stateReset) {
                setSalesInvoices(appendList);
            } else {
                setSalesInvoices(salesInvoices.concat(appendList));
            }
        });
    };

    return (
        <Sidebar title="Ticarət">
            {businessUnitLength === 1 &&
            profile.businessUnits.length === 0 ? null : (
                <ProSidebarItem label="Biznes blok">
                    <ProAsyncSelect
                        mode="multiple"
                        selectRequest={ajaxBusinessUnitSelectRequest}
                        valueOnChange={values => {
                            handlePaginationChange(1);
                            onFilter('businessUnitIds', values);
                        }}
                        disabled={businessUnitLength === 1}
                        data={
                            filterSelectedBusinessUnit.length > 0
                                ? [
                                      ...filterSelectedBusinessUnit.filter(
                                          item => item.id !== null
                                      ),
                                      ...businessUnits
                                          ?.map(item =>
                                              item.id === null
                                                  ? { ...item, id: 0 }
                                                  : item
                                          )
                                          .filter(
                                              item =>
                                                  !filterSelectedBusinessUnit
                                                      .map(({ id }) => id)
                                                      ?.includes(item.id)
                                          ),
                                  ]
                                : businessUnits?.map(item =>
                                      item.id === null
                                          ? { ...item, id: 0 }
                                          : item
                                  )
                        }
                        disabledBusinessUnit={businessUnitLength === 1}
                        value={
                            filters.businessUnitIds
                                ? filters.businessUnitIds.map(Number)
                                : businessUnitLength === 1
                                ? businessUnits[0]?.id === null
                                    ? businessUnits[0]?.name
                                    : businessUnits[0]?.id
                                : filters.businessUnitIds
                        }
                    />
                </ProSidebarItem>
            )}
            <ProSidebarItem label="Tarix">
                <ProDateRangePicker
                    onChangeDate={handleDatePicker}
                    defaultStartValue={
                        filters.dateFrom ? filters.dateFrom : undefined
                    }
                    defaultEndValue={
                        filters.dateTo ? filters.dateTo : undefined
                    }
                    notRequired={!!(StartDate || EndDate)}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Seriya nömrə">
                <Row style={{ marginTop: '8px' }}>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Hamısı"
                            isActive={selectedType === null}
                            onClick={() => handleFilterType()}
                        />
                    </Col>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Hə"
                            isActive={selectedType === 1}
                            onClick={() => handleFilterType(1)}
                        />
                    </Col>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Yox"
                            isActive={selectedType === 2}
                            onClick={() => handleFilterType(2)}
                        />
                    </Col>
                </Row>
            </ProSidebarItem>
            <ProSidebarItem label="Anbar">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxStocksSelectRequest}
                    valueOnChange={stocks => {
                        handlePaginationChange(1);
                        onFilter('stocks', stocks);
                    }}
                    value={
                        filters.stocks ? filters.stocks.map(Number) : undefined
                    }
                    data={
                        filterSelectedStocks.length > 0
                            ? [
                                  ...filterSelectedStocks,
                                  ...stocks.filter(
                                      item =>
                                          !filterSelectedStocks
                                              .map(({ id }) => id)
                                              ?.includes(item.id)
                                  ),
                              ]
                            : stocks
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Kataloq">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxCatalogsSelectRequest}
                    valueOnChange={newCatalogs => {
                        setCategory(newCatalogs);
                        setSelectedCatalogs([
                            ...selectedCatalogs,
                            ...catalogs.root
                                ?.filter(catalog =>
                                    newCatalogs.includes(catalog.id)
                                )
                                .filter(
                                    d =>
                                        !new Set(
                                            selectedCatalogs.map(de => de.id)
                                        ).has(d.id)
                                ),
                        ]);
                        filterSelectedCatalog.root.length > 0
                            ? handleParentCatalogsChange(
                                  newCatalogs,
                                  [
                                      ...filterSelectedCatalog.root,
                                      ...catalogs.root.filter(
                                          item =>
                                              !filterSelectedCatalog.root
                                                  .map(({ id }) => id)
                                                  ?.includes(item.id)
                                      ),
                                  ]
                                      ?.filter(catalog =>
                                          newCatalogs.includes(catalog.id)
                                      )
                                      .map(catalog => ({ props: { catalog } }))
                              )
                            : handleParentCatalogsChange(
                                  newCatalogs,
                                  [
                                      ...selectedCatalogs,
                                      ...catalogs.root?.filter(
                                          d =>
                                              !new Set(
                                                  selectedCatalogs.map(
                                                      de => de.id
                                                  )
                                              ).has(d.id)
                                      ),
                                  ]
                                      ?.filter(catalog =>
                                          newCatalogs.includes(catalog.id)
                                      )
                                      .map(catalog => ({ props: { catalog } }))
                              );
                    }}
                    data={
                        filterSelectedCatalog.root.length > 0
                            ? [
                                  ...filterSelectedCatalog.root,
                                  ...catalogs.root.filter(
                                      item =>
                                          !filterSelectedCatalog.root
                                              .map(({ id }) => id)
                                              ?.includes(item.id)
                                  ),
                              ]
                            : catalogs.root || []
                    }
                    // data={catalogs.root || []}
                    value={
                        filters.rootCatalogs
                            ? filters.rootCatalogs.map(Number)
                            : parentCatalogs.map(
                                  parentCatalog => parentCatalog.id
                              )
                    }
                />
                {/* <Select
          value={filters.rootCatalogs?filters.rootCatalogs.map(Number):
            parentCatalogs.map(parentCatalog => parentCatalog.id)}
          mode="multiple"
          placeholder="Seçin"
          showArrow
          size="large"
          className={styles.select}
          allowClear
          onChange={(newCatalogs, options) =>
           { setCategory(newCatalogs);
             handleParentCatalogsChange(newCatalogs, options)}
          }
          suffixIcon={<Icon component={DownArrow} />}
          filterOption={(input, option) =>
            option.props.children
              .replace('İ', 'I')
              .toLowerCase()
              .includes(input.replace('İ', 'I').toLowerCase())
          }
        >
          {catalogs.root?.map(catalog => (
            <Option
              key={catalog.id}
              value={catalog.id}
              className={styles.dropdown}
              catalog={catalog}
            >
              {catalog.name}
            </Option>
          ))}
        </Select> */}
            </ProSidebarItem>

            <ProSidebarItem label="Alt kataloq">
                <Select
                    // loading={isLoading}
                    value={
                        filters.productCatalogs
                            ? filters.productCatalogs.map(Number)
                            : childCatalogs.map(childCatalog => childCatalog.id)
                    }
                    onChange={(newCatalogs, options) => {
                        setSubCategory(newCatalogs);
                        handleChildCatalogsChange(newCatalogs, options);
                    }}
                    mode="multiple"
                    placeholder="Seçin"
                    suffixIcon={<Icon component={DownArrow} />}
                    showArrow
                    disabled={!parentCatalogs.length}
                    className={styles.select}
                    size="large"
                    allowClear
                    filterOption={(input, option) =>
                        option.props.children
                            .replace('İ', 'I')
                            .toLowerCase()
                            .includes(input.replace('İ', 'I').toLowerCase())
                    }
                >
                    {parentCatalogs.map(parentCatalog =>
                        catalogs.children[parentCatalog.id]?.map(subCatalog => (
                            <Option
                                key={subCatalog.id}
                                value={subCatalog.id}
                                id={subCatalog.id}
                                className={styles.dropdown}
                                catalog={subCatalog}
                            >
                                {subCatalog.name}
                            </Option>
                        ))
                    )}
                </Select>
            </ProSidebarItem>
            <ProSidebarItem label="Məhsul adı">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxProductsSelectRequest}
                    valueOnChange={products => {
                        handlePaginationChange(1);
                        onFilter('products', products);
                    }}
                    data={
                        filterSelectedProducts.length > 0
                            ? [
                                  ...filterSelectedProducts,
                                  ...products.filter(
                                      item =>
                                          !filterSelectedProducts
                                              .map(({ id }) => id)
                                              ?.includes(item.id)
                                  ),
                              ]
                            : products
                    }
                    value={
                        filters.products
                            ? filters.products.map(Number)
                            : undefined
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Məhsul kodu">
                <ProSearch
                    allowClear
                    onChange={e => {
                        setProductCode(e.target.value);
                        if (e.target.value === '') {
                            handleSearchCodeFilter(undefined);
                        }
                    }}
                    onSearch={value => handleSearchCodeFilter(value)}
                    value={productCode}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Seriya nömrəsi">
                <ProSearch
                    allowClear
                    onChange={e => {
                        setserialNumber(e.target.value);
                        if (e.target.value === '') {
                            handleSearchSerialNumberFilter(undefined);
                        }
                    }}
                    onSearch={value => handleSearchSerialNumberFilter(value)}
                    value={serialNumber}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Barkod">
                <ProSearch
                    allowClear
                    onChange={e => {
                        setbarCode(e.target.value);
                        if (e.target.value === '') {
                            handleSearchBarcodeFilter(undefined);
                        }
                    }}
                    onSearch={value => handleSearchBarcodeFilter(value)}
                    value={barCode}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Alıcı">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxClientsSelectRequest}
                    valueOnChange={clients => {
                        handlePaginationChange(1);
                        onFilter('clients', clients);
                    }}
                    data={
                        filterSelectedClients.length > 0
                            ? [
                                  ...filterSelectedClients,
                                  ...clients.filter(
                                      item =>
                                          !filterSelectedClients
                                              .map(({ id }) => id)
                                              ?.includes(item.id)
                                  ),
                              ]
                            : clients
                    }
                    value={
                        filters.clients
                            ? filters.clients.map(Number)
                            : undefined
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Müqavilə">
                <ProAsyncSelect
                    mode="multiple"
                    keys={['contract_no']}
                    selectRequest={ajaxContractsSelectRequest}
                    valueOnChange={contracts => {
                        handlePaginationChange(1);
                        onFilter('contracts', contracts);
                    }}
                    data={
                        filterSelectedContracts.length > 0
                            ? [
                                  ...filterSelectedContracts,
                                  ...contracts.filter(
                                      item =>
                                          !filterSelectedContracts
                                              .map(({ id }) => id)
                                              ?.includes(item.id)
                                  ),
                              ]
                            : contracts
                    }
                    value={
                        filters.contracts
                            ? filters.contracts.map(Number)
                            : undefined
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Qaimə">
                <ProAsyncSelect
                    mode="multiple"
                    keys={['invoiceNumber']}
                    selectRequest={ajaxInvoicesSelectRequest}
                    valueOnChange={invoices => {
                        handlePaginationChange(1);
                        onFilter('invoices', invoices);
                    }}
                    data={
                        filterSelectedSalesInvoices.length > 0
                            ? [
                                  ...filterSelectedSalesInvoices,
                                  ...salesInvoices.filter(
                                      item =>
                                          !filterSelectedSalesInvoices
                                              .map(({ id }) => id)
                                              ?.includes(item.id)
                                  ),
                              ]
                            : salesInvoices
                    }
                    value={
                        filters.invoices
                            ? filters.invoices.map(Number)
                            : undefined
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Satış meneceri">
                <ProAsyncSelect
                    mode="multiple"
                    keys={['name', 'lastName']}
                    selectRequest={ajaxSalesmansSelectRequest}
                    valueOnChange={salesman => {
                        handlePaginationChange(1);
                        onFilter('salesman', salesman);
                    }}
                    data={
                        filterSelectedSalesManagers.length > 0
                            ? [
                                  ...filterSelectedSalesManagers,
                                  ...salesman.filter(
                                      item =>
                                          !filterSelectedSalesManagers
                                              .map(({ id }) => id)
                                              ?.includes(item.id)
                                  ),
                              ]
                            : salesman
                    }
                    value={
                        filters.salesman
                            ? filters.salesman.map(Number)
                            : undefined
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Agent">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxAgentSelectRequest}
                    valueOnChange={agents => {
                        handlePaginationChange(1);
                        onFilter('agents', agents);
                    }}
                    data={
                        filterSelectedAgent.length > 0
                            ? [
                                  ...filterSelectedAgent,
                                  ...agent.filter(
                                      item =>
                                          !filterSelectedAgent
                                              .map(({ id }) => id)
                                              ?.includes(item.id)
                                  ),
                              ]
                            : agent
                    }
                    value={
                        filters.agents ? filters.agents.map(Number) : undefined
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Əlavə məlumat">
                <ProSearch
                    onSearch={value => {
                        handlePaginationChange(1);
                        onFilter('description', value);
                    }}
                    onChange={(e, value) => handleChange(e, value)}
                    value={description}
                />
            </ProSidebarItem>
        </Sidebar>
    );
};

const mapStateToProps = state => ({
    salesmen: state.usersReducer.users,
    suppliers: state.contactsReducer.suppliers,
    products: state.productReducer.products,
    stocks: state.stockReducer.stocks,
    catalogs: state.catalogsReducer.catalogs,
    clients: state.contactsReducer.clients,
    agents: state.contactsReducer.contacts,
    contracts: state.contractsReducer.contracts,
    isLoading: state.salesAndBuysReducer.isLoading,
    salesInvoices: state.soldItemsReducer.salesInvoices,
    invoicesCount: state.salesAndBuysReducer.invoicesCount,
});

export default connect(
    mapStateToProps,
    {
        fetchUsers,
        fetchContacts,
        fetchSuppliers,
        fetchStocks,
        fetchProducts,
        fetchCatalogs,
        fetchContracts,
        fetchSalesInvoiceSearch,
        fetchSalesInvoices,
        fetchSalesInvoiceCount,
        fetchFilteredCatalogs,
    }
)(SoldItemsSidebar);
