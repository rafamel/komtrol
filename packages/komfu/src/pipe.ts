/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { typedPipe } from 'ts-functional-pipe';
import { IPureInstance } from './types';

const _pipe = typedPipe<IPureInstance<{}>>();

function pipeT<T>() {
  return typedPipe<IPureInstance<T>>();
}

function pipeP<T = any>() {
  return pipeT<{ props: Readonly<T> }>();
}

function pipeC<T = any>() {
  return pipeT<{ context: T }>();
}

function pipePC<P = any, C = any>() {
  return pipeT<{ props: Readonly<P>; context: C }>();
}

export type Pipe = typeof _pipe & {
  t: typeof pipeT;
  p: typeof pipeP;
  c: typeof pipeC;
  pc: typeof pipePC;
};

const pipe: Pipe = _pipe as Pipe;
pipe.t = pipeT;
pipe.p = pipeP;
pipe.c = pipeC;
pipe.pc = pipePC;

export default pipe;
