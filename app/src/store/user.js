import gql from 'graphql-tag';

export const LOGIN = gql`
  mutation($email: String!, $password: String!) {
    auth(email: $email, password: $password)
  }
`;

export const SET_TOKEN = gql`
  mutation($token: String!) {
    setToken(token: $token)
  }
`;
