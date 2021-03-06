/* eslint max-len: [0] */
import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import Markdown from 'react-remarkable';
import ADDSidebar from './add/add_sidebar';
import DPPSSidebar from './dpps/dpps_sidebar';
import StratumSidebar from './stratum_sidebar';
import InputZoneSidebar from './input_zone_sidebar';
import CountTypeToggle from './count_type_toggle';
import compact from 'lodash.compact';
import isArray from 'lodash.isarray';
import {
  pluralize,
  getNextGeography,
  getEntityName,
  slugify
} from '../../utils/convenience_funcs';

class Sidebar extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleSpanClick = this.handleSpanClick.bind(this);
    this.handleNarrativeClick = this.handleNarrativeClick.bind(this);
    this.getCurrentTitle = this.getCurrentTitle.bind(this);
    this.subGeographyHasCorrectKeys = this.subGeographyHasCorrectKeys.bind(this);
    this.shouldRenderSidebar = this.shouldRenderSidebar.bind(this);
    this.state = {
      currentTitle: 'summary_area',
      narrativeOpen: false,
    };
  }

  componentDidMount() {
    this.handleSpanClick = this.handleSpanClick.bind(this);
    this.handleNarrativeClick = this.handleNarrativeClick.bind(this);
  }

  getCurrentTitle(title) {
    let currentClass = 'sidebar__viz-toggle';
    if (this.state.currentTitle === title) currentClass += ' active';
    return currentClass;
  }

  handleSpanClick(e) {
    if (e.currentTarget.dataset.title) {
      this.setState({ currentTitle: e.currentTarget.dataset.title });
    }
  }

  handleNarrativeClick(_e) {
    this.setState({ narrativeOpen: !this.state.narrativeOpen });
  }

  subGeographyHasCorrectKeys(vizType) {
    const { geographies, currentGeography, params } = this.props;
    const subGeography = getNextGeography(currentGeography);
    return (
      (vizType === 'add' && isArray(geographies[`${pluralize(subGeography)}_sums`]))
      ||
      (vizType === 'dpps' && isArray(geographies[`${pluralize(subGeography)}_sum`]))
      ||
      (currentGeography === 'country' && !params.stratum)
    );
  }

  shouldRenderSidebar(sidebar) {
    const { countType, loading, canInput } = this.props;
    if (loading || !canInput) return false;
    if (sidebar === 'add') {
      return (typeof countType === 'undefined' || countType === 'ADD') &&
        this.subGeographyHasCorrectKeys('add');
    }
    return countType === 'DPPS' && this.subGeographyHasCorrectKeys('dpps');
  }

  render() {
    const {
      sidebarState,
      location,
      geographies,
      loading,
      canInput,
      year,
      currentGeography,
      currentGeographyId,
      currentNarrative,
      error,
      selectedStratum,
      selectedInputZone,
      params,
      countType
    } = this.props;
    const years = ['2015'];
    const yearLinks = years.map(y => {
      const toVal = compact(window.location.pathname.split('/'));
      const linkVal = toVal.length ? `${y}/${toVal.splice(1).join('/')}` : y;
      const className = (y === this.props.year) ||
        (!this.props.year && y === '2015') ? 'current' : null;
      return (
        <li key={y} className={className} >
          <Link className={y === '2013' ? 'disabled' : null} to={`/${linkVal}`}>{y}</Link>
        </li>
      );
    });

    let sidebarInnerClassName = `${currentGeography}__${currentGeographyId}`;
    sidebarInnerClassName += ` region-${params.region}`;
    const sidebarClasses = ['closed', 'open', 'full'];
    const overviewTitleMap = {
      continent: 'CONTINENTAL',
      region: 'REGIONAL',
      country: 'COUNTRY'
    };

    const self = this;
    if (loading) {
      const loaderClass = `${sidebarInnerClassName} ${sidebarClasses[sidebarState]}`;
      return (
        <aside className={`sidebar__loader ${loaderClass}`}>
          <section className="sidebar__inner">
            <h4>African Elephant Database</h4>
            <h1 className="sidebar__entity-name">
              {getEntityName(location, params)}
            </h1>
          </section>
        </aside>
      );
    }
    let totalsTitle = 'Continental totals';
    if (currentGeography === 'continent') {
      totalsTitle = 'Regional Totals';
    }
    if (currentGeography === 'region') {
      totalsTitle = 'Country Totals';
    }
    if (currentGeography === 'country') {
      totalsTitle = 'Input Zone Totals';
    }
    let backToCountryLink = `/${params.year}/${params.region}/${params.country}`;
    if (countType && countType === 'DPPS') {
      backToCountryLink += `?count_type=${countType}`;
    }
    return (
      <aside className={sidebarClasses[sidebarState]}>
        <section className={`sidebar__inner ${sidebarInnerClassName}`}>
          <div className="sidebar__year-nav__container">
            <ul className="sidebar__year-nav">
              {yearLinks}
            </ul>
          </div>
          {!selectedInputZone &&
            <h1 className={`sidebar__entity-name ${selectedStratum ? ' sidebar__entity-name--stratum' : ''}`}>
              {selectedStratum &&
                <Link
                  to={`${backToCountryLink}`}
                  className="sidebar__entity-name__back"
                  title={`Back to ${geographies.country}`}
                  dangerouslySetInnerHTML={{ __html: '&larr;' }}
                />
              }
              {getEntityName(location, params)}
            </h1>
          }
          {selectedInputZone &&
            <h1 className="sidebar__entity-name sidebar__entity-name--input-zone">
              <Link
                to={`${backToCountryLink}`}
                className="sidebar__entity-name__back"
                title={`Back to ${geographies.country}`}
                dangerouslySetInnerHTML={{ __html: '&larr;' }}
              />
              {selectedInputZone.name}
            </h1>
          }
          {selectedStratum && selectedStratum.inpzone &&
            <div>
              <h3 className="sidebar__entity-input-zone-subtitle">
                Stratum in&nbsp;
                <Link to={`/${params.year}/${params.region}/${params.country}?input_zone=${slugify(selectedStratum.inpzone)}`}>
                  {selectedStratum.inpzone} Input Zone
                </Link>
              </h3>
            </div>
          }
          {selectedInputZone &&
            <div>
              <h3 className="sidebar__entity-input-zone-subtitle">
                Input Zone in&nbsp;
                <Link to={`/${params.year}/${params.region}/${params.country}`}>
                  {geographies.country}
                </Link>
              </h3>
            </div>
          }
          {canInput && geographies && !selectedStratum && !selectedInputZone &&
            <div>
              <nav className="sidebar__viz-type">
                <ul>
                  <li onClick={self.handleSpanClick} data-title={'narrative'}>
                    <div
                      className={this.getCurrentTitle('narrative')}
                    >
                      <span>
                        {overviewTitleMap[currentGeography]} OVERVIEW
                      </span>
                    </div>
                  </li>
                  <li onClick={self.handleSpanClick} data-title={'summary_area'}>
                    <div
                      className={this.getCurrentTitle('summary_area')}
                    >
                      <span>
                        Summary totals &amp; Interpretation of Changes
                      </span>
                    </div>
                  </li>
                  <li onClick={self.handleSpanClick} data-title={'totals'}>
                    <div
                      className={this.getCurrentTitle('totals')}
                    >
                      <span>
                        {totalsTitle}
                      </span>
                    </div>
                  </li>
                </ul>
              </nav>
              <CountTypeToggle
                geographies={geographies}
                currentTitle={this.state.currentTitle}
                location={location}
              />
            </div>
          }
        </section>

        <section className="sidebar__inner">
          {!canInput &&
            <h1>Loading <span className="loading-spinner"></span></h1>
          }

          {!loading && error &&
            <div>
              <h1>There was an error loading data.</h1>
              <p>
                We're sorry, there's no data for this combination of year and geographic location.
                Please try another area or date.
              </p>
            </div>
          }

          {this.state.currentTitle === 'narrative' && canInput && !selectedStratum &&
            <div className="sidebar__narrative">
              <Markdown source={currentNarrative} options={ { html: true } } />
            </div>
          }

          {geographies && this.shouldRenderSidebar('add') && !selectedInputZone &&
            <ADDSidebar
              geographies={geographies}
              currentTitle={this.state.currentTitle}
              currentGeography={currentGeography}
              sidebarState={sidebarState}
              year={year}
              params={params}
              location={location}
            />
          }

          {geographies && this.shouldRenderSidebar('dpps') && !selectedInputZone &&
            <DPPSSidebar
              geographies={geographies}
              currentTitle={this.state.currentTitle}
              currentGeography={currentGeography}
              sidebarState={sidebarState}
              params={params}
              location={location}
            />
          }

          {selectedStratum &&
            <StratumSidebar
              stratum={selectedStratum}
              geographies={geographies}
              params={params}
              sidebarState={sidebarState}
            />
          }
          {selectedInputZone &&
            <InputZoneSidebar
              zone={selectedInputZone}
              sidebarState={sidebarState}
              params={params}
            />
          }
        </section>
      </aside>
    );
  }
}

Sidebar.propTypes = {
  error: PropTypes.string,
  sidebarState: PropTypes.number.isRequired,
  location: PropTypes.object,
  params: PropTypes.object,
  countType: PropTypes.string,
  geographies: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  canInput: PropTypes.bool,
  year: PropTypes.string.isRequired,
  currentGeography: PropTypes.string,
  currentGeographyId: PropTypes.string,
  currentNarrative: PropTypes.string,
  selectedStratum: PropTypes.object,
  selectedInputZone: PropTypes.object
};

export default Sidebar;
