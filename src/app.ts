import express from 'express';
import BoletosRouter from './Routes/boletos';

class Aplicacao {
  private app: express.Application = express();
  private listenPort: number;

  constructor(listenPort: number) {
    this.listenPort = listenPort;
    this.setupRequestParsers();
    this.setupRouters();
  }

  private setupRequestParsers() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  private setupRouters() {
    this.app.use('/boleto', new BoletosRouter().router);
    this.app.use(function (req: express.Request, res: express.Response) {
      res.json({ message: "Não Encontrado" })
    });
  }

  public listen() {
    this.app.listen(this.listenPort, () => {
      console.log(`Aplicação está escutando na porta ${this.listenPort}`)
    })
  }
}

const application = new Aplicacao(8080);
application.listen();