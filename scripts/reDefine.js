const warn = console.warn;

console.warn = function (log) {
  if (log.indexOf('use moment.updateLocale') !== -1) return;
  return warn.call(this, log)
}


