router.get("/", async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM logs
    ORDER BY created_at DESC
    LIMIT 50
  `);
  res.json(result.rows);
});
