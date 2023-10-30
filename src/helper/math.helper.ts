export function sum(array:any) {
    return array.reduce((accumulator:any, currentValue:any)=>accumulator+currentValue,0);
  }