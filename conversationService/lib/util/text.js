function sanitizeHtml(string = '') {
  return string
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (match, num) => String.fromCharCode(num))
    .replace(/&#x([A-Za-z0-9]+);/g, (match, num) => String.fromCharCode(parseInt(num, 16)))
    .replace(/(<([^>]+)>)/ig, '');
}

module.exports = {
  sanitizeHtml,
};
