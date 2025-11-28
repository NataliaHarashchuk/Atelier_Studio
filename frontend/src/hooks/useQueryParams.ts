import { useSearchParams } from "react-router-dom";

export const useQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getParam = (key: string): string | null => {
    return searchParams.get(key);
  };

  const setParam = (key: string, value: string) => {
    searchParams.set(key, value);
    setSearchParams(searchParams);
  };

  const removeParam = (key: string) => {
    searchParams.delete(key);
    setSearchParams(searchParams);
  };

  return { getParam, setParam, removeParam, searchParams };
};
