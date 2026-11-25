import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Creddit Backend is running");
});

app.get("/api/test", (req, res) => {
    res.send("{\n" +
        "    \"success\": true,\n" +
        "    \"message\": \"Hello from Creddit\"\n" +
        "}");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});