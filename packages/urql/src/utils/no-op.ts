import { IResponse } from '../types';

export default function noOp(): IResponse<any> {
  return {
    fetching: true,
    error: undefined,
    data: undefined
  };
}
