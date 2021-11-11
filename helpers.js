//login checker function
function getUserByEmail(email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
    return undefined;
};
module.exports = {getUserByEmail};