import gql from 'graphql-tag';

export const LOGIN = gql`
  mutation($email: String!, $password: String!) {
    auth(email: $email, password: $password)
  }
`;
