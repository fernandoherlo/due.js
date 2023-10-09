import { stringify, parse } from 'flatted';

export default function getter (value: any, variables: any): any {
  if (!value) {
    return value;
  }
  const stringValue = stringify(value);
  let newValue = stringValue.replace(' ', '');

  if (Object.keys(variables)) {
    Object.keys(variables).forEach((variable) => {
      newValue = newValue.replace(variable, variables[variable]);
    });
  }

  return parse(newValue);
}
