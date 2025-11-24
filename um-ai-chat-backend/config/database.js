const prisma = require("./prismaClient");

function query(sql, params, callback) {
  let finalParams = params;
  let finalCallback = callback;

  if (typeof params === "function") {
    finalCallback = params;
    finalParams = [];
  }

  prisma.$queryRawUnsafe(sql, ...(finalParams || []))
    .then((rows) => finalCallback(null, rows))
    .catch((err) => finalCallback(err));
}

module.exports = {
  query,
};
