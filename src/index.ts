// src/server.ts
import app from "./app";
import { PORT } from "./config/envConfig";

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
