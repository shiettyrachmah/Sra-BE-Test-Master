const db = require("../models");
const query = require("../db/exampleDB");
const WebSocket = require('ws');
const axios = require('axios');
const PORT = 3000;
const FETCH_INTERVAL = 3 * 60 * 1000; 
const server = new WebSocket.Server({ port: PORT });
const Redis = require('ioredis');

// const Model = db.Model;
// const { Op } = require("sequelize");

exports.refactoreMe1 = async (req, res) => {
  //function ini sebenarnya adalah hasil survey dri beberapa pertnayaan, yang mana nilai dri jawaban tsb akan di store pada array seperti yang ada di dataset
  try {
    const [data] = await db.sequelize.query(query.dataSurvey);
    const totalIndex = Array.from({ length: 10 }, (_, i) => {
      const values = data.map((e) => e.values[i]);
      return values.reduce((a, b) => a + b, 0) / 10;
    });

    res.status(200).send({
      statusCode: 200,
      success: true,
      data: totalIndex,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      statusCode: 500,
      message: "Internal Server Error",
      success: false,
    });
  }
};

exports.refactoreMe2 = async (req, res) => {
  // function ini untuk menjalakan query sql insert dan mengupdate field "dosurvey" yang ada di table user menjadi true, jika melihat data yang di berikan, salah satu usernnya memiliki dosurvey dengan data false
  try {
    const survey = await Survey.create({
      userId: req.body.userId,
      values: req.body.values,
    });

    await User.update(
      { dosurvey: true },
      { where: { id: req.body.id } }
    );

    console.log("Success");

    res.status(201).send({
      statusCode: 201,
      message: "Survey sent successfully!",
      success: true,
      data: survey,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      statusCode: 500,
      message: "Cannot post survey.",
      success: false,
    });
  }
};

async function fetchDataAndSendToClients() {
  try {
    const response = await axios.get('https://livethreatmap.radware.com/api/map/attacks?limit=10');
    const data = response.data;

    server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  } catch (error) {
    console.error('Gagal mengambil data dari API:', error);
  }
}

exports.callmeWebSocket = async (req, res) => {
  
    // Mengirimkan data saat klien terhubung
  server.on('connection', (client) => {
    console.log('Klien terhubung');

    // Mengirimkan data saat klien terhubung
    fetchDataAndSendToClients();

    // Mengatur interval untuk mengambil data setiap 3 menit
    const interval = setInterval(fetchDataAndSendToClients, FETCH_INTERVAL);

    // Menangani penutupan koneksi
    client.on('close', () => {
      console.log('Klien terputus');
      clearInterval(interval);
    });
  });

  console.log(`Server WebSocket berjalan di port ${PORT}`);

};

exports.storeData = async (req, res) => {
  try {
    const redis = new Redis();
    // Cek apakah data sudah ada di cache Redis
    const cachedData = await redis.get('radware_data');

    if (cachedData) {
      console.log('Data ditemukan di cache.');
      res.status(200).json(JSON.parse(cachedData));
    } else {
      // Mengambil data dari API Radware
      const response = await axios.get('https://livethreatmap.radware.com/api/map/attacks?limit=10');
      const data = response.data;

      // Menyimpan data ke dalam cache Redis
      await redis.set('radware_data', JSON.stringify(data), 'ex', 180); // Simpan selama 180 detik (3 menit)

      // Menyimpan data ke dalam database PostgreSQL
      await db.sequelize.query(query.createTableAttack);

      // Loop through the data and insert it into the database
      for (const entry of data) {
        for (const record of entry) {
          const query = `
            INSERT INTO attack(sourceCountry, destinationCountry, millisecond, type, weight, attackTime)
            VALUES ('${record.sourceCountry}', '${record.destinationCountry}', '${record.millisecond}', '${record.type}', '${record.weight}', '${record.attackTime}')
          `;
          console.log(query);
          await db.sequelize.query(query);
        }
      }

      res.status(200).json(data);
    }
  } catch (error) {
    console.error('Gagal memproses data:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memproses data.' });
  }
}

exports.storeDataWithoutRedis = async (req, res) => {
  try {
    // Mengambil data dari API Radware
    const response = await axios.get('https://livethreatmap.radware.com/api/map/attacks?limit=10');
    const data = response.data;

      // Menyimpan data ke dalam database PostgreSQL
      await db.sequelize.query(query.createTableAttack);

      // Loop through the data and insert it into the database
      for (const entry of data) {
        for (const record of entry) {
          const query = `
            INSERT INTO attack(sourceCountry, destinationCountry, millisecond, type, weight, attackTime)
            VALUES ('${record.sourceCountry}', '${record.destinationCountry}', '${record.millisecond}', '${record.type}', '${record.weight}', '${record.attackTime}')
          `;
          console.log(query);
          await db.sequelize.query(query);
        }
      }

      res.status(200).json(data);
    
  } catch (error) {
    console.error('Gagal memproses data:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memproses data.' });
  }
}

exports.getData = async (req, res) => {
  try {
    const result = await db.sequelize.query(query.getDataTotalAttackCountry);
    const results = result[0];
    
    const response = {
      success: true,
      statusCode: 200,
      data: {
        label: ['SourceCountry','DestinationCountry', 'CountType'],
        total: [results[0].countsrccountry, results[0].countdescountry, results[0].countattacktypes],
      },
    };

    res.json(response);
  
  } catch (error) {
    console.error('Gagal mengambil data dari database:', error);
    res.status(500).json({ success: false, statusCode: 500, message: 'Gagal mengambil data' });
  }

};
