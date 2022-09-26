/* eslint-disable react/display-name */
/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { Select, Icon, Spin } from 'antd';
import { ReactComponent as DownArrow } from 'assets/img/icons/downarrow.svg';
import styles from './styles.module.scss';

const { Option } = Select;

class ProAsyncSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            search: '',
            page: 1,
            limit: 20,
            reachedEnd: false,
        };
    }

    componentDidMount() {
        this.props.selectRequest(this.state.page, this.state.limit);
    }

    handleChange = value => {
        this.props.valueOnChange(value);
        if (!this.state.loading && this.state.search !== '') {
            this.setState(
                { loading: true, page: 1, search: '', reachedEnd: false },
                () => {
                    this.props.selectRequest(
                        this.state.page,
                        this.state.limit,
                        '',
                        1,
                        () => {
                            this.setState({ loading: false });
                        }
                    );
                }
            );
        }
    };

    onScroll = event => {
        const { target } = event;

        if (
            !this.state.loading &&
            !this.state.reachedEnd &&
            target.scrollTop + target.offsetHeight + 5 >= target.scrollHeight
        ) {
            this.setState({ loading: true }, () => {
                this.setState(
                    state => ({ page: state.page + 1 }),
                    () => {
                        this.props.selectRequest(
                            this.state.page,
                            this.state.limit,
                            this.state.search,
                            null,
                            reachedEnd => {
                                if (reachedEnd) {
                                    this.setState({ reachedEnd: true });
                                }
                                this.setState({ loading: false });
                            }
                        );
                    }
                );
            });
        }
    };

    onSearch = val => {
        this.setState({ page: 1, reachedEnd: false, search: val }, () => {
            this.props.selectRequest(
                this.state.page,
                this.state.limit,
                this.state.search,
                1,
                reachedEnd => {
                    if (reachedEnd) {
                        this.setState({ reachedEnd: true });
                    }
                    this.setState({ loading: false });
                }
            );
        });
    };

    render() {
        const children = [];
        const {
            suffixIcon = <Icon component={DownArrow} />,
            data,
            keys = ['name'],
            loading = false,
            disabled = false,
            showArrow = true,
            showSearch = true,
            hasError = false,
            allowClear = true,
            className = '',
            id = true,
            disabledBusinessUnit = false,
            size = 'large',
            notFoundContent = 'Məlumat tapılmadı',
            ...rest
        } = this.props;

        for (let i = 0; i < data.length; i++) {
            children.push(
                <Option
                    key={data[i].id}
                    value={id ? data[i]?.id : data[i]?.name}
                    title={`${data[i][keys[0]]} ${data[i][keys[1]] ||
                        ''} ${data[i][keys[2]] || ''}`}
                >{`${data[i][keys[0]]} ${data[i][keys[1]] || ''} ${data[i][
                    keys[2]
                ] || ''}`}</Option>
            );
        }
        return (
            <Select
                showSearch={showSearch}
                allowClear={allowClear}
                notFoundContent={notFoundContent}
                className={`${styles.select} ${className} ${hasError ? styles.selectError : ''
                    } ${disabled ? styles.disabled : ''} ${disabledBusinessUnit ? styles.disabledBusinessUnit : ''
                    }`}
                onChange={this.handleChange}
                onPopupScroll={this.onScroll}
                dropdownClassName={styles.dropdown}
                optionFilterProp="children"
                getPopupContainer={trigger => trigger.parentNode}
                suffixIcon={loading ? <Spin size="small" /> : suffixIcon}
                placeholder="Secin"
                onDropdownVisibleChange={open => {
                    if (!open) {
                        if (!this.state.loading) {
                            this.setState(
                                {
                                    loading: true,
                                    reachedEnd: false,
                                    page: 1,
                                    search: '',
                                },
                                () => {
                                    this.props.selectRequest(
                                        this.state.page,
                                        this.state.limit,
                                        '',
                                        1,
                                        () => {
                                            this.setState({ loading: false });
                                        }
                                    );
                                }
                            );
                        }
                    }
                }}
                onSearch={this.onSearch}
                showArrow={showArrow}
                filterOption={(input, option) =>
                    option.props.children
                        .replace('İ', 'I')
                        .toLowerCase()
                        .includes(input.replace('İ', 'I').toLowerCase())
                }
                disabled={disabled || loading}
                size={size}
                {...rest}
            >
                {!this.state.loading
                    ? children
                    : [...children, <Option key="loading">Yüklənir...</Option>]}
            </Select>
        );
    }
}

export default ProAsyncSelect;
