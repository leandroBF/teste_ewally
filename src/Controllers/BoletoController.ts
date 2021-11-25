import express from 'express';
import BoletoService from '../Services/BoletoService';

const service = new BoletoService();

class BoletoController {

  public consultarBoleto(request: express.Request, response: express.Response): any {

    try {

      let resposta = service.consultarBoleto(request.params.sequencia);

      return response.json(resposta);

    } catch (error: any) {
      return response.status(400).json("Linha digitável inválida.");
    }

  }

}

export default BoletoController;