import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { IoFilterCircleOutline, IoCloseCircleOutline } from 'react-icons/io5';
import styles from './styles.module.sass';

export function SidebarLink({ name, path }) {
	return (
		<li>
			<NavLink
				activeClassName={styles.active}
				className={styles.hover}
				to={path}
			>
				{name}
			</NavLink>
		</li>
	);
}

SidebarLink.propTypes = {
	name: PropTypes.string.isRequired,
	path: PropTypes.string.isRequired,
};
export function Sidebar({ title, children, openedSidebar, setOpenedSidebar }) {
	return (
		<section
			className={`${styles.sidebar} ${openedSidebar && styles.open}`}
		>
			<div className={styles.sidebar_header}>
				<div className={styles.sidebar_header_text}>{title}</div>
				<button
					type="button"
					onClick={() => setOpenedSidebar(!openedSidebar)}
				>
					<IoCloseCircleOutline />
				</button>
			</div>
			<div className={styles.sidebar_dashboard_menu}>
				<ul>{children}</ul>
			</div>
		</section>
	);
}

Sidebar.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
		PropTypes.any,
	]),
	title: PropTypes.string,
};
