import * as core from '../../core';

const utils = core.utils;

utils.log = function (/* arge */)
{
    window.console.log.apply(window.console, arguments);
};
