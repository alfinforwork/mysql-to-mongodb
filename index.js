const { Sequelize } = require("sequelize");
const { MongoClient } = require("mongodb");

require("dotenv").config();

const running = async () => {
  const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASS,
    {
      host: process.env.MYSQL_HOST,
      dialect: "mysql",
    }
  );

  await sequelize.authenticate();
  console.log("MySQL connection has been established successfully.");

  const client = new MongoClient(process.env.MONGODB_HOST);
  await client.connect();
  console.log("MongoDB connected successfully to server");

  const mongo = client.db(process.env.MONGODB_DATABASE);

  const table = await sequelize
    .query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = '${process.env.MYSQL_DATABASE}'`
    )
    .then((res) => {
      return res[0].map((v) => v.TABLE_NAME);
    });

  for (let i = 0; i < table.length; i++) {
    const e = table[i];
    const data = await sequelize.query(`SELECT * FROM ${e}`);
    console.log(`log data table ${e}`, data[0]);
    if (data.length > 0) {
      const collection = mongo.collection(e);
      await collection.insertMany(data[0]);
    }
  }
};

running();
