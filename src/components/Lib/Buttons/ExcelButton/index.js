import React from 'react';
import { Button } from 'antd';
import { ReactComponent as PenIcon } from 'assets/img/icons/excel.svg';

import { ReactComponent as HistoryIcon } from 'assets/img/icons/history.svg';
import styles from './styles.module.scss';

export const ExcelButton = ({
	label = 'Excell-ə çıxarış',
	size = 'large',
	color = '#4E9CDF',
	history = false,
	iconWidth = 20,
	iconHeight = 20,
	...rest
}) => (
	<Button size={size} className={styles.excelButton} {...rest}>
		<div
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			{!history && (
				<PenIcon fill={color} width={iconWidth} height={iconHeight} />
			)}
			{history && (
				<span
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<HistoryIcon
						fill={color}
						width={iconWidth}
						height={iconHeight}
						style={{ marginRight: '8px' }}
					/>
					{label}
				</span>
			)}
		</div>
	</Button>
);
