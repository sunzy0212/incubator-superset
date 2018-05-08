/* eslint-disable global-require */
import $ from 'jquery';
import { t } from './locales';
import qs from 'query-string'

const utils = require('./modules/utils');

$(document).ready(function () {
  const query = qs.parse(window.location.search)
  const qn_querystring = query.qn_querystring
  if (qn_querystring) {
    window.sessionStorage.setItem('qn_querystring', qn_querystring)
  }

  $(':checkbox[data-checkbox-api-prefix]').change(function () {
    const $this = $(this);
    const prefix = $this.data('checkbox-api-prefix');
    const id = $this.attr('id');
    utils.toggleCheckbox(prefix, '#' + id);
  });

  // for language picker dropdown
  $('#language-picker a').click(function (ev) {
    ev.preventDefault();

    const targetUrl = ev.currentTarget.href;
    $.ajax(targetUrl)
      .then(() => {
        location.reload();
      });
  });

  $('#qn-logdb-link').click(function name(ev) {
    const data = $(ev.target).data()
    const qn_querystring = window.sessionStorage.getItem('qn_querystring')
    let url = data.logdbUrl
    if (qn_querystring) {
      url += ('/search/log' + window.atob(qn_querystring))
    }
    window.location.href = url
  })
})

export function appSetup() {
  // A set of hacks to allow apps to run within a FAB template
  // this allows for the server side generated menus to function
  window.$ = $;
  window.jQuery = $;
  require('bootstrap');
}

// Error messages used in many places across applications
export const COMMON_ERR_MESSAGES = {
  SESSION_TIMED_OUT: t('Your session timed out, please refresh your page and try again.'),
};
