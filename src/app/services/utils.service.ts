import * as jQuery from 'jquery';
import { DateTime } from 'luxon';

export function encryptPassword(password: string): string {
  return btoa(password);
}

export function range(size: number, startAt = 1) {
  const ans = [];
  for (let i = startAt; i <= size; i++) {
    ans.push(i);
  }
  return ans;
}

export function hideModal(id: string) {
  jQuery(`#${id}`).removeClass('show');
  jQuery('.modal-backdrop').remove();
}

export function formatDate(date: Date | string) {
  const dateToFormat = (typeof (date) === 'string') ? new Date(date) : date;
  return `${dateToFormat.getFullYear()}-${dateToFormat.getMonth() + 1}-${dateToFormat.getDate()}`;
}

export function formatDateTimeZone(date: string) {
  if (date) {
    if (date[date.length - 3] === '+') {
      return (DateTime.fromSQL(date, { zone: 'utc' }).toLocal());
      // return new Date(date + ':00');
    }
    return new Date(date);
  }
  return;
}

export function formatDateTime(date: Date | string) {
  const dateToFormat = (typeof (date) === 'string') ? new Date(date) : date;
  return `${dateToFormat.getFullYear()}-${dateToFormat.getMonth() + 1}-${dateToFormat.getDate()} ${dateToFormat.getHours()}:${dateToFormat.getMinutes()}:${dateToFormat.getSeconds()}`;
}
export function getJsonValueOfKey(jsonString: string, getKey: any) {
  const value = JSON.parse(jsonString)[getKey];
  return (value) ? value : '';
}

export const dateFormatString = 'MMM dd, y hh:mm a';
// Feed Stats Column Name
export const FeedColumnName = {
  'pass_completed_attempts': ['Passing Completed Attempts', 'PCA'],
  'pass_total_attempts': ['Passing Total Attempts', 'PTA'],
  'pass_yards': ['Passing Yards', 'PY'],
  'pass_average': ['Passing Average', 'PY'],
  'pass_td': ['Passing Touch Downs', 'PTD'],
  'pass_int': ['Passing Interceptions', 'PI'],
  'pass_sacks': ['Passing Sacks', 'PS'],
  'pass_two_pt_conversion': ['Passing Two Point conversions', 'PTPC'],

  'rush_total': ['Rushing Total', 'RT'],
  'rush_yards': ['Rushing Yards', 'RY'],
  'rush_average': ['Average Yards', 'RY'],
  'rush_td': ['Rushing Touch Downs', 'RTD'],
  'rush_longest': ['Rushing Longest', 'RL'],
  'rush_two_pt_conversion': ['Rushing Two Point Conversions', 'RTDP'],
  'rush_kick_return_td': ['Rushing Kick Return TD', 'RKRTD'],
  'rush_exp_return_td': ['Rushing Extra Return TD', 'RERTD'],

  'recv_total': ['Receiving Total', 'RT'],
  'recv_yards': ['Receiving Yards', 'Ry'],
  'recv_average': ['Receiving Average', 'RA'],
  'recv_td': ['Receiving Touch Downs', 'RTD'],
  'recv_longest': ['Receiving Longest', 'RL'],
  'recv_two_pt_conversion': ['Receiving Two Point Conversions', 'RTPC'],

  'fum_total': ['Fumbles Total', 'FT'],
  'fum_lost': ['Fumbles Lost', 'FL'],
  'fum_recovery': ['Fumbles Recovered', 'FR'],
  'fum_recovery_td': ['Fumble Recovery Touch Downs', 'FRTD'],

  'int_total': ['Total Interceptions', 'TI'],
  'int_yards': ['Interceptions Yards', 'IY'],
  'int_td': ['Interception Touch Downs', 'ITD'],

  'def_tackles': ['Defence Tackles', 'DT'],
  'def_unassisted_tackles': ['Defence Unassisted Tackles', 'DUT'],
  'def_sacks': ['Defence Sacks', 'DS'],
  'def_tackles_for_loss': ['Defence Tackles For Loss', 'DTL'],
  'def_passes_defended': ['Defence Passes Defended ', 'DPD'],
  'def_qb_hits': ['Defence Quarterback Hits', 'DQH'],
  'def_int_for_td': ['Defence Interception TD', 'DTDI'],
  'def_blocked_kicks': ['Defence Kicks Blocks', 'DKB'],
  'def_kick_return_td': ['Defence Kick Return TD', 'DKRTD'],
  'def_exp_return_td': ['Defence Exp Return TD', 'DTDER'],

  'kick_ret_total': ['Total Kick Returns', 'TKR'],
  'kick_ret_yards': ['Total Kick Returned Yards', 'KRY'],
  'kick_ret_average': ['Kick Return Average', 'KRA'],
  'kick_ret_longest_return': ['Kick Longest Return', 'KLR'],
  'kick_ret_td': ['Kick Return TD', 'KRTD'],

  'punt_ret_total': ['Punt Returns Total', 'TRP'],
  'punt_ret_yards': ['Punt Returns Yards', 'TRY'],
  'punt_ret_average': ['Punt Returns Average ', 'PAY'],
  'punt_ret_longest_return': ['Punt Longest Return', 'PLR'],
  'punt_ret_td': ['Punt ReturnsTD', 'PRTD'],

  'kicking_field_goals': ['Kicking Field Goals', 'KFG'],
  'kicking_longest': ['Kicking Longest', 'KL'],
  'kicking_extra_point': ['Kicking Extra Point', 'KER'],
  'kicking_points': ['Kicking Points', 'KPE'],
  'kicking_field_goals_from_1_19_yards': ['Kicking FG From 1-19 Yards', 'KFG1-19Y'],
  'kicking_field_goals_from_20_29_yards': ['Kicking FG From 20-29 Yards', 'KFG20-29Y'],
  'kicking_field_goals_from_30_39_yards': ['Kicking FG From 30-39 Yards', 'KFG30-39Y'],
  'kicking_field_goals_from_40_49_yards': ['Kicking FG From 40-49 Yards', 'KFG40-49Y'],
  'kicking_field_goals_from_50_yards': ['Kicking FG From 50+ Yards', 'KFG50+Y'],

  'punting_total': ['Punting Total', 'PT'],
  'punting_yards': ['Punting Yards', 'PY'],
  'punting_average': ['Punting Average', 'PA'],
  'punting_touchbacks': ['Punting Touchbacks', 'PT'],
  'punting_in_20_yards': ['Punting In 20 Yards', 'PI20Y'],
  'punting_longest': ['Punting Longest', 'PL'],

  'def_team_int': ['Defence Team Interceptions', 'DTI'],
  'def_team_fum_recovery': ['Defence Team  Fumbles Recovery', 'DTFR'],
  'def_team_sack': ['Defence Team Sack', 'DTS'],
  'def_team_safeties': ['Defence Team Safeties', 'DTS'],
  'def_team_td': ['Defence Team Touch Downs', 'DTTD'],
  'def_team_point_allowed': ['Defence Team Point Allowed', 'DTPA'],
  'fantasy_point': ['Fantasy Point', 'FP'],

};
