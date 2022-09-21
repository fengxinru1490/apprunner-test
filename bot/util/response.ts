export default class Response {
  private statusCode: any;
  private body: any;
  private headers: any;
  constructor({
    headers,
    body,
    statusCode
  }: { headers?: any, body?: any, statusCode?: number }) {
    this.headers = headers || {};
    this.body = body || '';
    this.statusCode = statusCode || 200;
    console.log('__this__', this);
  }
  send(statusCode, body) {
    return {
      statusCode: statusCode || this.statusCode,
      body: body || this.body
    };
  }
  status(statusCode) {
    return {
      json(body) {
        return {
          statusCode: statusCode || this.statusCode,
          body: JSON.stringify(body)
        };
      }
    };
  }
  set(headers) {
    this.headers = headers;
  }

  write(body) {
    this.body = body;
  }

  end() {
    return {
      statusCode: this.statusCode,
      headers: this.headers,
      body: this.body
    };
  }
}