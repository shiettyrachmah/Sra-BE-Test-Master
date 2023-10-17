const dataSurvey = `SELECT * FROM "surveys"`;
const createTableAttack = `
      CREATE TABLE IF NOT EXISTS attack (
          sourceCountry varchar(10),
          destinationCountry varchar(10),
          millisecond int,
          type varchar(30),
          weight int, 
          attackTime timestamptz
      )
      `;
const getDataTotalAttackCountry = `
      SELECT
      COUNT(DISTINCT destinationcountry) AS countDesCountry,
          COUNT(DISTINCT sourcecountry) AS countSrcCountry,
          COUNT(DISTINCT type) AS countAttackTypes
      FROM
          attack
      HAVING
          COUNT(DISTINCT type) > 1
      `;

module.exports = {
    dataSurvey: dataSurvey,
    createTableAttack: createTableAttack,
    getDataTotalAttackCountry
};
  