import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

const PROTO_PATH = join(__dirname, '../../packages/protos/hello.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const helloProto: any = grpc.loadPackageDefinition(packageDefinition).hello;

function main() {
  const client = new helloProto.HelloService(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  client.SayHello({ name: 'World' }, (err: any, response: any) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('Response:', response.message);
    }
  });
}

main();
