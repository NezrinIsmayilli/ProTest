// permissions => app functionalty (add transaction, add user and etc.)
export const permissions = {
	// Mədaxil
	kmd: 'kmd',
	// Müqavilə
	contract: 'contract',
	// İşə qəbul
	projobs: 'projobs',
	projobs_appeals: 'projobs_appeals',
	projobs_vacancies: 'projobs_vacancies',
	projobs_job_seekers: 'projobs_job_seekers',
	projobs_advertisements: 'projobs_advertisements',
	projobs_create_new_vacancy: 'projobs_create_new_vacancy',
	projobs_trainings: 'projobs_trainings',
	projobs_create_new_training: 'projobs_create_new_training',
	// İlkin qalıq
	balance_creation: 'balance_creation',
	// MSK
	msk: 'msk',
	// Əlaqələr
	relations: 'relations',
	// Hesablaşmalar
	settlement: 'settlement',
	// Əməkhaqqı ödənişi
	// Reports
	reports: 'reports',
	// Məxaric
	kmx: 'kmx',
	// Məhsul kataloqu
	product_catalog: 'product_catalog',
	// Yerdəyişmə əməliyyatı
	// Səsli Task
	tasks_media: 'tasks_media',
	// Task
	tasks: 'tasks',

	// Əməkdaş Dəvət
	employee_invite: 'employee_invite',
	// Əməkdaşlar
	employee: 'employee',
	// Gecikmələr
	// İş vaxtının uçotu

	// Anbar Qalığı
	init_invoice: 'init_invoice',

	// groups
	common: 'common',
	dashboard: 'dashboard',
	users: 'users',
	partner: 'partner',
	contact: 'contact',
	sales: 'sales',
	transaction: 'transaction',
	hrm: 'hrm',
	order: 'order',
	report: 'report',
	task: 'task',
	business_unit: 'business_unit',
	tenant_requisites: 'tenant_requisites',

	stock: 'stock',
	stock_product_catalog: 'stock_product_catalog',
	stock_product: 'stock_product',
	stock_turnover: 'stock_turnover',
	bron_invoice: 'bron_invoice',
	// Sales operations
	purchase_invoice: 'purchase_invoice',
	import_purchase: 'import_purchase',
	sales_invoice: 'sales_invoice',
	return_from_customer_invoice: 'return_from_customer_invoice',
	return_to_supplier_invoice: 'return_to_supplier_invoice',
	transfer_invoice: 'transfer_invoice',
	remove_invoice: 'remove_invoice',

	sales_turnover: 'sales_turnover',
	sales_sold_items: 'sales_sold_items',
	purchase_report: 'purchase_report',
	sales_contract: 'sales_contract',
	production_invoice: 'production_invoice',

	// Finance operations
	transaction_invoice_payment: 'transaction_invoice_payment',
	money_transfer: 'money_transfer',
	salary_payment: 'salary_payment',
	transaction_advance_payment: 'transaction_advance_payment',
	transaction_expense_payment: 'transaction_expense_payment',
	transaction_tenant_person_payment: 'transaction_tenant_person_payment',
	transaction_balance_creation_payment:
		'transaction_balance_creation_payment',
	transaction_exchange: 'transaction_exchange',

	accounts: 'accounts',
	expenses: 'expenses',

	stock_report_average_value1: 'stock_report_average_value1',
	stock_report_average_value2: 'stock_report_average_value2',

	expense_report: 'expense_report',
	advance_report: 'advance_report',
	employee_payment_report: 'employee_payment_report',
	balance_creation_report: 'balance_creation_report',
	currency_history_report: 'currency_history_report',
	cashbox_balance_report: 'cashbox_balance_report',
	employee_sales_bonus_configuration: 'employee_sales_bonus_configuration',
	sales_bonus_configuration: 'sales_bonus_configuration',
	credit_payments: 'credit_payments',
	credits_table: 'credits_table',

	transaction_vat_report: 'transaction_vat_report',
	transaction_recievables_report: 'transaction_recievables_report',
	transaction_payables_report: 'transaction_payables_report',

	hrm_working_employees: 'hrm_working_employees',
	hrm_fired_employees: 'hrm_fired_employees',
	hrm_activities: 'hrm_activities',

	structure: 'structure',
	occupation: 'occupation',

	calendar: 'calendar',
	timecard: 'timecard',
	work_schedule: 'work_schedule',

	lateness_report: 'lateness_report',
	payroll: 'payroll',
	timecard_report: 'timecard_report',

	salary_report: 'salary_report',

	order_basket: 'order_basket',
	order_report: 'order_report',

	sales_report: 'sales_report',
	debt_turnover: 'debt_turnover',
	profit_and_loss_report: 'profit_and_loss_report',
	balance_sheet_report: 'balance_sheet_report',
	profit_center_contracts: 'profit_center_contracts',
	payment_report: 'payment_report',

	stocks_products_price: 'stocks_products_price',
	stock_report_total: 'stock_report_total',
	stock_report_details_cost: 'stock_report_details_cost',
	stock_report_details_cost_main: 'stock_report_details_cost_main',
	stock_report_details_cost_total: 'stock_report_details_cost_total',
	sales_operations_sales_from_invoices:
		'sales_operations_sales_from_invoices',
	sales_operations_rfc_from_invoices: 'sales_operations_rfc_from_invoices',
	sales_operations_rts_from_invoices: 'sales_operations_rts_from_invoices',
	sales_sold_items_cost: 'sales_sold_items_cost',
	sales_sold_items_cost_main: 'sales_sold_items_cost_main',
	sales_sold_items_cost_main_total: 'sales_sold_items_cost_main_total',
	sales_sold_items_margin: 'sales_sold_items_cost_main_total',
	sales_purchased_items_price_per_item:
		'sales_purchased_items_price_per_item',
	sales_purchased_items_total_price: 'sales_purchased_items_total_price',
	sales_purchased_items_discount: 'sales_purchased_items_discount',
	sales_purchased_items_endprice: 'sales_purchased_items_endprice',
	sales_purchased_items_per_item_endprice:
		'sales_purchased_items_per_item_endprice',
	sales_purchased_items_main_currency: 'sales_purchased_items_main_currency',
	sales_purchased_items_details: 'sales_purchased_items_details',

	missed_calls: 'missed_calls',
	answered_calls: 'answered_calls',
	internal_calls: 'internal_calls',

	statistics_of_operators: 'statistics_of_operators',
	supervisor_panel: 'supervisor_panel',
	procall_status_history: 'procall_status_history',
	// main_indicators: 'main_indicators',

	msk_cashbox: 'msk_cashbox',
	msk_occupations: 'msk_occupations',
	msk_warehouse: 'msk_warehouse',
	msk_product: 'msk_product',
	credits: 'credits',
	msk_contract: 'msk_contract',
	msk_permissions: 'msk_permissions',
	msk_hrm: 'msk_hrm',
	telegram_notifications: 'telegram_notifications',
	msk_documents: 'msk_documents',
	msk_order: 'msk_order',
	msk_callcenter: 'msk_callcenter',
	msk_integrations: 'msk_integrations',
	msk_faq: 'msk_faq',

	sales_init_invoice: 'sales_init_invoice',
	sales_initial_debt: 'sales_initial_debt',
	transaction_initial_balance: 'transaction_initial_balance',

	faq: 'faq',
	procall_tracking_panel: 'procall_tracking_panel',
	procall_messages: 'procall_messages',
};

export const accessTypes = {
	read: 'read',
	manage: 'manage',
};

export const permissionsList = {
	dashboard: {
		name: 'Ticarət və Maliyyə',
		group_key: 'dashboard',
	},
	users: {
		name: 'İstifadəçilər',
		group_key: 'users',
	},
	contact: {
		name: 'Əlaqələr',
		group_key: 'contact',
	},
	partner: {
		name: 'Partnyorlar',
		group_key: 'contact',
	},
	stock: {
		name: 'Anbarlar',
		group_key: 'stock',
	},
	stock_turnover: {
		name: 'Anbar Hesabatı',
		group_key: 'stock',
	},
	stock_product: {
		name: 'Məhsullar',
		group_key: 'stock',
	},
	bron_invoice: {
		name: 'Bron qaiməsi',
		group_key: 'stock',
	},
	// projobs: {
	//   name: 'İşçi axtarışı',
	//   group_key: 'projobs',
	// },
	projobs_appeals: {
		name: 'Müraciətlər',
		group_key: 'projobs',
	},
	projobs_vacancies: {
		name: 'Vakansiyalar',
		group_key: 'projobs',
	},
	projobs_job_seekers: {
		name: 'İş axtaranlar',
		group_key: 'projobs',
	},
	projobs_advertisements: {
		name: 'Seçilmiş elanlar',
		group_key: 'projobs',
	},
	projobs_create_new_vacancy: {
		name: 'Yeni vakansiya yerləşdir',
		group_key: 'projobs',
	},
	projobs_trainings: {
		name: 'Təlimlər',
		group_key: 'projobs',
	},
	projobs_create_new_training: {
		name: 'Yeni təlim yerləşdir',
		group_key: 'projobs',
	},
	// msk: {
	//   name: 'MSK',
	//   group_key: 'msk',
	// },
	stock_product_catalog: {
		name: 'Məhsullar Kataloqu',
		group_key: 'stock',
	},
	purchase_invoice: {
		name: 'Alış əməliyyatı',
		group_key: 'sales',
		sub_group_key: 'operations',
	},
	import_purchase: {
		name: 'İdxal alışı',
		group_key: 'sales',
		sub_group_key: 'operations',
	},
	sales_invoice: {
		name: 'Satış əməliyyatı',
		group_key: 'sales',
		sub_group_key: 'operations',
	},
	return_from_customer_invoice: {
		name: 'Geri alma əməliyyatı',
		group_key: 'sales',
		sub_group_key: 'operations',
	},
	return_to_supplier_invoice: {
		name: 'Geri qaytarma əməliyyatı',
		group_key: 'sales',
		sub_group_key: 'operations',
	},
	transfer_invoice: {
		name: 'Transfer əməliyyatı',
		group_key: 'sales',
		sub_group_key: 'operations',
	},
	remove_invoice: {
		name: 'Silinmə əməliyyatı',
		group_key: 'sales',
		sub_group_key: 'operations',
	},
	sales_turnover: {
		name: 'Dövriyyə',
		group_key: 'sales',
	},
	sales_sold_items: {
		name: 'Satışlar',
		group_key: 'sales',
	},
	purchase_report: {
		name: 'Alışlar',
		group_key: 'sales',
	},
	sales_contract: {
		name: 'Müqavilələr',
		group_key: 'sales',
	},
	production_invoice: {
		name: 'İstehsalat',
		group_key: 'sales',
		sub_group_key: 'operations',
	},
	transaction_invoice_payment: {
		name: 'Qaimə əməliyyatları',
		group_key: 'transaction',
		sub_group_key: 'operations',
	},
	salary_payment: {
		name: 'Əməkhaqqı əməliyyatları',
		group_key: 'transaction',
		sub_group_key: 'operations',
	},
	money_transfer: {
		name: 'Transfer əməliyyatı',
		group_key: 'transaction',
		sub_group_key: 'operations',
	},
	transaction_advance_payment: {
		name: 'Avans',
		group_key: 'transaction',
		sub_group_key: 'operations',
	},
	transaction_expense_payment: {
		name: 'Xərclər',
		group_key: 'transaction',
		sub_group_key: 'operations',
	},
	transaction_tenant_person_payment: {
		name: 'Təhtəl hesab',
		group_key: 'transaction',
		sub_group_key: 'operations',
	},
	transaction_balance_creation_payment: {
		name: 'Təsisçi',
		group_key: 'transaction',
		sub_group_key: 'operations',
	},
	transaction_exchange: {
		name: 'Valyuta mübadiləsi',
		group_key: 'transaction',
		sub_group_key: 'operations',
	},

	expense_report: {
		name: 'Pul axını hesabatı',
		group_key: 'transaction',
		sub_group_key: 'reports',
	},
	advance_report: {
		name: 'Avans balansı',
		group_key: 'transaction',
		sub_group_key: 'reports',
	},
	employee_payment_report: {
		name: 'Təhtəl hesab balansı',
		group_key: 'transaction',
		sub_group_key: 'reports',
	},
	balance_creation_report: {
		name: 'Təsisçi pulları balansı',
		group_key: 'transaction',
		sub_group_key: 'reports',
	},
	currency_history_report: {
		name: 'Valyuta tarixçəsi',
		group_key: 'transaction',
		sub_group_key: 'reports',
	},
	cashbox_balance_report: {
		name: 'Hesab qalıqları',
		group_key: 'transaction',
		sub_group_key: 'reports',
	},
	employee_sales_bonus_configuration: {
		name: 'Əməkdaşlar üzrə bonuslar',
		group_key: 'transaction',
		sub_group_key: 'salesBonus',
	},
	sales_bonus_configuration: {
		name: 'Satışdan bonus/Tənzimləmələr',
		group_key: 'transaction',
		sub_group_key: 'salesBonus',
	},
	credit_payments: {
		name: 'Ödəniş cədvəli/Ödənişlər',
		group_key: 'transaction',
		sub_group_key: 'credits',
	},
	credits_table: {
		name: 'Ödəniş cədvəli/Cədvəllər',
		group_key: 'transaction',
		sub_group_key: 'credits',
	},
	accounts: {
		name: 'Hesablar',
		group_key: 'transaction',
		sub_group_key: 'accounts',
	},
	expenses: {
		name: 'Xərc Maddələri',
		group_key: 'transaction',
		sub_group_key: 'expenses',
	},
	transaction_vat_report: {
		name: 'ƏDV',
		group_key: 'transaction',
		sub_group_key: 'transaction_vat_report',
	},

	transaction_recievables_report: {
		name: 'Debitor borclar',
		group_key: 'transaction',
		sub_group_key: 'transaction_recievables_report',
	},
	transaction_payables_report: {
		name: 'Kreditor borclar',
		group_key: 'transaction',
		sub_group_key: 'transaction_payables_report',
	},
	hrm_working_employees: {
		name: 'İşçilər',
		group_key: 'hrm',
		sub_group_key: 'employees',
	},
	hrm_fired_employees: {
		name: 'Azad olunanlar',
		group_key: 'hrm',
		sub_group_key: 'employees',
	},
	hrm_activities: {
		name: 'Əməliyyatlar',
		group_key: 'hrm',
		sub_group_key: 'employees',
	},
	occupation: {
		name: 'Vəzifələr',
		group_key: 'hrm',
		sub_group_key: 'structure',
	},
	structure: {
		name: 'Bölmələr',
		group_key: 'hrm',
		sub_group_key: 'structure',
	},
	timecard_report: {
		name: 'İş vaxtının uçotu',
		group_key: 'hrm',
		sub_group_key: 'attendance',
	},
	calendar: {
		name: 'İstehsalat təqvimi',
		group_key: 'hrm',
		sub_group_key: 'attendance',
	},
	work_schedule: {
		name: 'İş rejimi',
		group_key: 'hrm',
		sub_group_key: 'attendance',
	},
	salary_report: {
		name: 'Əməkhaqqı Hesabatı',
		group_key: 'report',
	},
	payroll: {
		name: 'Əməkhaqqı Jurnalı',
		group_key: 'hrm',
		sub_group_key: 'report',
	},
	timecard: {
		name: 'Davamiyyət Jurnalı',
		group_key: 'hrm',
		sub_group_key: 'report',
	},
	lateness_report: {
		name: 'Cərimələr',
		group_key: 'hrm',
		sub_group_key: 'report',
	},
	order: {
		name: 'Sifarişlər',
		group_key: 'order',
	},
	order_report: {
		name: 'Hesabatlar',
		group_key: 'order',
	},
	order_basket: {
		name: 'Məhsul kataloqu',
		group_key: 'order',
	},
	sales_report: {
		name: 'Satış hesabatı',
		group_key: 'report',
	},
	debt_turnover: {
		name: 'Borc dövriyyəsi',
		group_key: 'report',
	},
	profit_and_loss_report: {
		name: 'Mənfəət və Zərər',
		group_key: 'report',
	},
	balance_sheet_report: {
		name: 'Balans hesabatı',
		group_key: 'report',
	},
	business_unit: {
		name: 'Biznes blok',
		group_key: 'business_unit',
	},
	tenant_requisites: {
		name: 'Rekvizitlər',
		group_key: 'tenant_requisites',
	},
	profit_center_contracts: {
		name: 'Mənfəət mərkəzləri/Müqavilələr',
		group_key: 'report',
		sub_group_key: 'profit_center',
	},
	payment_report: {
		name: 'Xərclər',
		group_key: 'report',
		sub_group_key: 'payment_report',
	},
	missed_calls: {
		name: 'Buraxılmış zənglər',
		group_key: 'call_center',
		sub_group_key: 'calls',
	},
	answered_calls: {
		name: 'İcra edilmiş zənglər',
		group_key: 'call_center',
		sub_group_key: 'calls',
	},
	internal_calls: {
		name: 'Daxili zənglər',
		group_key: 'call_center',
		sub_group_key: 'calls',
	},
	statistics_of_operators: {
		name: 'Operatorların statistikası',
		group_key: 'call_center',
		sub_group_key: 'reports',
	},
	supervisor_panel: {
		name: 'Supervayzer paneli',
		group_key: 'call_center',
		sub_group_key: 'reports',
	},
	procall_status_history: {
		name: 'Status tarixçəsi',
		group_key: 'call_center',
		sub_group_key: 'reports',
	},
	// main_indicators: {
	//   name: 'Əsas göstəricilər',
	//   group_key: 'call_center',
	//   sub_group_key: 'reports',
	// },
	msk_cashbox: {
		name: 'Kassa',
		group_key: 'settings',
		sub_group_key: 'msk',
	},
	msk_occupations: {
		name: 'Vəzifələr',
		group_key: 'settings',
		sub_group_key: 'msk',
	},
	msk_warehouse: {
		name: 'Anbar',
		group_key: 'settings',
		sub_group_key: 'msk',
	},
	msk_product: {
		name: 'Məhsul',
		group_key: 'settings',
		sub_group_key: 'msk',
	},
	credits: {
		name: 'Kredit',
		group_key: 'settings',
		sub_group_key: 'msk',
	},
	msk_contract: {
		name: 'Müqavilə',
		group_key: 'settings',
		sub_group_key: 'msk',
	},
	msk_permissions: {
		name: 'İstifadəçi hüquqları',
		group_key: 'settings',
		sub_group_key: 'msk',
	},
	msk_hrm: {
		name: 'İnsan resursları',
		group_key: 'settings',
		sub_group_key: 'msk',
	},
	telegram_notifications: {
		name: 'Bildirişlər',
		group_key: 'settings',
		sub_group_key: 'msk',
	},
	msk_documents: {
		name: 'Sənədlər',
		group_key: 'settings',
		sub_group_key: 'msk',
	},
	msk_order: {
		name: 'Sifariş tənzimləmələri',
		group_key: 'settings',
		sub_group_key: 'msk',
	},
	msk_callcenter: {
		name: 'Əlaqə mərkəzi',
		group_key: 'settings',
		sub_group_key: 'msk',
	},
	msk_integrations: {
		name: 'İnteqrasiya',
		group_key: 'settings',
		sub_group_key: 'msk',
	},
	msk_faq: {
		name: 'FAQ',
		group_key: 'settings',
		sub_group_key: 'msk',
	},
	sales_init_invoice: {
		name: 'Anbar',
		group_key: 'init_settings',
		sub_group_key: 'initial_remains',
	},
	transaction_initial_balance: {
		name: 'Hesab',
		group_key: 'init_settings',
		sub_group_key: 'initial_remains',
	},
	sales_initial_debt: {
		name: 'Borc',
		group_key: 'init_settings',
		sub_group_key: 'initial_remains',
	},

	faq: {
		name: 'FAQ',
		group_key: 'call_center', // 'contact_center',
		sub_group_key: 'faq',
	},

	procall_tracking_panel: {
		name: 'İzləmə paneli',
		group_key: 'call_center', // 'contact_center',
		sub_group_key: 'fop',
	},

	// procall_messages: {
	// 	name: 'Mesajlar',
	// 	group_key: 'call_center', // 'contact_center',
	// 	sub_group_key: 'procall_messages',
	// },

	// Columns
	stocks_products_price: {
		name: 'Anbar/Anbarlar/Məhsulların dəyəri',
		group_key: 'columns',
	},
	stock_report_average_value: {
		name: 'Anbar/Anbar hesabatı/Orta dəyər',
		group_key: 'columns',
	},
	stock_report_average_value1: {
		name: 'Anbar/Anbar hesabatı/Orta dəyər',
		group_key: 'columns',
	},
	stock_report_average_value2: {
		name: 'Anbar/Anbar hesabatı/Orta dəyər (Əsas valyuta)',
		group_key: 'columns',
	},
	stock_report_total: {
		name: 'Anbar/Anbar hesabatı/Toplam',
		group_key: 'columns',
	},
	stock_report_details_cost: {
		name: 'Anbar/Anbar hesabatı/Ətraflı/Maya dəyəri',
		group_key: 'columns',
	},
	stock_report_details_cost_main: {
		name: 'Anbar/Anbar hesabatl/Ətraflı/Maya dəyəri (Əsas valyuta)',
		group_key: 'columns',
	},
	stock_report_details_cost_total: {
		name: 'Anbar/Anbar hesabatl/Ətraflı/Maya dəyəri (Toplam)',
		group_key: 'columns',
	},
	sales_operations_sales_from_invoices: {
		name: 'Ticarət/Əməliyyatlar/Satış əməliyyatı/Qaimədən seç/Qiymət',
		group_key: 'columns',
	},
	sales_operations_rfc_from_invoices: {
		name: 'Ticarət/Əməliyyatlar/Geri alma əməliyyatı/Qaimədən seç/Qiymət',
		group_key: 'columns',
	},
	sales_operations_rts_from_invoices: {
		name:
			'Ticarət/Əməliyyatlar/Geri qaytarma əməliyyatı/Qaimədən seç/Qiymət',
		group_key: 'columns',
	},
	sales_sold_items_cost: {
		name: 'Ticarət/Satışlar/Vahidin maya dəyəri',
		group_key: 'columns',
	},
	sales_sold_items_cost_main: {
		name: 'Ticarət/Satışlar/Maya dəyəri',
		group_key: 'columns',
	},
	sales_sold_items_cost_main_total: {
		name: 'Ticarət/Satışlar/Mənfəət',
		group_key: 'columns',
	},
	sales_sold_items_margin: {
		name: 'Ticarət/Satışlar/Marja',
		group_key: 'columns',
	},
	sales_purchased_items_price_per_item: {
		group_key: 'columns',
		name: 'Ticarət/Alışlar/Vahidin qiyməti',
	},
	sales_purchased_items_total_price: {
		group_key: 'columns',
		name: 'Ticarət/Alışlar/Toplam dəyər',
	},
	sales_purchased_items_discount: {
		group_key: 'columns',
		name: 'Ticarət/Alışlar/Endirim',
	},
	sales_purchased_items_endprice: {
		group_key: 'columns',
		name: 'Ticarət/Alışlar/Son qiymət',
	},
	sales_purchased_items_per_item_endprice: {
		group_key: 'columns',
		name: 'Ticarət/Alışlar/Vahidin son qiyməti',
	},
	sales_purchased_items_main_currency: {
		group_key: 'columns',
		name: 'Ticarət/Alışlar/Əsas valyuta',
	},
	sales_purchased_items_details: {
		name: 'Ticarət/Alışlar/Ətraflı modalı',
		group_key: 'columns',
	},
};
