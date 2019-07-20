/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { typedPipe, pipe as _pipe } from 'ts-functional-pipe';
import { TIntermediate } from './types';

const _tpipe = typedPipe<TIntermediate<{}, void>>();

function pipeT<T extends object | void>() {
  return typedPipe<TIntermediate<{}, Readonly<T>>>();
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

export type Pipe = typeof _tpipe & {
  f: typeof _pipe;
  t: typeof pipeT;
  p: typeof pipeP;
  c: typeof pipeC;
  pc: typeof pipePC;
};

const pipe: Pipe = _tpipe as Pipe;
pipe.f = _pipe;
pipe.t = pipeT;
pipe.p = pipeP;
pipe.c = pipeC;
pipe.pc = pipePC;

export default pipe;
