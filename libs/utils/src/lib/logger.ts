import Debug from 'debug';

export class Logger {
  private debug: Debug.Debugger;

  constructor(private readonly debugNamespace = 'Logger') {
    this.debug = Debug(this.debugNamespace);
  }

  namespace(namespace: string) {
    this.debug = Debug(namespace);
    return this;
  }

  log(formatter: any, ...args: any[]) {
    return this.debug(formatter, ...args);
  }
}
