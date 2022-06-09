import qs, { ParsedQuery } from 'query-string';

export const qsStringify = <T>(object: T): string => {
  return `?${qs.stringify(object, {
    skipNull: true,
    skipEmptyString: true,
  })}`;
};

export const qsParse = (url: string): ParsedQuery => {
  return qs.parse(url);
};
