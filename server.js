require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


app.post("/api/dados", async (req, res) => {
  const { corrente, potencia, consumo, custo, rele_estado, comodo_id } = req.body;
  const query = `
    INSERT INTO leituras (corrente, potencia, consumo, custo, rele_estado, comodo_id)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  const values = [corrente, potencia, consumo, custo, rele_estado, comodo_id];

  try {
    await pool.query(query, values);
    res.status(200).send("OK");
  } catch (err) {
    console.error("--- ERRO DETALHADO ---");
    console.error(err);
    res.status(500).send("Erro ao salvar dados");
  }
});

app.get("/api/dados", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM leituras ORDER BY id DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("--- ERRO DETALHADO ---");
    console.error(err);
    res.status(500).send("Erro ao salvar dados");
  }
});


app.post("/api/comodos", async (req, res) => {
  const { nome } = req.body;
  const query = `INSERT INTO comodos (nome) VALUES ($1)`;
  try {
    await pool.query(query, [nome]);
    res.status(200).send("OK");
  } catch (err) {
    console.error("--- ERRO DETALHADO ---");
    console.error(err);
    res.status(500).send("Erro ao salvar dados");
  }
});

app.get("/api/comodos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM comodos ORDER BY id DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("--- ERRO DETALHADO ---");
    console.error(err);
    res.status(500).send("Erro ao salvar dados");
  }
});


app.delete("/api/comodos/:id", async (req, res) => {
  const { id } = req.params; 

  try {
    await pool.query("DELETE FROM comodos WHERE id = $1", [id]);
    res.status(200).send("Cômodo deletado com sucesso");
  } catch (err) {
    console.error("--- ERRO AO DELETAR CÔMODO ---");
    console.error(err);
    res.status(500).send("Erro ao deletar cômodo");
  }
});


app.delete("/api/dados/:id", async (req, res) => {
  const { id } = req.params; 

  try {
    await pool.query("DELETE FROM leituras WHERE id = $1", [id]);
    res.status(200).send("Leitura deletada com sucesso");
  } catch (err) {
    console.error("--- ERRO AO DELETAR DADO ---");
    console.error(err);
    res.status(500).send("Erro ao deletar dado");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor (API) rodando em http://localhost:${PORT}`);
});