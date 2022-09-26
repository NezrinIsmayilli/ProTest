import React, { Suspense, lazy } from 'react';
import { connect } from 'react-redux';
import {
  Switch,
  Route,
  Link,
  Redirect,
  useLocation,
  useParams,
  useHistory,
} from 'react-router-dom';
import { cookies } from 'utils/cookies';
import {
  Loading,
  SubNavigation,
  SubRouteLink,
  Sidebar,
  ButtonGreenOutline,
  PrivateRoute,
  NewButton,
} from 'components/Lib';
import Can from 'components/Lib/Can';

import { getFirstSuitableKey } from 'utils';

// import { FaUserTag } from 'react-icons/fa';
// import { Icon } from 'antd';
import { toast } from 'react-toastify';

import { integrateWithJobs } from 'store/actions/jobs/parameters';

import { permissions, accessTypes } from 'config/permissions';
import { ButtonLightBlue } from 'components/Lib/Buttons/ButtonLightBlue';
import Login from './Login';

// Müraciətlər
const Appeals = lazy(() =>
  import(/* webpackChunkName: "recruitment/Appeals" */ './Appeals')
);

// Elanlar/Vacancies - advertisement word blocked by adblockers
const Vacancies = lazy(() =>
  import(/* webpackChunkName: "recruitment/Vacancies" */ './Vacancies')
);

// Elan yarat
const VacancyCreate = lazy(() =>
  import(
    /* webpackChunkName: "recruitment/ElanYarat" */ './Vacancies/VacancyCreate'
  )
);
// Təlimlər/Trainings - advertisement word blocked by adblockers
const Trainings = lazy(() =>
  import(/* webpackChunkName: "recruitment/Vacancies" */ './Trainings')
);

const TrainingsCreate = lazy(() =>
  import(
    /* webpackChunkName: "recruitment/trainings created" */ './Trainings/TrainingsCreate'
  )
);
// Announcements
const Announcements = lazy(() =>
  import(/* webpackChunkName: "recruitment/Announcements" */ './Announcements')
);

// Məlumatlandırma - not ready
// const Information = lazy(() =>
//   import(/* webpackChunkName: "recruitment/Information" */ './Information')
// );import { abilities } from 'config/ability';

// sub page pathes
// // const appealsPath = '/recruitment/appeals';
// const vacanciesPath = '/recruitment/vacancies';
const vacanciesEditPath = '/recruitment/vacancies/edit/:id(\\d+)';
const trainingsEditPath = '/recruitment/trainings/edit/:id(\\d+)';
// const createVacancyPath = '/recruitment/vacancies/create';
// const announcementsPath = '/recruitment/announcements';

const pathList = {
  projobs_appeals: '/recruitment/appeals',
  projobs_vacancies: '/recruitment/vacancies',
  projobs_job_seekers: '/recruitment/announcements',
  projobs_advertisements: '/recruitment/announcements/bookmarked',
  projobs_create_new_vacancy: '/recruitment/vacancies/create',
  projobs_trainings: '/recruitment/trainings',
  projobs_create_new_training: '/recruitment/trainings/create',
};
const pathList2 = {
  projobs_appeals: '/recruitment/appeals/new',
  projobs_vacancies: '/recruitment/vacancies',
  projobs_job_seekers: '/recruitment/announcements',
  projobs_advertisements: '/recruitment/announcements/bookmarked',
  projobs_create_new_vacancy: '/recruitment/vacancies/create',
  projobs_trainings: '/recruitment/trainings',
  projobs_create_new_training: '/recruitment/trainings/create',
};

// const informationPath = '/recruitment/information';
function Jobs(props) {
  const {
    tenant: { id },
    permissionsList,
    loginProJobsData,
    actionLoading,
  } = props;

  const permissionProJobs = permissionsList.filter(permission =>
    Object.keys(pathList2).includes(permission.key)
  );

  const history = useHistory();
  const params = useParams();

  const isAnnoucementsRoute = params[0] === 'announcements';

  // const mainTenant = tenants.find(tenant => tenant.id === id);
  const isIngegratedWithJobs = cookies.get('_TKN_JOBS_') || '';

  const { pathname } = useLocation();
  const showNavAndSidebar = !/create|edit/.test(pathname);

  function successIntegrationHandle() {
    window.location.replace('/recruitment/appeals/new');
  }

  function failureIntegrationHandle() {
    toast.error('Yenidən cəhd edin.', {
      className: 'error-toast',
    });
  }

  const currentURLwait =
    window.location.pathname === '/recruitment/appeals/wait';
  const currentURLinterview =
    window.location.pathname === '/recruitment/appeals/interview';
  const currentURLresult =
    window.location.pathname === '/recruitment/appeals/result';
  return loginProJobsData.length === 0 ? (
    <Login actionLoading={actionLoading} />
  ) : (
    <>
      {showNavAndSidebar && (
        <>
          <SubNavigation>
            <Can I={accessTypes.read} a={permissions.projobs_appeals}>
              <SubRouteLink
                path={
                  currentURLwait
                    ? '/recruitment/appeals/wait'
                    : currentURLinterview
                    ? '/recruitment/appeals/interview'
                    : currentURLresult
                    ? '/recruitment/appeals/result'
                    : '/recruitment/appeals/new'
                }
              >
                Müraciətlər
              </SubRouteLink>
            </Can>
            <Can I={accessTypes.read} a={permissions.projobs_vacancies}>
              <SubRouteLink path={pathList.projobs_vacancies}>
                Vakansiyalar
              </SubRouteLink>
            </Can>
            <Can I={accessTypes.read} a={permissions.projobs_trainings}>
              <SubRouteLink path={pathList.projobs_trainings}>
                Təlimlər
              </SubRouteLink>
            </Can>
            {/* <SubRouteLink path={informationPath}>Məlumatlandırma</SubRouteLink> not ready */}
            <Can I={accessTypes.read} a={permissions.projobs_job_seekers}>
              <SubRouteLink exact path={pathList.projobs_job_seekers}>
                İş axtaranlar
              </SubRouteLink>
            </Can>
            <Can I={accessTypes.read} a={permissions.projobs_advertisements}>
              <SubRouteLink path={pathList.projobs_advertisements}>
                Seçilmiş elanlar
              </SubRouteLink>
            </Can>

            <li className="alignRight">
              {/* Vacansies created */}
              <Can
                I={
                  permissionProJobs[1]?.permission === 1
                    ? accessTypes.manage
                    : accessTypes.read
                }
                a={
                  permissionProJobs[1]?.permission === 0 ||
                  permissionProJobs[1]?.permission === 1
                    ? permissions.projobs_vacancies
                    : permissions.projobs_create_new_vacancy
                }
              >
                <Link
                  to={`${pathList.projobs_create_new_vacancy}`}
                  style={{ marginRight: '10px' }}
                >
                  <NewButton label="Vakansiya yerləşdirin" />
                </Link>
              </Can>
              {/* Trainings created */}
              <Can
                I={
                  permissionProJobs[2]?.permission === 1
                    ? accessTypes.manage
                    : accessTypes.read
                }
                a={
                  permissionProJobs[2]?.permission === 0 ||
                  permissionProJobs[2]?.permission === 1
                    ? permissions.projobs_trainings
                    : permissions.projobs_create_new_training
                }
              >
                <Link to={`${pathList.projobs_create_new_training}`}>
                  <ButtonLightBlue label="Təlim yerləşdirin" />
                </Link>
              </Can>
            </li>
          </SubNavigation>
          {/* fake sidebar - for placeholder */}
          <Sidebar />
        </>
      )}
      <Suspense fallback={<Loading />}>
        <Switch>
          <Redirect
            exact
            from="/recruitment"
            to={
              pathList2[
                getFirstSuitableKey(
                  permissionsList.filter(permission =>
                    Object.keys(pathList2).includes(permission.key)
                  ),
                  1
                )
              ]
            }
          />
          <Route exact path={`${pathList.projobs_appeals}/*`}>
            <Appeals />
          </Route>

          {/* vacancies */}
          <Route exact path={pathList.projobs_vacancies}>
            <Vacancies />
          </Route>

          {/* trainings */}
          <Route exact path={pathList.projobs_trainings}>
            <Trainings />
          </Route>

          {/* edit vacancy */}
          <Route exact path={vacanciesEditPath}>
            <VacancyCreate />
          </Route>

          {/* edit trainings */}
          <Route exact path={trainingsEditPath}>
            <TrainingsCreate />
          </Route>

          {/* create vacancy */}
          <Route exact path={`${pathList.projobs_create_new_vacancy}`}>
            <VacancyCreate />
          </Route>
          {/* create training */}
          <Route exact path={`${pathList.projobs_create_new_training}`}>
            <TrainingsCreate />
          </Route>

          {/* announcements */}
          <Route exact path={`${pathList.projobs_job_seekers}`}>
            <Announcements />
          </Route>

          {/* bookmarked announcements */}
          <Route exact path={`${pathList.projobs_advertisements}`}>
            <Announcements bookmarked={1} />
          </Route>
        </Switch>
      </Suspense>
    </>
  );
}

const mapStateToProps = state => ({
  actionLoading: state.authReducer.actionLoading,
  loginProJobsData: state.authReducer.loginProJobsData,
  tenant: state.tenantReducer.tenant,
  tenants: state.tenantReducer.tenants,
  isIntegrateLoading: !!state.loadings.integrateWithJobs,
  tenantsLoading: !!state.loadings.tenants,
  tenantLoading: !!state.loadings.tenant,
  permissionsList: state.permissionsReducer.permissions,
});

export default connect(
  mapStateToProps,
  {
    integrateWithJobs,
  }
)(Jobs);
