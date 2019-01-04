import gql from 'graphql-tag';

export const metatags = gql`
  query metatags($url: String!) {
    metatags(url: $url) {
      title
      description
      image
    }
  }
`;
