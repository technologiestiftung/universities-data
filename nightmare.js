const Nightmare = require('nightmare')
const chai = require('chai')
const expect = chai.expect

describe('find university results', () => {
  it('should find all university links', function(done) {
    this.timeout('10s')

    const nightmare = Nightmare()
    nightmare
      .goto('https://www.hochschulkompass.de/hochschulen.html')
      .click('input.btn.btn-info')
      .wait('a.btn-info.btn')
      .evaluate(() => document.querySelector('a.btn-info.btn').href)
      .end()
      .then(link => {
        console.log(link);
        done()
      })
  })
})