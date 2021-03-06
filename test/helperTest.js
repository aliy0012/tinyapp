const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail('user@example.com', testUsers)
    const expected = testUsers.userRandomID
    assert.equal(user, expected);
  });
});

describe('getUserByEmail', function() {
  it('should undefined if email is not in database', function() {
    const user = getUserByEmail('sometest@example.com', testUsers)
    const expected = undefined;
    assert.equal(user, expected);
  });
});

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail('user2@example.com', testUsers)
    const expected = testUsers.user2RandomID;
    assert.equal(user, expected);
  });
});

