import React, { PropTypes } from 'react';
import AreaRange from './area_range';
import { formatNumber, formatFloat } from '../utils/format_utils.js';

export default function ContinentalRollup(props) {
  const { data } = props;
  const unassessedRange = ((100 - data.PERCENT_OF_RANGE_ASSESSED) / 100) * data.ASSESSED_RANGE;
  const unassessedPercent = 100 - data.PERCENT_OF_RANGE_ASSESSED;
  return (
    <div>
      <table className="sidebar__stats-table bold-all">
        <tbody>
          <tr>
            <td>Estimates from Surveys</td>
            <td></td>
          </tr>
          <tr className="heading__small">2013 Elephant Numbers</tr>
          <tr>
            <td className="indented font-normal">Estimates from Surveys</td>
            <td>{formatNumber(data.ESTIMATE)}</td>
          </tr>
          <tr>
            <td>Guesses</td>
            <td>{formatNumber(data.GUESS_MIN)} – {formatNumber(data.GUESS_MAX)}</td>
          </tr>
        </tbody>
      </table>

      <AreaRange
        totalRange={formatNumber(data.RANGE_AREA)}
        assessedInKM={formatNumber(data.ASSESSED_RANGE)}
        assessedPercent={formatFloat(data.PERCENT_OF_RANGE_ASSESSED)}
        unassessedInKM={formatNumber(unassessedRange)}
        unassessedPercent={formatFloat(unassessedPercent)}
      />
    </div>
  );
}

ContinentalRollup.propTypes = {
  data: PropTypes.object.isRequired
};
