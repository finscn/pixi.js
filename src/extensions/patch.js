import * as core from '../core';

core.utils.log = function (/* arge */)
{
    window.console.log.apply(window.console, arguments);
};
