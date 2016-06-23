import {relative, join} from 'path-extra'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'

const {$, $$, _, React, ReactBootstrap, resolveTime, notify} = window
const {Table, ProgressBar, OverlayTrigger, Tooltip, Grid, Col, Alert, Row, Overlay, Label} = ReactBootstrap
const __ = i18n.main.__.bind(i18n.main)
const __n = i18n.main.__n.bind(i18n.main)

import {Slotitems} from './slotitems'
import StatusLabel from './statuslabel'
import {getHpStyle, getStatusStyle, getShipLabelStatus, BaseShipData} from './utils'

function getMaterialStyle(percent) {
  if (percent <= 50)
    return 'danger'
  else if (percent <= 75)
    return 'warning'
  else if (percent < 100)
    return 'info'
  else
    return 'success'
}

export const ShipRow = connect(
  () => createSelector([
      makeThisShipDataSelector(),
      makeThisShipRepairDockSelector(),
      constSelector,
    ], ([ship, $ship]=[], repairDock, {$shipTypes}) => ({
      ship: ship || {},
      $ship: $ship || {},
      $shipTypes,
      repairDock,
      labelStatus: getShipLabelStatus(ship, $ship, repairDock),
    }))
)(({ship, $ship, $shipTypes, labelStatus, repair}) => {
  const labelStatusStyle = getStatusStyle(labelStatus)
  const hpPercentage = ship.api_nowhp / ship.api_maxhp * 100
  const fuelPercentage = ship.api_fuel / $ship.api_fuel_max * 100
  const ammoPercentage = ship.api_bull / $ship.api_bull_max * 100
  return (
    <div className="ship-item">
      <div className="ship-tile">
        <div className="ship-basic-item">
          <div className="ship-info" style={labelStatusStyle}>
            <div className="ship-basic">
              <span className="ship-lv">
                Lv. {ship.api_lv || '??'}
              </span>
              <span className='ship-type'>
                {i18n.resources.__(($shipTypes[$ship.api_stype] || {api_name: '??'}).api_name)}
              </span>
            </div>
            <span className="ship-name">
              {i18n.resources.__($ship.api_name || '??')}
            </span>
            <span className="ship-exp">
              Next. {(ship.api_exp || [])[1]}
            </span>
          </div>
          <OverlayTrigger 
            show={repair && repair.api_state == 1}
            placement='right'
            overlay={
              repair ?
              /* TODO: repair time */
              <Tooltip id={`panebody-repair-time-${ship.api_id}`}>
                {__('Repair Time')}: {resolveTime((repair.api_complete_time-Date.now())/1000)}
              </Tooltip>
              : <noscript />
            }
          >
            <div className="ship-stat">
              <div className="div-row">
                <span className="ship-hp" style={labelStatusStyle}>
                  {ship.api_nowhp} / {ship.api_maxhp}
                </span>
                <div className="status-label">
                  <StatusLabel label={labelStatus}/>
                </div>
                <div className="status-cond" style={labelStatusStyle}>
                  <span className={"ship-cond " + getCondStyle(ship.api_cond)}>
                    ★{ship.api_cond}
                  </span>
                </div>
              </div>
              <span className="hp-progress top-space" style={labelStatusStyle}>
                <ProgressBar bsStyle={getHpStyle(hpPercentage)}
                             now={hpPercentage} />
              </span>
            </div>
          </OverlayTrigger>
        </div>
      </div>
      <span className="ship-fb" style={labelStatusStyle}>
        <span style={{flex: 1}}>
          <OverlayTrigger placement='right' overlay={
            <Tooltip id={`panebody-fuel-${ship.api_id}`}>
              {ship.api_fuel} / {$ship.api_fuel_max}
            </Tooltip>
          }>
            <ProgressBar bsStyle={getMaterialStyle(fuelPercentage)}
                         now={fuelPercentage} />
          </OverlayTrigger>
        </span>
        <span style={{flex: 1}}>
          <OverlayTrigger placement='right' overlay={
            <Tooltip id={`panebody-bull-${ship.api_id}`}>
              {ship.api_bull} / {$ship.api_bull_max}
            </Tooltip>
          }>
            <ProgressBar bsStyle={getMaterialStyle(ammoPercentage)}
                         now={ammoPercentage} />
          </OverlayTrigger>
        </span>
      </span>
      <div className="ship-slot" style={labelStatusStyle}>
        <Slotitems shipId={ship.api_id} />
      </div>
    </div>
  )
})

export const miniFlag = false