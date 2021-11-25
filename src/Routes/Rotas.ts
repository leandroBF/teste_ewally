import express from 'express';

export abstract class Rotas {

  protected _router = express.Router();
  protected _controller: any;

  public constructor(controller: any) {
    this.controller = controller;
    this.obterRotas();
  };

  abstract obterRotas(): void;

  public get router(): any {
    return this._router;
  }

  public get controller(): any {
    return this._controller;
  }

  public set controller(value: any) {
    this._controller = value;
  }

}