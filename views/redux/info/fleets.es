import {isEqual} from 'lodash'

function mergeIndexifiedFleets(state, body) {
  const {buildArray} = window
  const bodyFleet = buildArray(body.map((fleet) => [fleet.api_id - 1, fleet]))
  return window.compareUpdate(state, bodyFleet, 2)
}

// Return [fleetId, pos] if found
// [-1, -1] otherwise
function findShip(fleets, shipId) {
  for (let fleetId = 0; fleetId < fleets.length; fleetId++) {
    const pos = fleets[fleetId].api_ship.findIndex((_shipId) => _shipId == shipId)
    if (pos != -1) {
      return [fleetId, pos]
    }
  }
  return [-1, -1]
}

// If shipId is -1, then remove the ship by appending -1 to the tail
// Otherwise, just assign the ship.
// The clone of the fleet is returned.
// pos is 0..5
function setShip(fleet, pos, shipId) {
  const ships = fleet.api_ship.slice()
  if (shipId == -1) {
    ships.splice(pos, 1)
    ships.concat(-1)
  } else {
    ships[pos] = shipId
  }
  if (isEqual(ships, fleet.api_ship))
    return fleet
  return {
    ...fleet,
    api_ship: ships,
  }
}

export function reducer(state=[], {type, postBody, body}) {
  const {compareUpdate, buildArray} = window
  switch(type) {
  case '@@Response/kcsapi/api_port/port':
    return compareUpdate(state, body.api_deck_port, 2)
  case '@@Response/kcsapi/api_get_member/deck':
    return mergeIndexifiedFleets(state, body)
  case '@@Response/kcsapi/api_req_kaisou/powerup':
    return mergeIndexifiedFleets(state, body.api_deck)
  case '@@Response/kcsapi/api_get_member/ship_deck':
  case '@@Response/kcsapi/api_get_member/ship3':
    return mergeIndexifiedFleets(state, body.api_deck_data)
  case '@@Response/kcsapi/api_req_hensei/preset_select':
    state = state.slice()
    return compareUpdate(state, buildArray([[parseInt(postBody.api_deck_id)-1, body]]), 2)
  case '@@Response/kcsapi/api_req_kousyou/destroyship': {
    const fleets = state.slice()
    const [fleetId, pos] = findShip(fleets, parseInt(postBody.api_ship_id))
    if (fleetId != -1) {
      state = state.slice()
      state[fleetId] = setShip(state[fleetId], pos, -1)
      return state
    }
    break
  }
  case '@@Response/kcsapi/api_req_hensei/change': {
    // Let "ship*" be the ship that is specified by the fleet & position
    // Let "tgtShip*" be the ship that is specified by the shipId
    const fleets = state.slice()
    const fleetId = parseInt(postBody.api_id) - 1
    const fleet = fleets[fleetId] || {api_ship: []}
    const pos = parseInt(postBody.api_ship_idx)
    const shipId = fleet.api_ship[pos] || -1
    // Remove all
    if (pos == -1) {
      fleets[fleetId] = {
        ...fleet,
        api_ship: [fleet.api_ship[0], -1, -1, -1, -1, -1],
      }
      return fleets
    }
    const tgtShipId = parseInt(postBody.api_ship_id)
    const [tgtFleetId, tgtPos] = (tgtShipId == -1) ? [-1, -1] : findShip(fleets, tgtShipId)
    // Be cautious to the order of double "setShip"s
    // which takes place when tgtShipId != -1 && tgtFleetId != -1.
    // In order to prevent positions from being messed up by removing a ship,
    // setShip(tgtShip) before setShip(ship) since tgtShip is never -1 in this case
    fleets[fleetId] = setShip(fleets[fleetId], pos, tgtShipId)
    if (tgtFleetId != -1) {
      fleets[tgtFleetId] = setShip(fleets[tgtFleetId], tgtPos, shipId)
    }
    return fleets
  }
  }
  return state
}
