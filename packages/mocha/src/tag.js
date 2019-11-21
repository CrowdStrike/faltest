'use strict';

function buildGrep(tags, filter) {
  let grep = `^(?=.*${filter})`;

  let tagsToMatch = [];
  let tagsToNegate = [];

  for (let tag of tags) {
    // remove any optional #
    tag = tag.replace('#', '');

    if (tag.includes('!')) {
      tagsToNegate.push(tag.replace('!', ''));
    } else {
      tagsToMatch.push(tag);
    }
  }

  for (let tag of tagsToMatch) {
    grep += `(?=.*#${tag}(\\W|$))`;
  }

  if (tagsToNegate.length) {
    let tagsString = tagsToNegate.join('|');
    grep += `(?!.*#(${tagsString})( |$))`;
  }

  grep += '.*$';

  return grep;
}

module.exports = {
  buildGrep,
};
