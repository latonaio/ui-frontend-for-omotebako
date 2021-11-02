import queryString from 'query-string';

const getQueryStrings = (search) => {
  return queryString.parse(search);
}

const queryStrings = {
  getQueryStrings
};

export default queryStrings
