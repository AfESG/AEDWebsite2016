/* eslint max-len: [0] */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Nav from '../components/nav/nav';
import BreadCrumbNav from '../components/nav/breadcrumb_nav';
import HelpNav from '../components/nav/help_nav';
import Ranges from '../components/ranges';
import Sidebar from '../components/sidebar/sidebar';
import Intro from '../components/pages/intro';
import TotalCount from '../components/total_count';
import ErrorPage from '../components/pages/404';
import find from 'lodash.find';
import {
  getEntityName,
  slugify,
  mapSlugToId
} from '../utils/convenience_funcs';
import { formatNumber } from '../utils/format_utils';
import {
  fetchGeography,
  fetchRanges,
  fetchLocalRanges,
  fetchAdjacentGeography,
  fetchBounds
} from '../api';
import {
  toggleSearch,
  toggleLegend,
  expandSidebar,
  setSidebar,
  contractSidebar,
  toggleRange,
  clearAdjacentData,
  updateBounds,
  selectStratum
} from '../actions';

class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.expandSidebar = this.expandSidebar.bind(this);
    this.setSidebar = this.setSidebar.bind(this);
    this.contractSidebar = this.contractSidebar.bind(this);
    this.onHandleClick = this.onHandleClick.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleIntroClick = this.handleIntroClick.bind(this);
    this.toggleRange = this.toggleRange.bind(this);
    this.handleLegendClick = this.handleLegendClick.bind(this);
    this.cancelSearch = this.cancelSearch.bind(this);
    this.clearAdjacentData = this.clearAdjacentData.bind(this);
    this.updateBounds = this.updateBounds.bind(this);
    let showIntroOnLoad = true;
    if (props.params.region) showIntroOnLoad = false;
    if (props.location.query.hide_intro) showIntroOnLoad = false;
    this.state = {
      showSidebar: false,
      showIntro: showIntroOnLoad,
      initialLoad: false,
      getStratumTree: false,
      selectedInputZoneId: null,
      hasFetchedRanges: false
    };
  }

  componentDidMount() {
    // NEED VALIDATION - VERIFY AND/OR SEND TO 404
    // FETCH INITIAL DATA FOR MAP AND DATA
    this.fetchData(this.props, true);
    fetchLocalRanges('known', this.props.dispatch);
    fetchLocalRanges('protected', this.props.dispatch);
    fetchLocalRanges('possible', this.props.dispatch);
    fetchLocalRanges('doubtful', this.props.dispatch);
    // URL QUERIES TO CONTROL STATE
    if (this.props.location.query.sidebar_state) {
      const requestedState = parseInt(this.props.location.query.sidebar_state, 10);
      this.setSidebar(requestedState);
    } else {
      if (this.props.params.region && this.props.sidebarState === 0) {
        this.expandSidebar();
      }
    }
  }

  componentWillReceiveProps(newProps) {
    const props = this.props;
    const {
      canInput,
      loading,
      location,
      params,
      // subGeographyData
    } = newProps;
    if (!newProps.loading && !this.state.hasFetchedRanges) {
      this.setState({ hasFetchedRanges: true });
      fetchRanges('possible', this.props.dispatch);
      fetchRanges('protected', this.props.dispatch);
      fetchRanges('doubtful', this.props.dispatch);
      fetchRanges('known', this.props.dispatch);
    }
    if (canInput && !this.state.initialLoad && !loading) {
      this.setState({ initialLoad: true });
    }
    if (location.query !== props.location.query) {
      if (location.query.count_type !== props.location.query.count_type) {
        this.fetchData(newProps, true);
      } else if (location.pathname !== props.location.pathname
        && !params.input_zone) {
        if (this.props.params.input_zone && params.country && this.props.params.country === params.country) {
          const id = mapSlugToId(this.props.routeGeographyId);
          fetchBounds(this.props.dispatch, this.props.routeGeography, id);
        } else {
          this.fetchData(newProps, true);
        }
      } else {
        this.fetchData(newProps, false);
      }
    }
    if (params.input_zone) {
      if (params.country !== props.params.country) {
        this.fetchData(newProps, true);
        this.setState({ selectedInputZoneId: null });
      } else {
        this.setState({ selectedInputZoneId: params.input_zone });
      }
    } else {
      this.setState({ selectedInputZoneId: null });
    }
  }

  onHandleClick() {
    this.setState({ showSidebar: !this.state.showSidebar });
  }

  setSidebar(sideBarState) {
    this.props.dispatch(setSidebar(sideBarState));
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

  toggleRange(rangeType) {
    this.props.dispatch(toggleRange(rangeType));
  }

  clearAdjacentData() {
    this.props.dispatch(clearAdjacentData());
  }

  updateBounds(newBounds) {
    this.props.dispatch(updateBounds(newBounds));
  }

  selectStratum(stratumData) {
    this.props.dispatch(selectStratum(stratumData));
  }

  handleClick(e) {
    const rangeType = e.target.getAttribute('data-range-type');
    fetchRanges(rangeType, this.props.dispatch);
  }

  handleIntroClick() {
    this.setState({
      showIntro: false
    });
  }

  handleLegendClick() {
    this.props.dispatch(toggleLegend());
  }

  fetchData(props, force = false) {
    const {
      routeGeography,
      routeGeographyId,
      currentGeography,
      routeYear,
      loading,
      dispatch,
      location,
      params
    } = props;

    if (params.country && params.region && !params.stratum) {
      fetchAdjacentGeography(dispatch, routeGeography);
    } else if (params.region && !params.country && !params.stratum) {
      fetchAdjacentGeography(dispatch, routeGeography);
    } else {
      this.clearAdjacentData();
    }
    // has the route  changed in relation
    // to the current state regarding geography(data)
    if (force || (routeGeography !== currentGeography && !loading)) {
      return fetchGeography(
        dispatch,
        routeGeography,
        routeGeographyId,
        routeYear,
        location.query.count_type
      );
    }
    // DETERMINE WHICH ADJACENT GEOGRAPHY TO FETCH AND SHOW
    return false;
  }

  render() {
    const {
      children,
      location,
      geographies,
      totalEstimate,
      loading,
      canInput,
      dispatch,
      params,
      currentGeography,
      currentGeographyId,
      currentNarrative,
      subGeographyData,
      adjacentData,
      routeYear,
      sidebarState,
      error,
      bounds,
      border,
      searchActive,
      ranges,
      ui,
      routeGeography,
      routeGeographyId,
      selectedStratum
    } = this.props;
    // DETERMINE WHICH ESTIMATE TOTAL TO DISPLAY
    let finalTotalEstimate = '';
    if (!this.state.selectedInputZoneId) {
      finalTotalEstimate = totalEstimate;
    }
    let finalTotalConfidence = '';
    if (geographies.summary_sums) {
      finalTotalConfidence = geographies.summary_sums[0].CONFIDENCE;
    }
    let atStratumOrZone = false;
    if (selectedStratum) {
      finalTotalEstimate = selectedStratum.estimate;
      finalTotalConfidence = selectedStratum.lcl95;
      atStratumOrZone = true;
    }
    // DETERMINE WHETHER AN INPUT ZONE IS SELECTED
    let selectedZone;
    if (this.state.selectedInputZoneId && subGeographyData.length) {
      selectedZone = find(subGeographyData, z => {
        const zName = slugify(z.name).replace(/%2F/g, '/');
        const zone = zName === this.state.selectedInputZoneId;
        return zone;
      });
    }
    if (selectedZone) {
      finalTotalEstimate = selectedZone.population_estimate;
      finalTotalConfidence = selectedZone.percent_cl;
      atStratumOrZone = true;
    }
    // DETERMINE THE RIGHT CLASS FOR THE SIDEBAR
    const mainClasses = ['main--full', 'main--half', 'main--closed'];
    // DETERMINE WHETHER TO SHOW SEARCH OVERLAY
    const searchOverlay = searchActive
      ? <div onClick={this.cancelSearch} className="search__overlay" />
      : null;
    // DETERMINE WHETHER TO SHOW LOADING OVERLAY
    const loadingOverlay = !this.state.initialLoad || loading
      ? <div className="loading-overlay" />
      : <div className="loading-overlay dismissed" />;
    // DETERMINE MAIN CLASS
    const getMainClass = () => {
      let _class = mainClasses[sidebarState];
      if (selectedZone) {
        _class = `${_class} selected-zone`;
      }
      return _class;
    };
    return (
      <div
        className={
          `container main__container
          sidebar--${(sidebarState > 0 ? 'open' : 'closed')}
          ${(!params.region ? '' : 'breadcrumbs-active')}`}
        onClick={toggleSearch}
      >
        <main className={getMainClass()}>
          <Ranges
            handleClick={this.handleClick}
            handleLegendClick={this.handleLegendClick}
            toggleRange={this.toggleRange}
            ui={ui}
          />
          <BreadCrumbNav
            params={this.props.params}
            location={this.props.location}
            selectedStratum={selectedStratum}
            canInput={canInput}
          />
          <Nav
            expandSidebar={this.expandSidebar}
            contractSidebar={this.contractSidebar}
            sidebarState={sidebarState}
            onHandleClick={this.toggleSidebar}
            params={this.props.params}
            loading={loading}
            searchActive={searchActive}
            showIntro={this.state.showIntro}
          />
          {React.cloneElement(children, {
            adjacentData: adjacentData,
            currentGeography: currentGeography,
            currentGeographyId: currentGeographyId,
            subGeographyData: subGeographyData,
            year: routeYear,
            sidebarState: sidebarState,
            openSidebar: this.expandSidebar,
            cancelSearch: this.cancelSearch,
            updateBounds: this.updateBounds,
            bounds: bounds,
            border: border,
            ranges: ranges,
            ui: ui,
            loading: loading,
            canInput,
            routeGeography: routeGeography,
            routeGeographyId: routeGeographyId,
            selectedStratum: selectedStratum,
            selectedInputZone: selectedZone,
            dispatch: dispatch
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
          canInput={canInput}
          selectedStratum={selectedStratum}
          selectedInputZone={selectedZone}
        />
        {totalEstimate && finalTotalEstimate !== '' && canInput && !loading &&
          <TotalCount
            entity={getEntityName(location, params)}
            count={formatNumber(finalTotalEstimate)}
            confidence={finalTotalConfidence}
            canInput={canInput}
            atStratumOrZone={atStratumOrZone}
            summary={geographies.summary_sums || []}
          />
        }
        <HelpNav location={location} showIntro={this.state.showIntro} />
        {searchOverlay}
        {loadingOverlay}
        <Intro
          handleIntroClick={this.handleIntroClick}
          showIntro={this.state.showIntro}
        />
        {error &&
          <ErrorPage error={error} />
        }
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
  canInput: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  totalEstimate: PropTypes.string,
  routeGeography: PropTypes.string,
  routeGeographyId: PropTypes.string,
  routeYear: PropTypes.string,
  adjacentData: PropTypes.array,
  subGeographyData: PropTypes.array,
  sidebarState: PropTypes.number,
  error: PropTypes.string,
  bounds: PropTypes.array,
  border: PropTypes.object,
  searchActive: PropTypes.bool.isRequired,
  ranges: PropTypes.object,
  ui: PropTypes.object,
  selectedStratum: PropTypes.object
};

App.contextTypes = {
  store: React.PropTypes.object
};

const mapStateToProps = (state, props) => {
  // DETERMINE routeGeography FROM PARAMS
  let routeGeography = 'continent';
  if (props.params.country) {
    routeGeography = 'country';
  } else if (props.params.region) {
    routeGeography = 'region';
  }

  // MAP STATE AND PROPS
  return {
    error: state.geographyData.error,
    totalEstimate: state.geographyData.totalEstimate,
    geographies: state.geographyData.geographies,
    loading: state.geographyData.loading,
    canInput: state.geographyData.canInput,
    currentGeography: state.geographyData.currentGeography,
    currentGeographyId: state.geographyData.currentGeographyId,
    currentNarrative: state.geographyData.currentNarrative,
    routeGeography: routeGeography,
    routeGeographyId: props.params[routeGeography] || 'africa',
    routeYear: props.params.year || '2015',
    subGeographyData: state.geographyData.subGeographies,
    adjacentData: state.geographyData.adjacentData,
    sidebarState: state.navigation.sidebarState,
    bounds: state.geographyData.bounds,
    border: state.geographyData.border,
    searchActive: state.search.searchActive,
    ranges: state.ranges,
    ui: state.ui,
    selectedStratum: state.geographyData.selectedStratum
  };
};

const mapDispatchToProps = (dispatch) => ({ dispatch: dispatch });

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
