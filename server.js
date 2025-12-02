require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // Adicionei para garantir compatibilidade
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// rota post dados
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
    console.error(err);
    res.status(500).send("Erro ao salvar dados");
  }
});

// rota get dados
app.get("/api/dados", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM leituras ORDER BY id DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar dados");
  }
});

// rota post comodos
app.post("/api/comodos", async (req, res) => {
  const { nome } = req.body;
  const query = `INSERT INTO comodos (nome) VALUES ($1)`;
  try {
    await pool.query(query, [nome]);
    res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao salvar dados");
  }
});

// rota get comodos
app.get("/api/comodos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM comodos ORDER BY id DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar dados");
  }
});

// rota put comodos
app.put("/api/comodos/:id", async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  const query = "UPDATE comodos SET nome = $1 WHERE id = $2";
  
  try {
    await pool.query(query, [nome, id]);
    res.status(200).send("Cômodo atualizado com sucesso");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar cômodo");
  }
});

// rota put dados
app.put("/api/dados/:id", async (req, res) => {
  const { id } = req.params;
  const { corrente, potencia, consumo, custo, rele_estado, comodo_id } = req.body;

  const query = `
    UPDATE leituras 
    SET corrente=$1, potencia=$2, consumo=$3, custo=$4, rele_estado=$5, comodo_id=$6
    WHERE id=$7
  `;
  const values = [corrente, potencia, consumo, custo, rele_estado, comodo_id, id];

  try {
    await pool.query(query, values);
    res.status(200).send("Leitura atualizada com sucesso");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar dado");
  }
});

// rota delete comodos
app.delete("/api/comodos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM comodos WHERE id = $1", [id]);
    res.status(200).send("Cômodo deletado com sucesso");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao deletar cômodo");
  }
});

// rota delete dados
app.delete("/api/dados/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM leituras WHERE id = $1", [id]);
    res.status(200).send("Leitura deletada com sucesso");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao deletar dado");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor (API) rodando em http://localhost:${PORT}`);
});