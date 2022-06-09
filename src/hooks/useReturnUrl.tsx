const FCX_PAGE = process.env.REACT_APP_FCX_PAGE || '';

const useReturnUrl = (): string => {
  return FCX_PAGE;
};

export default useReturnUrl;
