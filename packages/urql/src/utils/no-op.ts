import { IResponse } from '../types';

export default function noOp(): IResponse<any> {
  return {
    fetching: false,
    error: undefined,
    data: undefined
  };
}
