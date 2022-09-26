import React, { Suspense, lazy } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Loading, ProWrapper } from 'components/Lib';

const CommerceAndFinance = lazy(() => import('./CommerceAndFinance'));

// const Employees = lazy(() =>
//   import(/* webpackChunkName: "dashboardEmployees" */ './Employees')
// );

// const EmployeesSearch = lazy(() =>
//   import(/* webpackChunkName: "dashboardEmployeesSearch" */ './EmployeesSearch')
// );

const baseRoute = '/dashboard';
const routes = {
  sales: '/commerce-and-finance',
  employees: '/employees',
  jobs: '/employees-search',
};

export default function Dashboard() {
  return (
    <ProWrapper>
      <Suspense fallback={<Loading />}>
        <Switch>
          <Redirect
            from="/dashboard"
            exact
            to={`${baseRoute}${routes.sales}`}
          />
          <Route path={`${baseRoute}${routes.sales}`}>
            <CommerceAndFinance />
          </Route>

          {/* <Route exact path={`${baseRoute}${routes.employees}`}>
            <Employees />
          </Route>

          <Route exact path={`${baseRoute}${routes.jobs}`}>
            <EmployeesSearch />
          </Route> */}
        </Switch>
      </Suspense>
    </ProWrapper>
  );
}
