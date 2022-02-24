const chai = require('chai');
const lookupIDByEmail = require('../helpers');

const testDB = {
  'userID': {
    id: 'userID',
    email: 'user@email.com',
    password: '$2a$10$IIRVCgO5NS6s3mVXd0E1Ju6j4H.PK7bNFWiEBn1/zmaOB.L2aTHlS'
  },
  'Df4G6b': {
    id: 'Df4G6b',
    email: 'brianfargo@hotmail.com',
    password: 'blackisles'
  }
};

describe('Lookup ID By Email', () => {

  it('Returns valid user ID when given correct info', () => {
    const userID = lookupIDByEmail('brianfargo@hotmail.com', testDB);
    const expectedID = 'Df4G6b';

    chai.assert.strictEqual(expectedID, userID);
  });

  it('Returns false when given non-existing email', () => {
    const userID = lookupIDByEmail('briandorf43@hotmail.com', testDB);

    chai.assert.strictEqual(userID, false);
  });

});