
class BoletoService {

  public consultarBoleto(sequencia: string): any {

    let tamanho = sequencia.length;

    if (tamanho == 48) {
      return this.processarLinhasDigitaveisArrecadacao(sequencia);
    }

    return this.processarLinhasDigitaveisBoleto(sequencia);
  }

  private retornaDadosBoleto(
    codigoBarras: string,
    valor: string,
    validade: string
  ): any {
    return {
      "barCode": codigoBarras,
      "amount": valor,
      "expirationDate": validade
    }
  }

  private processarLinhasDigitaveisArrecadacao(sequencia: string): any {

    let primeiraParte = sequencia.slice(0, 11);
    let digitoVerificadorPrimeiraParte = sequencia.slice(11, 12);

    let segundaParte = sequencia.slice(12, 23);
    let digitoVerificadorSegundaParte = sequencia.slice(23, 24);

    let terceiraParte = sequencia.slice(24, 35);
    let digitoVerificadorTerceiraParte = sequencia.slice(35, 36);

    let quartaParte = sequencia.slice(36, 47);
    let digitoVerificadorQuartaParte = sequencia.slice(47, 48);

    let codigoBarras = primeiraParte;
    codigoBarras += segundaParte;
    codigoBarras += terceiraParte;
    codigoBarras += quartaParte;

    let valor = codigoBarras.slice(4, 15);

    let valorFormatado = this.obterValorArrecadacaoFormatado(valor);

    return this.retornaDadosBoleto(
      codigoBarras,
      valorFormatado,
      ""
    );
  }

  private processarLinhasDigitaveisBoleto(sequencia: string): any {

    let codigoInstituicao = sequencia.slice(0, 3);
    let codigoMoeda = sequencia.slice(3, 4);
    let primeiraParteCampoLivre = sequencia.slice(4, 9);
    let digitoVerificadorCampo1 = sequencia.slice(9, 10);
    let segundaParteCampoLivre = sequencia.slice(10, 20);
    let digitoVerificadorCampo2 = sequencia.slice(20, 21);
    let terceiraParteCampoLivre = sequencia.slice(21, 31);
    let digitoVerificadorCampo3 = sequencia.slice(31, 32);
    let digitoVerificadorGeral = sequencia.slice(32, 33);
    let fatorVencimento = sequencia.slice(33, 37);
    let valor = sequencia.slice(37, 47);

    let codigoBarras = codigoInstituicao;
    codigoBarras += codigoMoeda;
    codigoBarras += digitoVerificadorGeral;
    codigoBarras += fatorVencimento;
    codigoBarras += valor;
    codigoBarras += primeiraParteCampoLivre;
    codigoBarras += segundaParteCampoLivre;
    codigoBarras += terceiraParteCampoLivre;

    let validacaoBoleto = this.validarRepresentacaoNumericaBoleto(
      codigoInstituicao + codigoMoeda + primeiraParteCampoLivre,
      digitoVerificadorCampo1,
      segundaParteCampoLivre,
      digitoVerificadorCampo2,
      terceiraParteCampoLivre,
      digitoVerificadorCampo3
    );

    if (!validacaoBoleto) {
      throw new Error();
    }

    let valorFormatado = this.obterValorBoletoFormatado(valor);
    let dataValidade = this.obterDataVencimentoBoleto(fatorVencimento);

    return this.retornaDadosBoleto(
      codigoBarras,
      valorFormatado,
      dataValidade
    );

  }

  private obterValorBoletoFormatado(valor: string): string {

    let parteDecimal = valor.slice(-2);
    let parteInteira = parseInt(valor.slice(0, 8));

    return parteInteira + "." + parteDecimal;
  }

  private obterValorArrecadacaoFormatado(valor: string): string {

    let parteDecimal = valor.slice(-2);
    let parteInteira = parseInt(valor.slice(0, 9));

    return parteInteira + "." + parteDecimal;
  }

  private obterDataVencimentoBoleto(fatorVencimento: string): string {
    var data = new Date('1997-10-07 00:00:00');
    data.setDate(data.getDate() + parseInt(fatorVencimento));

    let dia = data.getDate().toString().padStart(2, '0');
    let ano = data.getFullYear();
    let mes = (data.getMonth() + 1).toString().padStart(2, '0');

    return ano + "-" + mes + "-" + dia;
  }

  private validarRepresentacaoNumericaBoleto(
    campo1: string,
    dv1: string,
    campo2: string,
    dv2: string,
    campo3: string,
    dv3: string
  ): boolean {

    let sequencia = campo1 + campo2 + campo3;

    let tamanho = sequencia.length;
    let arrayResultado = [];

    let flagMultiplicador = 2;

    for (let indice = 0; indice < tamanho; indice++) {

      arrayResultado.push(parseInt(sequencia[indice]) * flagMultiplicador);

      if (flagMultiplicador == 2) {
        flagMultiplicador = 1;
        continue;
      }

      flagMultiplicador = 2;
    }

    let arrayResultadoCampo1 = arrayResultado.slice(0, 9);
    let arrayResultadoCampo2 = arrayResultado.slice(9, 19);
    let arrayResultadoCampo3 = arrayResultado.slice(19);

    let resultadoCampo1 = this.obterSomaArrayResultados(arrayResultadoCampo1);
    let resultadoCampo2 = this.obterSomaArrayResultados(arrayResultadoCampo2);
    let resultadoCampo3 = this.obterSomaArrayResultados(arrayResultadoCampo3);

    let dezenaPosteriorCampo1 = this.obterDezenaPosterior(resultadoCampo1);
    let dezenaPosteriorCampo2 = this.obterDezenaPosterior(resultadoCampo2);
    let dezenaPosteriorCampo3 = this.obterDezenaPosterior(resultadoCampo3);

    let dv1Resultado = dezenaPosteriorCampo1 - resultadoCampo1;
    let dv2Resultado = dezenaPosteriorCampo2 - resultadoCampo2;
    let dv3Resultado = dezenaPosteriorCampo3 - resultadoCampo3;

    if (
      dv1Resultado == parseInt(dv1)
      && dv2Resultado == parseInt(dv2)
      && dv3Resultado == parseInt(dv3)
    ) {
      return true;
    }

    return false;
  }

  private obterSomaArrayResultados(arrayResultado: any): number {

    let soma = 0;

    for (let indice in arrayResultado) {
      soma += this.obterSomaAlgorismo(arrayResultado[indice]);
    }

    return soma;
  }

  private obterSomaAlgorismo(valor: any): number {

    if (valor < 10) {
      return valor;
    }

    let soma = 0;

    let stringValor = valor.toString();

    for (let indice in stringValor) {
      soma += parseInt(stringValor[indice]);
    }

    return soma;
  }

  private obterDezenaPosterior(valor: any): number {
    return (Math.trunc(valor / 10) + 1) * 10;
  }
}
export default BoletoService;