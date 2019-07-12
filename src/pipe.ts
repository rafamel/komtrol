/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { typedPipe } from 'ts-functional-pipe';
import { TEmptyFuInstance, IFuInstance } from './types';

const _pipe = typedPipe<TEmptyFuInstance>();

function pipeT<T>() {
  return typedPipe<Required<IFuInstance<T>>>();
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
