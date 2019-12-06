'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const { buildGrep } = require('../../src/tag');

describe(function() {
  describe(buildGrep, function() {
    // eliminate the possibility of collision
    // because a filter can also match a tag
    const tagMatch1 = 'JLjVr';
    const tagMatch2 = 'YGgZs';
    const tagMiss = 'rfGAz';
    const filterMatch = 'hxMgw';
    const filterMiss = 'kwXFm';
    const tests = [
      `${filterMatch} #${tagMiss}`,
      `${filterMiss} #${tagMatch1}`,
      `${filterMatch} #${tagMatch2}`,
      `${filterMiss} #${tagMatch1} #${tagMatch2}`,
    ];

    function match(grep) {
      let regex = new RegExp(grep);
      return tests.filter(test => regex.test(test));
    }

    it('matches everything', function() {
      let grep = buildGrep([], '.*');

      expect(grep).to.equal('^(?=.*.*).*$');
      expect(match(grep)).to.deep.equal(tests);
    });

    it('matches a tag', function() {
      let grep = buildGrep([tagMatch1], '.*');

      expect(grep).to.equal(`^(?=.*.*)(?=.*#${tagMatch1}( |$)).*$`);
      expect(match(grep)).to.deep.equal([
        `${filterMiss} #${tagMatch1}`,
        `${filterMiss} #${tagMatch1} #${tagMatch2}`,
      ]);
    });

    it('matches multiple tags', function() {
      let grep = buildGrep([tagMatch1, tagMatch2], '.*');

      expect(grep).to.equal(`^(?=.*.*)(?=.*#${tagMatch1}( |$))(?=.*#${tagMatch2}( |$)).*$`);
      expect(match(grep)).to.deep.equal([
        `${filterMiss} #${tagMatch1} #${tagMatch2}`,
      ]);
    });

    it('negates a tag', function() {
      let grep = buildGrep([`!${tagMatch2}`], '.*');

      expect(grep).to.equal(`^(?=.*.*)(?!.*#(${tagMatch2})( |$)).*$`);
      expect(match(grep)).to.deep.equal([
        `${filterMatch} #${tagMiss}`,
        `${filterMiss} #${tagMatch1}`,
      ]);
    });

    it('negates multiple tags', function() {
      let grep = buildGrep([`!${tagMatch1}`, `!${tagMatch2}`], '.*');

      expect(grep).to.equal(`^(?=.*.*)(?!.*#(${tagMatch1}|${tagMatch2})( |$)).*$`);
      expect(match(grep)).to.deep.equal([
        `${filterMatch} #${tagMiss}`,
      ]);
    });

    it('match and negate a tag', function() {
      let grep = buildGrep([tagMatch1, `!${tagMatch2}`], '.*');

      expect(grep).to.equal(`^(?=.*.*)(?=.*#${tagMatch1}( |$))(?!.*#(${tagMatch2})( |$)).*$`);
      expect(match(grep)).to.deep.equal([
        `${filterMiss} #${tagMatch1}`,
      ]);
    });

    it('ignores # in input tags', function() {
      let actual = buildGrep(['#oeEdZ'], '.*');
      let expected = buildGrep(['oeEdZ'], '.*');

      expect(actual).to.equal(expected);
    });

    it('matches a filter', function() {
      let grep = buildGrep([], filterMatch);

      expect(grep).to.equal(`^(?=.*${filterMatch}).*$`);
      expect(match(grep)).to.deep.equal([
        `${filterMatch} #${tagMiss}`,
        `${filterMatch} #${tagMatch2}`,
      ]);
    });

    it('matches a filter and a tag', function() {
      let grep = buildGrep([tagMatch2], filterMatch);

      expect(grep).to.equal(`^(?=.*${filterMatch})(?=.*#${tagMatch2}( |$)).*$`);
      expect(match(grep)).to.deep.equal([
        `${filterMatch} #${tagMatch2}`,
      ]);
    });

    it('a filter can also match a tag', function() {
      let grep = buildGrep([], tagMatch1);

      expect(grep).to.equal(`^(?=.*${tagMatch1}).*$`);
      expect(match(grep)).to.deep.equal([
        `${filterMiss} #${tagMatch1}`,
        `${filterMiss} #${tagMatch1} #${tagMatch2}`,
      ]);
    });
  });
});
