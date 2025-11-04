import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import cors from 'cors';

const app = express();
const doc = YAML.load('./openapi.yaml');

app.use(cors());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(doc));
app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.SWAGGER_PORT || 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Swagger docs running at http://localhost:${PORT}/docs`);
});


