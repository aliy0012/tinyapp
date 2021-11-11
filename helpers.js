//login checker function
const getUserByEmail = function(email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
    return undefined;
};
module.exports = getUserByEmail;