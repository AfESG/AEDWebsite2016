import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Nav from '../components/nav';
import BreadCrumbNav from '../components/breadcrumb_nav';
import Sidebar from '../components/sidebar';
import TotalCount from '../components/total_count';
import HelpNav from '../components/help_nav';
import { getEntityName } from '../utils/convenience_funcs';
import { formatNumber } from '../utils/format_utils';
import { fetchGeography, fetchRanges } from '../api';
import { toggleSearch, expandSidebar, contractSidebar } from '../actions';

class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.expandSidebar = this.expandSidebar.bind(this);
    this.contractSidebar = this.contractSidebar.bind(this);
    this.onHandleClick = this.onHandleClick.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      showSidebar: false
    };
    this.fetchData(props, true);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.location.query !== this.props.location.query) {
      this.fetchData(newProps, true);
    }
  }

  onHandleClick() {
    this.setState({
      showSidebar: !this.state.showSidebar
    });
  }

  expandSidebar() {
    this.props.dispatch(expandSidebar());
  }

  contractSidebar() {
    this.props.dispatch(contractSidebar());
  }

  cancelSearch() {
    this.props.dispatch(toggleSearch(false));
  }

  handleClick() {
    fetchRanges('known', this.props.dispatch);
  }

  fetchData(props, force = false) {
    const {
      routeGeography,
      routeGeographyId,
      currentGeography,
      routeYear,
      loading,
      dispatch,
      location
    } = props;

    if (force || (routeGeography !== currentGeography && !loading)) {
      fetchGeography(
        dispatch,
        routeGeography,
        routeGeographyId,
        routeYear,
        location.query.count_type
      );
    }
  }

  render() {
    const {
      children,
      location,
      geographies,
      totalEstimate,
      loading,
      dispatch,
      params,
      currentGeography,
      currentGeographyId,
      currentNarrative,
      subGeographyData,
      routeYear,
      sidebarState,
      error,
      bounds,
      searchActive,
      known
    } = this.props;

    const mainClasses = ['main--full', 'main--half', 'main--closed'];
    const searchOverlay = searchActive ? <div className="search__overlay" /> : null;

    return (
      <div
        className={
          `container main__container
          sidebar--${(sidebarState > 0 ? 'open' : 'closed')}
          ${(!params.region ? '' : 'breadcrumbs-active')}`}
        onClick={toggleSearch}
      >
        <main className={mainClasses[sidebarState]}>
          <h1
            onClick={this.handleClick}
          >
            Click for Known
          </h1>
          <BreadCrumbNav params={this.props.params} />
          <Nav
            expandSidebar={this.expandSidebar}
            contractSidebar={this.contractSidebar}
            sidebarState={sidebarState}
            onHandleClick={this.toggleSidebar}
            params={this.props.params}
            loading={loading}
          />
          {React.cloneElement(children, {
            currentGeography: currentGeography,
            currentGeographyId: currentGeographyId,
            subGeographyData: subGeographyData,
            year: routeYear,
            openSidebar: this.expandSidebar,
            cancelSearch: this.cancelSearch.bind(this),
            bounds: bounds,
            known: known
          })}
        </main>
        <Sidebar
          error={error}
          location={location}
          sidebarState={sidebarState}
          geographies={geographies}
          loading={loading}
          dispatch={dispatch}
          countType={location.query.count_type}
          year={routeYear}
          params={params}
          currentGeography={currentGeography}
          currentGeographyId={currentGeographyId}
          currentNarrative={currentNarrative}
        />
        {totalEstimate &&
          <TotalCount
            entity={getEntityName(this.props.location)}
            count={formatNumber(totalEstimate)}
          />
        }
        <HelpNav location={location} />
        {searchOverlay}
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  currentGeography: PropTypes.string,
  currentGeographyId: PropTypes.string,
  currentNarrative: PropTypes.string,
  geographies: PropTypes.object,
  loading: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  totalEstimate: PropTypes.string,
  routeGeography: PropTypes.string,
  routeGeographyId: PropTypes.string,
  routeYear: PropTypes.string,
  subGeographyData: PropTypes.array,
  sidebarState: PropTypes.number,
  error: PropTypes.string,
  bounds: PropTypes.array,
  searchActive: PropTypes.bool.isRequired,
  known: PropTypes.array
};

const mapStateToProps = (state, props) => {
  let routeGeography = 'continent';
  if (props.params.country) {
    routeGeography = 'country';
  } else if (props.params.region) {
    routeGeography = 'region';
  }
  return {
    error: state.geographyData.error,
    totalEstimate: state.geographyData.totalEstimate,
    geographies: state.geographyData.geographies,
    loading: state.geographyData.loading,
    currentGeography: state.geographyData.currentGeography,
    currentGeographyId: state.geographyData.currentGeographyId,
    currentNarrative: state.geographyData.currentNarrative,
    routeGeography: routeGeography,
    routeGeographyId: props.params[routeGeography] || 'africa',
    routeYear: props.params.year || '2013',
    subGeographyData: state.geographyData.subGeographies,
    sidebarState: state.navigation.sidebarState,
    bounds: state.geographyData.bounds,
    searchActive: state.search.searchActive,
    known: state.ranges.known
  };
};

const mapDispatchToProps = (dispatch) => ({ dispatch: dispatch });

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
