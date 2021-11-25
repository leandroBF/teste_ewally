import { Rotas } from "./Rotas";
import BoletoController from "../Controllers/BoletoController";

class BoletosRouter extends Rotas {

  constructor() {
    super(new BoletoController());
  }

  public obterRotas() {

    this.router.get(
      '/:sequencia',
      this.controller.consultarBoleto
    );

  }

}

export default BoletosRouter;