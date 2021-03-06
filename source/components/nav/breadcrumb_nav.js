import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { titleize, titleizeStratum } from '../../utils/convenience_funcs';
import compact from 'lodash.compact';

const PATH_PARTS = ['year', 'region', 'country', 'input_zone'];

const BreadCrumbLink = ({ label, path, className, canInput }) => (
  <Link
    to={path}
    className={`${className} breadcrumb-nav__link${!canInput ? ' inactive' : ''}`}
  >
    {label}
  </Link>
);
BreadCrumbLink.propTypes = {
  path: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  canInput: PropTypes.bool.isRequired
};

const BreadCrumbNav = (props) => {
  const params = compact(PATH_PARTS.map(k => props.params[k]));
  if (params.length < 2) { return null; } // only render if we are at least at the region level
  const crumbs = params.map((p, i) => {
    let className = '';
    let title = titleize(p);
    if (i === 4 && props.params.stratum) {
      title = titleizeStratum(p);
    }
    // Add region color to active breadcrumb
    if (i === params.length - 1 && PATH_PARTS.length > 1) {
      className = `color--region-${params[1]}`;
    }
    return (
      <span key={`breadcrumb${i}`}>
        <BreadCrumbLink
          path={`/${params.slice(0, i + 1).join('/')}`}
          label={(i === 0 ? 'Africa' : title)}
          className={className}
          canInput={props.canInput}
        />
        {(i === params.length - 1 ?
          null :
          <span className="breadcrumb-nav__separator">{'>'}</span>)}
      </span>
    );
  });
  return <div className="breadcrumb-nav">{crumbs}</div>;
};

BreadCrumbNav.propTypes = {
  params: PropTypes.object,
  location: PropTypes.object,
  canInput: PropTypes.bool
};

export default BreadCrumbNav;
