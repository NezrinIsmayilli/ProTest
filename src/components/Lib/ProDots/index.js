import React from 'react';
import { Popover, Button } from 'antd';
import { ReactComponent as ThreeDots } from 'assets/img/icons/three-dots.svg';
import styles from './styles.module.scss';

export const ProDots = props => {
	const {
		children,
		color = '#373737',
		width = 18,
		height = 18,
		isDisabled = false,
		placement = 'left',
	} = props;

	const { innerWidth } = window;

	return (
		<>
			<Popover
				placement={placement}
				trigger={innerWidth <= 768 ? 'click' : 'hover'}
				content={isDisabled ? null : <ProContent content={children} />}
				className={styles.threeDots}
			>
				<ThreeDots
					fill={isDisabled ? '#C4C4C4' : color}
					width={width}
					height={height}
					style={isDisabled ? { cursor: 'not-allowed' } : { cursor: 'pointer' }}
				/>
			</Popover>
		</>
	);
};

export const ProContent = props => {
	const { content, ...rest } = props;
	return (
		<div className={styles.content} {...rest}>
			{content}
		</div>
	);
};

export const ProDotsItem = props => {
	const {
		label,
		iconWidth = 16,
		iconHeight = 16,
		icon = 'pencil',
		...rest
	} = props;
	const iconUrl = `/img/icons/`;
	return (
		<Button className={styles.item} {...rest}>
			<img
				width={iconWidth}
				height={iconHeight}
				src={`${iconUrl}${icon}.svg`}
				alt="iconAlt"
				style={{ marginRight: '8px' }}
			/>
			{label}
		</Button>
	);
};
